'use client'

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Download, User, Calendar, Ship, Clock, ExternalLink, CheckCircle } from 'lucide-react';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [remainingDownloads, setRemainingDownloads] = useState(0);

  // Temporary user object - replace with your auth solution
  const user = {
    company_id: "66d554947e3ff67af3cbfdc4",
    _id: "user_id_here",
    name: "User Name"
  };

  const fetchEmployeeDetails = useCallback(async (employeeIds, page = 1, limit = 10) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/get`, {
        employee_id: { '$in': employeeIds },
        page,
        limit
      });

      if (response.data.code === 200) {
        setCandidates(response.data.data);
        const totalRecords = response.data.total_documents || 0;
        setTotalPages(Math.ceil(totalRecords / limit) || 1);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/get`,
        { company_id: user.company_id }
      );

      if (response.data.code === 200) {
        return response.data.applications.flatMap(item =>
          (item.applied_by || []).map(applied => applied.employee_id)
        ).filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }, [user.company_id]);

  const fetchDownloadStatus = useCallback(async (candidateIds) => {
    if (!candidateIds.length) return;
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/resume/check-status`, {
        company_id: user.company_id,
        resume_ids: candidateIds
      });

      if (response.data.code === 200) {
        setDownloadStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching download status:', error);
    }
  }, [user.company_id]);

  const handleDownload = async (candidate) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/resume/download`, {
        resume_id: candidate._id,
        team_member_id: user._id,
        company_id: user.company_id,
        employee_id: candidate._id
      });

      if (response.data.code === 200) {
        setDownloadStatus(prev => ({
          ...prev,
          [candidate._id]: {
            downloaded: true,
            downloaded_by: user.name,
            downloaded_at: new Date().toISOString()
          }
        }));
        setRemainingDownloads(response.data.remaining_downloads);

        // Handle actual resume download here
        if (candidate.resume) {
          window.open(candidate.resume, '_blank');
        }
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const employeeIds = await fetchPosts();
        if (employeeIds.length) {
          await Promise.all([
            fetchEmployeeDetails(employeeIds, currentPage),
            fetchDownloadStatus(employeeIds)
          ]);
        } else {
          setCandidates([]);
          setTotalPages(1);
        }
      } catch (err) {
        setError('Failed to load candidates.');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentPage, fetchPosts, fetchEmployeeDetails, fetchDownloadStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Remaining downloads today: {remainingDownloads}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <article 
              key={candidate._id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </h2>
                    <p className="text-sm font-medium text-blue-600">{candidate.appliedRank}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {downloadStatus[candidate._id]?.downloaded ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Downloaded
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDownload(candidate)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        title="Download Resume"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    
                    <Link
                      href={`/candidates/${candidate._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                      title="View Profile"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <InfoRow icon={<Calendar />} label="DOB" value={candidate.dob} />
                  <InfoRow icon={<Ship />} label="Current Vessel" value={candidate.appliedVessel} />
                  <InfoRow icon={<Clock />} label="Available From" value={candidate.availability?.split('T')[0]} />
                </div>

                {downloadStatus[candidate._id]?.downloaded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <p>Downloaded by: {downloadStatus[candidate._id].downloaded_by}</p>
                    <p>At: {new Date(downloadStatus[candidate._id].downloaded_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
            <p className="mt-2 text-sm text-gray-500">
              No candidates have applied for this position yet.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </main>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center text-sm">
    <span className="text-gray-400 w-5 h-5">{icon}</span>
    <span className="text-gray-700 font-medium ml-2">{label}:</span>
    <span className="text-gray-600 ml-2">{value || 'N/A'}</span>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <nav className="flex justify-center items-center mt-8 gap-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
    >
      Previous
    </button>
    
    <span className="text-sm text-gray-700">
      Page {currentPage} of {totalPages}
    </span>
    
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
    >
      Next
    </button>
  </nav>
);

export default CandidatesPage;