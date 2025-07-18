"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import getLocation from "../utils/getLocation";
import { calculateDistance } from "../utils/calculateLocation";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";

interface Facility {
  id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  time: string;
  contact: string;
  address: string;
  verified: boolean;
  distance: number;
}

const FacilityMap: React.FC = () => {
  const [facilityData, setFacilityData] = useState<Facility[]>([]);
  const [sortedFacilityData, setSortedFacilityData] = useState<Facility[]>([]);
  const [clientLocation, setClientLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if location is already stored
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      setClientLocation(JSON.parse(storedLocation));
      // console.log("Using stored location:", JSON.parse(storedLocation));
    }
  }, []);

  const fetchLocation = async () => {
    setError(null);
    setLoading(true);
    const location = await getLocation();
    setLoading(false);

    if (location.coordinates) {
      setClientLocation(location.coordinates);
      localStorage.setItem("userLocation", JSON.stringify(location.coordinates)); // Save new location
    } else {
      setError(location.error || "Failed to fetch location.");
    }
  };

  // Fetch facility data from backend
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/facilities`); // Replace with your backend URL
        if (!response.ok) throw new Error("Failed to fetch facilities");

        const data = await response.json();
        // console.log("Data: ", data);
        setFacilityData(data || []);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setError("Failed to load facilities.");
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    if (clientLocation) {
      const sortedFacilities = facilityData
        ?.map((f: Facility | null) => {
          if (!f || typeof f !== "object") return null; // Ensure `f` is an object
          
          return {
            ...f,
            distance: calculateDistance(clientLocation[0], clientLocation[1], f.lat, f.lon),
          };
        })
        .filter((f): f is Facility & { distance: number } => f !== null) // Remove null values
        .sort((a, b) => a.distance - b.distance); // `a` and `b` are guaranteed to be valid objects now
  
      // console.log("Sorted: ", sortedFacilities);
      setSortedFacilityData(sortedFacilities);
    }
  }, [clientLocation, facilityData]);
  
// Custom icon for current location using 📍 emoji
const currentLocationIcon = L.divIcon({
  className: "custom-location-icon",
  html: "<div style='font-size: 32px; line-height: 32px;'>📍</div>", // Larger size
  iconSize: [32, 32], // Adjust size for better visibility
  iconAnchor: [16, 32], // Proper alignment
});


  // Default icon for facilities
  const facilityIcon = L.icon({
    iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div suppressHydrationWarning={true as any} className="flex flex-col-reverse md:flex-row pt-24 md:pt-14 my-2 md:mt-8">
      {clientLocation ? (
        <>
          <div className="flex flex-col md:w-1/3 m-4 shadow-lg max-h-200 overflow-y-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-emerald-600 mb-4">
              Recycling Hubs
            </h1>

            <p className="text-sm text-gray-500 text-center mb-2">
              Facilities sorted by nearest to your current location:
            </p>
            {sortedFacilityData?.map((info, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-gray-300 mb-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-semibold text-gray-800">{info.name}</h2>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-700 text-lg">Verified</span>
                    {info.verified ? (
                      <FaCheckCircle className="text-green-500 w-6 h-6" />
                    ) : (
                      <FaTimesCircle className="text-red-500 w-6 h-6" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600">
                  <strong>Capacity:</strong> {info.capacity}
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> {info.address}
                </p>
                <p className="text-gray-600">
                  <strong>Contact:</strong> {info.contact}
                </p>
                <p className="text-gray-600">
                  <strong>Time:</strong> {info.time}
                </p>
              </div>
            ))}
          </div>
          <MapContainer center={clientLocation} zoom={10} className="w-full h-[500px] m-4 rounded-lg shadow-lg z-[1]">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={clientLocation} icon={currentLocationIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {facilityData?.map((facility, index) => (
              <Marker key={index} position={[facility.lat, facility.lon]} icon={facilityIcon}>
                <Popup>
                  <h3 className="font-bold text-emerald-600 text-2xl">{facility.name}</h3>
                  <p>Capacity: {facility.capacity}</p>
                  <p>Address: {facility.address}</p>
                  <p>Contact: {facility.contact}</p>
                  <p>Time: {facility.time}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      ) : (
        <div className="px-4 w-full py-16 text-center">
          <br/><br/><br/>
          <h2 className="text-2xl font-bold">Location access required</h2>
          {error && <p className="text-red-600">{error}</p>}
          <p className="text-gray-600">Click the button below to enable location and find the nearest recycling facilities.</p>
          <button
            onClick={fetchLocation}
            className={`mt-4 px-6 py-3 text-white text-lg font-semibold rounded-md ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? "Fetching Location..." : "Enable Location"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FacilityMap;