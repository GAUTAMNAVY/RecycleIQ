"use client";

import { useEffect } from "react";
import Script from "next/script";

// 🔹 Extend the Window object to define `dataLayer`
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GoogleAnalytics = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];

      // ✅ Use a function expression instead of a declaration
      window.gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };

      window.gtag("js", new Date());
      window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_TAG);
    }
  }, []);

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5QLTMJKRNP"
      />
    </>
  );
};

export default GoogleAnalytics;
