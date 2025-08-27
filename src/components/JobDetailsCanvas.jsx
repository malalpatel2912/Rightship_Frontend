'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Building2, MapPin, Calendar, Clock, Briefcase, User,
  CheckCircle, BookmarkPlus, BookmarkCheck, Share2,
  Mail,
  Phone,
  Info,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;


const JobDetailsCanvas = ({ job, formatDate, onClose, onShare }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState({ apply: false, save: false });

  // Set initial states after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (job) {
      setIsApplied(job.is_applied || false);
      setIsSaved(job.is_saved || false);
    }
  }, [job]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply for jobs');
      router.push('/login');
      return;
    }

    if (user?.userType !== 'employee') {
      toast.error('Only Candidates can apply for jobs');
      return;
    }

    setLoading(prev => ({ ...prev, apply: true }));

    try {
      const method = isApplied ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_BASE_URL}/job/apply/${job.application_id || job._id}`,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setIsApplied(!isApplied);
        toast.success(isApplied ? 'Application withdrawn successfully' : 'Applied to job successfully');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(`Failed to ${isApplied ? 'withdraw' : 'apply for'} job`);
    } finally {
      setLoading(prev => ({ ...prev, apply: false }));
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save jobs');
      return;
    }

    if (user?.userType !== 'employee') {
      toast.error('Only Candidates can save jobs');
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));

    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_BASE_URL}/job/saved/${job.application_id || job._id}`,
        headers: {
          'Content-Type': 'application/json'
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
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(job);
    }
  };

  const maskSensitiveInfo = (text) => {
    if (!isAuthenticated || !text) return text || '';
    // Mask emails with 8 consecutive digits before @
    return text.replace(/([^\s]*\d{8}[^\s]*@\S+)/g, '******');
  };

  const getDescription = () => {
    return job.description || job.jobDescription || 'No detailed description available for this position.';
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl z-50 bg-white shadow-xl overflow-y-auto"
    >
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Share job"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={job?.companyLogo || '/placeholder-logo.png'}
              alt={job?.company?.company_name || 'Company'}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {job.ranks?.join(', ') || job.open_positions?.join(', ') || 'Job Position'}
              </h1>
              <button
                onClick={handleSave}
                disabled={loading.save}
                aria-label={isSaved ? "Unsave job" : "Save job"}
                className={`p-2 rounded-full transition-colors ${isSaved
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {isSaved
                  ? <BookmarkCheck className="w-5 h-5" />
                  : <BookmarkPlus className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-1 flex items-center text-gray-500">
              <Building2 className="w-4 h-4 mr-1" />
              <span className="font-medium text-red-500">{job?.company?.company_name || 'Company'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {job.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              <span>{job.location}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
            <span>Posted {job.created_date ? formatDate(job.created_date) : 'Recently'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            <span>{job.wagesType === 'month' ? 'Monthly' : 'Daily'}</span>
          </div>
          {job.viewed_count && (
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              <span>{job.viewed_count} view{job.viewed_count !== 1 ? 's' : ''}</span>
            </div>
          )}
          {job.wages && (
            <div className="col-span-2 mt-2 flex items-center text-green-600 font-medium text-lg">
              <span>{job.currency} {job.wages} per {job.wagesType || 'month'}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Vessel Types</h3>
          <div className="flex flex-wrap gap-2">
            {(job.ships || job.hiring_for || []).map((type, index) => (
              <span
                key={`vessel-${index}-${Math.random().toString(36).substring(2, 11)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
              >
                <Briefcase className="w-4 h-4 mr-1" />
                {type}
              </span>
            ))}
          </div>
        </div>



        {isAuthenticated ? (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job?.company.email && (
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-50 p-2 rounded-md">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Email</h3>
                        <a href={`mailto:${job?.company?.email}`} className="text-sm text-blue-600 hover:underline">
                          {job?.company?.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {job?.company?.mobile_no && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-2 rounded-md">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Phone</h3>
                        <a href={`tel:${job?.company?.mobile_no}`} className="text-sm text-green-600 hover:underline">
                          {job?.company?.mobile_no}
                        </a>
                      </div>
                    </div>
                  )}

                  {!job?.company?.email && !job?.company?.mobile_no && (
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

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Job Description</h3>
          <div className="prose prose-sm max-w-none text-gray-600">
            <div className="whitespace-pre-line">
              <div dangerouslySetInnerHTML={{ __html: maskSensitiveInfo(getDescription()) }} />
            </div>
          </div>
        </div>

        {job.seoDescription && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Overview</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <div dangerouslySetInnerHTML={{ __html: maskSensitiveInfo(job.seoDescription) }} />
            </div>
          </div>
        )}

        {/* Application Dates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Application Period</h3>
          <div className="flex flex-wrap gap-4 text-gray-600">
            {job.startDate && (
              <div>
                <span className="font-medium">Start Date:</span> {new Date(job.startDate).toLocaleDateString()}
              </div>
            )}
            {job.endDate && (
              <div>
                <span className="font-medium">End Date:</span> {new Date(job.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Company Information if available */}
        {job?.company?.company_name && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Company Information</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <div className="flex flex-col gap-2">
                {job.rspl_no && <p><span className="font-medium">RPSL No:</span> {job.rspl_no}</p>}
                {job?.company_website && <p><span className="font-medium">Website:</span> {job?.company_website}</p>}
                {job.mobile_no && <p><span className="font-medium">Contact:</span> {maskSensitiveInfo(job.mobile_no)}</p>}
                {job.email && <p><span className="font-medium">Email:</span> {maskSensitiveInfo(job.email)}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Additional tags */}
        {job.seoKeywords && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {job.seoKeywords.split(',').map((keyword, index) => (
                <span
                  key={`keyword-${index}-${Math.random().toString(36).substring(2, 11)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                {user?.userType === 'employee' ? (
                  <>
                    <button
                      onClick={handleApply}
                      disabled={loading.apply}
                      className={`px-6 py-3 rounded-lg font-medium text-white transition-colors
                        ${isApplied
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {loading.apply
                        ? 'Processing...'
                        : (isApplied
                          ? 'Withdraw Application'
                          : 'Apply Now')}
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={loading.save}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium border transition-colors
                          ${isSaved
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {loading.save
                          ? 'Processing...'
                          : (isSaved
                            ? 'Saved'
                            : 'Save')}
                      </button>

                      <button
                        onClick={handleShare}
                        className="flex-1 px-4 py-3 rounded-lg font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Only Candidates can apply for jobs</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-3">Sign in to apply for this job</p>
                <button
                  className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 w-full transition-colors"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {isApplied && (
            <div className="mt-4 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>You have applied to this job</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobDetailsCanvas;