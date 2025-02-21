import { SubmissionStatus } from "../../shared/entity/Submission";
import { SubmissionService } from "../../api-server/src/service/SubmissionService";
import { Worker } from "bullmq";
import Docker from "dockerode";
import { redisConfig } from "../../shared/config/redis.config";
import { redisClient } from "worker/config/redis.config";

class WorkerService {
  private docker: Docker;
  private readonly EXECUTION_TIMEOUT = 10000; // 10 seconds timeout

  constructor(private submissionService: SubmissionService) {
    this.docker = new Docker();
  }

  private isErrorOutput(output: string): boolean {
    return output.includes("Error") || output.includes("Exception");
  }

  private async updateSubmissionStatus(
    questionId: string,
    id: string,
    status: SubmissionStatus,
    output: string,
    result: string,
    expectedOutput?: string
  ) {
    await this.submissionService.updateSubmission(id, {
      status,
      output,
      result,
    });

    await redisClient.publish(
      "submission",
      JSON.stringify({
        id,
        questionId,
        status,
        output,
        result,
        expectedOutput,
      })
    );
  }

  private async handleContainerOutput(stream: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let result = "";
      let errorOutput = "";

      stream.on("data", (data: Buffer) => {
        const outputString = data.toString();
        if (this.isErrorOutput(outputString)) {
          errorOutput += outputString;
        } else {
          result += outputString;
        }
      });

      stream.on("error", (err: Error) => {
        reject(new Error(`Stream error: ${err.message}`));
      });

      stream.on("end", () => {
        if (errorOutput) {
          reject(new Error(errorOutput));
        } else {
          resolve(result);
        }
      });
    });
  }

  private async cleanupContainer(container: Docker.Container) {
    try {
      const containerInfo = await container.inspect();
      if (containerInfo.State.Running) {
        await container.stop();
      }
      await container.remove();
    } catch (error) {
      console.error("Error cleaning up container:", error);
    }
  }

  async startWorker() {
    const worker = new Worker(
      "submission",
      async (job) => {
        const { id, questionId } = job.data;
        let container: Docker.Container | null = null;

        try {
          const submission = await this.submissionService.getSubmissionById(id);
          if (!submission) {
            throw new Error("Submission not found");
          }
          container = await this.docker.createContainer({
            Image: "code-execution:latest",
            Tty: true,
            Env: [
              `SOURCE_CODE=${submission.submission.getCode()}`,
              `EXPECTED_OUTPUT=${submission.submission.getExpectedOutput()}`,
              `LANGUAGE=${submission.submission.getLanguage()}`,
            ],
          });

          await container.start();
          console.log(`Container started: ${container.id}`);

          // Set up timeout handler
          const timeoutPromise: Promise<string> = new Promise((_, reject) => {
            setTimeout(async () => {
              reject(new Error("Execution timeout"));
            }, this.EXECUTION_TIMEOUT);
          });

          const stream = await container.attach({
            stream: true,
            stdout: true,
            stderr: true,
          });

          try {
            // Race between execution and timeout
            const output: string = await Promise.race([
              this.handleContainerOutput(stream),
              timeoutPromise,
            ]);

            await container.wait();

            const responseArray = output.split("\n").map((line) => line.trim());
            const stdout = responseArray[1].split(":")[1].trim();
            const result = responseArray[responseArray.length - 3]
              .split(":")[1]
              .trim();

            await this.updateSubmissionStatus(
              questionId,
              id,
              SubmissionStatus.COMPLETED,
              stdout,
              result,
              submission.submission.getExpectedOutput()
            );
          } catch (error: any) {
            const isTimeout = error.message === "Execution timeout";
            await this.updateSubmissionStatus(
              questionId,
              id,
              isTimeout ? SubmissionStatus.ERROR : SubmissionStatus.COMPLETED,
              error.message,
              isTimeout ? "System Error" : "Wrong Answer",
              submission.submission.getExpectedOutput()
            );
          }
        } catch (error: any) {
          console.error("Error in worker:", error);
          await this.updateSubmissionStatus(
            questionId,
            id,
            SubmissionStatus.ERROR,
            error.message || "System error occurred. Please try again later",
            "System Error"
          );
        } finally {
          if (container) {
            await this.cleanupContainer(container);
          }
        }
      },
      {
        connection: redisConfig,
        concurrency: 2,
      }
    );

    return worker;
  }
}

export default WorkerService;
