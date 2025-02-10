import { SubmissionStatus } from "../../shared/entity/Submission";
import { SubmissionService } from "../../api-server/src/service/SubmissionService";
import { Worker } from "bullmq";
import Docker from "dockerode";
import { redisConfig } from "../../shared/config/redis.config";
import { redisClient } from "worker/config/redis.config";
class WorkerService {
  private docker: Docker;
  constructor(private submissionService: SubmissionService) {
    this.docker = new Docker();
  }
  isErrorOutput(output: string): boolean {
    // Implement logic to determine if the output is an error
    // This could be based on specific keywords or patterns in the output
    return output.includes("Error") || output.includes("Exception");
  }
  async startWorker() {
    const worker = new Worker(
      "submission",
      async (job) => {
        const { id } = job.data;
        try {
          const submission = await this.submissionService.getSubmissionById(id);
          const container = await this.docker.createContainer({
            Image: "code-execution:latest",
            Tty: true,
            Env: [
              `SOURCE_CODE=${submission.submission.getCode()}`,
              `EXPECTED_OUTPUT=${submission.submission.getExpectedOutput()}`,
            ],
          });

          try {
            await container.start();
          } catch (containerError) {
            await this.submissionService.updateSubmission(id, {
              status: SubmissionStatus.ERROR,
              output: containerError as string,
              result: "",
            });

            return;
          }

          const stream = await container.attach({
            stream: true,
            stdout: true,
            stderr: true,
          });

          const output = async () => {
            return new Promise<string>((resolve, reject) => {
              let result = "";
              let errorOutput = "";

              stream.on("data", (data) => {
                const outputString = data.toString();
                if (this.isErrorOutput(outputString)) {
                  errorOutput += outputString;
                } else {
                  result += outputString;
                }
              });

              stream.on("error", (err) => {
                reject(err);
              });

              stream.on("end", () => {
                if (errorOutput) {
                  reject(errorOutput);
                } else {
                  resolve(result);
                }
              });
            });
          };
          await container.wait();

          try {
            const res = await output();
            const responseArray = res.split("\n");
            const stdout = responseArray[1].split(":")[1];
            const result = responseArray[2].split(":")[1];

            await this.submissionService.updateSubmission(id, {
              status: SubmissionStatus.COMPLETED,
              output: stdout,
              result,
            });
          } catch (error) {
            await this.submissionService.updateSubmission(id, {
              status: SubmissionStatus.COMPLETED,
              output: error as string,
              result: "Wrong Answer",
            });
          }
          await container.remove();
        } catch (error: any) {
          // not able to create the container or not able to fetch the submission from database
          await this.submissionService.updateSubmission(id, {
            status: SubmissionStatus.ERROR,
            output:
              error.message || "System error occurred. please try again later",
            result: "System Error",
          });
        }
      },
      {
        connection: redisConfig,
      }
    );
    return worker;
  }
}

export default WorkerService;
