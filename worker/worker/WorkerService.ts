import { SubmissionStatus } from "../../shared/entity/Submission";
import { SubmissionService } from "../../shared/service/SubmissionService";
import { tryCatch, Worker } from "bullmq";
import Docker from "dockerode";
import { redisConfig } from "../../shared/config/redis.config";
import { redisClient } from "worker/config/redis.config";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

class WorkerService {
  private docker: Docker;
  private readonly EXECUTION_TIMEOUT = 10000; // 10 seconds timeout

  private ecs: ECSClient;
  private clusterName: string = process.env.CLUSTER_NAME || ""; // Replace with your ECS Cluster name
  private taskDefinition: string = process.env.TASK_DEFINITION || ""; // Replace with your ECS Task Definition
  private subnetIds: string[] = process.env.SUBNET_IDS?.split(",") || [""]; // Replace with your actual subnets
  private securityGroupIds = process.env.SECURITYGROUPD_IDS?.split(",") || [""]; // Replace with your actual security groups

  constructor(private submissionService: SubmissionService) {
    this.docker = new Docker();
    this.ecs = new ECSClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || " ",
      },
      region: process.env.AWS_REGION || "",
    });
  }

  private isErrorOutput(output: string): boolean {
    return (
      output.toLowerCase().includes("error") || output.includes("Exception")
    );
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

  private async runEcsTask(
    submissionId: string,
    questionId: string,
    sourceCode: string,
    language: string,
    expectedOutput: string
  ): Promise<string> {
    try {
      const command = new RunTaskCommand({
        cluster: this.clusterName,
        launchType: "EC2", // Use "FARGATE" if using AWS Fargate
        taskDefinition: this.taskDefinition,
        overrides: {
          containerOverrides: [
            {
              name: "worker-container",
              environment: [
                { name: "SUBMISSION_ID", value: submissionId },
                { name: "QUESTION_ID", value: questionId },
                { name: "SOURCE_CODE", value: sourceCode },
                { name: "LANGUAGE", value: language },
                { name: "EXPECTED_OUTPUT", value: expectedOutput },
              ],
            },
          ],
        },
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: this.subnetIds,
            securityGroups: this.securityGroupIds,
            assignPublicIp: "ENABLED",
          },
        },
        count: 1, // Runs a single ECS task per submission
      });

      const response = await this.ecs.send(command);
      if (!response?.tasks) {
        throw new Error("No tasks returned from ECS RunTask");
      }
      if (!response?.tasks[0]?.containers) {
        throw new Error("No containers returned from ECS RunTask");
      }
      console.log(
        "ECS Task started:",
        response?.tasks[0]?.containers[0].containerArn
      );
      return response?.tasks[0]?.containers[0].containerArn || "";
    } catch (error) {
      console.error("Failed to start ECS Task:", error);
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
          // container = await this.docker.createContainer({
          //   Image: "code-executioner-multlanguage:latest",
          //   Tty: true,
          //   Env: [
          //     `SOURCE_CODE=${submission.submission.getCode()}`,
          //     `EXPECTED_OUTPUT=${submission.submission.getExpectedOutput()}`,
          //     `LANGUAGE=${submission.submission.getLanguage()}`,
          //   ],
          // });

          // await container.start();

          const container = await this.runEcsTask(
            id,
            questionId,
            submission.submission.getCode(),
            submission.submission.getLanguage(),
            submission.submission.getExpectedOutput()
          );

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

            // await container.wait();

            const responseArray = output.split("\n").map((line) => line.trim());

            const stdout = responseArray[1].split(":")[1].trim();
            const result = responseArray[responseArray.length - 2]
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
