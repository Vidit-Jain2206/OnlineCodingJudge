import React, { useEffect, useRef, useState } from "react";
import { problem } from "./utils/Problem";
import axios from "axios";

const URL = "http://localhost:8080";
const ChatBox = ({ code, language, setChatBoxExpanded }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [threadId, setThreadId] = useState("");
  const lastMessageRef = useRef();

  useEffect(() => {
    async function initialiseChat() {
      const { data } = await axios.post(
        "/http://localhost:8080/initialise_chat",
        {
          context: {
            problemStatement: problem.description,
            programmingLanguage: language,
          },
          extractedCode: code,
        }
      );
      setThreadId(data.threadId);
    }
    initialiseChat();
  }, []);

  // useEffect(() => {
  //   const socket = io(URL);
  //   setSocket(socket);
  //   socket.emit("join:room", problem.id);
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("chat:response", (data) => {
  //       setChatHistory((prev) => [...prev, data]);
  //     });
  //   }
  //   lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [socket]);

  // console.log(chatHistory);

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    const response = await fetch("http://localhost:8080/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, userMessage }),
    });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = { role: "assistant", message: "", type: "text" };

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode incoming data and parse JSON
        const chunks = decoder
          .decode(value, { stream: true })
          .split("\n")
          .filter(Boolean);
        chunks.forEach((chunk) => {
          try {
            const parsedChunk = JSON.parse(chunk);
            if (parsedChunk.role === "assistant") {
              assistantMessage.message += parsedChunk.message;
              setChatHistory((prev) => [
                ...prev,
                { message: userMessage, role: "user", type: "text" },
                { ...assistantMessage },
              ]);
            }
          } catch (err) {
            console.error("Error parsing chunk:", err);
          }
        });
      }

      setUserMessage("");
    }
  };
  return (
    <div className="flex flex-col w-full max-w-lg mx-auto border-2 border-gray-50 rounded-lg shadow-md bg-white relative">
      <span
        onClick={() => {
          setChatBoxExpanded(false);
        }}
        className="absolute top-2 right-2 w-[10px] h-[10px] text-black font-bold cursor-pointer"
      >
        {" "}
        X
      </span>
      <h1 className="text-black text-[2rem]! font-bold bg-gray-100  py-2">
        Welcome to ChatAI
      </h1>
      {/* Chat History (Scrollable) */}
      <ul className="flex flex-col space-y-2 mt-8 mx-2 max-h-[600px] overflow-y-auto">
        {chatHistory.length > 0 &&
          chatHistory.map((message, index) => (
            <li
              key={index}
              className={`p-2 text-left rounded-lg max-w-xs ${
                message.role === "user"
                  ? "bg-[#A7C7E7] text-gray-800 self-end" // Soft pastel blue for user messages
                  : "bg-[#B5EAD7] text-gray-800 self-start" // Soft pastel green for bot messages
              }`}
            >
              {message.message}
            </li>
          ))}
        <div ref={lastMessageRef} />
      </ul>

      {/* Input Field */}
      <div className="flex items-center p-2 bg-white border-t rounded-b-lg">
        <input
          type="text"
          className="flex-1 px-2! py-1! border-2 text-black border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button
          className="ml-2 px-2! py-1! border-2 border-black bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
