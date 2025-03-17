import { RequestHandler, Request, Response } from "express";
import { CreateSubmissionDto } from "../../../shared/dtos/SubmissionDto";
import { SubmissionService } from "../../../shared/service/SubmissionService";
import { QueueService } from "../../../shared/service/QueueService";
import { AWSUploadService } from "../../../shared/service/AWSUploadServive";
export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private queueService: QueueService,
    private awsUploadService: AWSUploadService
  ) {}

  submitCode: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const submissionDto: CreateSubmissionDto = {
        questionId: req?.body?.questionId,
        code: req?.body?.code,
        language: req?.body?.language,
        expectedOutput: req?.body?.expectedOutput,
      };
      if (
        !submissionDto.code ||
        !submissionDto.language ||
        !submissionDto.expectedOutput ||
        !submissionDto.questionId
      ) {
        throw new Error("Missing required fields");
      }

      // upload the submission's source code to aws s3
      const { submission } = await this.submissionService.createSubmission({
        questionId: submissionDto.questionId,
        code: submissionDto.code,
        language: submissionDto.language,
        expectedOutput: submissionDto.expectedOutput,
      });

      if (!submission) {
        throw new Error("Failed to create submission");
      }

      await this.awsUploadService.uploadFile(
        submissionDto.code,
        submission.getId()
      );

      await this.queueService.addJob("submission", {
        questionId: submissionDto.questionId,
        id: submission.getId(),
      });
      console.log("Submission created and job added to queue");
      res.status(201).json(submission);
      return;
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return;
    }
  };

  getSubmission: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const submissionId = req?.params?.id;
      if (!submissionId) {
        throw new Error("Submission ID is required");
      }
      const submission = await this.submissionService.getSubmissionById(
        submissionId
      );
      if (!submission) {
        throw new Error("Submission not found");
      }
      res.status(200).json(submission);
      return;
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
      return;
    }
  };
}
