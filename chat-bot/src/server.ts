import express from "express";
import { SYSTEM_PROMPT } from "./utils/systemPrompt";
import { client, createAssistant } from "./config/openaiclient";
const app = express();

let assistantId: string = "";
createAssistant().then((id) => {
  assistantId = id;
});

app.post("/chat", async (req, res) => {
  try {
    const { userMessage, threadId } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });
    const stream = await client.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    for await (const event of stream) {
      if (event.event === "thread.message.delta") {
        let content: string = "";
        const deltaBlock = event?.data?.delta?.content?.[0];
        if (deltaBlock?.type === "text") {
          content = deltaBlock?.text?.value as string;
        }
        if (content) {
          res.write(
            JSON.stringify(
              {
                role: "assistant",
                message: content,
                type: "text",
              } + "\n"
            )
          );
        }
      }
    }
    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error });
  }
});

app.post("/initialise_chat", async (req, res) => {
  try {
    const { context, extractedCode } = req.body;
    const systemPromptModified = SYSTEM_PROMPT.replace(
      "{{problem_statement}}",
      context.problemStatement
    )
      .replace("{{programming_language}}", context.programmingLanguage)
      .replace("{{user_code}}", extractedCode);

    const thread = await client.beta.threads.create({
      messages: [{ role: "assistant", content: systemPromptModified }],
    });

    res.json({ threadId: thread.id });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
export interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
