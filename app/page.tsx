"use client"; // Ensures client-side rendering for hooks

import Link from "next/link";
import React, { useState } from "react";
import Particles from "./components/particles";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]); // Add state
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <nav className="my-16 animate-fade-in">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm duration-500 text-zinc-500 hover:text-zinc-300"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>

      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={200}
      />

      <h1 className="py-3.5 px-0.5 z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
        aaryan dave
      </h1>

      <div className="my-16 text-center animate-fade-in">
        <h2 className="text-sm text-zinc-500">
          I'm building <u>Wave</u> to redefine how you can interact with a computer.
        </h2>
      </div>

      {/* Chat Section */}
      <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in delay-1000">
        {messages.length > 0 && (
        <div className="h-64 overflow-y-auto border border-zinc-700 rounded-2xl p-2 bg-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <p
                className={`text-sm ${
                  msg.role === "user" ? "text-zinc-500" : "text-zinc-100"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}
          {loading && <p className="text-sm text-zinc-500">Thinking... because he's just so interesting...</p>}
        </div>
        )}
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 p-2 rounded-l-2xl border border-zinc-700 bg-transparent text-zinc-500 focus:outline-none"
            placeholder="Ask me anything about Aaryan!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="p-2 border border-zinc-700 bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-r-2xl"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}