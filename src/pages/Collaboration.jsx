import React, { useState, useRef, useEffect } from "react";

const Collaboration = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Ahmad",
      text: "Hey team 👋 Let's start working on this project.",
      time: "10:20",
    },
    {
      id: 2,
      author: "Sara",
      text: "Sure! I will handle the frontend.",
      time: "10:22",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        author: "You",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setMessage("");
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">

      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-white border-r flex flex-col">

        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800 text-lg">
            👥 Team Members
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {["Ahmad", "Sara", "John"].map((user) => (
            <div
              key={user}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow">
                {user.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user}</p>
                <p className="text-xs text-green-500">online</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="p-5 bg-white border-b flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              🚀 Project Discussion
            </h1>
            <p className="text-xs text-gray-500">
              Real-time collaboration space
            </p>
          </div>

          <div className="flex -space-x-2">
            {["A", "S", "J"].map((u, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs border-2 border-white"
              >
                {u}
              </div>
            ))}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.author === "You" ? "justify-end" : "justify-start"
              }`}
            >

              {msg.author !== "You" && (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                  {msg.author.charAt(0)}
                </div>
              )}

              <div
                className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.author === "You"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] opacity-70 block mt-1 text-right">
                  {msg.time}
                </span>
              </div>

              {msg.author === "You" && (
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  Y
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-5 bg-white border-t">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full shadow-inner">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Write a message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm transition"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Collaboration