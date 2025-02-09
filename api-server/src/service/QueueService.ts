import { Queue } from "bullmq";

export class QueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("submission", {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    });
  }

  async addJob(jobName: string, data: any) {
    await this.queue.add(jobName, data);
  }
}
