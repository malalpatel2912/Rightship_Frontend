'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useSession } from "next-auth/react";
import {
    Ship, Calendar, Building, MailCheck, BookmarkCheck,
    CheckCircle, X, ExternalLink, Eye, Clock, IndianRupee,
    Briefcase, Filter, Search, ChevronDown
} from 'lucide-react';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Import JobDetailsCanvas (assuming you've created this from previous code)
import dynamic from 'next/dynamic';
const JobDetailsCanvas = dynamic(() => import('@/components/JobDetailsCanvas'), {
    ssr: false,
});

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

// Format date utility
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return format(date, 'MMM dd, yyyy');
    } catch (err) {
        return 'Unknown date';
    }
};

// Empty state component
const EmptyState = ({ type, message }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg shadow-sm border border-gray-100">
        {type === 'applied' ? (
            <MailCheck className="h-12 w-12 text-gray-300 mb-4" />
        ) : (
            <BookmarkCheck className="h-12 w-12 text-gray-300 mb-4" />
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">No {type === 'applied' ? 'applied' : 'saved'} jobs</h3>
        <p className="text-gray-500 max-w-md mb-6">{message}</p>
        <Button asChild>
            <Link href="/jobs">Browse Jobs</Link>
        </Button>
    </div>
);

// Job card component
const JobCard = ({ job, type, onAction, onClick }) => {
    const jobDetails = job.job || {};
    const company = job?.company || {};

    return (
        <Card className="overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="p-5" onClick={() => onClick(job)}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {jobDetails.ranks?.join(', ') || 'Job Position'}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="font-medium">{company.company_name || 'Company'}</span>

                            {company.verified && (
                                <Badge className="ml-2 bg-green-50 text-green-600 border-green-100">
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            onClick(job);
                        }}>
                            <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(job, type === 'applied' ? 'withdraw' : 'unsave');
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span>
                            {type === 'applied' ?
                                `Applied ${formatDate(job.applied_at || job.saved_at)}` :
                                `Saved ${formatDate(job.saved_at || job.applied_at)}`
                            }
                        </span>
                    </div>

                    {jobDetails.wages && (
                        <div className="flex items-center text-green-600">
                            <span>{jobDetails.currency } {jobDetails.wages} per {jobDetails.wagesType || 'month'}</span>
                        </div>
                    )}
                </div>

                {jobDetails.jobDescription && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2" 
                       dangerouslySetInnerHTML={{ __html: jobDetails.jobDescription }}>
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                    {(jobDetails.ships || []).map((ship, idx) => (
                        <Badge
                            key={`${ship}-${idx}`}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                            <Ship className="h-3 w-3 mr-1" />
                            {ship}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                    {type === 'applied' ? (
                        <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Applied</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-blue-600 text-sm">
                            <BookmarkCheck className="h-4 w-4 mr-1" />
                            <span>Saved</span>
                        </div>
                    )}
                </div>

                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-sm"
                >
                    <Link href={`/jobs/${job.application_id}`}>
                        <span className="flex items-center">
                            View Details
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </span>
                    </Link>
                </Button>
            </div>
        </Card>
    );
};

export default function MyJobsPage() {
    const router = useRouter();

    // Get session from NextAuth
    const { data: session, status: authStatus } = useSession();
    // Get additional auth info from our custom context
    const { user, token: authToken, isAuthenticated } = useAuth();

    // Get auth token from various sources
    const getAuthToken = () => {
        if (session?.accessToken) return session.accessToken;
        if (authToken) return authToken;
        // Fallback to localStorage for compatibility
        return localStorage.getItem('token');
    };

    // Check authentication status
    useEffect(() => {
        if (authStatus === 'loading') return;
    
        const token = getAuthToken();
        
        if (authStatus === 'unauthenticated' && !token) {
          console.log('Redirecting to login due to missing authentication');
          router.push('/login?callbackUrl=/applied-jobs');
        }
      }, [authStatus, router]);

    const [activeTab, setActiveTab] = useState('applied');
    const [jobs, setJobs] = useState({ applied: [], saved: [] });
    const [loading, setLoading] = useState({ applied: true, saved: true });
    const [error, setError] = useState({ applied: null, saved: null });
    const [selectedJob, setSelectedJob] = useState(null);

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

    // Pagination
    const [pagination, setPagination] = useState({
        applied: { page: 1, limit: 10, total: 0, totalPages: 0 },
        saved: { page: 1, limit: 10, total: 0, totalPages: 0 }
    });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'newest',
        shipType: 'all',
        rankType: 'all'
    });

    // Fetch applied jobs
    const fetchAppliedJobs = async () => {
        if (!isAuthenticated) return;

        setLoading(prev => ({ ...prev, applied: true }));
        setError(prev => ({ ...prev, applied: null }));

        try {
            const response = await axios.get(`${API_BASE_URL}/job/applied`, {
                params: {
                    page: pagination.applied.page,
                    limit: pagination.applied.limit
                }
            });

            if (response.data) {
                setJobs(prev => ({
                    ...prev,
                    applied: response.data.applied_jobs || []
                }));

                setPagination(prev => ({
                    ...prev,
                    applied: {
                        ...prev.applied,
                        total: response.data.total || 0,
                        totalPages: response.data.total_pages || 1
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
            setError(prev => ({
                ...prev,
                applied: 'Failed to load applied jobs. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, applied: false }));
        }
    };

    // Fetch saved jobs
    const fetchSavedJobs = async () => {
        if (!isAuthenticated) return;

        setLoading(prev => ({ ...prev, saved: true }));
        setError(prev => ({ ...prev, saved: null }));

        try {
            const response = await axios.get(`${API_BASE_URL}/job/saved`, {
                params: {
                    page: pagination.saved.page,
                    limit: pagination.saved.limit
                }
            });

            if (response.data) {
                setJobs(prev => ({
                    ...prev,
                    saved: response.data.saved_jobs || []
                }));

                setPagination(prev => ({
                    ...prev,
                    saved: {
                        ...prev.saved,
                        total: response.data.total || 0,
                        totalPages: response.data.total_pages || 1
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            setError(prev => ({
                ...prev,
                saved: 'Failed to load saved jobs. Please try again.'
            }));
        } finally {
            setLoading(prev => ({ ...prev, saved: false }));
        }
    };

    // Fetch jobs when tabs or pagination changes
    useEffect(() => {
        if (activeTab === 'applied') {
            fetchAppliedJobs();
        } else {
            fetchSavedJobs();
        }
    }, [activeTab, pagination.applied.page, pagination.saved.page, isAuthenticated]);

    // Handle job action (withdraw application or unsave)
    const handleJobAction = async (job, action) => {
        try {
            if (action === 'withdraw') {
                await axios.delete(`${API_BASE_URL}/job/apply/${job.application_id}`);
                toast.success('Application withdrawn successfully');

                // Update the jobs list
                setJobs(prev => ({
                    ...prev,
                    applied: prev.applied.filter(j => j.application_id !== job.application_id)
                }));

                // Update pagination
                setPagination(prev => ({
                    ...prev,
                    applied: {
                        ...prev.applied,
                        total: Math.max(0, prev.applied.total - 1)
                    }
                }));
            } else if (action === 'unsave') {
                await axios.delete(`${API_BASE_URL}/job/saved/${job.application_id}`);
                toast.success('Job removed from saved items');

                // Update the jobs list
                setJobs(prev => ({
                    ...prev,
                    saved: prev.saved.filter(j => j.application_id !== job.application_id)
                }));

                // Update pagination
                setPagination(prev => ({
                    ...prev,
                    saved: {
                        ...prev.saved,
                        total: Math.max(0, prev.saved.total - 1)
                    }
                }));
            }
        } catch (error) {
            console.error(`Error during job action (${action}):`, error);
            toast.error(`Failed to ${action === 'withdraw' ? 'withdraw application' : 'unsave job'}`);
        }
    };

    // Handle page change
    const handlePageChange = (type, direction) => {
        setPagination(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                page: direction === 'next'
                    ? Math.min(prev[type].page + 1, prev[type].totalPages)
                    : Math.max(prev[type].page - 1, 1)
            }
        }));
    };

    // Handle sorting
    const handleSortChange = (value) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
        // Here you would add logic to re-fetch or sort the data
    };

    // Handle filter search
    const handleSearch = (e) => {
        e.preventDefault();
        // Here you would add logic to filter data based on search
        console.log('Filtering with search:', filters.search);
    };

    // Get current jobs based on active tab
    const currentJobs = jobs[activeTab] || [];
    const currentLoading = loading[activeTab];
    const currentError = error[activeTab];
    const currentPagination = pagination[activeTab];

    return (
        <div className="bg-gray-50 min-h-screen py-6 px-4 md:py-10">
            <Toaster position="bottom-right" />

            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Jobs</h1>
                    <p className="text-gray-600 mt-1">Manage your job applications and saved listings</p>
                </div>

                <Tabs defaultValue="applied" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <TabsList className="mb-0">
                            <TabsTrigger value="applied" className="text-base px-4 py-2">
                                <MailCheck className="h-4 w-4 mr-2" />
                                Applied Jobs
                                {jobs.applied.length > 0 && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                                        {pagination.applied.total}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="text-base px-4 py-2">
                                <BookmarkCheck className="h-4 w-4 mr-2" />
                                Saved Jobs
                                {jobs.saved.length > 0 && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                                        {pagination.saved.total}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full px-3 py-2 pr-10 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>

                            <Select value={filters.sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Sort by..." />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest first</SelectItem>
                                    <SelectItem value="oldest">Oldest first</SelectItem>
                                    <SelectItem value="salary_high">Highest salary</SelectItem>
                                    <SelectItem value="salary_low">Lowest salary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <TabsContent value="applied" className="mt-0">
                        {currentLoading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : currentError ? (
                            <div className="bg-red-50 p-4 rounded-md text-red-700">
                                <p>{currentError}</p>
                                <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={fetchAppliedJobs}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : currentJobs.length === 0 ? (
                            <EmptyState
                                type="applied"
                                message="You haven't applied to any jobs yet. Browse jobs and apply to get started on your career journey."
                            />
                        ) : (
                            <div className="space-y-4">
                                {currentJobs.map((job) => (
                                    <JobCard
                                        key={job.application_id}
                                        job={job}
                                        type="applied"
                                        onAction={handleJobAction}
                                        onClick={setSelectedJob}
                                    />
                                ))}

                                {currentPagination.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange('applied', 'prev')}
                                            disabled={currentPagination.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">
                                            Page {currentPagination.page} of {currentPagination.totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange('applied', 'next')}
                                            disabled={currentPagination.page === currentPagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="saved" className="mt-0">
                        {currentLoading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : currentError ? (
                            <div className="bg-red-50 p-4 rounded-md text-red-700">
                                <p>{currentError}</p>
                                <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={fetchSavedJobs}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : currentJobs.length === 0 ? (
                            <EmptyState
                                type="saved"
                                message="You haven't saved any jobs yet. Save jobs you're interested in to apply later or keep track of opportunities."
                            />
                        ) : (
                            <div className="space-y-4">
                                {currentJobs.map((job) => (
                                    <JobCard
                                        key={job.application_id}
                                        job={job}
                                        type="saved"
                                        onAction={handleJobAction}
                                        onClick={setSelectedJob}
                                    />
                                ))}

                                {currentPagination.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange('saved', 'prev')}
                                            disabled={currentPagination.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">
                                            Page {currentPagination.page} of {currentPagination.totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange('saved', 'next')}
                                            disabled={currentPagination.page === currentPagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Job Details Slide-over */}
            {selectedJob && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setSelectedJob(null)}
                    />
                    <JobDetailsCanvas
                        job={{
                            ...selectedJob.job,
                            application_id: selectedJob.application_id,
                            company_name: selectedjob?.company?.company_name,
                            is_applied: activeTab === 'applied' || false,
                            is_saved: activeTab === 'saved' || false
                        }}
                        formatDate={formatDate}
                        onClose={() => setSelectedJob(null)}
                    />
                </>
            )}
        </div>
    );
}