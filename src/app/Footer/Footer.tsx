"use client";
import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { paperPlane, location, call, mail, logoLinkedin, logoTwitter, logoInstagram, logoWhatsapp } from "ionicons/icons";
import logo from "../../assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {

  return (
    <footer suppressHydrationWarning={true as any} className="footer projects shadow-2xl">
      <div className="footer-top md:section">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <div className="container">
          <div className="footer-brand">
            <Link href="/">
              <Image src={logo} alt="RecycleRight" width={100} height={100} className="logo mx-auto md:mx-0" />
            </Link>
            <p className="footer-text">
              ♻️ <strong>RecycleRight:</strong> Transforming Waste Management  
              Easily classify waste, discover eco-friendly alternatives, and find proper disposal and recycling methods.
            </p>
          </div>

          {/* Our Services */}
          <ul className="footer-list">
            <li><p className="footer-list-title">Our Services</p></li>
            <li><Link href="/recycle" className="footer-link">Waste Classification</Link></li>
            <li><Link href="/chat-with-ai" className="footer-link">AI-Powered Waste Assistant</Link></li>
            <li><Link href="/recycling-hubs" className="footer-link">Nearest Recycling Facilities</Link></li>
            <li><Link href="/news-feed" className="footer-link">Recycling News & Updates</Link></li>
          </ul>

          {/* Company */}
          <ul className="footer-list">
            <li><p className="footer-list-title">Explore</p></li>
            <li><Link href="/recycle" className="footer-link">Recycling Guide</Link></li>
            <li><Link href="/blogs" className="footer-link">Green Blogs</Link></li>
            <li><Link href="/contactus" className="footer-link">Contact Us</Link></li>
          </ul>

          {/* Contact Us */}
          <ul className="footer-list">
            <li><p className="footer-list-title">Contact Us</p></li>
            <li className="footer-item">
              <IonIcon icon={location}></IonIcon>
              <address className="contact-link">Noida, Uttar Pradesh, 201301</address>
            </li>
            <li className="footer-item">
              <IonIcon icon={call}></IonIcon>
              <Link href="tel:+91950971813" className="contact-link">+91 9509712813</Link>
            </li>
            <li className="footer-item">
              <IonIcon icon={mail}></IonIcon>
              <Link href="mailto:piyushbhatnagar092@gmail.com" className="contact-link">navygautam33@gmail.com</Link>
            </li>
            <li className="footer-item">
              <ul className="social-list">
                <li><Link href="https://www.linkedin.com/in/navy-gautam-0247b1249/" aria-label="LinkedIn" className="social-link"><IonIcon icon={logoLinkedin}></IonIcon></Link></li>
                <li><Link href="#" aria-label="Instagram" className="social-link"><IonIcon icon={logoInstagram}></IonIcon></Link></li>
                <li><Link href="#" aria-label="Twitter" className="social-link"><IonIcon icon={logoTwitter}></IonIcon></Link></li>
                <li><Link href="https://wa.me/919509712813" aria-label="WhatsApp" className="social-link"><IonIcon icon={logoWhatsapp}></IonIcon></Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            &copy; 2025 <strong>RecycleRight</strong> | All Rights Reserved by{" "}
            <Link href="#" className="copyright-link">Navy Gautam</Link>
          </p>
          <ul className="footer-bottom-list">
            <li><Link href="#" className="footer-bottom-link">Privacy Policy</Link></li>
            <li><Link href="#" className="footer-bottom-link">Terms of Use</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
