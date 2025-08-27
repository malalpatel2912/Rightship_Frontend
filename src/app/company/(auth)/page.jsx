'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompanyPage() {
  // Get session from NextAuth
  const { data: session, status: authStatus } = useSession();
  // Get additional auth info from our custom context
  const { user, token: authToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  // Get auth token from various sources
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
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
    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/job/create');
    }
  }, [authStatus, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!getAuthToken()) {
        console.log('No token available, skipping attributes fetch');
        setLoading(false);
        return;
      }
      try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/company`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Subscription response status:', response.status);
        console.log('Subscription response data:', response.data);
        if (response.status === 200) {
          setSubscription(response.data.subscription);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authStatus]);

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">You don't have an active subscription plan. Upgrade now to access premium features.</p>
          <Link href="/subscription/plans">
            <span className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200">
              View Subscription Plans
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Subscription Details Card */}
        <div className=" overflow-hidden mb-8">
          
          <div className="">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">{subscription.plan_name}</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600 capitalize">{subscription.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Type:</span>
                      <span className="font-medium capitalize">{subscription.plan_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{subscription.duration} month(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(subscription.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{formatDate(subscription.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company Placement:</span>
                      <span className="font-medium capitalize">{subscription.company_list_placement}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="border border-gray-200 rounded-lg p-5 h-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Usage</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile View Stats */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Profile Views</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-blue-700">
                          {subscription.remaining_profile_views}
                        </div>
                        <div className="text-sm text-gray-500">
                          of {subscription.can_view_profile_per_week} weekly
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(subscription.remaining_profile_views / subscription.can_view_profile_per_week) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Resume Downloads Stats */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Resume Downloads</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-green-700">
                          {subscription.remaining_resume_downloads}
                        </div>
                        <div className="text-sm text-gray-500">
                          of {subscription.resume_download_per_week} weekly
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${(subscription.remaining_resume_downloads / subscription.resume_download_per_week) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* User Allocation Stats */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-purple-50 md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Team Members</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-800">
                          You can add up to {subscription.can_add_user} users
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Job Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to find your next team member?</h2>
                <p className="text-gray-600">Post a job listing and start receiving applications from qualified candidates.</p>
              </div>
              <Link href="/company/job/create">
                <span className="mt-4 md:mt-0 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md text-center transition duration-200">
                  Create New Job Listing
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}