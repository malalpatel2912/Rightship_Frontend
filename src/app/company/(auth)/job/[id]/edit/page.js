"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import Tiptap from "@/components/common/Tiptap";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  // Get session from NextAuth
  const { data: session, status: authStatus } = useSession();
  // Get additional auth info from our custom context
  const { user, token: authToken, isAuthenticated } = useAuth();

  // For debugging
  console.log("NextAuth Session:", session);
  console.log("Custom Auth Context:", { user, authToken, isAuthenticated });

  const [shipOptions, setShipOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);

  const form = useForm({
    defaultValues: {
      ships: [],
      ranks: [],
      jobDescription: "",
      startDate: new Date(),
      endDate: new Date(),
      wages: "",
      wagesType: "month",
      currency: "₹",
      status: true,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      slug: "",
      uniqueCode: "",
    },
  });

  // Get auth token from various sources
  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    // Fallback to localStorage for compatibility
    return localStorage.getItem("token");
  };

  // Extract company_id from various sources
  const getCompanyId = () => {
    // Try NextAuth session first
    if (session?.user?.companyId) return session.user.companyId;

    // Try custom auth context next
    if (user?.company_id) return user.company_id;

    // Finally try localStorage
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.company_id;
      }
    } catch (e) {
      console.error("Error parsing userData from localStorage:", e);
    }

    return null;
  };

  // Configure axios with auth token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Set axios default auth header");
    } else {
      console.warn("No auth token available for axios");
    }
  }, [session, authToken]);

  // Check authentication status
  useEffect(() => {
    if (authStatus === "loading") return;

    const token = getAuthToken();

    console.log("Auth check:", {
      authStatus,
      hasToken: !!token,
    });

    if (authStatus === "unauthenticated" && !token) {
      console.log("Redirecting to login due to missing authentication");
      router.push(`/login?callbackUrl=/company/job/${jobId}/edit`);
    }
  }, [authStatus, router, jobId]);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (authStatus === "loading") return;
      if (!getAuthToken()) return;

      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();
        console.log(
          "Fetching job details with token:",
          token ? "Available" : "Not available"
        );

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/get`,
          {
            application_id: [jobId],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Job details response:", response.data);

        if (
          response.data?.code === 200 &&
          response.data.applications?.length > 0
        ) {
          const jobData = response.data.applications[0];

          // Transform the data for the form
          const formattedData = {
            ...jobData,
            ships: Array.isArray(jobData.ships)
              ? jobData.ships.map((ship) => ({ value: ship, label: ship }))
              : [],
            ranks: Array.isArray(jobData.ranks)
              ? jobData.ranks.map((rank) => ({ value: rank, label: rank }))
              : [],
            startDate: jobData.startDate
              ? new Date(jobData.startDate)
              : new Date(),
            endDate: jobData.endDate ? new Date(jobData.endDate) : new Date(),
            status: jobData.status === "active",
          };

          // Set form values
          Object.entries(formattedData).forEach(([key, value]) => {
            // Skip undefined values
            if (value !== undefined) {
              form.setValue(key, value);
            }
          });
        } else {
          setError("Job not found or you do not have permission to edit it");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(error.response?.data?.msg || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId && (authStatus === "authenticated" || getAuthToken())) {
      fetchJobDetails();
    }
  }, [jobId, form, authStatus]);

  // Fetch attributes (ships and ranks)
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!getAuthToken()) return;

      try {
        const token = getAuthToken();
        console.log(
          "Fetching attributes with token:",
          token ? "Available" : "Not available"
        );

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/attributes/get`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Attributes response:", response.data);

        if (response.data?.code === 200) {
          const attributes = response.data.data;
          const shipAttribute = attributes.find(
            (attr) => attr.name.toLowerCase() === "ships"
          );
          const rankAttribute = attributes.find(
            (attr) => attr.name.toLowerCase() === "rank"
          );

          const shipData = shipAttribute
            ? shipAttribute.values
                .filter((value) => value && value.trim() !== "")
                .map((value) => ({
                  value: value,
                  label: value,
                }))
                .sort((a, b) => a.label.localeCompare(b.label))
            : [];

          const rankData = rankAttribute
            ? rankAttribute.values
                .filter((value) => value && value.trim() !== "")
                .map((value) => ({
                  value: value,
                  label: value,
                }))
                .sort((a, b) => a.label.localeCompare(b.label))
            : [];

          setShipOptions(shipData);
          setRankOptions(rankData);
        } else {
          throw new Error(response.data?.msg || "Failed to fetch attributes");
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setError("Failed to load attributes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [authStatus]);

  const generateSEOData = (formData) => {
    if (!formData.ships?.length || !formData.ranks?.length) {
      return {
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        slug: "",
        uniqueCode: "",
      };
    }

    const ships = formData.ships.map((s) => s.value.trim());
    const ranks = formData.ranks.map((r) => r.value.trim());

    const slugShips = ships
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const slugRanks = ranks
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    const titleShips = ships.join(", ");
    const titleRanks = ranks.join(", ");

    const timestamp = Date.now();
    const jobLocation = "India";

    const baseDescription =
      `Latest ${titleShips} job openings for ${titleRanks} positions in ${jobLocation}. ` +
      `Apply now for maritime careers on ${
        ships.length > 1 ? "vessels including" : "vessel type"
      } ${titleShips}.`;

    const keywords = [
      ...ships.map((ship) => `${ship} jobs in ${jobLocation}`),
      ...ranks.map((rank) => `${rank} jobs in ${jobLocation}`),
      ...ships.map((ship) => `${ship} ${ranks[0]} vacancy`),
      ...ranks.map((rank) => `Maritime ${rank} positions`),
      "Shipping jobs",
      "Maritime careers",
      `Seafarer jobs in ${jobLocation}`,
    ].join(", ");

    return {
      slug: `${timestamp}-${slugShips}-jobs-for-${slugRanks}-in-india`,
      uniqueCode: `JOB-${timestamp}`,
      seoTitle: `${titleShips} Jobs for ${titleRanks} in ${jobLocation} | Maritime Careers`,
      seoDescription: baseDescription.slice(0, 160),
      seoKeywords: keywords,
    };
  };

  const handleAutoGenerate = () => {
    setIsAutoGenerate(true);
    const formData = form.getValues();

    if (!formData.ships?.length || !formData.ranks?.length) {
      setError("Please select ships and ranks first to generate SEO data");
      return;
    }

    const seoData = generateSEOData(formData);

    Object.entries(seoData).forEach(([key, value]) => {
      form.setValue(key, value);
    });

    setSuccess("SEO data generated successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const onSubmit = async (data) => {
    if (!getAuthToken()) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Extract only the fields we want to update
      const {
        ships,
        ranks,
        jobDescription,
        startDate,
        endDate,
        wages,
        wagesType,
        status,
        seoTitle,
        seoDescription,
        seoKeywords,
        currency,
        slug,
        uniqueCode,
      } = data;

      const token = getAuthToken();
      console.log(
        "Updating job with token:",
        token ? "Available" : "Not available"
      );

      // Format the data for update
      const jobData = {
        application_id: jobId,
        ships: ships.map((s) => s.value),
        ranks: ranks.map((r) => r.value),
        jobDescription,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        wages,
        wagesType,
        status: status ? "active" : "inactive",
        seoTitle,
        seoDescription,
        seoKeywords,
        slug,
        currency,
        uniqueCode,
        updated_date: new Date().toISOString(),
      };

      console.log("Submitting job update:", jobData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/edit`,
        jobData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Job update response:", response.data);

      if (response.data.code === 200) {
        setSuccess("Job updated successfully!");
        setTimeout(() => {
          router.push("/company/job");
        }, 2000);
      } else {
        throw new Error(response.data.msg || "Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.message || "Failed to update job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      backgroundColor: "white",
      borderColor: "hsl(var(--input))",
      "&:hover": {
        borderColor: "hsl(var(--input))",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(201.9, 87%, 24.1%)"
        : base.backgroundColor,
      color: state.isSelected ? "white" : "hsl(var(--foreground))",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "hsl(201.9, 87%, 24.1%)"
          : "hsl(var(--accent))",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "hsl(var(--accent))",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "hsl(var(--accent-foreground))",
    }),
  };

  // If still loading authentication, show loading state
  if (authStatus === "loading") {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3">Authenticating...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3">Loading job data...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>

      {success && (
        <Alert className="mb-6 bg-green-50 border border-green-100 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-red-50 border border-red-100 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          Ships
                        </FormLabel>
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          Ranks
                        </FormLabel>
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
                        <FormLabel className="text-gray-900 dark:text-white text-base">
                          Job Description
                        </FormLabel>
                        <div className="mt-1">
                          <FormControl>
                            <Tiptap
                              value={field.value}
                              onChange={(html) => {
                                // Only update form value on meaningful content changes
                                if (html !== "<p></p>") {
                                  field.onChange(html);
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs mt-2">
                          Use the toolbar to format your job description with
                          headings, lists, and formatting
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
                          <FormLabel className="text-gray-900 dark:text-white">
                            Start Date
                          </FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                          <FormLabel className="text-gray-900 dark:text-white">
                            End Date
                          </FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                          <FormLabel className="text-gray-900 dark:text-white">
                            Wages
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="text-gray-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                   
                    {/* Currency Type */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 dark:text-white">
                            Currency
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={[
                                { value: "₹", label: "INR (₹)" },
                                { value: "$", label: "USD ($)" },
                              ]}
                              value={
                                field.value
                                  ? { value: field.value, label: field.value === "₹" ? "INR (₹)" : "USD ($)" }
                                  : null
                              }
                              onChange={(option) => {
                                console.log("Currency changed to:", option.value);
                                field.onChange(option.value);
                              }}
                              styles={customStyles}
                              className="text-gray-900"
                            />
                          </FormControl>
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
                          <FormLabel className="text-gray-900 dark:text-white">
                            Wages Type
                          </FormLabel>
                          <Select
                            options={[
                              { value: "day", label: "Day" },
                              { value: "month", label: "Month" },
                            ]}
                            value={{
                              value: field.value,
                              label: field.value === "day" ? "Day" : "Month",
                            }}
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
                    type="button"
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          SEO Title
                        </FormLabel>
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
                          {field.value?.length || 0}/60 characters
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          SEO Description
                        </FormLabel>
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
                          {field.value?.length || 0}/160 characters
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          SEO Keywords
                        </FormLabel>
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
                        <FormLabel className="text-gray-900 dark:text-white">
                          URL Slug
                        </FormLabel>
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
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-gray-900 dark:text-white">
                            Status
                          </FormLabel>
                          <FormDescription>
                            Activate or deactivate this job posting
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={`transition-colors duration-300 ${
                              field.value ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO Preview Card */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-blue-600 text-xl hover:underline cursor-pointer">
                        {form.watch("seoTitle") || "Job Title Will Appear Here"}
                      </h3>
                      <p className="text-green-700 text-sm">
                        {`rightships.com/${form.watch("slug") || "url-slug"}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {form.watch("seoDescription") ||
                          "Job description preview will appear here..."}
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Keywords:</h4>
                      <p className="text-sm text-gray-500">
                        {form.watch("seoKeywords") ||
                          "Keywords will appear here..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-lg p-8 bg-[hsl(201.9,87%,24.1%)] hover:bg-[hsl(201.9,87%,20%)]"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating Job...
                  </div>
                ) : (
                  "Update Job"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/company/job")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
