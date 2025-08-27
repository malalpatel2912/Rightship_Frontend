'use client'
import React from 'react'
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export default function ContactPage() {
  const Logo = '../logo.png';
  
  return (
    <div className="py-20 bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div className="flex justify-center">
          <img
            src={Logo} // Use the path where your logo is stored
            alt="Right Ships Logo"
            className="h-24"
          />
        </div>
        <h2 className="text-center text-2xl font-extrabold text-gray-900">RIGHT SHIPS SERVICES</h2>
        <p className="text-center text-gray-700 font-medium">- Job Portal -</p>
        <div className="mt-6 space-y-4">
          <div className="flex items-center text-gray-600">
            <Phone className="mr-3 text-red-600" size={18} />
            <a href="tel:02245164141" className="hover:text-blue-600 me-1">02245164141</a> / <a href="tel:7738350138" className="hover:text-blue-600 ms-1"> 7738350138 </a>
          </div>
          <div className="flex items-center text-gray-600">
            <Globe className="mr-3 text-red-600" size={18} />
            <a href="http://www.rightships.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">www.rightships.com</a>
          </div>
          <div className="flex items-center text-gray-600">
            <Mail className="mr-3 text-red-600" size={18} />
            <a href="mailto:info@rightships.com" className="hover:text-blue-600">info@rightships.com</a>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="mr-3 text-red-600" size={18} />
            <a href="https://www.google.com/maps/search/?api=1&query=Nbc+complex+off+No+216+Sector+11+Belapur+cbd+Navi+Mumbai+-+400614" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              Nbc complex off No 216 Sector 11 Belapur cbd Navi Mumbai - 400614
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}