export class Submission {
  private id: string;
  private code: string;
  private language: string;
  private expectedOutput: string;
  private stdOutput: string;
  private status: SubmissionStatus;
  private createdAt: Date;
  private updatedAt: Date;
  private result: string;

  constructor(
    id: string,
    code: string,
    language: string,
    expectedOutput: string
  ) {
    this.id = id;
    this.code = code;
    this.language = language;
    this.expectedOutput = expectedOutput;
    this.status = SubmissionStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.result = "";
    this.stdOutput = "";
  }

  getId() {
    return this.id;
  }

  getCode() {
    return this.code;
  }

  getLanguage() {
    return this.language;
  }

  getExpectedOutput() {
    return this.expectedOutput;
  }

  getStdOutput() {
    return this.stdOutput;
  }

  getStatus() {
    return this.status;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getResult() {
    return this.result;
  }

  setResult(result: string) {
    this.result = result;
  }

  setStdOutput(stdOutput: string) {
    this.stdOutput = stdOutput;
  }

  setStatus(status: SubmissionStatus) {
    this.status = status;
  }
}

export enum SubmissionStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  ERROR = "error",
  TIMEOUT = "timeout",
}
