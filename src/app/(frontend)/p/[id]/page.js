'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, Download, BookmarkPlus, Star, Mail, Phone, AlertTriangle, ArrowLeft, Lock, LogIn, Calendar, Briefcase, Ship, Users, Globe, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const ProfileAvatar = ({ profile, firstName, lastName }) => {
  if (profile) {
    return (
      <img
        src={profile}
        alt={`${firstName} ${lastName}`}
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
      />
    );
  }

  return (
    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
      {firstName?.[0]}{lastName?.[0]}
    </div>
  );
};

const InfoCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
    <p className="font-medium">{value || 'Not specified'}</p>
  </div>
);

// Share modal component
const ShareModal = ({ onClose, profileUrl, candidateName }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link');
      });
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share Profile</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          Share {candidateName}'s profile with others
        </p>
        
        <div className="mb-5">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md mb-2 overflow-hidden">
            <input 
              type="text" 
              value={profileUrl} 
              readOnly
              className="w-full bg-transparent border-none focus:outline-none text-sm"
            />
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this maritime professional: ${candidateName} - ${profileUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs">WhatsApp</span>
          </a>
          
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mb-2">
              <Facebook className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs">Facebook</span>
          </a>
          
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center mb-2">
              <Linkedin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs">LinkedIn</span>
          </a>
          
          <a 
            href={`mailto:?subject=Maritime Professional Profile: ${candidateName}&body=Check out this maritime professional's profile: ${profileUrl}`}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs">Email</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default function CandidateProfile() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const params = useParams();
  const router = useRouter();

  // Get session from NextAuth and custom auth context
  const { data: session, status: authStatus } = useSession();
  const { user: authUser, token: authToken, isAuthenticated } = useAuth();


  // Check if user is authenticated 
  const userIsAuthenticated = !!session || !!authToken || !!localStorage.getItem('token');

  // Get auth token from various sources
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    toast[type](message);
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine headers based on authentication
        const headers = { 'Content-Type': 'application/json' };
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Fetching candidate data for ID:', params.id);

        // For public profile, we'll use a slightly different endpoint or request
        const response = await axios.post(`${API_BASE_URL}/employees/public/${params.id}`, {}, {
          headers: headers
        });

        console.log('Candidate data response:', response.data);

        if (response.data.code === 200 && response.data.data) {
          setCandidate(response.data.data);
        } else {
          setError('Candidate not found or profile is not public');
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError(err.response?.data?.msg || err.message || 'Failed to fetch candidate data');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [params.id]);

  // For handling share click
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Redirect to login page with the current URL as callback
  const handleLoginRedirect = () => {
    const currentUrl = window.location.pathname;
    router.push(`/login?callbackUrl=${currentUrl}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading candidate profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/jobs')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="mb-4">
          <AlertDescription>No candidate data available</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push('/jobs')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  // Create a display name for the candidate
  const candidateName = `${candidate.firstName} ${candidate.lastName}`;
  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="bottom-right" />
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)} 
          profileUrl={profileUrl}
          candidateName={candidateName}
        />
      )}

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Public Profile Badge */}
      <div className="flex justify-end mb-4">
        <Badge variant="outline" className="bg-green-50 text-green-700 px-3 py-1">
          <Globe className="w-3.5 h-3.5 mr-1.5" />
          Public Profile
        </Badge>
      </div>

      {/* Top Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <ProfileAvatar
            profile={candidate.profile}
            firstName={candidate.firstName}
            lastName={candidate.lastName}
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-2xl font-bold">
                {candidateName}
              </h1>
              
              {/* Show availability badge if available */}
              {candidate.availability && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Available from {new Date(candidate.availability).toLocaleDateString()}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 my-3">
              {candidate.presentRank && (
                <Badge variant="secondary">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  {candidate.presentRank}
                </Badge>
              )}
              
              {candidate.nationality && (
                <Badge variant="outline">
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  {candidate.nationality}
                </Badge>
              )}
              
              {candidate.appliedVessel && (
                <Badge variant="outline">
                  <Ship className="w-3.5 h-3.5 mr-1.5" />
                  {candidate.appliedVessel}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {/* Show auth-required notice for non-authenticated users */}
              {!userIsAuthenticated && (
                <Alert className="w-full mb-2">
                  <div className="flex items-start">
                    <Lock className="w-4 h-4 mt-0.5 mr-2 text-amber-500" />
                    <div>
                      <p className="text-sm">Log in to view contact information and download resume</p>
                      <Button 
                        variant="default" 
                        className="mt-2" 
                        size="sm"
                        onClick={handleLoginRedirect}
                      >
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Log in
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Contact Button - Only for authenticated users */}
              {userIsAuthenticated && (
                <Button variant="default">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Candidate
                </Button>
              )}

              {/* Resume Download - Only for authenticated users */}
              {userIsAuthenticated && (
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              )}

              {/* Share Profile - Always available for everyone */}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - Only for authenticated users */}
      {userIsAuthenticated && (
        <Alert className="mb-6">
          <AlertDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{candidate.email || 'Email not available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>
                  Phone: {candidate.mobile_no || 'Not specified'}
                  {candidate.whatsappNumber && ` | WhatsApp: ${candidate.whatsappNumber}`}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Professional Details */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard title="Present Rank" value={candidate.presentRank} />
            <InfoCard title="Applied Rank" value={candidate.appliedRank} />
            <InfoCard title="Certificate of Competency" value={candidate.coc} />
            <InfoCard title="Certificate of Proficiency" value={candidate.cop} />
            <InfoCard title="Watchkeeping" value={candidate.watchkeeping} />
            <InfoCard
              title="Total Sea Experience"
              value={candidate.totalSeaExperienceYear || candidate.totalSeaExperienceMonth ?
                `${candidate.totalSeaExperienceYear || 0} years, ${candidate.totalSeaExperienceMonth || 0} months` :
                null}
            />
            <InfoCard
              title="Present Rank Experience"
              value={candidate.presentRankExperienceInMonth ?
                `${candidate.presentRankExperienceInMonth} months` :
                null}
            />
            <InfoCard title="Applied Vessel" value={candidate.appliedVessel} />
          </div>
        </CardContent>
      </Card>

      {/* Personal Details - Limited for public view */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Only show limited personal details for public view */}
            <InfoCard title="Age" value={candidate.age} />
            <InfoCard title="Nationality" value={candidate.nationality} />
            <InfoCard title="Availability" value={candidate.availability ?
              new Date(candidate.availability).toLocaleDateString() :
              null}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vessel Experience */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Vessel Experience</h2>
          <div className="space-y-2">
            {candidate.vesselExp && candidate.vesselExp.length > 0 ? (
              candidate.vesselExp.map((vessel, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  {vessel}
                </div>
              ))
            ) : (
              <p>No vessel experience data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to action for non-authenticated users */}
      {!userIsAuthenticated && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Interested in this candidate?</h3>
          <p className="text-blue-700 mb-4">
            Log in or create an account to view contact information, download resume, and connect with this candidate.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleLoginRedirect}>
              <LogIn className="w-4 h-4 mr-2" />
              Log in
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}