import { Server } from "socket.io";
import { ChatMessage } from "../server";
import { client } from "../config/openaiclient";
import { SYSTEM_PROMPT } from "../utils/systemPrompt";

export class SocketService {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
  }

  async joinRoom(socketId: string, roomId: string) {
    this.io.sockets.sockets.get(socketId)?.join(roomId);
  }

  async sendMessage(roomId: string, message: ChatMessage) {
    console.log("sending back to ", roomId, message);
    this.io.to(roomId).emit("chat:response", message);
  }

  async generateResponse(
    context: { problemStatement: string; programmingLanguage: string },
    extractedCode: string,
    chatMessagesHistory: ChatMessage[],
    userMessage: string
  ): Promise<ChatMessage> {
    // generate response from chat messages and return the message

    const systemPromptModified = SYSTEM_PROMPT.replace(
      "{{problem_statement}}",
      context.problemStatement
    )
      .replace("{{programming_language}}", context.programmingLanguage)
      .replace("{{user_code}}", extractedCode);

    const apiResponse = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPromptModified },
        ...chatMessagesHistory.map((chat) => ({
          role: chat.role,
          content: chat.message,
        })),
        { role: "user", content: userMessage },
      ],
    });
    if (apiResponse.choices[0].message.content) {
      const result = JSON.parse(apiResponse.choices[0].message.content);
      console.log(result);
      if ("output" in result) {
        return {
          message: result.output,
          role: "assistant",
          type: "markdown",
        };
      }
    }
    return {} as ChatMessage;
  }
}
