import express from "express";
import { SYSTEM_PROMPT } from "./utils/systemPrompt";
import { client } from "./config/openaiclient";
const app = express();

app.post("/chat", async (req, res) => {
  try {
    const { context, extractedCode, chatMessagesHistory, userMessage } =
      req.body;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const systemPromptModified = SYSTEM_PROMPT.replace(
      "{{problem_statement}}",
      context.problemStatement
    )
      .replace("{{programming_language}}", context.programmingLanguage)
      .replace("{{user_code}}", extractedCode);

    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPromptModified },
        ...chatMessagesHistory.map((chat: ChatMessage) => ({
          role: chat.role,
          content: chat.message,
        })),
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(
          JSON.stringify({
            role: "assistant",
            message: content,
            type: "text",
          }) + "\n"
        );
      }
    }
    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error });
  }
});
export interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}

app.listen(8080, () => {
  console.log("Server is running on port 3000");
});
