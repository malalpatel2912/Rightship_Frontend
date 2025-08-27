'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

const CompanyProfile = () => {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(null);

  const [companyLogo, setCompanyLogo] = useState("https://static.vecteezy.com/system/resources/previews/011/883/284/non_2x/colorful-star-logo-good-for-technology-logo-vintech-logo-company-logo-browser-logo-dummy-logo-bussiness-logo-free-vector.jpg");

  // Get session from NextAuth
  const { data: session, status: authStatus } = useSession();
  // Get additional auth info from our custom context
  const { user, token: authToken, isAuthenticated } = useAuth();

  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
  };

  // Extract company_id from various sources
  const getCompanyId = () => {
    // Try NextAuth session first
    if (session?.user?.companyId) return session.user.companyId;
    
    // Try custom auth context next
    if (user?.company_id) return user.company_id;
    
    // Finally try localStorage
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.company_id;
      }
    } catch (e) {
      console.error('Error parsing userData from localStorage:', e);
    }
    
    return null;
  };

  // Check authentication status
  useEffect(() => {
    if (authStatus === 'loading') return;

    const token = getAuthToken();
    const companyId = getCompanyId();
    
    console.log('Auth check:', { 
      authStatus, 
      hasToken: !!token, 
      hasCompanyId: !!companyId,
      user
    });
    
    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/profile');
    }
  }, [authStatus, router]);

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
  
  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError('');
      const companyId = getCompanyId();
      
      if (!companyId) {
        console.error('No company ID available');
        setError('Unable to retrieve company information. Please try again later.');
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        console.log('Fetching company data with token:', token ? 'Available' : 'Not available');
        console.log('Company ID:', companyId);
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/get`,
          { company_id: companyId },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }
        );
        
        console.log('Company data response:', response.data);
        
        if (response.data?.code === 200 && response.data.data?.length) {
          const companyData = response.data.data[0];
          setCompany(companyData);
          setCompanyLogo(companyData.companyLogo || companyLogo);
          setEditedCompany(companyData);
        } else {
          throw new Error(response.data?.msg || 'Failed to fetch company data');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setError('Failed to load company information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have authentication
    if ((authStatus === 'authenticated' || getAuthToken()) && getCompanyId()) {
      fetchCompanyData();
    } else if (authStatus !== 'loading') {
      // If authentication is done loading and we still don't have what we need
      setLoading(false);
    }
  }, [authStatus]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileUrl = response.data.file_url;
      setCompanyLogo(fileUrl);
      setEditedCompany(prev => ({
        ...prev,
        companyLogo: fileUrl
      }));

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update`, {
        company_id: getCompanyId(),
        companyLogo: fileUrl
      });
      
      // Show success message
      showToast('Logo updated successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to update logo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        ...editedCompany,
        company_id: getCompanyId()
      };
      
      // Remove fields that shouldn't be sent
      delete payload._id;

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update`, payload);
      
      if (response.data?.code === 200) {
        setCompany(editedCompany);
        setIsEditing(false);
        showToast('Company profile updated successfully!', 'success');
      } else {
        throw new Error(response.data?.msg || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('Failed to update company profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not available';
    
    try {
      let dateObj;
      if (typeof dateValue === 'object' && dateValue.$date) {
        dateObj = new Date(dateValue.$date);
      } else {
        dateObj = new Date(dateValue);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Show loading state during authentication
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Authenticating...</span>
      </div>
    );
  }

  // Show loading state while fetching company data
  if (loading && !company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading company profile...</span>
      </div>
    );
  }

  // Show error state
  if (error && !company) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="bg-red-50 border border-red-200 p-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If we have no company data after loading is complete
  if (!loading && !company) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="bg-yellow-50 border border-yellow-200 p-4">
          <AlertDescription>No company profile found. Please contact support if this issue persists.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white shadow-xl">
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Manage your company information and settings</p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert className="mb-6 bg-red-50 border border-red-100">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">Company Logo</label>
                  <div className="relative group">
                    <img 
                      src={companyLogo} 
                      alt="Company Logo" 
                      className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                          <span className="text-white">Upload</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Company Name</label>
                  {isEditing ? (
                    <Input
                      value={editedCompany?.company_name || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, company_name: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{company?.company_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  {isEditing ? (
                    <Input
                      value={editedCompany?.website_url || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, website_url: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <a 
                      href={company?.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 block text-blue-600 hover:underline"
                    >
                      {company?.website_url || 'Not provided'}
                    </a>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        placeholder="City"
                        value={editedCompany?.city || ''}
                        onChange={(e) => setEditedCompany({...editedCompany, city: e.target.value})}
                      />
                      <Input
                        placeholder="Country"
                        value={editedCompany?.country || ''}
                        onChange={(e) => setEditedCompany({...editedCompany, country: e.target.value})}
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {[company?.city, company?.country].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Name</label>
                  {isEditing ? (
                    <Input
                      value={editedCompany?.first_name || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, first_name: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{company?.first_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedCompany?.email || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, email: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{company?.email || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedCompany?.mobile_no || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, mobile_no: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{company?.mobile_no || 'Not provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Verification Status</span>
                  <Badge 
                    variant={company?.verified ? "success" : "secondary"}
                    className={company?.verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {company?.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Admin Verification</span>
                  <Badge 
                    variant={company?.admin_verify ? "success" : "secondary"}
                    className={company?.admin_verify ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {company?.admin_verify ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">License RPSL</label>
                  {isEditing ? (
                    <Input
                      value={editedCompany?.license_rpsl || ''}
                      onChange={(e) => setEditedCompany({...editedCompany, license_rpsl: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{company?.license_rpsl || 'Not provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Account Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(company?.created_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(company?.updated_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedCompany(company);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Container for Notifications */}
      <div className="fixed bottom-4 right-4 z-50" id="toast-container"></div>
    </div>
  );
};

export default CompanyProfile;