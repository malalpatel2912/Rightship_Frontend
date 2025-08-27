import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuthUtils } from './useAuthUtils';

export const useProfileData = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthToken, getUserId } = useAuthUtils();

  const fetchProfileData = async () => {
    const userId = getUserId();
    if (!userId) {
      setError('Unable to determine user ID. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await axios.post(API_ENDPOINTS.EMPLOYEE.GET, {
        employee_id: userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.code === 200 && response.data.data?.length > 0) {
        setProfileData(response.data.data[0]);
      } else {
        setError('Profile not found or you do not have permission to view this profile');
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const token = getAuthToken();
      const userId = getUserId();

      const response = await axios.post(API_ENDPOINTS.EMPLOYEE.UPDATE, {
        employee_id: userId,
        ...updateData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.code === 200) {
        setProfileData(prev => ({
          ...prev,
          ...updateData
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    if (getAuthToken()) {
      fetchProfileData();
    }
  }, []);

  return {
    profileData,
    loading,
    error,
    updateProfile,
    setProfileData
  };
}; 