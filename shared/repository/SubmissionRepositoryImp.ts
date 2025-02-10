import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../shared/database/schema";
import { ISubmissionRepository } from "../repository/ISubmissionRepository";
import { Submission, SubmissionStatus } from "../../shared/entity/Submission";
import { submissions } from "../../shared/database/schema";

export class SubmissionRepositoryImp implements ISubmissionRepository {
  constructor(private db: any) {}

  async getSubmissionById(id: string): Promise<Submission | null> {
    try {
      const result = await this.db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      const newSub = new Submission(
        row.id,
        row.sourceCode,
        row.language,
        row.expectedOutput
      );
      newSub.setStatus(row.status as SubmissionStatus);
      newSub.setCreatedAt(row.createdAt || new Date());
      newSub.setUpdatedAt(row.updatedAt || new Date());
      newSub.setResult(row.result || "");
      newSub.setStdOutput(row.stdOutput || "");
      return newSub;
    } catch (error) {
      throw new Error("Failed to get submission");
    }
  }

  async updateSubmission(submission: Submission): Promise<Submission> {
    try {
      const result = submission.getResult();
      await this.db
        .update(submissions)
        .set({
          status: submission.getStatus(),
          stdOutput: submission.getStdOutput(),
          updatedAt: new Date(),
          result: result,
        })
        .where(eq(submissions.id, submission.getId()));

      return submission;
    } catch (error) {
      throw new Error("Failed to update submission");
    }
  }

  async saveSubmission(submission: Submission): Promise<Submission> {
    try {
      const result = await this.db.insert(submissions).values({
        id: submission.getId(),
        sourceCode: submission.getCode(),
        language: submission.getLanguage(),
        expectedOutput: submission.getExpectedOutput(),
        status: submission.getStatus(),
        stdOutput: submission.getStdOutput(),
        result: submission.getResult(),
        createdAt: submission.getCreatedAt(),
        updatedAt: submission.getUpdatedAt(),
      });

      return submission;
    } catch (error) {
      throw new Error("Failed to create submission");
    }
  }
}
