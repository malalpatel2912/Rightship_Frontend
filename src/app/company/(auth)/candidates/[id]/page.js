'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, Download, BookmarkPlus, Star, Mail, Phone, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from 'react-hot-toast'

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

export default function CandidateProfile() {
  const [showContact, setShowContact] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const params = useParams();
  const router = useRouter();

  const { views, downloads, subscription, updateSubscriptionUsage } = useSubscription();

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

  // Extract user/company info from various sources
  const getUserInfo = () => {
    // Try NextAuth session first
    if (session?.user) {
      return {
        company_id: session.user.companyId,
        _id: session.user.id,
        name: session.user.name || session.user.email
      };
    }

    // Try custom auth context next
    if (authUser) {
      return {
        company_id: authUser.company_id,
        _id: authUser.id,
        name: authUser.name || authUser.email
      };
    }

    // Finally try localStorage
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return {
          company_id: parsedData.company_id,
          _id: parsedData.id,
          name: parsedData.name || parsedData.email
        };
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

    // Add an axios interceptor to handle token expiration
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          showNotification("Authentication expired. Please log in again.", "error");
          // Optionally, redirect to login page after a delay
          setTimeout(() => {
            router.push(`/login?callbackUrl=/company/candidates/${params.id}`);
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [session, authToken, params.id, router]);

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
      router.push(`/login?callbackUrl=/company/candidates/${params.id}`);
    }
  }, [authStatus, router, params.id]);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (authStatus === 'loading') return;

      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        console.log('Fetching candidate data for ID:', params.id);

        const response = await axios.post(`${API_BASE_URL}/employees/list`, {
          employee_id: params.id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Candidate data response:', response.data);

        if (response.data.code === 200 && response.data.data.length > 0) {
          const candidateData = response.data.data[0];
          setCandidate(candidateData);

          // If profile has been viewed before, show contact info automatically
          if (candidateData.is_profile_viewed) {
            setShowContact(true);
          }

          // Set shortlist status from API response
          setIsShortlisted(candidateData.is_shortlisted || false);
        } else {
          setError('Candidate not found or you do not have permission to view this profile');
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError(err.response?.data?.msg || err.message || 'Failed to fetch candidate data');
      } finally {
        setLoading(false);
      }
    };

    if (authStatus === 'authenticated' || getAuthToken()) {
      fetchCandidateData();
    }
  }, [params.id, authStatus]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${candidate.firstName} ${candidate.lastName}'s Profile`,
        url: window.location.href
      }).then(() => {
        showNotification('Profile shared successfully');
      }).catch(err => {
        console.error('Error sharing profile:', err);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showNotification('Profile link copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          showNotification('Failed to copy link', 'error');
        });
    }
  };

  const trackProfileView = async () => {
    try {
      const token = getAuthToken();
      const user = getUserInfo();

      if (!token || !user) {
        console.error('No auth token or user info found');
        return;
      }

      // Make notification API call
      await axios.post(
        `${API_BASE_URL}/notification/action`,
        {
          employee_id: params.id,
          company_id: user.company_id,
          action_type: "profile_view",
         
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (views > 0) {
        // Make API call to track profile view
        const response = await axios.post(
          `${API_BASE_URL}/candidates/profile/view`,
          {
            candidate_id: params.id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        

        console.log('Track view response:', response.data);

        // Update local state to reflect that profile has been viewed
        if (response.data.code === 200) {
          setCandidate(prevCandidate => ({
            ...prevCandidate,
            is_profile_viewed: true
          }));

          updateSubscriptionUsage('profile_view');

          return true;
        }
      }

      toast.error(`You have ${views} Limits, to view Detail`)

      return false;

    } catch (err) {
      console.error('Error tracking profile view:', err);
      // Don't show error to user, just log it
    }
  };

  const handleContactClick = async () => {
    // If first time showing contact, track the profile view
    if (!showContact && !candidate.is_profile_viewed) {
      if (await trackProfileView()) {
        setShowContact(!showContact);
      }
    }

  };

  const handleResumeDownload = async () => {
    setIsDownloading(true);
    try {
      const token = getAuthToken();
      const user = getUserInfo();

      if (!token || !user) {
        showNotification("Authentication required. Please log in again.", "error");
        return;
      }

       // Make notification API call
       await axios.post(
        `${API_BASE_URL}/notification/action`,
        {
          employee_id: params.id,
          company_id: user.company_id,
          action_type: "resume_download",
          company_name: user.name,
          website_link: window.location.origin
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (downloads > 0) {
        // Track resume download
        const response = await axios.post(
          `${API_BASE_URL}/candidates/resume/download`,
          {
            candidate_id: params.id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

       

        console.log('Resume download response:', response.data);

        // Check if we got a valid response
        if (response.data.code === 200) {
          // Update local state to reflect that resume has been downloaded
          setCandidate(prevCandidate => ({
            ...prevCandidate,
            is_resume_downloaded: true
          }));

          updateSubscriptionUsage('resume_download');
          // If we have explicit resume URL in the response, use it
          if (response.data.resume_url) {
            window.open(response.data.resume_url, '_blank');
            showNotification("Resume downloaded successfully");
          }
          // Otherwise use the one from candidate data
          else if (candidate.resume) {
            window.open(candidate.resume, '_blank');
            showNotification("Resume downloaded successfully");
          } else {
            showNotification("Resume not available for this candidate", "error");
          }
        } else {
          showNotification(response.data.msg || "Unable to download resume", "error");
        }

        return true;
      }

      toast.error(`You have ${downloads} Limits, to Download`)

      return false;

    } catch (err) {
      console.error('Error downloading resume:', err);
      showNotification(err.response?.data?.msg || "Failed to download resume", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShortlistToggle = async () => {
    setIsSaving(true);
    try {
      const token = getAuthToken();
      const user = getUserInfo();

      if (!token || !user) {
        showNotification("Authentication required. Please log in again.", "error");
        return;
      }

      if (isShortlisted) {
        // Remove from shortlist - using DELETE method with the same API endpoint
        console.log('Removing candidate from shortlist:', params.id);
        
        const response = await axios.delete(
          `${API_BASE_URL}/candidates/shortlist`,
          {
            data: { candidate_id: params.id },
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Remove from shortlist response:', response.data);

        if (response.data.code === 200) {
          setIsShortlisted(false);
          // Update local candidate state to reflect shortlisted status
          setCandidate(prevCandidate => ({
            ...prevCandidate,
            is_shortlisted: false
          }));
          showNotification(`${candidate.firstName} ${candidate.lastName} has been removed from your shortlist.`);
        } else {
          throw new Error(response.data.msg || "Could not remove candidate from shortlist");
        }
      } else {
        // Add to shortlist
        console.log('Shortlisting candidate with:', {
          candidate_id: params.id
        });

        const response = await axios.post(
          `${API_BASE_URL}/candidates/shortlist`,
          {
            candidate_id: params.id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Shortlist response:', response.data);

        if (response.data.code === 200) {
          setIsShortlisted(true);
          // Update local candidate state to reflect shortlisted status
          setCandidate(prevCandidate => ({
            ...prevCandidate,
            is_shortlisted: true
          }));
          showNotification(`${candidate.firstName} ${candidate.lastName} has been added to your shortlist.`);
        } else {
          throw new Error(response.data.msg || "Could not shortlist candidate");
        }
      }
    } catch (err) {
      console.error('Error managing shortlist:', err);
      const action = isShortlisted ? "remove from" : "add to";
      showNotification(`Could not ${action} shortlist at this time`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // If still loading authentication, show loading state
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Authenticating...</p>
      </div>
    );
  }

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
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
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
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Candidates
      </Button>

      {/* Top Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <ProfileAvatar
            profile={candidate.profile}
            firstName={candidate.firstName}
            lastName={candidate.lastName}
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-gray-600 mb-4">
              {candidate.presentRank || 'No rank'} | {candidate.nationality || 'Nationality not specified'}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={handleContactClick}
                disabled={candidate.is_profile_viewed}
              >
                {showContact ? 'Hide Contact' : (candidate.is_profile_viewed ? 'Contact Info Below' : 'Contact Now')}
              </Button>

              <Button
                variant={candidate.is_resume_downloaded ? "secondary" : "outline"}
                onClick={handleResumeDownload}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' :
                  (candidate.is_resume_downloaded ? 'Resume Downloaded' : 'Download Resume')}
              </Button>

              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>

              <Button
                variant={isShortlisted ? "secondary" : "outline"}
                onClick={handleShortlistToggle}
                disabled={isSaving}
              >
                <Star className="w-4 h-4 mr-2" fill={isShortlisted ? "#f59e0b" : "none"} />
                {isSaving ? 'Processing...' : (isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - always visible if profile has been viewed */}
      {(showContact || candidate.is_profile_viewed) && (
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

      {/* Personal Details */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard title="Age" value={candidate.age} />
            <InfoCard title="Date of Birth" value={candidate.dob} />
            <InfoCard title="Gender" value={candidate.gender} />
            <InfoCard title="Nationality" value={candidate.nationality} />
            <InfoCard title="US Visa" value={candidate.usVisa} />
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
    </div>
  );
}