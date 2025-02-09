import { SubmissionStatus } from "@shared/entity/Submission";
import { SubmissionService } from "api-server/src/service/SubmissionService";
import { Worker } from "bullmq";
import Docker from "dockerode";
class WorkerService {
  private docker: Docker;
  constructor(private submissionService: SubmissionService) {
    this.docker = new Docker();
  }

  async startWorker() {
    const worker = new Worker("submission", async (job) => {
      const { id } = job.data;
      try {
        const submission = await this.submissionService.getSubmissionById(id);
        const container = await this.docker.createContainer({
          Image: "node:20",
          Cmd: ["node", "index.js"],
          Tty: true,
        });
        await container.start();
        const output = await container.logs({
          follow: true,
          stdout: true,
          stderr: true,
        });
        console.log(output);
        await container.stop();
        await container.remove();
        await this.submissionService.updateSubmission(id, {
          status: SubmissionStatus.COMPLETED,
          output: output.toString(),
        });
      } catch (error) {
        await this.submissionService.updateSubmission(id, {
          status: SubmissionStatus.ERROR,
          output: (error as Error).message,
        });
        console.error(error);
      }
    });
    return worker;
  }
}

export default WorkerService;
