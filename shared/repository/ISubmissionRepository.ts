import { Submission } from "../../shared/entity/Submission";

export interface ISubmissionRepository {
  getSubmissionById(id: string): Promise<Submission | null>;
  updateSubmission(submission: Submission): Promise<Submission>;
  saveSubmission(submission: Submission): Promise<Submission>;
}
