"use client";
import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

const FAQ = () => {
    const faqData = [
        {
          question: "What is RecycleRight?",
          answer:
            "RecycleRight is an AI-powered platform that helps you classify waste, find eco-friendly alternatives, learn about environmental impact, and discover proper disposal and recycling methods. It also offers an AI chatbot for waste-related queries, a recycling facility locator, and the latest sustainability news.",
        },
        {
          question: "How does the waste classification work?",
          answer:
            "Simply enter the name of your item, and our AI will predict its waste category. You’ll also get insights on how to dispose of it properly, along with sustainable alternatives.",
        },
        {
          question: "Why is proper waste disposal important?",
          answer:
            "Incorrect disposal can harm the environment, pollute water and soil, and contribute to climate change. RecycleRight helps you make informed decisions to reduce waste and promote recycling.",
        },
        {
          question: "Can I find nearby recycling centers using RecycleRight?",
          answer:
            "Yes! Our Recycling Facility Locator helps you find the nearest recycling centers based on your location, making it easy to dispose of waste responsibly.",
        },
        {
          question: "How can I stay updated on waste management news?",
          answer:
            "You can check out our News Feed for the latest updates on waste management, sustainability, and recycling. You can also subscribe to our newsletter for regular insights.",
        },
        {
          question: "Is RecycleRight free to use?",
          answer:
            "Yes! RecycleRight is completely free and designed to help individuals and communities adopt better waste management practices effortlessly.",
        },
      ];
      

  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index: any) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  return (
    <section suppressHydrationWarning={true as any} className="md:mb-40">
      <Container >
        <Row>
          <Col>
            <h2 className="text-center text-3xl">Frequently Asked Questions</h2>
            <div className="mt-8">
              {faqData.map((item, index) => (
                <div
                  className={`mb-6 p-8 rounded-xl shadow-md ${
                    activeQuestion === index ? "active" : ""
                  }`}
                  key={index}
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-center justify-between text-center gap-12">
                    <h4 className="text-2xl font-bold">
                      {item.question}
                      <span className="text-xl font-semibold ">
                        {activeQuestion === index ? (
                          <RiArrowDropUpLine />
                        ) : (
                          <RiArrowDropDownLine />
                        )}
                      </span>
                    </h4>
                  </div>
                  {activeQuestion === index && (
                    <p className="text-xl mt-4 ">{item.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default FAQ;
