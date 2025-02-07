import dotenv from "dotenv";
import { SubmissionRepositoryImp } from "./repository/SubmissionRepositoryImp";
import { SubmissionService } from "./service/SubmissionService";
import { SubmissionController } from "./controllers/SubmissionController";
import express from "express";

dotenv.config();

const submissionRepository = new SubmissionRepositoryImp();
const submissionService = new SubmissionService(submissionRepository);
const submissionController = new SubmissionController(submissionService);

const app = express();

app.use(express.json());

app.post("/submissions", submissionController.submitCode);

app.get("/submissions/:id", submissionController.getSubmission);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
