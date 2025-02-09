import WorkerService from "./worker/WorkerService";
import { SubmissionService } from "../api-server/src/service/SubmissionService";
import { SubmissionRepositoryImp } from "../shared/repository/SubmissionRepositoryImp";
import { db } from "./config/database.config";
import { QueueService } from "../api-server/src/service/QueueService";

async function startWorker() {
  const repository = new SubmissionRepositoryImp(db);
  const queueService = new QueueService();
  const service = new SubmissionService(repository, queueService);
  const worker = new WorkerService(service);

  await worker.startWorker();
  console.log("Worker started");
}

startWorker().catch(console.error);
