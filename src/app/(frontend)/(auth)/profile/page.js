'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext';
import { Loader2, Shield, AlertTriangle, Download, Camera, Clock, Upload, Edit2, FileText, User, Mail, Phone, Ship, Anchor, Award, Calendar, MapPin, Clipboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const ProfileSection = ({ title, children }) => (
  <div className="mt-8">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const ProfileField = ({ label, value, icon: Icon }) => (
  <div className="flex items-start space-x-3 py-2">
    {Icon && <Icon className="w-5 h-5 text-gray-500 mt-0.5" />}
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-900">{value || 'Not specified'}</p>
    </div>
  </div>
);

// Add new components for file handling
const FileUploadButton = ({ onFileSelect, accept, children, loading }) => (
  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
    <input
      type="file"
      className="hidden"
      onChange={(e) => onFileSelect(e.target.files[0])}
      accept={accept}
    />
    {loading ? (
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    ) : null}
    {children}
  </label>
);

const DownloadButton = ({ url, label }) => (
  <Button
    variant="outline"
    size="sm"
    className="text-blue-600 hover:text-blue-700"
    onClick={() => window.open(url, '_blank')}
  >
    <Download className="w-4 h-4 mr-2" />
    {label}
  </Button>
);

export default function PrivateProfile() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Get session from NextAuth
  const { data: session, status: authStatus } = useSession();
  // Get additional auth info from our custom context
  const { user: authUser, token: authToken, isAuthenticated } = useAuth();
  
  // For debugging
  console.log('NextAuth Session:', session);
  console.log('Custom Auth Context:', { authUser, authToken, isAuthenticated });
  
  // Get auth token from various sources
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
  };
  
  // Get user ID from various sources
  const getUserId = () => {
    // Try NextAuth session first
    if (session?.user?.id) return session.user.id;
    
    // Try custom auth context next
    if (authUser?.id) return authUser.id;
    
    // Finally try localStorage
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id;
      }
    } catch (e) {
      console.error('Error parsing userData from localStorage:', e);
    }
    
    return null;
  };

  // Configure axios with auth token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Set axios default auth header');
    } else {
      console.warn('No auth token available for axios');
    }
  }, [session, authToken]);

  // Check authentication status
  useEffect(() => {
    if (authStatus === 'loading') return;

    const token = getAuthToken();
    
    console.log('Auth check:', { 
      authStatus, 
      hasToken: !!token
    });
    
    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/profile');
    }
  }, [authStatus, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (authStatus === 'loading') return;
      
      const userId = getUserId();
      if (!userId) {
        setError('Unable to determine user ID. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        console.log('Fetching profile data for user ID:', userId);
        
        const response = await axios.post(`${API_BASE_URL}/employee/get`, {
          employee_id: userId
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Profile data response:', response.data);
        
        if (response.data.code === 200 && response.data.data?.length > 0) {
          setProfileData(response.data.data[0]);
        } else {
          setError('Profile not found or you do not have permission to view this profile');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.response?.data?.msg || err.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (authStatus === 'authenticated' || getAuthToken()) {
      fetchProfileData();
    }
  }, [authStatus]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.file_url) {
        return response.data.file_url;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePhotoUpdate = async (file) => {
    try {
      const fileUrl = await handleFileUpload(file);
      const userId = getUserId();
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update`, {
        employee_id: userId,
        profilePicture: fileUrl
      });

      if (response.data?.code === 200) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: fileUrl
        }));
        toast.success('Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo');
    }
  };

  const handleResumeUpdate = async (file) => {
    try {
      const fileUrl = await handleFileUpload(file);
      const userId = getUserId();
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update`, {
        employee_id: userId,
        resume: fileUrl
      });

      if (response.data?.code === 200) {
        setProfileData(prev => ({
          ...prev,
          resume: fileUrl
        }));
        toast.success('Resume updated successfully!');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update resume');
    }
  };

  // If still loading authentication, show loading state
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <p>Authenticating...</p>
      </div>
    );
  }

  // If loading profile data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <p>Loading profile data...</p>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/login')}>
          Return to Login
        </Button>
      </div>
    );
  }

  // If no profile data
  if (!profileData) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert className="mb-6">
          <AlertDescription>No profile data available</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header - only visible on mobile */}
        <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <img
              src={profileData?.profilePicture || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{profileData?.firstName} {profileData?.lastName}</h2>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {profileData?.presentRank}
              </Badge>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleMobileSidebar}
            className="text-blue-600 border-blue-200"
          >
            View Profile
          </Button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Mobile Sidebar Overlay - conditionally shown */}
          {showMobileSidebar && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={toggleMobileSidebar}
            ></div>
          )}
          
          {/* Left Sidebar - Responsive */}
          <div className={`
            ${showMobileSidebar ? 'fixed left-0 top-0 h-full z-30' : 'hidden'} 
            md:sticky md:top-0 md:block md:h-screen 
            w-[280px] md:w-72 
            bg-white overflow-y-auto border-r border-gray-200 
            p-5 transition-all duration-300
          `}>
            <div className="flex flex-col items-center">
              {/* Mobile Close Button - only visible inside mobile sidebar */}
              <div className="md:hidden w-full flex justify-end mb-4">
                <Button variant="ghost" size="sm" onClick={toggleMobileSidebar}>
                  &times;
                </Button>
              </div>
              
              {/* Profile Photo Section */}
              <div className="relative group mx-auto mb-5">
                <div className="relative">
                  <img
                    src={profileData?.profilePicture || "https://via.placeholder.com/128"}
                    alt="Profile"
                    className="w-28 h-28 rounded-full border-4 border-gray-200 object-cover shadow-md transition-all duration-200 group-hover:border-blue-300"
                  />
                  {/* Upload Photo Button */}
                  <div className="absolute bottom-1 right-1">
                    <label 
                      className="cursor-pointer p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      htmlFor="profile-photo-input"
                    >
                      <Camera className="w-3.5 h-3.5 text-gray-600" />
                    </label>
                    <input
                      id="profile-photo-input"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleProfilePhotoUpdate(e.target.files[0])}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </div>

              {/* Name and Rank */}
              <h2 className="text-xl font-bold text-gray-900 text-center">
                {profileData?.firstName} {profileData?.lastName}
              </h2>
              
              <Badge variant="outline" className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                {profileData?.presentRank}
              </Badge>
              
              <p className="text-sm text-gray-500 mt-2">
                Applied for: <span className="font-medium">{profileData?.appliedRank}</span>
              </p>

              {/* Last Login */}
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Quick Info */}
            <div className="space-y-4 mb-5 w-full">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Info</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600 truncate">{profileData?.email}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">{profileData?.mobile_no || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">{profileData?.nationality || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-gray-600">Available from: {profileData?.availability || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <Card className="mt-2 border-gray-200 w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Resume</CardTitle>
                  <label 
                    className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                    htmlFor="resume-input"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                  <input
                    id="resume-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleResumeUpdate(e.target.files[0])}
                    disabled={isUploading}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {profileData?.resume ? 'Resume uploaded' : 'No resume uploaded'}
                  </span>
                </div>
                
                {profileData?.resume && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 mt-2"
                    onClick={() => window.open(profileData.resume, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6">
            <Card className="shadow-sm mb-6">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link href="/profile/edit">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2 bg-[#0f2b5b] hover:bg-[#1a4080] text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </Link>

                    {isEditing && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Editing Mode
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  View and manage your personal and professional information
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs 
                  defaultValue="personal" 
                  className="w-full"
                  value={activeTab} 
                  onValueChange={setActiveTab}
                >
                  <div className="px-4 md:px-6 pt-4 border-b overflow-x-auto">
                    <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100">
                      <TabsTrigger 
                        value="personal" 
                        onClick={() => setActiveTab("personal")}
                        className="data-[state=active]:bg-[#0f2b5b] data-[state=active]:text-white"
                      >
                        Personal
                      </TabsTrigger>
                      <TabsTrigger 
                        value="professional" 
                        onClick={() => setActiveTab("professional")}
                        className="data-[state=active]:bg-[#0f2b5b] data-[state=active]:text-white"
                      >
                        Professional
                      </TabsTrigger>
                      <TabsTrigger 
                        value="certifications" 
                        onClick={() => setActiveTab("certifications")}
                        className="data-[state=active]:bg-[#0f2b5b] data-[state=active]:text-white"
                      >
                        Certifications
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    {/* Personal Info Tab */}
                    <TabsContent value="personal" className="space-y-6 mt-0">
                      {/* Basic Information */}
                      <section>
                        <div className="flex items-center mb-4">
                          <User className="w-5 h-5 text-blue-500 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileField label="Nationality" value={profileData.nationality} icon={MapPin} />
                            <ProfileField label="Date of Birth" value={profileData.dob} icon={Calendar} />
                            <ProfileField label="Age" value={profileData.age} icon={User} />
                            <ProfileField label="Gender" value={profileData.gender} icon={User} />
                            <ProfileField label="Height (cm)" value={profileData.height} />
                            <ProfileField label="Weight (kg)" value={profileData.weight} />
                            <ProfileField label="BMI" value={profileData.bmi} />
                            <ProfileField label="US Visa" value={profileData.usVisa} />
                          </div>
                        </div>
                      </section>

                      {/* Contact Information */}
                      <section>
                        <div className="flex items-center mb-4">
                          <Mail className="w-5 h-5 text-blue-500 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileField label="Email" value={profileData.email} icon={Mail} />
                            <ProfileField label="Mobile No" value={profileData.mobile_no} icon={Phone} />
                            <ProfileField label="WhatsApp Number" value={profileData.whatsappNumber} icon={Phone} />
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    {/* Professional Info Tab */}
                    <TabsContent value="professional" className="space-y-6 mt-0">
                      {/* Rank & Vessel Information */}
                      <section>
                        <div className="flex items-center mb-4">
                          <Anchor className="w-5 h-5 text-blue-500 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">Rank & Vessel</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileField label="SID" value={profileData.sid} icon={Clipboard} />
                            <ProfileField label="Date Of Availability" value={profileData.availability} icon={Calendar} />
                            <ProfileField label="Applied Rank" value={profileData.appliedRank} icon={Award} />
                            <ProfileField label="Last Rank" value={profileData.presentRank} icon={Award} />
                            <ProfileField label="Vessel Applied For" value={profileData.appliedVessel} icon={Ship} />
                            <ProfileField label="Last Vessel" value={profileData.presentVessel} icon={Ship} />
                          </div>
                        </div>
                      </section>

                      {/* Experience Information */}
                      <section>
                        <div className="flex items-center mb-4">
                          <Clock className="w-5 h-5 text-blue-500 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileField label="Total Sea Experience" value={`${profileData.totalSeaExperienceYear || '0'} years, ${profileData.totalSeaExperienceMonth || '0'} months`} icon={Anchor} />
                            <ProfileField label="Last Rank Experience" value={`${profileData.presentRankExperienceInMonth || '0'} months`} icon={Award} />
                            <div className="col-span-1 sm:col-span-2">
                              <ProfileField 
                                label="Experience In Vessels" 
                                value={profileData.vesselExp?.join(', ')} 
                                icon={Ship}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    {/* Certifications Tab */}
                    <TabsContent value="certifications" className="space-y-6 mt-0">
                      <section>
                        <div className="flex items-center mb-4">
                          <Award className="w-5 h-5 text-blue-500 mr-2" />
                          <h2 className="text-lg font-semibold text-gray-900">Certificates & Qualifications</h2>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-1 gap-4">
                            <ProfileField 
                              label="Certificate of Competency (COC)" 
                              value={profileData.coc} 
                              icon={Award}
                            />
                            <Separator className="my-1" />
                            <ProfileField 
                              label="Certificate of Proficiency (COP)" 
                              value={profileData.cop} 
                              icon={Award}
                            />
                            <Separator className="my-1" />
                            <ProfileField 
                              label="Watchkeeping" 
                              value={profileData.watchkeeping} 
                              icon={Clock}
                            />
                          </div>
                        </div>
                      </section>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}