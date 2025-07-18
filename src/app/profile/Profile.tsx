"use client";
import React, { useState, useEffect } from "react";
import { getEmail, getPhoneNumber, getfullname, getUserRole, getToken, getUserID, getUserName, getUser, setPhoneNumber } from "../sign-in/auth";
import Image from "next/image";
import { toast } from "react-toastify";

interface FacilityItem {
  id: string,
  name: string;
  capacity: number;
  lat: number;
  lon: number;
  time: string;
  address: string;
  contact: string;
  verified: boolean;
  photo: string;
  title: string;
  content: string;
}

interface Blog {
  title: string;
  content: string;
  photo: string;
}

const Profile = () => {
  const [username, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");

  const user = getUser();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [lon, setLon] = useState("");
  const [lat, setLat] = useState("");
  const [contact, setContact] = useState("");
  const [time, setTime] = useState("");
  const [verified, setVerified] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState<(Blog | FacilityItem)[]>([]);

  //for update option of facility
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<FacilityItem>({
    id: "",
    name: "",
    capacity: 0,
    lat: 0,
    lon: 0,
    time: "",
    address: "",
    contact: "",
    verified: false,
    photo: "",
    title: "",
    content: ""
  });
  
  useEffect(() => {
    if(user === null)
    {
      toast.error("Please Login")
      setTimeout(() => {
        window.location.href = "/sign-in"; // Redirect to login page
      }, 2000);
      return;
    }

    setUserName(user.username);
    setUserId(user.id);
    setEmail(user.email);
    setFullname(user.fullName);
    setPhoneNumber(user.phoneNumber);
    setRole(user.role);
    setToken(user.token);

    const fetchItems = async () => {
      try {
        const endpoint = role === "admin" ? "facilities" : "blogs";
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/${endpoint}?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Data: ", data);
          setItems(data || []);
        } else {
          console.error(`Failed to fetch ${endpoint}`);
          setItems([]);
        }
      } catch (err) {
        console.error(`Error fetching ${role === "admin" ? "facilities" : "blogs"}:`, err);
      }
    };
    if (userId) fetchItems();
  }, [userId, role]);

  const handleEdit = (item: FacilityItem) => {
    setEditingItem(item.id);
    setFormData(item);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/facilities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setItems((prevItems: (Blog | FacilityItem)[]) =>
          prevItems.map((item) =>
            "id" in item && item.id === id ? { ...item, ...formData } : item
          )
        );
        setEditingItem(null);
        toast.success("Facility updated successfully!");
      } else {
        console.error("Failed to update facility.");
        toast.error("Failed to update facility.");
      }
    } catch (err) {
      console.error("Error updating facility:", err);
    }
  };

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (role === "admin") {
      if (!name || !capacity || !lon || !lat || !address) {
        setError("Please fill all required facility fields.");
        return;
      }
    } else if (!title || !content) {
      setError("Both title and content are required!");
      return;
    }

    const formData = new FormData();
    if (role === "admin") {
      formData.append("name", name);
      formData.append("capacity", capacity);
      formData.append("lon", lon);
      formData.append("lat", lat);
      formData.append("contact", contact || "Not Provided");
      formData.append("time", time || "Not Provided");
      formData.append("verified", verified.toString());
      formData.append("address", address);
    } else {
      formData.append("title", title);
      formData.append("content", content);
      formData.append("userId", userId);
      if (image) formData.append("image", image);
    }
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    try {
      const endpoint = role === "admin" ? "facilities" : "blogs";
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send token here
        },
        body: formData,
      });

      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        setItems((prevItems) => [...prevItems, data]);
        setSuccess(`${role === "admin" ? "Facility" : "Blog"} posted successfully!`);
        if (role === "admin") {
          setName("");
          setCapacity("");
          setLon("");
          setLat("");
          setContact("");
          setTime("");
          setVerified(false);
          setAddress("");
        } else {
          setTitle("");
          setContent("");
          setImage(null);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try later.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const endpoint = role === "admin" ? "facilities" : "blogs";
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/${endpoint}/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Send token here
        },
      });

      if (response.ok) {
        setItems(items.filter((item) => "id" in item && item.id !== itemId));
      } else {
        console.error(`Failed to delete ${role === "admin" ? "facility" : "blog"}.`);
      }
    } catch (err) {
      console.error(`Error deleting ${role === "admin" ? "facility" : "blog"}:`, err);
    }
  };

  return (
    <div suppressHydrationWarning={true as any} className="container mx-auto p-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <Image
              className="w-32 h-32 object-cover rounded-full border-4 border-emerald-500"
              src="https://avatars.githubusercontent.com/u/52039279?v=4"
              alt="Profile Picture"
              width={100}
              height={100}
            />
          </div>
          <h3 className="text-2xl text-center font-semibold">{username}</h3>
          <table className="w-full mt-4">
            <tbody>
              <tr>
                <td className="text-gray-500 font-semibold">Email</td>
                <td>{email}</td>
              </tr>
              <tr>
                <td className="text-gray-500 font-semibold">Full Name</td>
                <td>{fullname}</td>
              </tr>
              <tr>
                <td className="text-gray-500 font-semibold">Phone</td>
                <td>{phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Post a {role === "admin" ? "Facility" : "Blog"}</h2>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}
          <form onSubmit={handlePostItem}>
            {role === "admin" ? (
              <>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Facility Name" required />
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Capacity" required />
                <input type="text" value={lon} onChange={(e) => setLon(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Longitude" required />
                <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Latitude" required />
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Contact" />
                <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Time" />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Address" required />
                <div className="flex items-center mt-3 mb-4 ml-2">
                <label className="flex items-center whitespace-nowrap">
                  <input type="checkbox" checked={verified} onChange={() => setVerified(!verified)} className="mr-2" />
                  <span>Verified</span>
                </label>
                </div>
              </>
            ) : (
              <>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Blog Title" required />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Blog Content" rows={5} required></textarea>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0]);
                    }
                  }}
                  className="mb-4"
                />
              </>
            )}
            <button type="submit" className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700">Post {role === "admin" ? "Facility" : "Blog"}</button>
          </form>
        </div>
      </div>
      <div className="md:w-2/4 w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">{role === "admin" ? "Facilities List" : "Your Blogs"}</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center">No {role === "admin" ? "facilities" : "blogs"} added yet.</p>
          ) : (
            items?.map((item: Blog | FacilityItem) => {
              if (!("id" in item)) return null;

              return (
              <div key={item?.id} className="p-4 border border-gray-300 rounded-md mb-4 relative">
                <button
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => handleDeleteItem(item?.id)}
                >
                  Delete {role === "admin" ? "Facility" : "Blog"}
                </button>
                {(
                  <img
                    src={item?.photo ? item.photo : role === "admin"? "https://static.vecteezy.com/system/resources/thumbnails/008/325/906/small_2x/green-leaf-building-environment-logo-design-free-vector.jpg" : "https://static.vecteezy.com/system/resources/previews/015/349/601/original/blog-icon-design-free-vector.jpg"}
                    alt={role === "admin" ? "Facility" : "Blog"}
                    className="w-1/2 rounded-md mb-2"
                  />
                )}

                {role === "admin" ? 
                  editingItem === item.id ? 
                  (
                    <>
                      <label className="block font-semibold text-gray-700 mb-1">Facility Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Facility Name" />
                      <label className="block font-semibold text-gray-700 mb-1">Capacity</label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Capacity" />
                      <label className="block font-semibold text-gray-700 mb-1">Longitude</label>
                      <input type="text" name="lon" value={formData.lon} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Longitude" />
                      <label className="block font-semibold text-gray-700 mb-1">Latitude</label>
                      <input type="text" name="lat" value={formData.lat} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Latitude" />
                      <label className="block font-semibold text-gray-700 mb-1">Contact</label>
                      <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Contact" />
                      <label className="block font-semibold text-gray-700 mb-1">Time</label>
                      <input type="text" name="time" value={formData.time} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Time" />
                      <div className="flex items-center mb-2">
                        <input type="checkbox" name="verified" checked={formData.verified} onChange={(e) => setFormData({ ...formData, verified: e.target.checked })} className="w-5 h-5 mr-2" />
                        <label className="text-gray-700 font-semibold">Verified</label>
                      </div>
                      <label className="block font-semibold text-gray-700 mb-1">Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2 border border-gray-400 rounded-md mb-2 focus:ring-2 focus:ring-blue-500" placeholder="Address" />
                      <button onClick={() => handleUpdate(item.id)} className="bg-blue-600 text-white py-1 px-3 rounded-md mr-2">Save</button>
                      
                      <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white py-1 px-3 rounded-md mt-2">Cancel</button>
                    </>
                  ) : 
                  (
                    <div>
                      <h3 className="text-xl font-semibold">{item?.name}</h3>
                      <p className="text-gray-600 mt-2">
                        <strong>Capacity:</strong> {item?.capacity}
                      </p>
                      <p className="text-gray-600">
                        <strong>Location:</strong> {item?.lat}, {item?.lon}
                      </p>
                      <p className="text-gray-600">
                        <strong>Contact:</strong> {item?.contact || "Not Provided"}
                      </p>
                      <p className="text-gray-600">
                        <strong>Time:</strong> {item?.time || "Not Provided"}
                      </p>
                      <p className="text-gray-600">
                        <strong>Verified:</strong> {item?.verified ? "Yes" : "No"}
                      </p>
                      <p className="text-gray-600">
                        <strong>Address:</strong> {item?.address}
                      </p>
                      <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white py-1 px-3 rounded-md mr-2">Edit</button>
                    </div>
                  ) :
                   (
                    <>
                      <h3 className="text-xl font-semibold">{"title" in item ? item.title : ""}</h3>
                      <p className="text-gray-600 mt-2">{"content" in item ? item.content : ""}</p>
                    </>
                  )}
              </div>
              )
            })
          )
        }
        </div>
      </div>
    </div>
)
};

export default Profile;
