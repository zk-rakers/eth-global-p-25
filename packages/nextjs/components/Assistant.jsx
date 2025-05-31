'use client';

import React, { useState, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';

const Assistant = () => {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a helpful assistant. For troubleshooting queries, ask follow-up questions to gather details before giving solutions. You can also generate service listings from keywords, summarize proposals, or compare different service offers as requested."
    }
  ]);
  const [engine, setEngine] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [initProgress, setInitProgress] = useState("");
  const [generating, setGenerating] = useState(false);
  const [openAiApiKey, setOpenAiApiKey] = useState("");

  const LOCAL_MODEL_ID = "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC";

  useEffect(() => {
    let isCancelled = false;
    const initEngine = async () => {
      try {
        const newEngine = await webllm.CreateMLCEngine(LOCAL_MODEL_ID, {
          initProgressCallback: (report) => setInitProgress(report.text)
        });
        if (!isCancelled) {
          setEngine(newEngine);
          console.log("Engine methods:", Object.keys(newEngine));
          console.log("Local model loaded successfully.");
        }
      } catch (err) {
        console.error("Failed to load local model:", err);
      } finally {
        if (!isCancelled) setLoadingModel(false);
      }
    };
    initEngine();
    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    let newSystem = "You are a helpful assistant.";
    if (mode === "listing") newSystem = "You are a skilled copywriter generating listings.";
    else if (mode === "summarize") newSystem = "You are a summarization assistant.";
    else if (mode === "compare") newSystem = "You compare service offers clearly.";
    setMessages([{ role: "system", content: newSystem }]);
  }, [mode]);

  const handleSend = async (userInput) => {
    if (!userInput || generating) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages([...newMessages, { role: "assistant", content: "...(thinking)..." }]);
    setGenerating(true);

    try {
      let inputMessages = [];

      if (mode === "chat") {
        inputMessages = [
          ...messages.filter(m => m.role !== "assistant"),
          { role: "user", content: userInput }
        ];
      } else if (mode === "listing") {
        inputMessages = [
          { role: "system", content: "You are a professional copywriter. Generate a polished service listing." },
          { role: "user", content: `Keywords: ${userInput}` }
        ];
      } else if (mode === "summarize") {
        inputMessages = [
          { role: "system", content: "You are a summarization assistant." },
          { role: "user", content: `Summarize:\n${userInput}` }
        ];
      } else if (mode === "compare") {
        const [a, b] = userInput.split(/\s*-{3,}\s*/);
        inputMessages = [
          { role: "system", content: "You are a service comparison assistant." },
          { role: "user", content: `Compare the following two offers:\nOffer A:\n${a}\n\nOffer B:\n${b}` }
        ];
      }

      let reply = "";

      if (engine) {
        const result = await engine.chat.completions.create({
          messages: inputMessages,
          stream: false
        });
        reply = result.choices[0].message.content;
      } else if (openAiApiKey) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: inputMessages
          })
        });
        const data = await response.json();
        reply = data?.choices?.[0]?.message?.content || "(no reply)";
      } else {
        reply = "⚠️ Model unavailable and no GPT-4 key provided.";
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: reply.trim() };
        return updated;
      });
    } catch (err) {
      console.error("Generation failed", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "⚠️ Error generating response."
        };
        return updated;
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white border border-gray-300 rounded shadow">
      <div className="mb-3">
        <label className="mr-2 font-medium text-gray-700">Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="p-1 border border-gray-300 rounded">
          <option value="chat">🤖 Chat (Triage Assistant)</option>
          <option value="listing">📝 Listing Generator</option>
          <option value="summarize">🔎 Summarizer</option>
          <option value="compare">📊 Comparator</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="mr-2 text-sm text-gray-600">OpenAI API Key (optional for GPT-4):</label>
        <input
          type="password"
          placeholder="sk-..."
          value={openAiApiKey}
          onChange={(e) => setOpenAiApiKey(e.target.value)}
          className="w-60 p-1 border border-gray-300 rounded text-sm"
        />
      </div>

      {loadingModel ? (
        <div className="text-sm text-gray-500 mb-3">
          <span className="animate-pulse">🤖 Loading local AI model... {initProgress}</span>
        </div>
      ) : (
        !engine && <div className="text-sm text-red-600 mb-3">⚠️ Local model not loaded. You can still use GPT-4 if you provide an API key.</div>
      )}

      <div className="mb-3 border border-gray-200 p-3 rounded h-64 overflow-y-auto flex flex-col space-y-2">
        {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`max-w-[80%] p-2 rounded ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800 self-start' : 'bg-blue-500 text-white self-end'}`}>
            {msg.content}
          </div>
        ))}
      </div>

      {mode === "chat" && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(e.target.value); }}
            disabled={generating || loadingModel}
          />
          <button
            onClick={(e) => {
              const inputElem = e.currentTarget.previousSibling;
              if (inputElem && inputElem.value) {
                handleSend(inputElem.value);
                inputElem.value = "";
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={generating || loadingModel}>
            Send
          </button>
        </div>
      )}

      {mode === "listing" && (
        <div className="flex flex-col space-y-2">
          <textarea
            rows="2"
            placeholder="Enter a few keywords (e.g. 'plumber, kitchen sink, emergency')"
            className="p-2 border border-gray-300 rounded"
            disabled={generating || loadingModel}
            id="listing-input"
          ></textarea>
          <button
            onClick={() => {
              const inputElem = document.getElementById('listing-input');
              if (inputElem && inputElem.value) {
                handleSend(inputElem.value);
              }
            }}
            className="self-start bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={generating || loadingModel}>
            Generate Listing
          </button>
        </div>
      )}

      {mode === "summarize" && (
        <div className="flex flex-col space-y-2">
          <textarea
            rows="4"
            placeholder="Paste the full proposal or text to summarize..."
            className="p-2 border border-gray-300 rounded"
            disabled={generating || loadingModel}
            id="summ-input"
          ></textarea>
          <button
            onClick={() => {
              const inputElem = document.getElementById('summ-input');
              if (inputElem && inputElem.value) {
                handleSend(inputElem.value);
              }
            }}
            className="self-start bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={generating || loadingModel}>
            Summarize
          </button>
        </div>
      )}

      {mode === "compare" && (
        <div className="flex flex-col space-y-2">
          <textarea
            rows="4"
            placeholder="Paste Offer 1 here..."
            className="p-2 border border-gray-300 rounded"
            id="offerA"
            disabled={generating || loadingModel}
          ></textarea>
          <textarea
            rows="4"
            placeholder="Paste Offer 2 here..."
            className="p-2 border border-gray-300 rounded"
            id="offerB"
            disabled={generating || loadingModel}
          ></textarea>
          <button
            onClick={() => {
              const a = document.getElementById('offerA')?.value || "";
              const b = document.getElementById('offerB')?.value || "";
              if (a && b) {
                handleSend(`${a}\n---\n${b}`);
              }
            }}
            className="self-start bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={generating || loadingModel}>
            Compare Offers
          </button>
        </div>
      )}
    </div>
  );
};

export default Assistant; 