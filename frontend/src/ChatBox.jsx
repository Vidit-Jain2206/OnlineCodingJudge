import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { problem } from "./utils/Problem";

const URL = "http://localhost:8080";
const ChatBox = ({ code, language, setChatBoxExpanded }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket = io(URL);
    setSocket(socket);
    socket.emit("join:room", problem.id);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("chat:response", (data) => {
        setChatHistory((prev) => [...prev, data]);
      });
    }
  }, [socket]);

  console.log(chatHistory);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    if (socket) {
      socket.emit(
        "chat:message",
        {
          problemStatement: problem.description,
          programmingLanguage: language,
        },
        code,
        chatHistory,
        userMessage,
        problem.id
      );
    }
    setChatHistory((prev) => [
      ...prev,
      { message: userMessage, role: "user", type: "text" },
    ]);
    setUserMessage("");
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
      {/* Chat History (Scrollable) */}
      <div className="flex flex-col space-y-2 mt-8 mx-2 max-h-[600px] overflow-y-auto">
        {chatHistory.length > 0 &&
          chatHistory.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-xs ${
                message.role === "user"
                  ? "bg-[#A7C7E7] text-gray-800 self-end" // Soft pastel blue for user messages
                  : "bg-[#B5EAD7] text-gray-800 self-start" // Soft pastel green for bot messages
              }`}
            >
              {message.message}
            </div>
          ))}
      </div>

      {/* Input Field */}
      <div className="flex items-center p-2 bg-white border-t rounded-b-lg">
        <input
          type="text"
          className="flex-1 px-2! py-1! border-2 text-black border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
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
