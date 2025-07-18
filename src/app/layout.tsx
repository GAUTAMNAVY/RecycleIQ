import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import Navbar from "./Header/Navbar";
import Footer from "./Footer/Footer";
import GoogleAnalytics from "./Components/GoogleAnalytics"; // Import Google Analytics

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "RecycleRight",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/favicon.ico?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>
      <body className={poppins.className}>
        <GoogleAnalytics /> {/* ✅ Fix Hydration Error */}
        <NextTopLoader color="#28af60" showSpinner={false} />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
