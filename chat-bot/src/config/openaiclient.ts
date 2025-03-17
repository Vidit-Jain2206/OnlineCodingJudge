import OpenAI from "openai";
import "dotenv/config";

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function createAssistant() {
  const assistant = await client.beta.assistants.create({
    name: "My Chatbot",
    instructions: "You are a helpful assistant.",
    model: "gpt-4o",
  });
  return assistant.id;
}
