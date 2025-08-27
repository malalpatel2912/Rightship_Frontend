'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays, isValid, parseISO } from 'date-fns';
import Select from 'react-select';
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from "next-auth/react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import {
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  AlertTriangle,
  Search,
  Download,
  Star,
  Clock
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CandidateTrackingPage() {
  const searchParams = useSearchParams();
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

  // Initialize state from URL parameters
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTrackingType, setSelectedTrackingType] = useState(
    searchParams.get('tracking_type') || 'viewed'
  );
  const [dateRange, setDateRange] = useState({
    from: searchParams.get('date_from') ? parseISO(searchParams.get('date_from')) : subDays(new Date(), 30),
    to: searchParams.get('date_to') ? parseISO(searchParams.get('date_to')) : new Date(),
  });
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'recent');
  const [showFilters, setShowFilters] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const PAGE_SIZE = 10;

  // API endpoints map based on interaction type
  const API_ENDPOINTS = {
    viewed: `${process.env.NEXT_PUBLIC_API_BASE_URL}/candidates/viewed-history`,
    downloaded: `${process.env.NEXT_PUBLIC_API_BASE_URL}/candidates/downloaded-history`,
    shortlisted: `${process.env.NEXT_PUBLIC_API_BASE_URL}/candidates/shortlisted`
  };

  // Check authentication status
  useEffect(() => {
    if (authStatus === 'loading') return;

    const token = getAuthToken();

    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/candidates/history');
    }
  }, [authStatus, router]);

  // Update URL with current filters and search using router.push
  const updateURLParams = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    params.set('tracking_type', selectedTrackingType);
    if (isValid(dateRange.from)) params.set('date_from', format(dateRange.from, 'yyyy-MM-dd'));
    if (isValid(dateRange.to)) params.set('date_to', format(dateRange.to, 'yyyy-MM-dd'));
    if (sortOrder !== 'recent') params.set('sort', sortOrder);

    // Use router.replace to update URL without creating new history entry
    const url = `/company/candidates/history${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(url, { scroll: false });
  };

  // Update URL when filters, pagination, or search change
  useEffect(() => {
    updateURLParams();
  }, [searchTerm, currentPage, selectedTrackingType, dateRange, sortOrder]);

  // Configure axios with auth token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for axios');
    }
  }, [session, authToken]);

  // Fetch candidates with filters and pagination
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getAuthToken();
        const endpoint = API_ENDPOINTS[selectedTrackingType];

        if (!endpoint) {
          throw new Error(`Invalid tracking type: ${selectedTrackingType}`);
        }

        const queryData = {
          page: currentPage,
          limit: PAGE_SIZE,
          sort: sortOrder
        };

        if (searchTerm) {
          queryData.search = searchTerm;
        }

        if (isValid(dateRange.from)) {
          queryData.start_date = format(dateRange.from, 'yyyy-MM-dd');
        }

        if (isValid(dateRange.to)) {
          queryData.end_date = format(dateRange.to, 'yyyy-MM-dd');
        }

        console.log(`Fetching candidates from ${endpoint} with query:`, queryData);

        const response = await axios.post(endpoint, queryData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.code === 200) {
          setCandidates(response.data.data || []);
          setTotalCandidates(response.data.total_documents || 0);
          setTotalPages(response.data.total_pages || Math.ceil((response.data.total_documents || 0) / PAGE_SIZE));
        } else {
          throw new Error(response.data?.msg || 'Failed to fetch candidates');
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError('Failed to load candidate tracking data. Please try again.');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have authentication
    if (authStatus === 'authenticated' || getAuthToken()) {
      fetchCandidates();
    }
  }, [currentPage, searchTerm, selectedTrackingType, dateRange, sortOrder, authStatus]);

  // Navigate to candidate details page
  const handleViewCandidateDetails = (candidate) => {
    const candidateId = candidate.candidate_id || 
                        (candidate.candidate_details && candidate.candidate_details._id);
    router.push(`/company/candidates/${candidateId}`);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleTrackingTypeChange = (value) => {
    setSelectedTrackingType(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1);
    setIsCalendarOpen(false);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
    setSortOrder('recent');
    setSearchTerm('');
    setCurrentPage(1);
    // Don't reset tracking type as it's now handled by tabs
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={`page-btn-${i}`}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '40px',
      backgroundColor: 'white',
      borderColor: 'hsl(var(--input))',
      '&:hover': {
        borderColor: 'hsl(var(--input))'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'hsl(201.9, 87%, 24.1%)' : base.backgroundColor,
      color: state.isSelected ? 'white' : 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: state.isSelected ? 'hsl(201.9, 87%, 24.1%)' : 'hsl(var(--accent))'
      }
    })
  };

  // If still loading authentication, show loading state
  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const formatExperience = (years, months) => {
    let experience = '';
    if (years && parseInt(years) > 0) {
      experience += `${years} year${parseInt(years) !== 1 ? 's' : ''}`;
    }
    if (months && parseFloat(months) > 0) {
      experience += experience ? ` ${months} month${parseFloat(months) !== 1 ? 's' : ''}` : `${months} month${parseFloat(months) !== 1 ? 's' : ''}`;
    }
    return experience || 'None';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Get interaction time and count based on tracking type
  const getInteractionInfo = (candidate) => {
    const details = candidate.candidate_details || {};
    
    if (selectedTrackingType === 'viewed') {
      return {
        label: 'Viewed',
        timestamp: candidate.latest_view,
        count: candidate.view_count || 1,
        icon: <Eye className="h-4 w-4 mr-1" />
      };
    } else if (selectedTrackingType === 'downloaded') {
      return {
        label: 'Downloaded',
        timestamp: candidate.latest_download,
        count: candidate.download_count || 1,
        icon: <Download className="h-4 w-4 mr-1" />
      };
    } else if (selectedTrackingType === 'shortlisted') {
      return {
        label: 'Shortlisted',
        timestamp: candidate.shortlisted_at,
        count: 1, // Shortlisting happens once
        icon: <Star className="h-4 w-4 mr-1 text-yellow-500" />
      };
    }
    
    return {
      label: 'Interacted',
      timestamp: new Date(),
      count: 1,
      icon: <Clock className="h-4 w-4 mr-1" />
    };
  };

  // Get status badge
  const getStatusBadge = (candidate) => {
    if (selectedTrackingType === 'shortlisted' || candidate.is_shortlisted) {
      return <Badge variant="success" className="bg-yellow-100 text-yellow-800">Shortlisted</Badge>;
    }
    if (selectedTrackingType === 'downloaded' || candidate.is_resume_downloaded) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Resume Downloaded</Badge>;
    }
    if (selectedTrackingType === 'viewed' || candidate.is_profile_viewed) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Profile Viewed</Badge>;
    }
    return null;
  };

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Candidate Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor your candidate interactions and recruitment activities
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error Message */}
          {error && (
            <Alert className="mb-4 bg-red-50 border border-red-100 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Interaction Type Tabs */}
          <Tabs 
            defaultValue="viewed" 
            value={selectedTrackingType}
            onValueChange={handleTrackingTypeChange}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="viewed" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Viewed Profiles</span>
                <span className="sm:hidden">Viewed</span>
              </TabsTrigger>
              <TabsTrigger value="downloaded" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Downloaded Resumes</span>
                <span className="sm:hidden">Downloads</span>
              </TabsTrigger>
              <TabsTrigger value="shortlisted" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Shortlisted Candidates</span>
                <span className="sm:hidden">Shortlisted</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filters */}
          <div className={`space-y-4 mb-6 ${showFilters ? '' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-8 pr-8"
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => handleSearchChange('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select
                options={sortOptions}
                value={sortOptions.find(option => option.value === sortOrder)}
                onChange={(selected) => handleSortOrderChange(selected.value)}
                styles={customSelectStyles}
                placeholder="Sort by"
              />

              <Button
                variant="outline"
                onClick={resetFilters}
                className="md:col-span-3 w-full md:w-auto md:justify-self-end"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || dateRange.from || dateRange.to || sortOrder !== 'recent') && (
            <div className="mb-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}

              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Date: {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : 'Any'} - {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : 'Any'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setDateRange({ from: null, to: null })}
                  />
                </Badge>
              )}

              {sortOrder !== 'recent' && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Sort: {sortOptions.find(option => option.value === sortOrder)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSortOrder('recent')}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">Current Position</TableHead>
                  <TableHead className="hidden md:table-cell">Experience</TableHead>
                  <TableHead>Interaction</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="mb-2">
                          {selectedTrackingType === 'viewed' && "No viewed profiles found"}
                          {selectedTrackingType === 'downloaded' && "No downloaded resumes found"}
                          {selectedTrackingType === 'shortlisted' && "No shortlisted candidates found"}
                        </div>
                        {(searchTerm || dateRange.from || dateRange.to || sortOrder !== 'recent') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate, candidateIndex) => {
                    const details = candidate.candidate_details || {};
                    const interactionInfo = getInteractionInfo(candidate);
                    
                    return (
                      <TableRow key={`candidate-row-${candidateIndex}`} className="group hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              {details.profile ? (
                                <AvatarImage src={details.profile} alt={`${details.firstName} ${details.lastName}`} />
                              ) : null}
                              <AvatarFallback>{getInitials(details.firstName, details.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {details.firstName} {details.lastName}
                              </div>
                              <div className="text-sm text-gray-500 md:hidden">
                                {details.presentRank || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {details.nationality}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{details.presentRank || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{details.presentVessel || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatExperience(details.totalSeaExperienceYear, details.totalSeaExperienceMonth)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {interactionInfo.icon}
                              <span>
                                {interactionInfo.timestamp 
                                  ? format(new Date(interactionInfo.timestamp), 'MMM dd, yyyy')
                                  : 'N/A'}
                              </span>
                            </div>
                            {interactionInfo.count > 1 && (
                              <div className="text-xs text-gray-500">
                                {interactionInfo.count} times
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(candidate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-70 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleViewCandidateDetails(candidate)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && candidates.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCandidates)} of {totalCandidates} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {renderPaginationNumbers()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}