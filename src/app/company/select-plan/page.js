'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Calendar, Users, FileText, Award, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext'; // Assuming you have an AuthContext

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

// Define Navi Blue color
const NAVI_BLUE = '#001F5B'; // Dark navy blue color

const SubscriptionPlans = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { user, token: authToken, isAuthenticated } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [applyingPlan, setApplyingPlan] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

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

    console.log('Auth check:', {
      authStatus,
      hasToken: !!token
    });

    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/subscription/plans');
    }
  }, [authStatus, router]);

  // Fetch plans when component mounts
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setPlans(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyForPlan = async (planId) => {
    setApplyingPlan(planId);
    setApplyError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/apply`,
        { plan_id: planId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Show success message
      setApplySuccess(true);
      
      // Redirect to /company/ page after a short delay
      setTimeout(() => {
        router.push('/company/');
      }, 1500);
    } catch (err) {
      console.error('Failed to apply for plan:', err);
      setApplyError(err.response?.data?.message || err.message || 'Failed to apply for subscription plan');
      setApplyingPlan(null);
    }
  };

  const getPlanTypeLabel = (category) => {
    switch(category) {
      case 'annual':
        return 'Annual';
      case 'semi-annual':
        return '6 Months';
      case 'trial':
        return 'Trial';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPlacementBadgeColor = (placement) => {
    const placementLower = placement.toLowerCase();
    if (placementLower.includes('premium')) {
      return 'bg-purple-100 text-purple-800';
    } else if (placementLower.includes('website')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFeatureValue = (value) => {
    if (value === 'Unlimited') return 'Unlimited';
    if (typeof value === 'string' && value.includes('per')) return value;
    return value;
  };

  const filteredPlans = selectedTab === 'all' 
    ? plans 
    : plans.filter(plan => plan.plan_category === selectedTab);

  // Loading state
  if (authStatus === 'loading' || loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: NAVI_BLUE }}></div>
        <p className="ml-3 text-gray-600">Loading subscription plans...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button className="mt-2" onClick={fetchPlans} style={{ backgroundColor: NAVI_BLUE }}>Try Again</Button>
      </Alert>
    );
  }

  // Empty state
  if (plans.length === 0) {
    return (
      <div className="w-full p-8 bg-gray-50 text-center max-w-2xl mx-auto my-8">
        <p className="text-gray-600">No subscription plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-sm overflow-hidden">
      {/* Success message */}
      {applySuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 shadow-xl max-w-md">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Application Submitted</h3>
            <p className="text-gray-600 text-center">
              Your subscription request has been submitted. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-8 text-white" style={{ backgroundColor: NAVI_BLUE }}>
        <h2 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h2>
        <p className="opacity-90">
          Select the plan that fits your company's needs and recruiting goals
        </p>
      </div>

      {/* Plan Type Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('all')}
            className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              selectedTab === 'all'
                ? 'border-b-2 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{ borderColor: selectedTab === 'all' ? NAVI_BLUE : 'transparent', color: selectedTab === 'all' ? NAVI_BLUE : '' }}
          >
            All Plans
          </button>
          <button
            onClick={() => setSelectedTab('monthly')}
            className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              selectedTab === 'monthly'
                ? 'border-b-2 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{ borderColor: selectedTab === 'monthly' ? NAVI_BLUE : 'transparent', color: selectedTab === 'monthly' ? NAVI_BLUE : '' }}
          >
            Monthly Plans
          </button>
          <button
            onClick={() => setSelectedTab('annual')}
            className={`py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              selectedTab === 'annual'
                ? 'border-b-2 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{ borderColor: selectedTab === 'annual' ? NAVI_BLUE : 'transparent', color: selectedTab === 'annual' ? NAVI_BLUE : '' }}
          >
            Annual Plans
          </button>
        </div>
      </div>

      {/* Apply error message */}
      {applyError && (
        <Alert variant="destructive" className="mx-6 mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Failed</AlertTitle>
          <AlertDescription>{applyError}</AlertDescription>
        </Alert>
      )}

      {/* Plans Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border overflow-hidden flex flex-col transition-transform hover:shadow-lg ${
                plan.plan_name.toLowerCase().includes('pro') ? 'border-blue-200 shadow-md' : ''
              }`}
            >
              {plan.plan_name.toLowerCase().includes('pro') && (
                <div className="text-white text-center text-xs py-1 font-medium" style={{ backgroundColor: NAVI_BLUE }}>
                  POPULAR CHOICE
                </div>
              )}
              
              {/* Plan Header */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{plan.plan_name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                    plan.plan_category === 'annual' ? 'bg-green-100 text-green-800' : 
                    plan.plan_category === 'semi-annual' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {getPlanTypeLabel(plan.plan_category)}
                  </span>
                </div>
                {/* {plan.amount && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatCurrency(plan.amount)}
                    </span>
                    {plan.gst_applicable && (
                      <span className="text-sm text-gray-500">+ GST</span>
                    )}
                  </div>
                )} */}
                <p className="text-xs text-gray-500 mt-1">
                  {plan.duration}
                </p>
              </div>

              {/* Plan Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Users className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVI_BLUE }} />
                    <div>
                      <span className="font-medium">Team Members</span>
                      <p className="text-sm text-gray-500">
                        {renderFeatureValue(plan.can_add_user)} team members allowed
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVI_BLUE }} />
                    <div>
                      <span className="font-medium">Profile Views</span>
                      <p className="text-sm text-gray-500">
                        {renderFeatureValue(plan.can_view_profile_per_week)}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVI_BLUE }} />
                    <div>
                      <span className="font-medium">Resume Downloads</span>
                      <p className="text-sm text-gray-500">
                        {renderFeatureValue(plan.resume_download_per_week)}
                      </p>
                    </div>
                  </li>
                  {plan.company_list_placement && (
                    <li className="flex items-start gap-3">
                      <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVI_BLUE }} />
                      <div>
                        <span className="font-medium">Placement</span>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium mr-1 ${getPlacementBadgeColor(plan.company_list_placement)}`}>
                            {plan.company_list_placement}
                          </span> 
                          listing
                        </p>
                      </div>
                    </li>
                  )}
                  {plan.additional_benefits && plan.additional_benefits.length > 0 && (
                    <li className="flex items-start gap-3">
                      <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NAVI_BLUE }} />
                      <div>
                        <span className="font-medium">Additional Benefits</span>
                        <ul className="text-sm text-gray-500 mt-1 space-y-1">
                          {plan.additional_benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Plan Action */}
              <div className="p-6 border-t">
                <Button
                  // onClick={() => applyForPlan(plan.id)}
                  disabled={true}
                  className={`w-full h-10 flex items-center justify-center ${
                    applyingPlan === plan.id
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ 
                    backgroundColor: applyingPlan === plan.id ? '#ccc' : NAVI_BLUE 
                  }}
                >
                  {applyingPlan === plan.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                     Contact Admin
                    </>
                  ) : (
                    <>
                       Contact Admin <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footnote */}
      <div className="px-6 pb-6 text-sm text-gray-500">
        <p>* All plans require admin approval before activation.</p>
        <p>* Annual plans offer significant savings compared to monthly billing.</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;