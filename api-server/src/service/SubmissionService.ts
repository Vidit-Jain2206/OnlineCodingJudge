import { v4 as uuidv4 } from "uuid";
import {
  CreateSubmissionDto,
  SubmissionResponseDto,
  UpdateSubmissionDto,
} from "../../../shared/dtos/SubmissionDto";
import { Submission } from "../../../shared/entity/Submission";
import { ISubmissionRepository } from "../../../shared/repository/ISubmissionRepository";
import { QueueService } from "./QueueService";

export class SubmissionService {
  constructor(
    private submissionRepository: ISubmissionRepository,
    private queueService: QueueService
  ) {}

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
      await this.queueService.addJob("submission", {
        id: savedSubmission.getId(),
      });
      return {
        id: savedSubmission.getId(),
        status: savedSubmission.getStatus(),
        createdAt: savedSubmission.getCreatedAt(),
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
        id: submission.getId(),
        status: submission.getStatus(),
        createdAt: submission.getCreatedAt(),
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
    const updatedSubmission = await this.submissionRepository.updateSubmission(
      submission
    );
    return {
      id: updatedSubmission.getId(),
      status: updatedSubmission.getStatus(),
      createdAt: updatedSubmission.getCreatedAt(),
    };
  }
}
