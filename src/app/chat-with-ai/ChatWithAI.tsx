"use client";
import { useState, useEffect } from "react";
import { FiZap } from "react-icons/fi";
import Image from "next/image";
import logo from '../../assets/ai human.png';

export default function ChatWithAI() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! Ask me anything about waste management." },
  ]);
  const [input, setInput] = useState("");
  const [showImage, setShowImage] = useState(true);

  // Detect screen width and hide image if width is below 718px
  useEffect(() => {
    const handleResize = () => {
      setShowImage(window.innerWidth > 718);
    };

    // Initial check
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chatwithai/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input }),
        }
      );
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I can't process your request right now." },
      ]);
    }
  };

  return (
    <>
      <br /><br /><br /><br />
      <div
        suppressHydrationWarning={true as any}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'white',
          padding: '20px',
          gap: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Left-side Image covering full height */}
        {showImage && (
          <div
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              maxWidth: '40vw',
              height: '100vh',
            }}
          >
            <Image
              src={logo}
              alt="Recycling"
              width={500}
              height={700}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
        )}

        {/* Chat Container */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '700px',
            backgroundColor: '#F9FAFB',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1
            style={{
              color: '#1F2937',
              borderBottom: '3px solid #1F2937',
              padding: '5px 8px',
              fontSize: '30px',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Chat with WasteWise AI <FiZap />
          </h1>

          <div
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              height: '480px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              border: '1px solid #E5E7EB',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  maxWidth: '75%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#10B981' : '#E5E7EB',
                  color: msg.sender === 'user' ? 'white' : '#1F2937',
                }}
              >
                {msg.sender === 'ai' ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', marginTop: '20px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about waste management..."
              style={{
                backgroundColor: '#F3F4F6',
                flex: '1',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                marginRight: '10px',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
