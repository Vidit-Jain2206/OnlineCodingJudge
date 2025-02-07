import { dbPool } from "../config/database.config";
import { Submission } from "../entity/Submission";
import { ISubmissionRepository } from "./ISubmissionRepository";

export class SubmissionRepositoryImp implements ISubmissionRepository {
  constructor() {}
  async getSubmissionById(id: string): Promise<Submission | null> {
    const query = `SELECT * FROM submissions WHERE id = $1`;
    const result = await dbPool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateSubmission(submission: Submission): Promise<Submission> {
    const query = `UPDATE submissions SET status = $1, output = $2, updated_at = $2 WHERE id = $3 RETURNING *`;
    const result = await dbPool.query(query, [
      submission.getStatus(),
      submission.getStdOutput(),
      submission.getUpdatedAt(),
      submission.getId(),
    ]);
    return result.rows[0];
  }

  async saveSubmission(submission: Submission): Promise<Submission> {
    const query = `INSERT INTO submissions ( id, source_code, language, expected_output, status, created_at ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result = await dbPool.query(query, [
      submission.getId(),
      submission.getCode(),
      submission.getLanguage(),
      submission.getExpectedOutput(),
      submission.getStatus(),
      submission.getCreatedAt(),
    ]);

    return result.rows[0];
  }
}
