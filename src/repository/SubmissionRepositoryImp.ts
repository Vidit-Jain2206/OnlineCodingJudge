import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schema";
import { ISubmissionRepository } from "./ISubmissionRepository";
import { Submission, SubmissionStatus } from "../entity/Submission";
import { submissions } from "../database/schema";

export class SubmissionRepositoryImp implements ISubmissionRepository {
  constructor(private db: MySql2Database<typeof schema>) {}

  async getSubmissionById(id: string): Promise<Submission | null> {
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
    newSub.setStdOutput(row.output || "");
    return newSub;
  }

  async updateSubmission(submission: Submission): Promise<Submission> {
    const result = await this.db
      .update(submissions)
      .set({
        status: submission.getStatus(),
        output: submission.getStdOutput(),
      })
      .where(eq(submissions.id, submission.getId()));

    return submission;
  }

  async saveSubmission(submission: Submission): Promise<Submission> {
    const result = await this.db.insert(submissions).values({
      id: submission.getId(),
      sourceCode: submission.getCode(),
      language: submission.getLanguage(),
      expectedOutput: submission.getExpectedOutput(),
      status: submission.getStatus(),
      createdAt: submission.getCreatedAt(),
    });

    return submission;
  }
}
