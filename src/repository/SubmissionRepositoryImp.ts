import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schema";
import { ISubmissionRepository } from "./ISubmissionRepository";
import { Submission, SubmissionStatus } from "../entity/Submission";
import { submissions } from "../database/schema";

export class SubmissionRepositoryImp implements ISubmissionRepository {
  constructor(private db: MySql2Database<typeof schema>) {}

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
