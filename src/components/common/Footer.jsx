'use client';

import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const navigation = {
    company: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about-us' },
      { name: 'Services', href: '/our-services' },
    ],
    support: [
      { name: 'Jobs', href: '/jobs' },
      { name: 'Pre Sea Courses', href: '/pre-sea-courses' },
      { name: 'Post Sea Courses', href: '/post-sea-courses' },
      { name: 'Contact Us', href: '/contact-us' },
    ],
    social: [
      { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/rightshipsdotcom?igsh=MWdqY2poY29kM3U2bA==' },
      { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/' },
      { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@rightships?si=KAEgVHD1KqrTccJz' },
    ],
  };

  return (
    <footer className="bg-[#002A42] text-white py-20">
      <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center mb-9">
                <Image 
                  src="/white-logo.png" 
                  alt="rightships" 
                  className="me-3" 
                  width={32} 
                  height={32} 
                />
                <span className="text-2xl font-bold">RIGHTSHIPS</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Address:</h3>
              <p className="text-gray-300">Nbc complex off No 216 Sector 11 Belapur cbd Navi Mumbai - 400614</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Contact:</h3>
              <p className="text-gray-300">+91 22 4516 4128, +91 22 4516 4141</p>
              <p className="text-gray-300">info@rightships.com</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
                <ul className="space-y-4">
                {navigation.company.map((item) => (
                    <li key={item.name}>
                    <Link href={item.href} className="text-gray-300 hover:text-white">
                        {item.name}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

            <div>
                <ul className="space-y-4">
                {navigation.support.map((item) => (
                    <li key={item.name}>
                    <Link href={item.href} className="text-gray-300 hover:text-white">
                        {item.name}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

          </div>
          
          {/* Contact Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Enquiry Now</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded bg-white text-gray-900"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded bg-white text-gray-900"
              />
              <textarea
                placeholder="Enter your message"
                rows={4}
                className="w-full px-4 py-2 rounded bg-white text-gray-900"
              />
              <button
                type="submit"
                className="w-full bg-[#8B1F1F] text-white py-2 px-4 rounded hover:bg-[#7A1B1B]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300">© {new Date().getFullYear()} Rightships.com. All rights reserved.</p>
            
            {/* Social Icons */}
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact-us" className="text-gray-300 hover:text-white">
                Cookies Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;