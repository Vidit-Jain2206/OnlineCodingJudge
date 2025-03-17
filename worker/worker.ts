import WorkerService from "./worker/WorkerService";
import { SubmissionService } from "../shared/service/SubmissionService";
import { SubmissionRepositoryImp } from "../shared/repository/SubmissionRepositoryImp";
import { db } from "./config/database.config";

async function startWorker() {
  const repository = new SubmissionRepositoryImp(db);
  const service = new SubmissionService(repository);
  const worker = new WorkerService(service);

  await worker.startWorker();
  console.log("Worker started");
}

startWorker().catch(console.error);
