'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Check, Calendar, Building2, MapPin, Clock, BookmarkPlus, BookmarkCheck, Briefcase, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import the JobDetailsCanvas to prevent hydration issues
const JobDetailsCanvas = dynamic(() => import('@/components/JobDetailsCanvas'), {
  ssr: false,
});

// Constants
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
const JOBS_PER_PAGE = 10;

// Fallback mock data for testing UI when API fails
const MOCK_JOBS = [
  {
    _id: "mock1",
    ranks: ["Chief Engineer", "2nd Engineer"],
    company_name: "Maritime Ventures",
    location: "Singapore",
    created_date: new Date().toISOString(),
    wagesType: "month",
    wages: 5000,
    currency: "USD",
    jobDescription: "Looking for experienced engineers for international vessels",
    ships: ["Tanker", "Container"],
    viewed_count: 24,
    applied_count: 5
  },
  {
    _id: "mock2",
    ranks: ["Captain", "Chief Officer"],
    company_name: "Ocean Shipping Co",
    location: "Dubai, UAE",
    created_date: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    wagesType: "month",
    wages: 6500,
    currency: "USD",
    jobDescription: "Immediate openings for qualified officers with at least 5 years of experience",
    ships: ["Bulk Carrier"],
    viewed_count: 42,
    applied_count: 8
  },
  {
    _id: "mock3",
    ranks: ["AB Seaman", "Ordinary Seaman"],
    company_name: "Global Marine Services",
    location: "Rotterdam, Netherlands",
    created_date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    wagesType: "month",
    wages: 2800,
    currency: "EUR",
    jobDescription: "Hiring deck crew for European routes",
    ships: ["Container", "RoRo"],
    viewed_count: 31,
    applied_count: 12
  }
];

// Utility Functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Utility function to sanitize HTML descriptions
const sanitizeHtml = (html) => {
  if (!html) return 'No description available';
  
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove all script tags
  const scripts = tempDiv.getElementsByTagName('script');
  while (scripts[0]) {
    scripts[0].parentNode.removeChild(scripts[0]);
  }
  
  // Remove all style tags
  const styles = tempDiv.getElementsByTagName('style');
  while (styles[0]) {
    styles[0].parentNode.removeChild(styles[0]);
  }
  
  // Replace block elements with space + content to ensure proper text flow
  ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].forEach(tag => {
    const elements = tempDiv.getElementsByTagName(tag);
    for (let i = 0; i < elements.length; i++) {
      if (i > 0) elements[i].insertAdjacentText('beforebegin', ' ');
    }
  });
  
  // Get text content and truncate if necessary
  let text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim() || 'No description available';
};

// Components
const SearchInput = ({ value, onChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="flex-1 relative">
    <div className="relative">
      <input
        type="text"
        placeholder="Search jobs, companies, or keywords..."
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
    {value && (
      <button 
        type="button" 
        onClick={() => onChange({ target: { value: '' } })}
        className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </form>
);

const FilterSection = ({ title, options, selected, onChange, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ensure the options are unique
  const uniqueOptions = useMemo(() => {
    return [...new Set(options)];
  }, [options]);
  
  const filteredOptions = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return uniqueOptions.filter(option =>
      selected.includes(option) ||
      option.toLowerCase().includes(lowerSearch)
    );
  }, [uniqueOptions, searchTerm, selected]);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {searchTerm ? (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map(item => (
            <span 
              key={`selected-${item}`}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs"
            >
              {item}
              <button 
                onClick={() => onChange(item)} 
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 border border-gray-100 rounded-lg bg-white">
        {filteredOptions.length > 0 ? (
          filteredOptions.map(option => (
            <label 
              key={option} 
              className="flex items-center p-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer group"
            >
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onChange(option)}
                  className="hidden"
                />
                <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center transition-colors
                  ${selected.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                  {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            </label>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500 text-center">No matching {title.toLowerCase()} found</div>
        )}
      </div>
    </div>
  );
};

const ShareJobModal = ({ job, onClose }) => {
  const [copied, setCopied] = useState(false);
  const jobURL = `${window.location.origin}/jobs/${job.application_id || job._id}`;
  
  const shareOptions = [
    {
      name: 'Copy Link',
      icon: 'link',
      action: () => {
        navigator.clipboard.writeText(jobURL);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'WhatsApp',
      icon: 'whatsapp',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.ranks?.join(', ') || 'Job Position'} at ${job?.company?.company_name || 'Company'}\n\n${jobURL}`)}`, '_blank')
    },
    {
      name: 'Email',
      icon: 'email',
      action: () => window.open(`mailto:?subject=Job Opportunity: ${job.ranks?.join(', ') || 'Job Position'}&body=Check out this job: ${job.ranks?.join(', ') || 'Job Position'} at ${job?.company?.company_name || 'Company'}\n\n${jobURL}`, '_blank')
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobURL)}`, '_blank')
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job opening: ${job.ranks?.join(', ') || 'Job Position'} at ${job?.company?.company_name || 'Company'}\n\n${jobURL}`)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: 'facebook',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobURL)}`, '_blank')
    }
  ];
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Share Job</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-5">
          <p className="text-sm text-gray-600 mb-3">Share this job opportunity with your network</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg break-all text-sm border border-gray-200">
              {jobURL}
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(jobURL);
                setCopied(true);
                toast.success('Link copied to clipboard');
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`p-2.5 rounded-lg transition-colors ${
                copied ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map(option => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {option.name === 'Copy Link' && copied ? (
                <Check className="w-6 h-6 text-green-500 mb-1.5" />
              ) : (
                <Share2 className="w-6 h-6 text-gray-500 mb-1.5" />
              )}
              <span className="text-sm">{option.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            By sharing this job, you acknowledge that you're complying with the terms of service.
          </p>
        </div>
      </div>
    </>
  );
};

const JobCard = ({ job, onClick, onAction, onShare }) => {
  const { isAuthenticated, user } = useAuth();
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState({ apply: false, save: false });

  // Set initial states after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (isAuthenticated && job) {
      setIsApplied(job.is_applied || false);
      setIsSaved(job.is_saved || false);
    }
  }, [job, isAuthenticated]);

  const handleApply = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please log in to apply for jobs');
      return;
    }

    if (user?.userType !== 'employee') {
      toast.error('Only Candidates can apply for jobs');
      return;
    }
    
    setLoading(prev => ({ ...prev, apply: true }));
    
    try {
      const response = await axios.post(
        isApplied 
          ? `${API_BASE_URL}/job/apply/${job.application_id || job._id}`
          : `${API_BASE_URL}/job/apply/${job.application_id || job._id}`,
        {},
        { 
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        setIsApplied(!isApplied);
        toast.success(isApplied ? 'Application withdrawn successfully' : 'Applied to job successfully');
        if (onAction) onAction(job, 'apply');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(`Failed to ${isApplied ? 'withdraw' : 'apply for'} job`);
    } finally {
      setLoading(prev => ({ ...prev, apply: false }));
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    
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
        if (onAction) onAction(job, 'save');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(`Failed to ${isSaved ? 'unsave' : 'save'} job`);
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) onShare(job);
  };

  // Format salary display
  const formatSalary = () => {
    if (!job.wages) return null;
    return (
      <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
        {job.currency || '$'}{job.wages} per {job.wagesType || 'month'}
      </div>
    );
  };

  // Add a memo to process the job description 
  const processedDescription = useMemo(() => {
    return sanitizeHtml(job.jobDescription || job.description);
  }, [job.jobDescription, job.description]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      <div className="p-5" onClick={onClick}>
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <img
              src={job?.companyLogo || '/images/placeholder-logo.png'}
              alt={job?.company?.company_name || 'Company logo'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNFNUU3RUIiIGQ9Ik0wIDBoMTYwdjE2MEgweiIvPjxwYXRoIGQ9Ik04My4xOTUgNTcuMTk1YzAtLjY0LjUyLTEuMTYgMS4xNi0xLjE2aDE2LjY0YTEuMTYgMS4xNiAwIDAxMS4xNiAxLjE2djE2LjY0YTEuMTYgMS4xNiAwIDAxLTEuMTYgMS4xNmgtMTYuNjRhMS4xNiAxLjE2IDAgMDEtMS4xNi0xLjE2di0xNi42NHptLTI1IDE5YzAtLjY0LjUyLTEuMTYgMS4xNi0xLjE2aDE2LjY0YTEuMTYgMS4xNiAwIDAxMS4xNiAxLjE2djE2LjY0YTEuMTYgMS4xNiAwIDAxLTEuMTYgMS4xNmgtMTYuNjRhMS4xNiAxLjE2IDAgMDEtMS4xNi0xLjE2di0xNi42NHptMjUgMGMwLS42NC41Mi0xLjE2IDEuMTYtMS4xNmgxNi42NGExLjE2IDEuMTYgMCAwMTEuMTYgMS4xNnYxNi42NGExLjE2IDEuMTYgMCAwMS0xLjE2IDEuMTZoLTE2LjY0YTEuMTYgMS4xNiAwIDAxLTEuMTYtMS4xNnYtMTYuNjR6IiBmaWxsPSIjQTNBN0IyIi8+PC9nPjwvc3ZnPg==';
              }}
            />
          </div>
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {job.ranks?.join(', ') || job.open_positions?.join(', ') || 'Job Position'}
                </h3>
                <div className="mt-1 flex items-center text-sm">
                  <Building2 className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="font-medium text-red-600">{job?.company?.company_name || 'Company'}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleShare}
                  aria-label="Share job"
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {user?.userType === 'employee' && (
                  <button
                    onClick={handleSave}
                    disabled={loading.save}
                    aria-label={isSaved ? "Unsave job" : "Save job"}
                    className={`p-2 rounded-full transition-colors ${
                      isSaved 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
            
            {/* Job Details */}
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{job.created_date ? formatDate(job.created_date) : 'Recent'}</span>
              </div>
              {job.wagesType && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{job.wagesType === 'month' ? 'Full-time' : 'Contract'}</span>
                </div>
              )}
            </div>
            
            {/* Salary if available */}
            {job.wages && (
              <div className="mt-3">
                {formatSalary()}
              </div>
            )}
            
            {/* Job Description */}
            <div 
              className="mt-3 text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none overflow-hidden text-ellipsis"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxHeight: '3rem'
              }}
              dangerouslySetInnerHTML={{ 
                __html: processedDescription 
              }}
            />
            
            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.ships || job.hiring_for || []).map((type, index) => (
                <span
                  key={`${job.application_id || job._id}-vessel-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="mt-auto px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <span className="inline-flex items-center">
            {job.viewed_count ? `${job.viewed_count} view${job.viewed_count !== 1 ? 's' : ''}` : 'New'}
          </span>
          {job.applied_count && (
            <span className="ml-3 inline-flex items-center">
              • {job.applied_count} applicant{job.applied_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClick}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-blue-600 text-white hover:bg-blue-700"
          >
            View Details
          </button>
          {user?.userType === 'employee' && (
            <button
              onClick={handleApply}
              disabled={loading.apply}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                isApplied 
                  ? 'border border-red-500 text-red-500 hover:bg-red-50' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading.apply 
                ? 'Processing...' 
                : (isApplied ? 'Applied' : 'Apply Now')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Create a separate component for the job board content
const JobBoardContent = () => {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = useState(null);
  const [shareJob, setShareJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [error, setError] = useState(null);
  
  const [state, setState] = useState({
    jobs: [],
    loading: true,
    filters: {
      ranks: searchParams.get('ranks')?.split(',').filter(Boolean) || [],
      ships: searchParams.get('ships')?.split(',').filter(Boolean) || [],
      location: searchParams.get('location')?.split(',').filter(Boolean) || []
    },
    searchTerm: searchParams.get('search') || '',
    currentPage: parseInt(searchParams.get('page')) || 1,
    options: {
      ranks: [],
      ships: [],
      locations: []
    }
  });

  // Handle window resize - only after component mounts
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-show filters on larger screens
      if (window.innerWidth >= 768) {
        setShowFilters(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure axios with auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Record job view when selecting a job
  const recordJobView = async (jobId) => {
    try {
      await axios.post(`${API_BASE_URL}/viewed/${jobId}`, {}, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error recording job view:', error);
      // Non-critical error, so we don't show a toast
    }
  };

  // Handle job selection
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    recordJobView(job.application_id || job._id);
  };

  // Handle job sharing
  const handleShareJob = (job) => {
    setShareJob(job);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const newState = {
      ...state,
      currentPage: 1,
      filters: {
        ranks: [],
        ships: [],
        location: []
      }
    };
    setState(newState);
    updateURL(newState);
  };

  // Function to update URL with current filters and search
  const updateURL = (newState) => {
    const params = new URLSearchParams();
    
    if (newState.searchTerm) {
      params.set('search', newState.searchTerm);
    }
    if (newState.filters.ranks.length > 0) {
      params.set('ranks', newState.filters.ranks.join(','));
    }
    if (newState.filters.ships.length > 0) {
      params.set('ships', newState.filters.ships.join(','));
    }
    if (newState.filters.location.length > 0) {
      params.set('location', newState.filters.location.join(','));
    }
    if (newState.currentPage > 1) {
      params.set('page', newState.currentPage.toString());
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newURL);
  };

  // Define the fetchJobs function outside of the useEffect
  const fetchJobs = async () => {
    setState(prev => ({ ...prev, loading: true }));
    setError(null);
    
    console.log('Fetching jobs with params:', {
      page: state.currentPage,
      limit: JOBS_PER_PAGE,
      search: state.searchTerm,
      ranks: state.filters.ranks.join(','),
      ships: state.filters.ships.join(','),
      location: state.filters.location.join(',')
    });
    
    try {
      // Simpler API request matching the backup copy
      const response = await axios.get(`${API_BASE_URL}/job-applications`, {
        params: {
          page: state.currentPage,
          limit: JOBS_PER_PAGE,
          search: state.searchTerm,
          ranks: state.filters.ranks.join(','),
          ships: state.filters.ships.join(',')
          // Remove location parameter as it wasn't in the original
        },
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('API Response:', response.data);
      
      // Using simpler response handling like in the backup
      if (response.data && response.data.code === 200) {
        setState(prev => ({
          ...prev,
          jobs: response.data.applications || [],
          loading: false
        }));
        setTotalPages(response.data.total_pages || 1);
        setTotalJobs(response.data.total_count || 0);
      } else {
        console.log('Invalid response format, using mock data');
        setState(prev => ({
          ...prev,
          jobs: MOCK_JOBS,
          loading: false
        }));
        setTotalPages(1);
        setTotalJobs(MOCK_JOBS.length);
        setError('No jobs found. Showing sample data.');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs. Showing sample data.');
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        jobs: MOCK_JOBS 
      }));
      setTotalPages(1);
      setTotalJobs(MOCK_JOBS.length);
      setError('There was a problem loading the jobs. Showing example data for demonstration purposes.');
    }
  };
  
  // Use fetchJobs in useEffect with the same dependencies as the backup
  useEffect(() => {
    fetchJobs();
  }, [state.currentPage, state.searchTerm, state.filters.ranks, state.filters.ships]);

  // Fetch Applied Jobs (if authenticated)
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/job/applied`, {
          params: { page: 1, limit: 100 }
        });
        
        if (response.data) {
          const appliedJobIds = new Set(
            response.data.applied_jobs.map(job => job.application_id)
          );
          
          setState(prev => ({
            ...prev,
            jobs: prev.jobs.map(job => ({
              ...job,
              is_applied: appliedJobIds.has(job.application_id || job._id)
            }))
          }));
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };
    
    fetchAppliedJobs();
  }, [isAuthenticated, state.jobs.length]);

  // Fetch Saved Jobs (if authenticated)
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/job/saved`, {
          params: { page: 1, limit: 100 }
        });
        
        if (response.data) {
          const savedJobIds = new Set(
            response.data.saved_jobs.map(job => job.application_id)
          );
          
          setState(prev => ({
            ...prev,
            jobs: prev.jobs.map(job => ({
              ...job,
              is_saved: savedJobIds.has(job.application_id || job._id)
            }))
          }));
        }
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };
    
    fetchSavedJobs();
  }, [isAuthenticated, state.jobs.length]);

  // Fetch Filter Options
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/attributes/get`, {});
        
        if (response.data && response.data.code === 200) {
          const attributes = response.data.data;
          const shipAttribute = attributes.find(attr => attr.name.toLowerCase() === 'ships');
          const rankAttribute = attributes.find(attr => attr.name.toLowerCase() === 'rank');
          const locationAttribute = attributes.find(attr => attr.name.toLowerCase() === 'location');

          // Ensure we have unique values by using Set
          const ships = shipAttribute 
            ? [...new Set(shipAttribute.values
                .filter(value => value && value.trim() !== ''))]
                .sort((a, b) => a.localeCompare(b))
            : [];

          const ranks = rankAttribute 
            ? [...new Set(rankAttribute.values
                .filter(value => value && value.trim() !== ''))]
                .sort((a, b) => a.localeCompare(b))
            : [];
            
          const locations = locationAttribute 
            ? [...new Set(locationAttribute.values
                .filter(value => value && value.trim() !== ''))]
                .sort((a, b) => a.localeCompare(b))
            : [];
          
          setState(prev => ({
            ...prev,
            options: { ships, ranks, locations }
          }));
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };
    
    fetchAttributes();
  }, []);

  // Modified search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const newState = {
      ...state,
      currentPage: 1
    };
    setState(newState);
    updateURL(newState);
  };

  // Modified filter toggle
  const toggleFilter = (type, value) => {
    const newState = {
      ...state,
      currentPage: 1,
      filters: {
        ...state.filters,
        [type]: state.filters[type].includes(value)
          ? state.filters[type].filter(item => item !== value)
          : [...state.filters[type], value]
      }
    };
    setState(newState);
    updateURL(newState);
  };

  const handleJobAction = (job, actionType) => {
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j =>
        j.application_id === job.application_id || j._id === job._id
          ? { 
              ...j, 
              is_applied: actionType === 'apply' ? !j.is_applied : j.is_applied,
              is_saved: actionType === 'save' ? !j.is_saved : j.is_saved
            }
          : j
      )
    }));
    
    // If this was the selected job, update it too
    if (selectedJob && (selectedJob.application_id === job.application_id || selectedJob._id === job._id)) {
      setSelectedJob(prev => ({
        ...prev,
        is_applied: actionType === 'apply' ? !prev.is_applied : prev.is_applied,
        is_saved: actionType === 'save' ? !prev.is_saved : prev.is_saved
      }));
    }
  };

  // Calculate active filter count
  const totalActiveFilters = 
    state.filters.ranks.length + 
    state.filters.ships.length + 
    state.filters.location.length;

  // Only render the filters on client-side to avoid hydration mismatch
  const showFilterSection = typeof window !== 'undefined' && (showFilters || windowWidth >= 768);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header with Stats */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Next Maritime Job</h1>
          <p className="mt-2 text-gray-600">Browse {totalJobs > 0 ? totalJobs : 'available'} jobs from top maritime companies</p>
        </div>
        
        {/* Search Bar and Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchInput
            value={state.searchTerm}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              searchTerm: e.target.value 
            }))}
            onSubmit={handleSearch}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="px-4 py-2 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <span className="hidden sm:inline">View:</span>
              <span>{viewMode === 'list' ? 'Grid' : 'List'}</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 relative"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {totalActiveFilters > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-red-800">Error loading jobs</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => {
                  setError(null);
                  setState(prev => ({ ...prev, loading: true }));
                  fetchJobs();
                }}
                className="px-4 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-800 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Active Filters */}
        {totalActiveFilters > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {state.filters.ranks.map(rank => (
              <span
                key={rank}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {rank}
                <button
                  onClick={() => toggleFilter('ranks', rank)}
                  className="hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            {state.filters.ships.map(vessel => (
              <span
                key={vessel}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
              >
                {vessel}
                <button
                  onClick={() => toggleFilter('ships', vessel)}
                  className="hover:text-green-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            {state.filters.location.map(location => (
              <span
                key={location}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
              >
                {location}
                <button
                  onClick={() => toggleFilter('location', location)}
                  className="hover:text-amber-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            <button 
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - client-side only */}
          <AnimatePresence>
            {showFilterSection && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-72 lg:w-80 bg-white p-6 rounded-xl shadow-sm sticky top-4 h-fit overflow-y-auto lg:max-h-[calc(100vh-2rem)]"
              >
                <div className="flex justify-between items-center md:hidden mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <FilterSection
                  title="Ranks"
                  options={state.options.ranks}
                  selected={state.filters.ranks}
                  onChange={(value) => toggleFilter('ranks', value)}
                  className="mb-6"
                />
                
                <FilterSection
                  title="Vessel Types"
                  options={state.options.ships}
                  selected={state.filters.ships}
                  onChange={(value) => toggleFilter('ships', value)}
                  className="mb-6"
                />
                
                
                {totalActiveFilters > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={clearAllFilters}
                      className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Results Summary */}
            {/* {!state.loading && state.jobs.length > 0 && (
              <div className="mb-4 text-sm text-gray-500">
                Showing {Math.min((state.currentPage - 1) * JOBS_PER_PAGE + 1, totalJobs)} - {Math.min(state.currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs} jobs
              </div>
            )} */}
            
            {/* Loading State */}
            {state.loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Job Cards */}
                {state.jobs.length > 0 ? (
                  viewMode === 'list' ? (
                    <div className="space-y-4">
                      {state.jobs.map((job) => (
                        <JobCard
                          key={job.application_id || job._id || `job-${Math.random().toString(36).substring(2, 11)}`}
                          job={job}
                          onClick={() => handleSelectJob(job)}
                          onAction={handleJobAction}
                          onShare={handleShareJob}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {state.jobs.map((job) => (
                        <JobCard
                          key={job.application_id || job._id || `job-${Math.random().toString(36).substring(2, 11)}`}
                          job={job}
                          onClick={() => handleSelectJob(job)}
                          onAction={handleJobAction}
                          onShare={handleShareJob}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="bg-white rounded-xl p-10 text-center">
                    <div className="mb-4 flex justify-center">
                      <Briefcase className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500 mb-4">
                      We couldn't find any jobs matching your search criteria.
                    </p>
                    <button 
                      onClick={clearAllFilters} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                
                {/* Pagination */}
                {state.jobs.length > 0 && totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex gap-2 items-center">
                      <button
                        onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={state.currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page number buttons */}
                      <div className="hidden sm:flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show 5 pages max centered around current page
                          let pageToShow;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else if (state.currentPage <= 3) {
                            pageToShow = i + 1;
                          } else if (state.currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = state.currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={`page-${pageToShow}`}
                              onClick={() => setState(prev => ({ ...prev, currentPage: pageToShow }))}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                state.currentPage === pageToShow
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageToShow}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Mobile page indicator */}
                      <span className="px-4 py-2 text-sm flex items-center sm:hidden">
                        Page {state.currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                        disabled={state.currentPage >= totalPages}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Job Details Slide-over - client-side only */}
      {typeof window !== 'undefined' && selectedJob && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedJob(null)}
          />
          <JobDetailsCanvas
            job={selectedJob}
            formatDate={formatDate}
            onClose={() => setSelectedJob(null)}
            onShare={() => {
              setSelectedJob(null);
              setShareJob(selectedJob);
            }}
          />
        </>
      )}
      
      {/* Share Job Modal - client-side only */}
      {typeof window !== 'undefined' && shareJob && (
        <ShareJobModal 
          job={shareJob} 
          onClose={() => setShareJob(null)} 
        />
      )}
      
      {/* Toast Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '12px',
            boxShadow: '0 3px 15px rgba(0, 0, 0, 0.1)',
            padding: '16px'
          },
        }}
      />
    </div>
  );
};

// Main Page Component with Suspense
const JobBoardPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <h2 className="text-lg text-gray-700 font-medium">Loading job listings...</h2>
      </div>
    }>
      <JobBoardContent />
    </Suspense>
  );
};

export default JobBoardPage;