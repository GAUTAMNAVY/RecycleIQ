"use client";
import React from "react";
import { motion } from "framer-motion";
import ChatWithAI from "./ChatWithAI";

const Page = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="my-8 md:mt-20 md:pt-8">
          <ChatWithAI />
        </div>
      </motion.div>
    </>
  );
};

export default Page;
