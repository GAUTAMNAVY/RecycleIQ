"use client";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ sender: string; text: string; options?: string[]; correctAnswer?: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [doBounce, setDoBounce] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const FUN_FACTS = [
    "Recycling one aluminum can saves enough energy to run a TV for 3 hours! 📺",
    "Glass is 100% recyclable and can be reused endlessly without loss in quality. ♻️",
    "Plastic bags can take up to 1000 years to decompose in landfills! 😱",
    "Recycling one ton of paper saves 17 trees and 7,000 gallons of water. 🌳",
    "E-waste is the fastest-growing waste stream in the world! 🔋",
  ];

  const MENU_OPTIONS = [
    "Learn how to recycle waste items",
    "Find eco-friendly product alternatives",
    "Chat with AI to ask queries",
    "Locate recycling facilities near me",
    "Explore & post blogs",
    "See latest news",
    "Play a quiz",
    "Another fun fact",
  ];

  const QUIZ_QUESTIONS = [
    {
      question: "What is the best way to dispose of electronic waste?",
      options: ["Throw in trash", "Recycle at an e-waste facility", "Burn it", "Bury it"],
      correctAnswer: "Recycle at an e-waste facility",
    },
    {
      question: "Which material is 100% recyclable?",
      options: ["Plastic", "Glass", "Styrofoam", "Rubber"],
      correctAnswer: "Glass",
    },
    {
      question: "How long does it take for a plastic bottle to decompose?",
      options: ["100 years", "450 years", "50 years", "10 years"],
      correctAnswer: "450 years",
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
      setMessages([
        { sender: "bot", text: `👋 Hello! Did you know? ${funFact}` },
        { sender: "bot", text: "How can I assist you today? Select an option below:" },
      ]);
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    setLoading(true);

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (messageText === "7") {
      // Start quiz
      const quiz = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: quiz.question, options: quiz.options, correctAnswer: quiz.correctAnswer },
      ]);
    } else {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });

        const data = await response.json();
        const botMessage = { sender: "bot", text: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error: any) {
        console.error("Error sending message:", error);
        toast.error("Error sending message:", error);
      }
    }

    setLoading(false);
  };

  const handleQuizAnswer = (selectedAnswer: string, correctAnswer: string) => {
    if (selectedAnswer === correctAnswer) {
      setMessages((prev) => [...prev, { sender: "bot", text: "✅ Correct! Great job!" }]);
    } else {
      setMessages((prev) => [...prev, { sender: "bot", text: `❌ Incorrect. The right answer is: ${correctAnswer}` }]);
    }
  };

  return (
    <div suppressHydrationWarning={true as any} className="fixed bottom-4 right-4 z-[5]">
      {/* Speech Bubble Notification */}
      {!isOpen && showNotification && (
        <div className="relative bg-white shadow-lg px-6 py-8 rounded-lg border text-lg font-semibold text-gray-700 animate-fade-in">
          👋 Hi&apos;m here to help you!
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
        </div>
      )}

      {/* Minimized Chat Icon */}
      {!isOpen && (
        <div
          className={`bg-green-500 text-white px-6 py-4 rounded-full shadow-lg cursor-pointer ${
            doBounce ? "animate-bounce" : ""
          }`}
          onClick={() => {
            setIsOpen(true);
            setDoBounce(true);
            setShowNotification(false);
          }}
        >
          Chat with EcoBot🤖!
        </div>
      )}

      {/* Chat Window (Hidden when minimized) */}
      <div className={`w-80 bg-white shadow-xl rounded-xl border border-gray-300 flex flex-col ${isOpen ? "block" : "hidden"}`}>
        {/* Chat Header */}
        <div className="bg-green-600 text-white text-center py-2 rounded-t-xl flex justify-between px-4">
          <span>♻️ EcoBot🤖</span>
          <button onClick={() => setIsOpen(false)}>🔽</button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 max-w-[75%] text-sm rounded-lg ${msg.sender === "user" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"}`} 
              dangerouslySetInnerHTML={{
                __html: msg.text.replace(
                  /<a /g,
                  "<a class='text-blue-600 underline hover:text-blue-800 inline'"
                ),
              }}>
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-500 text-sm text-center">Typing...</div>}
          <div ref={chatEndRef}></div>
        </div>

        {/* Quiz Options */}
        {messages.length > 0 && messages[messages.length - 1].options && (
          <div className="p-2 bg-blue-200 flex flex-wrap justify-center gap-2">
            {messages[messages.length - 1].options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(option, messages[messages.length - 1].correctAnswer!)}
                className="bg-blue-500 text-white text-sm px-2 py-1 rounded w-full text-left"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Menu Options */}
        <div className="p-2 bg-gray-200 flex flex-wrap justify-center gap-2">
          {MENU_OPTIONS.map((option, index) => (
            <button key={index} onClick={() => sendMessage(`${index + 1}`)} className="bg-green-500 text-white text-sm px-2 py-1 rounded w-full text-left">
              {index + 1}. {option}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="p-2 border-t bg-white flex">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something..." className="w-full p-2 border rounded-l outline-none" />
          <button onClick={() => sendMessage(input)} className="bg-green-500 text-white px-4 rounded-r">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
