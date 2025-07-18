"use client";
import Home from "./home/Home";
import Chatbot from "./Chatbot/Chatbot";

export default function App() {

  return (
    <div suppressHydrationWarning={true as any}>
      <Home/>
      <Chatbot />
    </div>
  );
}
