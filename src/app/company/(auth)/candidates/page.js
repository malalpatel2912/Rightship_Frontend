"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Select from "react-select";
import {
  Download,
  Eye,
  BookmarkPlus,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const AllCandidatesTable = () => {
  const { data: session, status: authStatus } = useSession();
  const { user: authUser, token: authToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for API data
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  // State for filter options
  const [rankOptions, setRankOptions] = useState([]);
  const [shipOptions, setShipOptions] = useState([]);
  const [cocOptions, setCocOptions] = useState([]);
  const [copOptions, setCopOptions] = useState([]);
  const [watchKeepingOptions, setWatchKeepingOptions] = useState([]);

  // Active filter options
  const activeFilterOptions = useMemo(
    () => [{ label: "Active Candidates", value: "10d" }],
    []
  );

  // Get authentication token from available sources
  const getAuthToken = useCallback(() => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    return localStorage.getItem("token");
  }, [session, authToken]);

  // Unified filter state derived from URL parameters
  const filters = useMemo(() => {
    if (!searchParams) return {};

    return {
      appliedRank: searchParams.get("appliedRank") || "",
      appliedVessel: searchParams.get("appliedVessel") || "",
      coc: searchParams.get("coc") || "",
      cop: searchParams.get("cop") || "",
      watchkeeping: searchParams.get("watchkeeping") || "",
      active_within: searchParams.get("lastActive") || "",
      page: parseInt(searchParams.get("page"), 10) || 1,
    };
  }, [searchParams]);

  // Get filter option objects based on URL parameters
  const selectedFilters = useMemo(
    () => ({
      rankFilter: filters.appliedRank
        ? rankOptions.find((option) => option.value === filters.appliedRank)
        : null,
      shipTypeFilter: filters.appliedVessel
        ? shipOptions.find((option) => option.value === filters.appliedVessel)
        : null,
      cocFilter: filters.coc
        ? cocOptions.find((option) => option.value === filters.coc)
        : null,
      copFilter: filters.cop
        ? copOptions.find((option) => option.value === filters.cop)
        : null,
      watchKeepingFilter: filters.watchkeeping
        ? watchKeepingOptions.find(
            (option) => option.value === filters.watchkeeping
          )
        : null,
      activeFilter: filters.active_within
        ? activeFilterOptions.find(
            (option) => option.value === filters.active_within
          )
        : null,
    }),
    [
      filters,
      rankOptions,
      shipOptions,
      cocOptions,
      copOptions,
      watchKeepingOptions,
      activeFilterOptions,
    ]
  );

  // Configure axios with auth token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [getAuthToken]);

  // Authentication check and redirect if needed
  useEffect(() => {
    if (authStatus === "loading") return;

    const token = getAuthToken();
    if (authStatus === "unauthenticated" && !token) {
      router.push("/login?callbackUrl=/company/candidates");
    }
  }, [authStatus, router, getAuthToken]);

  // Fetch filter options from API
  const fetchFilterOptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/attributes/get`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200) {
        const attributes = response.data.data;

        // Process ship types
        const shipAttribute = attributes.find(
          (attr) => attr.name.toLowerCase() === "ships"
        );
        const shipData = shipAttribute
          ? shipAttribute.values
              .map((value) => ({ label: value, value }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
        setShipOptions([{ label: "All Ship Types", value: "" }, ...shipData]);

        // Process ranks
        const rankAttribute = attributes.find(
          (attr) => attr.name.toLowerCase() === "rank"
        );
        const rankData = rankAttribute
          ? rankAttribute.values
              .map((value) => ({ label: value, value }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
        setRankOptions([{ label: "All Ranks", value: "" }, ...rankData]);

        // Process certificates
        const cocAttribute = attributes.find(
          (attr) => attr.name.toLowerCase() === "coc"
        );
        const cocData = cocAttribute
          ? cocAttribute.values
              .map((value) => ({ label: value, value }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
        setCocOptions([{ label: "All", value: "" }, ...cocData]);

        const copAttribute = attributes.find(
          (attr) => attr.name.toLowerCase() === "cop"
        );
        const copData = copAttribute
          ? copAttribute.values
              .map((value) => ({ label: value, value }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
        setCopOptions([{ label: "All", value: "" }, ...copData]);

        const watchKeepingAttribute = attributes.find(
          (attr) => attr.name.toLowerCase() === "watch keeping"
        );
        const watchKeepingData = watchKeepingAttribute
          ? watchKeepingAttribute.values
              .map((value) => ({ label: value, value }))
              .sort((a, b) => a.label.localeCompare(b.label))
          : [];
        setWatchKeepingOptions([
          { label: "All", value: "" },
          ...watchKeepingData,
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      setError("Failed to load filter options. Please try again later.");
    }
  }, [getAuthToken]);

  // Fetch employee data based on current filters
  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Build request data from filters
      const requestData = {
        page: filters.page,
        limit: 20,
        availability: { $exists: true, $ne: "" },
        appliedRank: { $exists: true, $ne: "" },
      };

      // Add filter parameters if they exist
      if (filters.appliedRank) requestData.appliedRank = filters.appliedRank;
      if (filters.appliedVessel)
        requestData.appliedVessel = filters.appliedVessel;
      if (filters.coc) requestData.coc = filters.coc;
      if (filters.cop) requestData.cop = filters.cop;
      if (filters.watchkeeping) requestData.watchkeeping = filters.watchkeeping;
      if (filters.active_within)
        requestData.active_within = filters.active_within;

      const response = await axios.post(
        `${API_URL}/employees/list`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200) {
        setCandidates(response.data.data || []);
        const totalRecords = response.data.total_documents || 0;
        setTotalPages(Math.ceil(totalRecords / 20) || 1);
      } else {
        setCandidates([]);
        throw new Error(response.data.msg || "Failed to fetch candidates");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error.message);
      setError(error.message || "Error fetching candidates.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [filters, getAuthToken]);

  // Load initial data when component mounts
  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "authenticated" || getAuthToken()) {
      fetchFilterOptions();
    }
  }, [authStatus, fetchFilterOptions, getAuthToken]);

  // Fetch employee data whenever filters change
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!getAuthToken()) return;

    fetchEmployeeData();
  }, [filters, authStatus, fetchEmployeeData, getAuthToken]);

  // Handle filter changes by updating URL
  const updateUrlParams = useCallback(
    (paramName, value) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }

      // Reset to page 1 when filters change
      if (paramName !== "page") {
        params.set("page", "1");
      }

      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Clear all filters
  const handleClearFilter = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  // Handle page changes
  const handlePageChange = useCallback(
    (page) => {
      updateUrlParams("page", page.toString());
    },
    [updateUrlParams]
  );

  // If still loading authentication, show loading state
  if (authStatus === "loading") {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-3">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Clear Filters button */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Candidates</h2>
        <button
          onClick={handleClearFilter}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert className="mb-4 bg-red-50 border border-red-100 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank Filter */}
        <Select
          value={selectedFilters.rankFilter}
          onChange={(option) => updateUrlParams("appliedRank", option?.value)}
          options={rankOptions}
          placeholder="Filter by Rank Applied"
          className="w-full"
          isDisabled={loading}
        />

        {/* Ship Type Filter */}
        <Select
          value={selectedFilters.shipTypeFilter}
          onChange={(option) => updateUrlParams("appliedVessel", option?.value)}
          options={shipOptions}
          placeholder="Filter by Ship Type Applied"
          className="w-full"
          isDisabled={loading}
        />

        {/* COC Filter */}
        <Select
          value={selectedFilters.cocFilter}
          onChange={(option) => updateUrlParams("coc", option?.value)}
          options={cocOptions}
          placeholder="Filter by COC"
          className="w-full"
          isDisabled={loading}
        />

        {/* COP Filter */}
        <Select
          value={selectedFilters.copFilter}
          onChange={(option) => updateUrlParams("cop", option?.value)}
          options={copOptions}
          placeholder="Filter by COP"
          className="w-full"
          isDisabled={loading}
        />

        {/* Watchkeeping Filter */}
        <Select
          value={selectedFilters.watchKeepingFilter}
          onChange={(option) => updateUrlParams("watchkeeping", option?.value)}
          options={watchKeepingOptions}
          placeholder="Filter by Watchkeeping"
          className="w-full"
          isDisabled={loading}
        />

        {/* Active Filter */}
        <Select
          value={selectedFilters.activeFilter}
          onChange={(option) => updateUrlParams("lastActive", option?.value)}
          options={activeFilterOptions}
          placeholder="Filter by Active Candidate"
          className="w-full"
          isDisabled={loading}
        />
      </div>

      {/* Candidates Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank & Certificates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Vessel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-500">
                      Loading candidates...
                    </span>
                  </div>
                </td>
              </tr>
            ) : candidates.length > 0 ? (
              candidates.map((candidate) => (
                <tr
                  key={candidate._id}
                  className={`hover:bg-gray-50 transition-colors ${
                    candidate.is_profile_viewed ? "bg-blue-200/35" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          DOB: {candidate.dob} • {candidate.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {candidate.appliedRank || "Not specified"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {candidate.coc && (
                        <span className="mr-2">COC: {candidate.coc}</span>
                      )}
                      {candidate.cop && (
                        <span className="mr-2">COP: {candidate.cop}</span>
                      )}
                      {candidate.watchkeeping && (
                        <span>Watch: {candidate.watchkeeping}</span>
                      )}
                      {!candidate.coc &&
                        !candidate.cop &&
                        !candidate.watchkeeping &&
                        "No certificates specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {candidate.appliedVessel || "Not specified"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {candidate.vesselExp && candidate.vesselExp.length > 0 ? (
                        candidate.vesselExp.map((exp, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {exp}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-600">
                          No experience data
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {candidate.availability
                      ? candidate.availability.split("T")[0]
                      : "Not specified"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {(() => {
                      const updatedDate = new Date(candidate.updated_date);
                      const joinedDate = new Date(candidate.joined_date);
                      const threeMonthsAgo = new Date();
                      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

                      const isActive =
                        updatedDate > threeMonthsAgo ||
                        joinedDate > threeMonthsAgo;

                      return (
                        <div className="flex items-center justify-center">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              isActive ? "bg-green-500" : "bg-red-400"
                            }`}
                          ></span>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/company/candidates/${candidate._id}`}
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Profile</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              disabled={candidate.is_resume_downloaded > 0}
                              className={`transition-colors ${
                                candidate.is_resume_downloaded > 0
                                  ? "text-green-500 cursor-default"
                                  : "text-gray-400 hover:text-blue-600"
                              }`}
                            >
                              {candidate.is_resume_downloaded > 0 ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Download className="w-5 h-5" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {candidate.is_resume_downloaded
                                ? "Already Downloaded"
                                : "Download Resume"}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              disabled={candidate.is_shortlisted}
                              className={`transition-colors ${
                                candidate.is_shortlisted
                                  ? "text-yellow-500 cursor-default"
                                  : "text-gray-400 hover:text-yellow-500"
                              }`}
                            >
                              <BookmarkPlus className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {candidate.is_shortlisted
                                ? "Shortlisted"
                                : "Add to Shortlist"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <User className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No candidates found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters to find more candidates.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && candidates.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <nav className="flex justify-center items-center mt-8 gap-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
    >
      Previous
    </button>

    <span className="text-sm text-gray-700">
      Page {currentPage} of {totalPages || 1}
    </span>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages || totalPages === 0}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
    >
      Next
    </button>
  </nav>
);

export default AllCandidatesTable;
