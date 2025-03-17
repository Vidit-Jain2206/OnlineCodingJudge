import dotenv from "dotenv";
import { SubmissionRepositoryImp } from "../../shared/repository/SubmissionRepositoryImp";
import { SubmissionService } from "./service/SubmissionService";
import { SubmissionController } from "./controllers/SubmissionController";
import express from "express";
import { db } from "./config/database.config";
import { QueueService } from "./service/QueueService";
import cors from "cors";
import { AWSUploadService } from "./service/AWSUploadServive";

dotenv.config();
const accessKeyId: string = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY || "";
const region: string = process.env.AWS_REGION || "";
const bucketName: string = process.env.AWS_BUCKET_NAME || "";
const submissionRepository = new SubmissionRepositoryImp(db);
const queueService = new QueueService();
const submissionService = new SubmissionService(submissionRepository);
const awsUploadService = new AWSUploadService(
  accessKeyId,
  secretAccessKey,
  region,
  bucketName
);
const submissionController = new SubmissionController(
  submissionService,
  queueService,
  awsUploadService
);

const app = express();

app.use(express.json());
app.use(cors());

app.post("/submissions", submissionController.submitCode);

app.get("/submissions/:id", submissionController.getSubmission);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
