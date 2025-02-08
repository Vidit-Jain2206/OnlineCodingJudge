import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const submissions = mysqlTable("submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sourceCode: text("source_code").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  expectedOutput: text("expected_output").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  output: text("output"),
  executionTime: int("execution_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
