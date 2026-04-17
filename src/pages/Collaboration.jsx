import React, { useState, useEffect } from "react";

const fileTree = [
  { name: "public", type: "folder" },
  { name: "src", type: "folder" },
  {
    name: ".env",
    type: "file",
    content: "URL=http://localhost:5000\nSECOND_URL=http://localhost:5000",
  },
  { name: ".gitignore", type: "file" },
  { name: "README.md", type: "file" },
];

// 🎨 heat colors (GitHub blame style)
const heatColors = [
  "bg-[#f6f8fa]",
  "bg-[#ffe5d0]",
  "bg-[#fcbba1]",
  "bg-[#fc9272]",
  "bg-[#fb6a4a]",
  "bg-[#de2d26]",
];

export default function Collaboration() {
  const [selectedFile, setSelectedFile] = useState(fileTree[2]);
  const [mode, setMode] = useState("code");

  const [content, setContent] = useState(selectedFile.content || "");
  const [originalContent, setOriginalContent] = useState(selectedFile.content || "");

  const [commitMessage, setCommitMessage] = useState("");
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    setContent(selectedFile.content || "");
    setOriginalContent(selectedFile.content || "");
  }, [selectedFile]);

  const hasChanges = content !== originalContent;

  const handleCommit = () => {
    if (!commitMessage) return;

    setCommits([
      {
        id: Date.now(),
        message: commitMessage,
        time: new Date().toLocaleTimeString(),
      },
      ...commits,
    ]);

    setOriginalContent(content);
    setCommitMessage("");
  };

  const lines = content.split("\n");

  return (
    <div className="flex h-screen bg-[#f6f8fa] text-[13px]">

      {/* Sidebar */}
      <div className="w-[280px] bg-white border-r">

        {/* Branch */}
        <div className="p-3 border-b flex justify-between items-center">
          <span className="font-semibold">main</span>
          <span className="text-gray-400">🔍</span>
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <input
            placeholder="Go to file"
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Files */}
        <div className="p-2">
          {fileTree.map((f, i) => (
            <div
              key={i}
              onClick={() => f.type === "file" && setSelectedFile(f)}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                selectedFile.name === f.name ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <span>{f.type === "folder" ? "📁" : "📄"}</span>
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Repo Path */}
        <div className="bg-white border-b px-6 py-3 flex justify-between">
          <div>
            <span className="text-blue-600 font-medium">Front-End</span>
            <span className="mx-1">/</span>
            <span className="bg-gray-200 px-2 py-0.5 rounded">
              {selectedFile.name}
            </span>
          </div>

      
          <div className="text-xs flex items-center gap-2 bg-white-800 border border-[#30363d] text-gray px-3 py-1 rounded-md">
             {/* <span>{commits.length}</span> */}
             {/* <span className="text-gray-500">•</span> */}
             <button className="text-lg leading-none px-2 rounded cursor-pointer">
                 ⋯
             </button>
             </div>
        </div>

        {/* Commit Bar */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
            <div>
              <span className="font-semibold">ezatullah</span>
              <span className="ml-2 text-gray-600">
                {commits[0]?.message || "Add SECOND_URL to env configuration"}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            {commits[0]?.time || "1 minute ago"}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b px-6 py-2 flex gap-6">
          <button
            onClick={() => setMode("code")}
            className={mode === "code" ? "border-b-2 border-black pb-1 font-semibold" : "text-gray-500 cursor-pointer"}
          >
            Code
          </button>
          <button
            onClick={() => setMode("blame")}
            className={mode === "blame" ? "border-b-2 border-black pb-1 font-semibold" : "text-gray-500 cursor-pointer"}
          >
            Blame
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b px-6 py-2 flex justify-end gap-2">
          <button className="border px-2 py-1 rounded cursor-pointer">Raw</button>
          <button className="border px-2 py-1 rounded cursor-pointer">Copy</button>
          <button className="border px-2 py-1 rounded cursor-pointer">Download</button>
        </div>

        {/* Code Area */}
        <div className="flex-1 bg-white font-mono text-sm">

          {mode === "code" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 outline-none"
            />
          ) : (
            <div>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  {/* heat color */}
                  <div className={`w-2 ${heatColors[i % heatColors.length]}`} />

                  {/* line number */}
                  <div className="w-10 text-right pr-3 text-gray-400 select-none">
                    {i + 1}
                  </div>

                  {/* code */}
                  <div className="flex-1 px-2 whitespace-pre">
                    {line}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commit Box */}
        <div className="bg-white border-t p-4">
          <textarea
            placeholder="Commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />

          <button
            onClick={handleCommit}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded text-white ${
              hasChanges ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            Commit changes
          </button>
        </div>
      </div>
    </div>
  );
}

