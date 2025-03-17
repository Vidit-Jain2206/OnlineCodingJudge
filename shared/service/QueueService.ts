import { redisConfig } from "../config/redis.config";
import { Queue } from "bullmq";

export class QueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("submission", {
      connection: redisConfig,
    });
  }

  async addJob(jobName: string, data: any) {
    await this.queue.add(jobName, data);
  }
}
