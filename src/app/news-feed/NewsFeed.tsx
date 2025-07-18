"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw } from "lucide-react";
import { getEmail, getUser } from "../sign-in/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Article {
  title: string;
  image_url?: string; // Make it optional to avoid errors
  description: string;
  link: string;
}

const NewsFeed = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const user = getUser();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    
    const today = new Date().toISOString().split("T")[0]; 
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekFormatted = lastWeek.toISOString().split("T")[0];

    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    const query = "waste recycling sustainability"; // Keywords to search for
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // console.log("Data: ", data);
  
      if (data.results) {
        setNews(data.results);
      } else {
        console.error("No articles found", data);
        toast.error("No articles found");
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
      toast.error("Failed to fetch news");
    }
    
    setLoading(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
  
    if (!email) {
      setError("Please enter an email address.");
      return;
    }
  
    try {
      if(user === null)
      {
        toast.error("Please Login")
        setTimeout(() => {
          window.location.href = "/sign-in"; // Redirect to login page
        }, 2000);
        return;
      }

      const userEmail = user.email;

      if (!userEmail) {
        toast.error("Please Login")
        setTimeout(() => {
          window.location.href = "/sign-in"; // Redirect to login page
        }, 2000);
      }
  
      // ✅ Compare the logged-in email with the entered email
      if (userEmail !== email) {
        setError("Please use the email associated with your account.");
        return;
      }
  
      // ✅ Proceed with subscription if email matches
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Send auth token
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
  
      setSuccessMessage(data.message);
      setEmail(""); // Clear input field after successful subscription
    } catch (error: any) {
      setError(error.message);
    }
  };
  

  return (
    <div suppressHydrationWarning={true as any} className="flex flex-row">
      <div className="max-w-4xl mx-auto p-4">
      <br/><br/><br/><br/>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-600" /> Latest News on Waste & Recycling
          </h1>
          <button
            onClick={fetchNews}
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center text-sm hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.slice(0, visibleCount).map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="shadow-md border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row gap-4">
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold">{article.title}</h2>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        Read more
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {visibleCount < news.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Subscription Form */}
        <br/><br/><br/><br/>
        <div className="mt-8 p-6 border border-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold">Subscribe to our Newsletter</h2>
          <p className="text-gray-600">Stay updated with the latest news on waste & recycling.</p>
          {subscribed ? (
            <p className="text-green-600 mt-2">You have successfully subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border p-2 rounded-md w-full"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Subscribe
              </button>
              {error && <p className="text-red-500 text-sm" >{error}</p>}
              {successMessage && <p className="text-green-500 text-sm" >{successMessage}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
