"use client";
import React, { useState } from "react";
import disposalData from "./disposalData.json";
import { FiZap } from "react-icons/fi";
type InfoType = "disposal" | "recycle" | "impact" | "dustbin";

const Recycle: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [predictedCategory, setPredictedCategory] = useState("");
  const [alternateProducts, setAlternateProducts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [confidence, setConfidence] = useState<number>(40);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [imageResultUrl, setImageResultUrl] = useState<string>("");
  const [imageOriginalUrl, setImageOriginalUrl] = useState<string>("");

  const handleRecycle = async () => {
    setError("");
    setPredictedCategory("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLASSIFICATION_SERVER_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setPredictedCategory(data.category.charAt(0).toUpperCase() + data.category.slice(1));
      // setPredictedCategory("Plastic");
    } catch (err) {
      setError("Error fetching prediction. Please try again.");
    }
  };

  const handleSuggestAlternatives = async () => {
    setAlternateProducts([]);
    setError("");
  
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAJRwLv1ArJbq-F7-4wb0q_KhZ9PHz4uOo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Suggest alternate eco-friendly products for ${inputText}. Give answer only in 10 lines. Don't use bold letters, write in normal text.` }] }],
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
  
      const data = await response.json();
      const suggestions = data.candidates?.[0]?.content?.parts?.[0]?.text.split("\n").filter((s: string) => s) || [];
      setAlternateProducts(suggestions);
    } catch (err) {
      setError("Error fetching suggestions. Please try again.");
    }
  };

  // const handleImageUpload = async () => {
  //   if (!imageFile) {
  //     setError("Please upload an image file first.");
  //     return;
  //   }
  
  //   setError("");
  //   setDetectedObjects([]);
  //   setImageResultUrl("");
  
  //   const formData = new FormData();
  //   formData.append("file", imageFile);
  //   formData.append("confidence", confidence.toString());
  
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_CLASSIFICATION_SERVER_URL}/upload`, {
  //       method: "POST",
  //       body: formData,
  //     });
  
  //     if (!response.ok) throw new Error("Image classification failed.");
  
  //     const data = await response.json();

  //     console.log(data);
  
  //     if (data.status === "success") {
  //       console.log(typeof(data.detected_objects))
  //       const detected_objects = data.detected_objects
  //       .map(obj => {
  //         const trimmed = obj.trim().toLowerCase();
  //         return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  //       });
  //       setDetectedObjects(detected_objects || []);
  //       setImageResultUrl(`${process.env.NEXT_PUBLIC_CLASSIFICATION_SERVER_URL}/${data.detected_image_path}`);
  //       setImageOriginalUrl(`${process.env.NEXT_PUBLIC_CLASSIFICATION_SERVER_URL}/${data.original_image_path}`);
        
  //       // console.log(imageOriginalUrl, imageResultUrl, detectedObjects);
  //     } else {
  //       setError(data.message || "Unknown error occurred during image classification.");
  //     }
  //   } catch (err) {
  //     setError("Error uploading image. Please try again.");
  //   }
  // };  
  
  return (
    <div className="section container flex flex-col items-center px-4 py-12">
      <h2 className="text-4xl text-emerald-700 font-bold mb-8 text-center">
        Recycle Center
      </h2>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 px-4 py-12 w-full">

        {/* =================== Text-Based Classification =================== */}
        <div className="bg-white flex-1 p-6 rounded-xl shadow-lg min-h-[700px] overflow-auto">
          <h3 className="text-2xl font-bold text-emerald-700 mb-4 text-center">
            Text-Based Waste Classification using Stacked Logistic Regression and Random Forest
          </h3>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter waste item..."
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
          />

          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleRecycle}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Recycle
            </button>
            <button
              onClick={handleSuggestAlternatives}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiZap /> Suggest Alternate Products
            </button>
          </div>

          {predictedCategory && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-emerald-700 mb-2">
                Predicted Category: {predictedCategory}
              </h3>
              <div className="flex flex-col gap-4">
                {["disposal", "recycle", "impact", "dustbin"].map((type) => (
                  <div
                    key={type}
                    className="p-4 bg-gray-100 shadow-md rounded-md"
                  >
                    <h4 className={`text-lg font-semibold ${
                      type === "disposal"
                        ? "text-blue-700"
                        : type === "recycle"
                        ? "text-green-700"
                        : type === "impact"
                        ? "text-red-700"
                        : "text-yellow-700"
                    } capitalize`}>
                      {type === "dustbin" ? "Dustbin Color" : type === "impact" ? "Environmental Impact" : `${type} Instructions`}
                    </h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {(() => {
                        const categoryData = disposalData[predictedCategory as keyof typeof disposalData];
                        const value = categoryData?.[type as InfoType];

                        const items = Array.isArray(value) ? value : value ? [value] : null;

                        if (!items) return <li>N/A</li>;

                        return items.map((item, index) => <li key={index}>{item}</li>);
                      })()}
                    </ul>

                  </div>
                ))}
              </div>
            </div>
          )}

          {alternateProducts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                Suggested Alternate Products
              </h3>
              <ul className="list-disc list-inside text-gray-600">
                {alternateProducts.map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {/* =================== Image-Based Classification =================== */}
        {/* <div className="bg-white flex-1 p-6 rounded-xl shadow-lg min-h-[700px] overflow-auto">
          <h3 className="text-2xl font-bold text-emerald-700 mb-4 text-center">
            Image-Based Classification
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full mb-4"
          />

            <label className="text-gray-700">Confidence Level (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-20 p-2 border border-gray-300 rounded"
            />

          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleImageUpload}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition flex items-center gap-2"
            >
              Classify Image      
            </button>
          </div>

          {detectedObjects.length > 0 && (
            <div className="bg-gray-50 p-4 rounded shadow mb-4">
              <h4 className="text-lg font-semibold text-emerald-600 mb-2">
                Detected Items:
              </h4>
              <ul className="list-disc list-inside text-gray-700">
                {detectedObjects.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {(imageOriginalUrl || imageResultUrl) && (
            <div className="mt-4 flex justify-center items-start space-x-8">
              {imageOriginalUrl && (
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Original Image:
                  </h4>
                  <img
                    src={imageOriginalUrl}
                    alt="Original Image"
                    className="max-w-sm border rounded shadow"
                  />
                </div>
              )}
              
              {imageResultUrl && (
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Detected Image:
                  </h4>
                  <img
                    src={imageResultUrl}
                    alt="Detected Result"
                    className="max-w-sm border rounded shadow"
                  />
                </div>
              )}
            </div>
          )} */}

          {/* {detectedObjects.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-emerald-700 mb-4 text-center">
                Disposal Details for Detected Items
              </h3>

              {detectedObjects.map((object, idx) => (
                <div key={idx} className="mb-6 border-t pt-4">
                  <h4 className="text-lg font-bold text-emerald-600 mb-2">
                    {object}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {["disposal", "recycle", "impact", "dustbin"].map((type) => (
                      <div
                        key={type}
                        className="p-4 bg-gray-100 shadow-md rounded-md"
                      >
                        <h5 className={`text-md font-semibold ${
                          type === "disposal"
                            ? "text-blue-700"
                            : type === "recycle"
                            ? "text-green-700"
                            : type === "impact"
                            ? "text-red-700"
                            : "text-yellow-700"
                        } capitalize`}>
                          {type === "dustbin" ? "Dustbin Color" : type === "impact" ? "Environmental Impact" : `${type} Instructions`}
                        </h5>
                        <ul className="list-disc list-inside text-gray-600">
                          {(Array.isArray(disposalData[object]?.[type])
                            ? disposalData[object]?.[type]
                            : [disposalData[object]?.[type]]
                          )?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          )) || <li>N/A</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )} */}

        {/* </div> */}
    </div>
</div>

  );
};

export default Recycle;