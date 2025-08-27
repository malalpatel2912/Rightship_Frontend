'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from "next-auth/react";
import {
  Ship, Users, Calendar, Clock, IndianRupee, Building, Eye, Share2,
  Briefcase, ArrowLeft, CheckCircle, BookmarkPlus, MessageCircle,
  Copy, Facebook, Twitter, Linkedin, BookmarkCheck, X, Info, Lock, Mail, Phone,
  DollarSign
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Get session from NextAuth
  const { data: session, status: authStatus } = useSession();
  // Get additional auth info from our custom context
  const { user, token: authToken, isAuthenticated } = useAuth();

  // For debugging
  console.log('NextAuth Session:', session);
  console.log('Custom Auth Context:', { user, authToken, isAuthenticated });

  // Get auth token from various sources
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem('token');
  };

  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState({ apply: false, save: false });

  // Get job details data
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!params?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Configure headers based on authentication status
        const headers = {
          'Content-Type': 'application/json',
        };

        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Fetching job details with headers:', headers);

        const response = await axios.get(`${API_BASE_URL}/job/${params.id}`, { headers });

        if (response.data && response.data.code === 200) {
          setJobData(response.data);

          // Set application and save status
          if (response.data.job_detail) {
            setIsApplied(response.data.job_detail.is_applied || false);
            setIsSaved(response.data.job_detail.is_saved || false);
          }
        } else {
          setError('Job not found or unavailable');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [params?.id, authStatus, session, authToken]);

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return 'Not specified';
    }
  };

  // Function to render HTML content safely
  const renderHTML = (htmlContent) => {
    return { __html: htmlContent || '' };
  };

  // Handle apply for job
  const handleApply = async () => {
    const token = getAuthToken();

    if (!token) {
      toast.error('Please log in to apply for this job');
      router.push('/login');
      return;
    }

    if (user?.userType !== 'employee') {
      toast.error('Only Candidates can apply for jobs');
      return;
    }

    setActionLoading(prev => ({ ...prev, apply: true }));

    try {
      const method = isApplied ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_BASE_URL}/job/apply/${params.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setIsApplied(!isApplied);
        toast.success(isApplied ? 'Application withdrawn successfully' : 'Applied to job successfully');

        // Update applied count if application was successful
        if (!isApplied && jobData?.job_detail?.job) {
          setJobData(prev => ({
            ...prev,
            job_detail: {
              ...prev.job_detail,
              job: {
                ...prev.job_detail.job,
                applied_count: (prev.job_detail.job.applied_count || 0) + 1
              }
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(`Failed to ${isApplied ? 'withdraw application' : 'apply for job'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, apply: false }));
    }
  };

  // Handle save job
  const handleSave = async () => {
    const token = getAuthToken();

    if (!token) {
      toast.error('Please log in to save this job');
      router.push('/login');
      return;
    }

    if (user?.userType !== 'employee') {
      toast.error('Only Candidates can save jobs');
      return;
    }

    setActionLoading(prev => ({ ...prev, save: true }));

    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_BASE_URL}/job/saved/${params.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Job removed from saved items' : 'Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(`Failed to ${isSaved ? 'unsave' : 'save'} job`);
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Handle share job
  const handleShare = async (platform) => {
    if (!jobData) return;

    try {
      const jobUrl = `${window.location.origin}/jobs/${params.id}`;
      const title = jobData.job_detail?.job?.seoTitle || 'Job Opening';
      const hashtags = 'maritimejobs,shipping,careers';

      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(title)}&hashtags=${hashtags}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${jobUrl}`)}`,
      };

      if (platform === 'copy') {
        await navigator.clipboard.writeText(jobUrl);
        toast.success('Link copied to clipboard!');
        setShareModalOpen(false);
      } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        setShareModalOpen(false);
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share the job. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !jobData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'Job Not Found'}</h2>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { job_detail, company_total_jobs, recent_jobs } = jobData;
  const { company, job } = job_detail;

  // Determine if user is authenticated by checking for a token
  const userIsAuthenticated = !!getAuthToken();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toast notifications */}
      <Toaster position="bottom-right" />

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShareModalOpen(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Job</h3>
              <button onClick={() => setShareModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Share this job with your network</p>
              <div className="p-3 bg-gray-50 rounded-lg break-all text-sm">
                {`${window.location.origin}/jobs/${params.id}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('copy')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-sm">Copy Link</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-green-500 mb-1" />
                <span className="text-sm">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Facebook className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-sm">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Linkedin className="w-6 h-6 text-blue-700 mb-1" />
                <span className="text-sm">LinkedIn</span>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="container mx-auto py-8 px-4">
        {/* Back Button & Job Title */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={() => setShareModalOpen(true)}
            variant="outline"
            className="ml-auto"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 overflow-hidden">
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt={`${company.company_name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Ship className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {job.ranks?.join(', ') || 'Job Position'}
                    </h1>
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="font-medium text-black">{company.company_name}</span>
                      {company.verified && (
                        <Badge className="ml-2 bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Posted {formatDate(job.created_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{job.viewed_count || 0} views</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.applied_count || 0} applications</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {user?.userType === 'employee' ? (
                    <>
                      <Button
                        onClick={handleApply}
                        disabled={actionLoading.apply}
                        className={`flex-1 transition-colors ${isApplied
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                      >
                        {actionLoading.apply ? (
                          <span className="flex items-center">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            Processing...
                          </span>
                        ) : (
                          <>
                            {isApplied ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Withdraw Application
                              </>
                            ) : (
                              <>
                                <Briefcase className="mr-2 h-4 w-4" /> Apply Now
                              </>
                            )}
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleSave}
                        disabled={actionLoading.save}
                        variant="outline"
                        className="flex-1"
                      >
                        {actionLoading.save ? (
                          <span className="flex items-center">
                            <span className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                            Processing...
                          </span>
                        ) : (
                          <>
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="mr-2 h-4 w-4 text-blue-500" /> Saved
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="mr-2 h-4 w-4" /> Save Job
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="w-full text-center py-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Only Candidates can apply for jobs</p>
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                {userIsAuthenticated && user?.userType === 'employee' ? (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {isApplied && (
                      <div className="text-sm flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>You have applied to this job</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-700 flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Sign in as a Candidate to apply or save this job</p>
                      <p className="mt-1">
                        <Link href="/login" className="text-blue-700 underline">
                          Log in
                        </Link> or
                        <Link href="/register" className="text-blue-700 underline ml-1">
                          create an account
                        </Link> to apply for this position and access more features.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-gray-600">
                  {job.jobDescription ? (
                    <div dangerouslySetInnerHTML={renderHTML(job.jobDescription)} />
                  ) : (
                    <p>No description available</p>
                  )}
                </div>

              </CardContent>
            </Card>

            {userIsAuthenticated ? (
              <>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {company.email && (
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-md">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Email</h3>
                            <a href={`mailto:${company.email}`} className="text-sm text-blue-600 hover:underline">
                              {company.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {company.mobile_no && (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-50 p-2 rounded-md">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Phone</h3>
                            <a href={`tel:${company.mobile_no}`} className="text-sm text-green-600 hover:underline">
                              {company.mobile_no}
                            </a>
                          </div>
                        </div>
                      )}

                      {!company.email && !company.mobile_no && (
                        <div className="flex items-center justify-center py-4 text-gray-500">
                          <Info className="h-5 w-5 mr-2" />
                          <span>No contact information available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-0 shadow-sm bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gray-100 p-3 rounded-full mb-3">
                        <Lock className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">Contact Information Hidden</h3>
                      <p className="text-gray-600 mb-4">Login to view recruiter's contact details and apply for this job</p>
                      <div className="flex gap-3">
                        <Link href="/login">
                          <Button variant="default">
                            Login Now
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button variant="outline">
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Ships & Ranks */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Ships & Ranks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Ships:</h3>
                    <div className="flex flex-wrap gap-2">
                      {(job.ships || []).length > 0 ? (
                        job.ships.map((ship, index) => (
                          <Badge
                            key={`${ship}-${index}`}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          >
                            <Ship className="h-3 w-3 mr-1" />
                            {ship}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No ships specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Ranks:</h3>
                    <div className="flex flex-wrap gap-2">
                      {(job.ranks || []).length > 0 ? (
                        job.ranks.map((rank, index) => (
                          <Badge
                            key={`${rank}-${index}`}
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            {rank}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No ranks specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {job.wages && (
                  <div className="flex items-start gap-3">
                    {job.wagesType === 'day' ? (
                      <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                    ) : (
                      <IndianRupee className="h-5 w-5 text-gray-500 mt-0.5" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium">Wages</h3>
                      <p className="text-sm text-gray-500">
                        {job.wagesType === 'day' ? 'USD' : (job.currency || '₹')} {job.wages} per {job.wagesType || 'month'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Application Period</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(job.startDate)} - {formatDate(job.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Employment Type</h3>
                    <p className="text-sm text-gray-500">
                      {job.wagesType === 'month' ? 'Monthly' : 'Daily'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md bg-blue-50 border border-blue-100 overflow-hidden">
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt={`${company.company_name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{company.company_name}</h3>
                    {company.company_website && (
                      <a
                        href={company.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {company.company_website}
                      </a>
                    )}
                  </div>
                </div>

                {company.license_rpsl && (
                  <div>
                    <h3 className="text-sm font-medium">License/RPSL</h3>
                    <p className="text-sm text-gray-500">{company.license_rpsl}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium">Total Job Postings</h3>
                  <p className="text-sm text-gray-500">{company_total_jobs || 0} jobs</p>
                </div>

                {/* Contact Information - Shown only for logged in users */}
                <div>
                  <h3 className="text-sm font-medium">Contact Information</h3>
                  {userIsAuthenticated ? (
                    <div className="space-y-1 mt-1">
                      {job.mobile_no ? (
                        <p className="text-sm text-gray-500">Phone: {job.mobile_no}</p>
                      ) : null}
                      {job.email ? (
                        <p className="text-sm text-gray-500">Email: {job.email}</p>
                      ) : null}
                      {!job.mobile_no && !job.email && (
                        <p className="text-sm text-gray-500">No contact information available</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      <span>Log in to view contact details</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            {recent_jobs && recent_jobs.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Other Jobs from this Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recent_jobs.map((recentJob) => (
                      <Link
                        href={`/jobs/${recentJob.application_id}`}
                        key={recentJob.application_id}
                        className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900">
                          {recentJob.ranks?.join(', ') || 'Job Position'}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDate(recentJob.created_date)}</span>
                          </div>
                          {recentJob.wages && (
                            <div className="flex items-center text-green-600">
                              {recentJob.wagesType === 'day' ? (
                                <>
                                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                                  <span>USD {recentJob.wages}/{recentJob.wagesType}</span>
                                </>
                              ) : (
                                <>
                                  <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                  <span>{recentJob.currency || '₹'} {recentJob.wages}/{recentJob.wagesType || 'month'}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}