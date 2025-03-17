import { v4 as uuidv4 } from "uuid";
import {
  CreateSubmissionDto,
  SubmissionResponseDto,
  UpdateSubmissionDto,
} from "../dtos/SubmissionDto";
import { Submission } from "../entity/Submission";
import { ISubmissionRepository } from "../repository/ISubmissionRepository";

export class SubmissionService {
  constructor(private submissionRepository: ISubmissionRepository) {}

  async createSubmission(
    submissionDto: CreateSubmissionDto
  ): Promise<SubmissionResponseDto> {
    try {
      const submission = new Submission(
        uuidv4(),
        submissionDto.code,
        submissionDto.language,
        submissionDto.expectedOutput
      );

      const savedSubmission = await this.submissionRepository.saveSubmission(
        submission
      );
      if (!savedSubmission) {
        throw new Error("Failed to create submission");
      }

      return {
        submission: savedSubmission,
      };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async getSubmissionById(id: string): Promise<SubmissionResponseDto> {
    try {
      const submission = await this.submissionRepository.getSubmissionById(id);
      if (!submission) {
        throw new Error("Submission not found");
      }
      return {
        submission: submission,
      };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async updateSubmission(
    id: string,
    submissionDto: UpdateSubmissionDto
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionRepository.getSubmissionById(id);
    if (!submission) {
      throw new Error("Submission not found");
    }
    if (submissionDto.status) {
      submission.setStatus(submissionDto.status);
    }
    if (submissionDto.output) {
      submission.setStdOutput(submissionDto.output);
    }
    if (submissionDto.result) {
      submission.setResult(submissionDto.result);
    }
    const updatedSubmission = await this.submissionRepository.updateSubmission(
      submission
    );
    return {
      submission: updatedSubmission,
    };
  }
}
