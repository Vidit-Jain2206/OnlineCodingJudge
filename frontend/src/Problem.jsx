import { useEffect, useState } from "react";
import { Split, Play, Check } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { problem } from "./utils/Problem";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_SERVER_URL = "http://localhost:8000"; // Change this to your server URL

const ProblemLayout = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(problem.boilerPlateCode);
  const [status, setStatus] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("submission:completed", (data) => {
        console.log(data);
        setStatus("Completed");
      });
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post("http://localhost:3000/submissions", {
        code,
        language,
        expectedOutput: problem.examples[0].output,
      });
      const id = data.submission.id;
      const status = data.submission.status;
      console.log(data);
      setStatus(status);
      socket.emit("join:room", id);
    } catch (error) {}
  };

  console.log(status);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description Panel */}
        <div className="w-2/5 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 text-left">
              <h2 className="text-2xl font-bold text-gray-800 text-left">
                {problem.title}
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {problem.difficulty}
              </span>
            </div>

            <div className="prose max-w-none text-left">
              <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                {problem.description}
              </p>

              <h3 className="text-lg font-semibold mb-2 text-black">
                Example 1:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-black">
                <p className="font-mono text-sm mb-2">
                  Input: {problem.examples[0].input}
                </p>
                <p className="font-mono text-sm mb-2">
                  Output: {problem.examples[0].output}
                </p>
                <p className="text-sm text-gray-600">
                  {problem.examples[0].explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className={`w-3/5 flex flex-col bg-white`}>
          {/* Language Selector */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between text-black">
            <select
              className="px-3 py-2 border rounded-md bg-white"
              value={language}
              disabled
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Code Editor */}
          <div className="flex-1 bg-gray-900 overflow-hidden">
            <Editor
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-gray-900 text-gray-200 font-mono resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Console/Output */}
          <div className="h-1/4 border-t border-gray-200 bg-gray-50 overflow-hidden">
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <button
                className="text-sm text-white hover:text-gray-300 px-2 py-1 selection:outline-none"
                onClick={handleSubmit}
              >
                submit
              </button>
            </div>
            <div className="p-4 font-mono text-sm text-gray-600 h-full overflow-y-auto">
              {status === "pending" && (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemLayout;
