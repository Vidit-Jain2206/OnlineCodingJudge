import { Submission, SubmissionStatus } from "../entity/Submission";

export interface CreateSubmissionDto {
  code: string;
  language: string;
  expectedOutput: string;
}
export interface SubmissionResponseDto {
  submission: Submission;
}

export interface UpdateSubmissionDto {
  status?: SubmissionStatus;
  output?: string;
  result?: string;
}
