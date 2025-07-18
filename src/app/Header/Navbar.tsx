"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IonIcon } from "@ionic/react";
import { menuOutline } from "ionicons/icons";
import { closeOutline } from "ionicons/icons";
import { location } from "ionicons/icons"
import logo from "../../assets/logo.png"
import { getEmail, getUser, getUserName, handleLogout, isAuthenticated } from "../sign-in/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  username: string;
}

interface NavItemProps {
  label: string;
  href: string;
}

const Header = () => {
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [locations, setLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const handleCloseDropdown = () => {
    setIsDropdownOpen(false); // Close dropdown when clicking any option
  };

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === "undefined") return;
  
    document.documentElement.classList.remove("no-js");
  
    const fetchLocation = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw`
        );
  
        const data = await response.json();
  
        const city = data.features[0]?.context?.find((c: any) => c.id.includes("place"))?.text;
        const state = data.features[0]?.context?.find((c: any) => c.id.includes("region"))?.text;
  
        if (city && state) {
          setLocation(`${city}, ${state}`);
        }
      } catch (error: any) {
        console.error("Error fetching location:", error);
        toast.error("Error fetching location:", error);
      }
    };
  
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          // console.log("Navbar:", lat, lon);
  
          localStorage.setItem("userLocation", JSON.stringify([lat, lon]));
          fetchLocation(lat, lon);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsHeaderActive(true);
      } else {
        setIsHeaderActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = getUser();
      if (userData) {
        try {
          const parsedUser = typeof userData === "string" ? JSON.parse(userData) : userData;
          if (parsedUser?.username) {
            setUser(parsedUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Invalid user data", error);
          setUser(null);
        }
      }
    }
  }, []);
  
  const toggleNavbar = () => {
    setIsNavbarActive(!isNavbarActive);
  };

  return (
    <header suppressHydrationWarning={true as any} className={`header ${isHeaderActive ? "active" : ""}`} data-header>
      <div className="container shadow-md z-[7] bg-white">
        <Link href="/">
          <Image
            src={logo}
            alt="RecycleRight"
            width={120}
            height={120}
            className="logo ml-4 logo md:ml-16 "
          />
        </Link>

        <nav className={`navbar ${isNavbarActive ? "active" : ""}`} data-navbar>
          <div className="wrapper">
            <Link href="/" className="logo">
              Recycle Right
            </Link>
            <button
              className="nav-close-btn"
              aria-label="close menu"
              data-nav-toggler
              onClick={toggleNavbar}
            >
              <IonIcon
                icon={closeOutline}
                className={`close-icon ${isNavbarActive ? "" : "hidden"}`}
              ></IonIcon>
            </button>
          </div>

          <ul className="navbar-list">
            <NavItem label="Home" href="/"/>
            <NavItem label="Recycle Guide" href="/recycle"/>
            <NavItem label="WasteWise AI" href="/chat-with-ai"/>
            <NavItem label="Recycling Hubs" href="/recycling-hubs"/>
            <NavItem label="Green Blogs" href="/blogs"/>
            <NavItem label="Latest News" href="/news-feed"/>
            <NavItem label="ContactUs" href="/contactus"/>
          </ul>
        </nav>

        <h1 className='font-montserrat font-bold text-xl ml-12 md:ml-4 md:text-2xl text-emerald-600 flex items-center gap-[1vh]'>
          <IonIcon icon={location} aria-hidden="true" role="img"></IonIcon>
          {locations || 'Loading...'}
        </h1>

        {user ? (
          <div className="relative">
            <button
              className="md:mr-8 text-sm md:text-xl font-semibold"
              onClick={handleToggleDropdown}
            >
              {user? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Guest"}
            </button>
            {isDropdownOpen && (
              <div className="absolute top-12 right-0 projects p-4  shadow-md divide-y rounded-lg w-44 mt-2 z-[5]">
                <Link href="/profile" className="hover:text-emerald-500" onClick={handleCloseDropdown}>
                  Profile
                </Link>
                <button
                  className="hover:text-emerald-500"
                  onClick={() => { handleLogout(); handleCloseDropdown(); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
                ) : (
                  <>
                      <Link href="/sign-in" className="btn-md btn-outline md:mr-4">SignIn</Link>
                  </>
                )}
        <button
          className="nav-open-btn"
          aria-label="open menu"
          data-nav-toggler
          onClick={toggleNavbar}
        >
          <IonIcon icon={menuOutline} aria-hidden="true" role="img"></IonIcon>
        </button>

        <div
          className={`overlay ${isNavbarActive ? "active" : ""}`}
          data-nav-toggler
          data-overlay
          onClick={toggleNavbar}
        ></div>
      </div>
    </header>
  );
};

const NavItem = ({ label, href }: NavItemProps) => {
  return (
    <li suppressHydrationWarning={true as any} className="navbar-link">
      <Link href={href}>
        {label}
      </Link>
    </li>
  );
};

export default Header;
