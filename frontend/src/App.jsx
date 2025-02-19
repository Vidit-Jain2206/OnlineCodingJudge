import { useState } from "react";
import "./App.css";
import ProblemLayout from "./Problem";
import ChatBox from "./ChatBox";
import { problem } from "./utils/Problem";

function App() {
  const [chatBoxExpanded, setChatBoxExpanded] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(problem?.boilerPlateCode);

  return (
    <div className="relative">
      <ProblemLayout
        code={code}
        setCode={setCode}
        language={language}
        setLanguage={setLanguage}
      />
      <div className="w-[30%] flex justify-end items-end absolute bottom-4 right-0">
        {!chatBoxExpanded && (
          <button
            className=" outline-none selection:outline-none"
            onClick={() => setChatBoxExpanded(true)}
          >
            Ask AI
          </button>
        )}
        {chatBoxExpanded && (
          <ChatBox
            setChatBoxExpanded={setChatBoxExpanded}
            code={code}
            language={language}
          />
        )}
      </div>
    </div>
  );
}

export default App;
