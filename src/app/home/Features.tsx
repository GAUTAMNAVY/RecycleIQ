"use client";
import React from "react";
import AboutUs from "../About/About";

const recycleRightFeatures = [
  {
    number: "01",
    title: "Smart Waste Classification",
    description:
      "Enter a product name, and our AI-powered system will classify its waste category, suggest eco-friendly alternatives, and provide disposal and recycling guidance.",
  },
  {
    number: "02",
    title: "AI-Powered Chat Support",
    description:
      "Get instant answers to your waste management and recycling-related queries with our intelligent chatbot.",
  },
  {
    number: "03",
    title: "Interactive Chatbot for Assistance",
    description:
      "Engage with our AI-driven chatbot for a conversational experience on waste sorting, recycling tips, and sustainability insights.",
  },
  {
    number: "04",
    title: "Stay Informed with Sustainability News",
    description:
      "Access the latest news on waste management and sustainability, and subscribe to our newsletter to stay updated.",
  },
  {
    number: "05",
    title: "Find Nearby Recycling Facilities",
    description:
      "Easily locate the nearest recycling centers to dispose of your waste responsibly.",
  },
  {
    number: "06",
    title: "User-Friendly Experience",
    description:
      "A seamless and intuitive platform that makes waste classification and recycling awareness accessible to everyone.",
  },
  // {
  //   number: "07",
  //   title: "Connect with Us",
  //   description:
  //     "Reach out to us for any queries, suggestions, or collaborations to promote sustainable waste management.",
  // },
];


const Features: React.FC = () => {
  return (
    <>
      <section suppressHydrationWarning={true as any} className=" features" id="features" aria-label="features">
        <div className="container mx-auto px-4 pb-4 text-center">
          <AboutUs />
          <ul className="grid-list section py-20 my-2">
            {recycleRightFeatures.map((feature, index) => (
              <li key={index}>
                <div className="features-card">
                  <data className="card-number" value={feature.number}>
                    {feature.number}
                  </data>
                  <h3 className="h3 card-title">{feature.title}</h3>
                  <p className="card-text text-2xl">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Features;
