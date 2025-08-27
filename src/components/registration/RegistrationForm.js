'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import {
  Building2,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowLeft,
  LogIn,
} from 'lucide-react'

import { InputField } from './InputField'

const formVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
    },
  },
}

export default function RegistrationPage({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    websiteUrl: '',
    mobileNo: '',
    email: '',
    city: '',
    licenseRpsl: '',
    address: '',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      'firstName', 
      'lastName', 
      'companyName', 
      'mobileNo', 
      'email', 
      'city', 
      'licenseRpsl'
    ]
    
    const emptyFields = requiredFields.filter(field => !formData[field])

    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields')
      return false
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.mobileNo)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/register`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName,
        website_url: formData.websiteUrl || null, // Make website optional
        mobile_no: formData.mobileNo,
        email: formData.email,
        city: formData.city,
        license_rpsl: formData.licenseRpsl,
        address: formData.address || null, // Make address optional
        admin_verify: false,
      })

      if (response.data.code === 200) {
        toast.success('Registration successful! Please check your email.')
        onSuccess && onSuccess()
      } else {
        throw new Error(response.data.msg	 || 'Registration failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50">
      {/* Back button (visible on mobile) */}
      <div className="p-4 lg:hidden">
        <Link href="/" className="flex items-center text-blue-600 font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Left Column - Image and Content */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 lg:p-12 ">
        {/* Back button (visible on desktop) */}
        <div className="hidden lg:block mb-8">
          <Link href="/" className="flex items-center text-blue-100 hover:text-white font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Hero Image */}
          <div className="mb-8 flex justify-center">
            <Image 
              src="/logo-white.svg" 
              alt="Registration" 
              width={300} 
              height={150}
              className="w-64 h-32"
            />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Join RightShips Today
          </h1>
          
          <p className="text-blue-100 mb-6 text-lg">
            Create your company account and connect with maritime professionals worldwide. 
            Our platform helps you manage your team and job listings efficiently.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Easy Job Posting</h3>
                <p className="text-blue-100 text-sm">Create and manage multiple job listings with our intuitive tools</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Team Management</h3>
                <p className="text-blue-100 text-sm">Add team members and assign roles for collaborative work</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Verified Professionals</h3>
                <p className="text-blue-100 text-sm">Connect with pre-screened maritime professionals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="lg:w-1/2 flex items-center justify-center">
        <div className="w-full bg-white p-6 py-14 lg:p-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Register Your Company</h2>
            <p className="text-gray-600 mt-2">
              Complete the form below to create your company account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <InputField
                  name="firstName"
                  label="First Name"
                  type="text"
                  icon={User}
                  required={true}
                  value={formData.firstName}
                  onChange={(value) => updateField('firstName', value)}
                />
              </div>

              {/* Last Name */}
              <div>
                <InputField
                  name="lastName"
                  label="Last Name"
                  type="text"
                  icon={User}
                  required={true}
                  value={formData.lastName}
                  onChange={(value) => updateField('lastName', value)}
                />
              </div>

              {/* Company Name */}
              <div className="md:col-span-2">
                <InputField
                  name="companyName"
                  label="Company Name"
                  type="text"
                  icon={Building2}
                  required={true}
                  value={formData.companyName}
                  onChange={(value) => updateField('companyName', value)}
                />
              </div>

              {/* Website URL (optional) */}
              <div className="md:col-span-2">
                <InputField
                  name="websiteUrl"
                  label="Website URL (optional)"
                  type="url"
                  icon={Globe}
                  required={false}
                  value={formData.websiteUrl}
                  onChange={(value) => updateField('websiteUrl', value)}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <InputField
                  name="mobileNo"
                  label="Mobile Number"
                  type="tel"
                  icon={Phone}
                  required={true}
                  prefix="+91"
                  value={formData.mobileNo}
                  onChange={(value) => updateField('mobileNo', value)}
                />
              </div>

              {/* Email */}
              <div>
                <InputField
                  name="email"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  required={true}
                  value={formData.email}
                  onChange={(value) => updateField('email', value)}
                />
              </div>

              {/* City */}
              <div>
                <InputField
                  name="city"
                  label="City"
                  type="text"
                  icon={MapPin}
                  required={true}
                  value={formData.city}
                  onChange={(value) => updateField('city', value)}
                />
              </div>

              {/* RPSL License */}
              <div>
                <InputField
                  name="licenseRpsl"
                  label="RPSL License"
                  type="text"
                  icon={CreditCard}
                  required={true}
                  value={formData.licenseRpsl}
                  onChange={(value) => updateField('licenseRpsl', value)}
                />
              </div>

              {/* Address (optional) */}
              {/* <div className="md:col-span-2">
                <InputField
                  name="address"
                  label="Complete Address (optional)"
                  type="textarea"
                  icon={MapPin}
                  required={false}
                  value={formData.address}
                  onChange={(value) => updateField('address', value)}
                />
              </div> */}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <>Register Company</>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/company/login" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  Log in <LogIn className="ml-1 w-4 h-4" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}