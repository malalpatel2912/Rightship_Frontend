'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Select from 'react-select';
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import {
  MoreVertical,
  Edit,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  AlertTriangle
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function JobListTable() {
  const searchParams = useSearchParams();
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

  const USERCOMPANYID = getCompanyId();
  console.log(`USERCOMPANYID ${USERCOMPANYID}`);

  // Initialize state from URL parameters
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [filters, setFilters] = useState({
    ships: searchParams.get('ships') ? searchParams.get('ships').split(',').map(s => ({ value: s, label: s })) : [],
    ranks: searchParams.get('ranks') ? searchParams.get('ranks').split(',').map(r => ({ value: r, label: r })) : [],
    status: searchParams.get('status') ? { value: searchParams.get('status'), label: searchParams.get('status') } : null
  });
  const [shipOptions, setShipOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 10;

  // Check authentication status
  useEffect(() => {
    if (authStatus === 'loading') return;

    const token = getAuthToken();
    const companyId = getCompanyId();

    console.log('Auth check:', {
      authStatus,
      hasToken: !!token,
      hasCompanyId: !!companyId
    });

    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/job');
    }
  }, [authStatus, router]);

  // Update URL with current filters and search using router.push
  const updateURLParams = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filters.ships.length) params.set('ships', filters.ships.map(s => s.value).join(','));
    if (filters.ranks.length) params.set('ranks', filters.ranks.map(r => r.value).join(','));
    if (filters.status) params.set('status', filters.status.value);

    // Use router.push to update URL while preserving history
    const url = `/company/job${params.toString() ? `?${params.toString()}` : ''}`;

    // Use replace instead of push to avoid creating new history entries for filter changes
    router.replace(url, { scroll: false });
  };

  // Update URL when filters, pagination, or search change
  useEffect(() => {
    updateURLParams();
  }, [searchTerm, currentPage, filters]);

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

  // Fetch jobs with filters and pagination
  useEffect(() => {
    const fetchJobs = async () => {
      if (!USERCOMPANYID) {
        console.error('No company ID available, cannot fetch jobs');
        setError('Company ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const token = getAuthToken();
        console.log('Fetching jobs with token:', token ? 'Available' : 'Not available');

        const query = {
          company_id: USERCOMPANYID,
          page: currentPage,
          limit: PAGE_SIZE
        };

        if (searchTerm) {
          query.uniqueCode = searchTerm;
        }

        if (filters.ships.length > 0) {
          query.ships = filters.ships.map(s => s.value);
        }

        if (filters.ranks.length > 0) {
          query.ranks = filters.ranks.map(r => r.value);
        }

        if (filters.status) {
          query.status = filters.status.value;
        }

        console.log('Fetching jobs with query:', query);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/get`, query, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Job fetch response:', response.data);

        if (response.data?.code === 200) {
          setJobs(response.data.applications || []);
          setTotalJobs(response.data.total_documents || 0);
          setTotalPages(Math.ceil((response.data.total_documents || 0) / PAGE_SIZE));
        } else {
          throw new Error(response.data?.msg || 'Failed to fetch jobs');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have authentication
    if ((authStatus === 'authenticated' || getAuthToken()) && USERCOMPANYID) {
      fetchJobs();
    }
  }, [currentPage, searchTerm, filters, USERCOMPANYID, authStatus]);

  // Fetch attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attributes/get`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.code === 200) {
          const attributes = response.data.data;

          // Prepare options and initialize status filter from URL
          const shipOpts = formatAttributeOptions(attributes, 'ships');
          const rankOpts = formatAttributeOptions(attributes, 'rank');

          setShipOptions(shipOpts);
          setRankOptions(rankOpts);

          // Update status label if status filter is set
          if (filters.status) {
            const statusValue = filters.status.value;
            const statusLabel = statusOptions.find(option => option.value === statusValue)?.label || statusValue;
            setFilters(prev => ({
              ...prev,
              status: { value: statusValue, label: statusLabel }
            }));
          }
        } else {
          console.warn('Unexpected attributes response:', response.data);
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    // Only fetch if we have authentication
    if ((authStatus === 'authenticated' || getAuthToken()) && USERCOMPANYID) {
      fetchAttributes();
    }
  }, [authStatus, USERCOMPANYID]);

  const formatAttributeOptions = (attributes, type) => {
    const attribute = attributes.find(attr => attr.name.toLowerCase() === type);
    return attribute ? attribute.values
      .filter(value => value && value.trim() !== '')
      .map(value => ({
        value: value,
        label: value
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) : [];
  };

  const handleDelete = async (jobId) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/delete`, {
        application_id: jobId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.code === 200) {
        // Remove the job from selected jobs if it was selected
        setSelectedJobs(prev => prev.filter(id => id !== jobId));

        // If this was the last item on the current page, go to previous page
        if (jobs.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          // Refresh the current page
          const updatedJobs = jobs.filter(job => job.application_id !== jobId);
          setJobs(updatedJobs);
          setTotalJobs(prev => prev - 1);

          // Update total pages
          const newTotalPages = Math.ceil((totalJobs - 1) / PAGE_SIZE);
          setTotalPages(newTotalPages);

          // If current page is now greater than total pages, adjust it
          if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, newTotalPages));
          }
        }
      } else {
        throw new Error(response.data?.msg || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = getAuthToken();
      await Promise.all(
        selectedJobs.map(jobId =>
          axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/delete`, {
            application_id: jobId
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      // Calculate new total count and pages
      const newTotalJobs = totalJobs - selectedJobs.length;
      const newTotalPages = Math.ceil(newTotalJobs / PAGE_SIZE);

      setTotalJobs(newTotalJobs);
      setTotalPages(newTotalPages);
      setSelectedJobs([]);

      // If all items on current page were deleted and it's not the first page,
      // go to previous page if current page now exceeds total pages
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      } else {
        // Stay on current page but refresh the data
        const updatedJobs = jobs.filter(job => !selectedJobs.includes(job.application_id));
        setJobs(updatedJobs);
      }
    } catch (error) {
      console.error('Error deleting jobs:', error);
      setError('Failed to delete selected jobs. Please try again.');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.application_id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId, checked) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const resetFilters = () => {
    setFilters({
      ships: [],
      ranks: [],
      status: null
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Page is updated in useEffect -> updateURLParams
  };

  const customStyles = {
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
          key={i}
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

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // If still loading authentication, show loading state
  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Job Listings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your job postings and track their performance
              </p>
            </div>
            <div className="flex gap-2">
              {/* <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button> */}
              <Button
                onClick={() => router.push('/company/job/create')}
                className="bg-[hsl(201.9,87%,24.1%)] hover:bg-[hsl(201.9,87%,20%)]"
              >
                Create New Job
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

          {/* Search and Filters */}
          {/* <div className={`space-y-4 mb-6 ${showFilters ? '' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search by job code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-3 pr-8"
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => handleSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select
                isMulti
                options={shipOptions}
                value={filters.ships}
                onChange={(selected) => {
                  setFilters(prev => ({ ...prev, ships: selected || [] }));
                  setCurrentPage(1);
                }}
                placeholder="Filter by ships"
                styles={customStyles}
              />
              <Select
                isMulti
                options={rankOptions}
                value={filters.ranks}
                onChange={(selected) => {
                  setFilters(prev => ({ ...prev, ranks: selected || [] }));
                  setCurrentPage(1);
                }}
                placeholder="Filter by ranks"
                styles={customStyles}
              />
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(selected) => {
                  setFilters(prev => ({ ...prev, status: selected }));
                  setCurrentPage(1);
                }}
                placeholder="Filter by status"
                styles={customStyles}
                isClearable
              />
              <Button
                variant="outline"
                onClick={resetFilters}
                className="whitespace-nowrap"
              >
                Reset Filters
              </Button>
            </div>
          </div> */}

          {/* Active Filters */}
          {(searchTerm || filters.ships.length > 0 || filters.ranks.length > 0 || filters.status) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleSearch('')}
                  />
                </Badge>
              )}
              {filters.ships.map(ship => (
                <Badge key={ship.value} variant="secondary" className="flex items-center gap-2">
                  Ship: {ship.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        ships: prev.ships.filter(s => s.value !== ship.value)
                      }));
                      setCurrentPage(1);
                    }}
                  />
                </Badge>
              ))}
              {filters.ranks.map(rank => (
                <Badge key={rank.value} variant="secondary" className="flex items-center gap-2">
                  Rank: {rank.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        ranks: prev.ranks.filter(r => r.value !== rank.value)
                      }));
                      setCurrentPage(1);
                    }}
                  />
                </Badge>
              ))}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {filters.status.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, status: null }));
                      setCurrentPage(1);
                    }}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bulk Actions</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{selectedJobs.length} jobs selected</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Selected ({selectedJobs.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        selected {selectedJobs.length} jobs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Jobs
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJobs.length === jobs.length && jobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Job Code</TableHead>
                  <TableHead>Ships</TableHead>
                  <TableHead>Ranks</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="mb-2">No jobs found</div>
                        {(searchTerm || filters.ships.length > 0 || filters.ranks.length > 0 || filters.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.application_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.includes(job.application_id)}
                          onCheckedChange={(checked) => handleSelectJob(job.application_id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.uniqueCode}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {job.ships?.map(ship => (
                            <Badge key={ship} variant="outline" className="text-xs">
                              {ship}
                            </Badge>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {job.ranks?.map(rank => (
                            <Badge key={rank} variant="outline" className="text-xs">
                              {rank}
                            </Badge>
                          )) || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.created_date ? format(new Date(job.created_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>{job.viewed_count || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={job.status === 'active' ? 'success' : 'secondary'}
                          className={
                            job.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800" // 🔴 Change inactive bg to red
                          }
                        >
                          {job.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/company/job/${job.application_id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/company/job/${job.application_id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(job.application_id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && jobs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalJobs)} of {totalJobs} entries
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