"use client"; // Ensures client-side rendering for hooks

import React, { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {messages.length > 0 && (
        <div
          ref={chatContainerRef}
          className="h-64 overflow-y-auto border border-zinc-700 rounded-2xl p-4 bg-transparent"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              {msg.content.split("\n").map((line, index) => (
                <p
                  key={index}
                  className={`text-sm mb-2 ${
                    msg.role === "user" ? "text-zinc-500" : "text-zinc-100"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-zinc-500 animate-pulse">
              Thinking... because he's just so interesting...
            </p>
          )}
        </div>
      )}
      <div className="flex mt-4 animate-fade-in delay-1000">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-2xl border border-zinc-700 bg-transparent text-zinc-500 focus:outline-none text-base placeholder:font-inter placeholder:text-zinc-500"
          placeholder="Ask me anything about Aaryan!"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="p-3 border border-zinc-700 bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-r-2xl"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}