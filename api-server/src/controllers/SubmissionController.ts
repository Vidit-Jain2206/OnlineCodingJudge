import { RequestHandler, Request, Response } from "express";
import { CreateSubmissionDto } from "../../../shared/dtos/SubmissionDto";
import { SubmissionService } from "../service/SubmissionService";

export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

  submitCode: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const submissionDto: CreateSubmissionDto = {
        code: req?.body?.code,
        language: req?.body?.language,
        expectedOutput: req?.body?.expectedOutput,
      };
      if (
        !submissionDto.code ||
        !submissionDto.language ||
        !submissionDto.expectedOutput
      ) {
        throw new Error("Missing required fields");
      }
      const submission = await this.submissionService.createSubmission({
        code: submissionDto.code,
        language: submissionDto.language,
        expectedOutput: submissionDto.expectedOutput,
      });
      if (!submission) {
        throw new Error("Failed to create submission");
      }
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
