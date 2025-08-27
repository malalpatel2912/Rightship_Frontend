'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon, AlertTriangle, Currency, Eye } from 'lucide-react';
import Select from 'react-select';
import { useForm } from 'react-hook-form';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Tiptap from '@/components/common/Tiptap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateJobPage() {
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

  const [shipOptions, setShipOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAutoGenerate, setIsAutoGenerate] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    const companyId = getCompanyId();

    console.log('Auth check:', {
      authStatus,
      hasToken: !!token,
      hasCompanyId: !!companyId
    });

    if (authStatus === 'unauthenticated' && !token) {
      console.log('Redirecting to login due to missing authentication');
      router.push('/login?callbackUrl=/company/job/create');
    }
  }, [authStatus, router]);

  const form = useForm({
    defaultValues: {
      ships: [],
      ranks: [],
      jobDescription: '',
      startDate: new Date(),
      endDate: new Date(),
      wages: '',
      wagesType: 'month',
      currency: '₹',
      status: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      slug: '',
      uniqueCode: ''
    }
  });

  const generateSEOData = (formData) => {
    if (!formData.ships?.length || !formData.ranks?.length) {
      return {
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        slug: '',
        uniqueCode: ''
      };
    }

    const ships = formData.ships.map(s => s.value.trim());
    const ranks = formData.ranks.map(r => r.value.trim());

    const slugShips = ships.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const slugRanks = ranks.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const titleShips = ships.join(', ');
    const titleRanks = ranks.join(', ');

    const timestamp = Date.now();
    const jobLocation = 'India';

    const baseDescription = `Latest ${titleShips} job openings for ${titleRanks} positions in ${jobLocation}. ` +
      `Apply now for maritime careers on ${ships.length > 1 ? 'vessels including' : 'vessel type'} ${titleShips}.`;

    const keywords = [
      ...ships.map(ship => `${ship} jobs in ${jobLocation}`),
      ...ranks.map(rank => `${rank} jobs in ${jobLocation}`),
      ...ships.map(ship => `${ship} ${ranks[0]} vacancy`),
      ...ranks.map(rank => `Maritime ${rank} positions`),
      'Shipping jobs',
      'Maritime careers',
      `Seafarer jobs in ${jobLocation}`,
    ].join(', ');

    return {
      slug: `${timestamp}-${slugShips}-jobs-for-${slugRanks}-in-india`,
      uniqueCode: `JOB-${timestamp}`,
      seoTitle: `${titleShips} Jobs for ${titleRanks} in ${jobLocation} | Maritime Careers`,
      seoDescription: baseDescription.slice(0, 160),
      seoKeywords: keywords
    };
  };

  const handleAutoGenerate = () => {
    // Enable auto-generation mode
    setIsAutoGenerate(true);

    // Get current form data
    const formData = form.getValues();

    // Check if we have necessary data to generate SEO
    if (!formData.ships?.length || !formData.ranks?.length) {
      console.log('Please select ships and ranks first');
      return;
    }

    // Generate new SEO data
    const seoData = generateSEOData(formData);

    // For each SEO field, only update if it's empty or if auto-generate is enabled
    Object.entries(seoData).forEach(([key, value]) => {
      // Get the current value and trim it
      const currentValue = form.getValues(key)?.trim() || '';

      // Check if field is empty or has default content
      const isEmpty = !currentValue;

      // Update field if it's empty or if auto-generate is enabled
      if (isEmpty || isAutoGenerate) {
        form.setValue(key, value);
      }
    });
  };

  // Watch for changes in ships and ranks
  const watchedShips = form.watch('ships');
  const watchedRanks = form.watch('ranks');

  // Auto-generate SEO when ships or ranks change
  useEffect(() => {
    if (isAutoGenerate) {
      const formData = form.getValues();
      const seoData = generateSEOData(formData);
      Object.entries(seoData).forEach(([key, value]) => {
        // Only update if the field is empty or if auto-generate is enabled
        const currentValue = form.getValues(key)?.trim() || '';
        if (!currentValue || isAutoGenerate) {
          form.setValue(key, value);
        }
      });
    }
  }, [watchedShips, watchedRanks, isAutoGenerate]);

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!getAuthToken()) {
        console.log('No token available, skipping attributes fetch');
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        console.log('Fetching attributes with token:', token ? 'Available' : 'Not available');

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attributes/get`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Attributes response:', response.data);

        if (response.data?.code === 200) {
          const attributes = response.data.data;
          const shipAttribute = attributes.find(attr => attr.name.toLowerCase() === 'ships');
          const rankAttribute = attributes.find(attr => attr.name.toLowerCase() === 'rank');

          const shipData = shipAttribute ? shipAttribute.values
            .filter(value => value && value.trim() !== '')
            .map(value => ({
              value: value,
              label: value
            }))
            .sort((a, b) => a.label.localeCompare(b.label)) : [];

          const rankData = rankAttribute ? rankAttribute.values
            .filter(value => value && value.trim() !== '')
            .map(value => ({
              value: value,
              label: value
            }))
            .sort((a, b) => a.label.localeCompare(b.label)) : [];

          setShipOptions(shipData);
          setRankOptions(rankData);
        } else {
          throw new Error(response.data?.msg || 'Failed to fetch attributes');
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
        setError('Failed to load attributes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [authStatus]);

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
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'hsl(var(--accent))',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'hsl(var(--accent-foreground))',
    }),
  };

  const onSubmit = async (data) => {

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      console.log('Submitting job with token:', token ? 'Available' : 'Not available');

      const jobData = {
        ...data,
        ships: data.ships.map(s => s.value),
        ranks: data.ranks.map(r => r.value),
        status: data.status ? 'active' : 'inactive',
        created_date: new Date().toISOString(),
      };

      console.log('Submitting job data:', jobData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/create`,
        jobData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Job creation response:', response.data);

      if (response.data.code === 200) {
        setSuccess('Job created successfully!');
        form.reset();
        // Optional: redirect to jobs listing page
        setTimeout(() => {
          router.push('/company/job');
        }, 2000);
      } else {
        throw new Error(response.data.msg || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError(error.message || 'Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If still loading authentication, show loading state
  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3">Loading attributes...</p>
      </div>
    );
  }

  // Function to format date as readable string
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  // Format wages with currency and type
  const formatWages = (wages, currency, wagesType) => {
    if (!wages) return 'Competitive';
    return `${currency}${wages} per ${wagesType}`;
  };

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 border border-green-100 text-green-700">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-50 border border-red-100 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Information and SEO Edit */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ships Selection */}
                  <FormField
                    control={form.control}
                    name="ships"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">Ships</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            isMulti
                            options={shipOptions}
                            styles={customStyles}
                            className="text-gray-900"
                            placeholder="Select ships..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ranks Selection */}
                  <FormField
                    control={form.control}
                    name="ranks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">Ranks</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            isMulti
                            options={rankOptions}
                            styles={customStyles}
                            className="text-gray-900"
                            placeholder="Select ranks..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Job Description */}

                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-gray-900 dark:text-white text-base">Job Description</FormLabel>
                        <div className="mt-1">
                          <FormControl>
                            <Tiptap
                              value={field.value}
                              onChange={(html) => {
                                // Only update form value on meaningful content changes
                                if (html !== '<p></p>') {
                                  field.onChange(html);
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs mt-2">
                          Use the toolbar to format your job description with headings, lists, and formatting
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dates and Wages Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-900 dark:text-white">Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal text-gray-900 dark:text-white",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-900 dark:text-white">End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal text-gray-900 dark:text-white",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Wages */}
                    <FormField
                      control={form.control}
                      name="wages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">Wages</FormLabel>
                          <FormControl>
                            <Input type="number" className="text-gray-900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/*  Currency Type */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">Currency</FormLabel>
                          <Select
                            options={[
                              { value: '₹', label: 'INR (₹)' },
                              { value: '$', label: 'USD ($)' }
                            ]}
                            value={{ value: field.value, label: field.value === '₹' ? 'INR (₹)' : 'USD ($)' }}
                            onChange={(option) => field.onChange(option.value)}
                            styles={customStyles}
                            className="text-gray-900"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Wages Type */}
                    <FormField
                      control={form.control}
                      name="wagesType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">Wages Type</FormLabel>
                          <Select
                            options={[
                              { value: 'day', label: 'Day' },
                              { value: 'month', label: 'Month' }
                            ]}
                            value={{ value: field.value, label: field.value === 'day' ? 'Day' : 'Month' }}
                            onChange={(option) => field.onChange(option.value)}
                            styles={customStyles}
                            className="text-gray-900"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Edit Card */}
              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO Settings
                  </CardTitle>
                  <Button
                    onClick={handleAutoGenerate}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Auto Generate SEO
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SEO Title */}
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">SEO Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              setIsAutoGenerate(false);
                              field.onChange(e);
                            }}
                            className="text-gray-900"
                            placeholder="Enter SEO title"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {field.value.length}/60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SEO Description */}
                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">SEO Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            onChange={(e) => {
                              setIsAutoGenerate(false);
                              field.onChange(e);
                            }}
                            className="text-gray-900"
                            placeholder="Enter SEO description"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {field.value.length}/160 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SEO Keywords */}
                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">SEO Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            onChange={(e) => {
                              setIsAutoGenerate(false);
                              field.onChange(e);
                            }}
                            className="text-gray-900"
                            placeholder="Enter comma-separated keywords"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* URL Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900 dark:text-white">URL Slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              setIsAutoGenerate(false);
                              field.onChange(e);
                            }}
                            className="text-gray-900"
                            placeholder="Enter URL slug"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Settings and Preview */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-gray-900 dark:text-white">Status</FormLabel>
                          <FormDescription>
                            Activate or deactivate this job posting
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

             
              {/* Submit Button */}
              <div className="flex flex-col space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-lg p-6 flex items-center justify-center gap-2"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="w-5 h-5" />
                  Preview Job
                </Button>
                
                <Button
                  type="submit"
                  className="w-full text-lg p-8 bg-[hsl(201.9,87%,24.1%)] hover:bg-[hsl(201.9,87%,20%)]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Job...
                    </div>
                  ) : 'Finished'}
                </Button>
              </div>

               {/* SEO Preview Card */}
               <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">SEO Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-blue-600 text-xl hover:underline cursor-pointer">
                        {form.watch('seoTitle') || 'Job Title Will Appear Here'}
                      </h3>
                      <p className="text-green-700 text-sm">
                        {`rightships.com/${form.watch('slug') || 'url-slug'}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {form.watch('seoDescription') || 'Job description preview will appear here...'}
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Keywords:</h4>
                      <p className="text-sm text-gray-500">
                        {form.watch('seoKeywords') || 'Keywords will appear here...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </form>
      </Form>

      {/* Job Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-[hsl(201.9,87%,24.1%)] p-6 text-white">
            <DialogTitle className="text-2xl font-bold mb-2">
              {form.watch('seoTitle') || 'Job Title Will Appear Here'}
            </DialogTitle>
            <DialogDescription className="text-white/80 opacity-90">
              Job ID: {form.watch('uniqueCode') || 'JOB-XXXXX'}
            </DialogDescription>
          </div>

          <div className="p-6 space-y-8">
            {/* Company Logo and Key Details Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center w-24 h-24 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-400">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.29 7 12 12 20.71 7"></polyline>
                  <line x1="12" y1="22" x2="12" y2="12"></line>
                </svg>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Key Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2 items-start">
                    <div className="bg-blue-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ships</p>
                      <p className="text-gray-900 font-medium">
                        {form.watch('ships')?.map(s => s.value).join(', ') || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <div className="bg-green-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ranks</p>
                      <p className="text-gray-900 font-medium">
                        {form.watch('ranks')?.map(r => r.value).join(', ') || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <div className="bg-amber-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Salary</p>
                      <p className="text-gray-900 font-medium">
                        {formatWages(form.watch('wages'), form.watch('currency'), form.watch('wagesType'))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <div className="bg-purple-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-gray-900 font-medium">
                        {formatDate(form.watch('startDate'))} - {formatDate(form.watch('endDate'))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-start">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${form.watch('status') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {form.watch('status') ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            {/* Job Description */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-800">Job Description</h2>
              </div>
              <div 
                className="prose max-w-none p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: form.watch('jobDescription') || '<p>No job description provided.</p>' }}
              />
            </div>

            {/* Apply Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                How to Apply
              </h3>
              <p className="text-sm text-blue-600">
                Candidates can apply for this position through our website.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Edit Job
              </Button>
              <Button 
                onClick={() => {
                  setPreviewOpen(false);
                  form.handleSubmit(onSubmit)();
                }}
                className="bg-[hsl(201.9,87%,24.1%)] hover:bg-[hsl(201.9,87%,20%)] text-white"
              >
                Submit Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}