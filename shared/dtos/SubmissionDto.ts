import { SubmissionStatus } from "../entity/Submission";

export interface CreateSubmissionDto {
  code: string;
  language: string;
  expectedOutput: string;
}
export interface SubmissionResponseDto {
  id: string;
  status: SubmissionStatus;
  createdAt: Date;
}

export interface UpdateSubmissionDto {
  status?: SubmissionStatus;
  output?: string;
}
