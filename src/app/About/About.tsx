"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import feature from "../../assets/ai with nature.jpg";

const About = () => {
  return (
    <section suppressHydrationWarning={true as any} className="section features" id="features" aria-label="features">
      <div className="container mx-auto px-4 text-center">
        <p className="section-subtitle font-bold text-gray-700 mb-2">
        -About RecyleRight-
        </p>

        <h2 className=" text-4xl section-title font-bold text-black mb-4">
        Smarter Waste Management for a Greener Future
        </h2>

        <div className=" mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-10 items-center justify-between text-center md:text-left">
            <div className="md:w-1/2 mb-4 md:mb-0 md:pl-8">
              <p className="section-text text-3xl text-gray-600 leading-relaxed">
              Every day, we dispose of items without truly knowing where they belong. <b>RecycleRight</b> simplifies waste management by helping you identify waste categories, discover eco-friendly alternatives, understand environmental impact, and learn proper disposal methods. With <b>AI-powered classification</b>, <b>real-time recycling facility locators</b>, and <b>up-to-date waste management news</b>, we ensure you stay informed and make responsible choices. Staying updated on the latest sustainability trends is crucial in tackling waste challenges effectively. <b>Together, let’s reduce waste, recycle smarter, and create a cleaner, greener future!</b> 🌍💚
              </p>
              <div className="flex flex-wrap justify-center md:justify-start">
                <p className="btn btn-primary mr-3">
                  <Link href="/contactus"> Contact Us</Link>
                </p>
                <p className="btn btn-secondary mr-3">
                  <Link href="/news-feed"> Green News! </Link>
                </p>{" "}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center section-banner has-before">
              <Image
                src={feature}
                alt="Image"
                width={400}
                height={400}
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
