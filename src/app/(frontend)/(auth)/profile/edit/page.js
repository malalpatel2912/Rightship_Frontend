'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-hot-toast';

export default function EditProfile() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    gender: '',
    nationality: '',
    dateOfAvailability: '',
    sid: '',
    usVisa: '',
    presentRank: '',
    appliedRank: '',
    lastVessel: '',
    appliedVessel: '',
    vesselExperience: [],
    totalSeaExperienceYear: '',
    totalSeaExperienceMonth: '',
    presentRankExperienceInMonth: '',
    cop: '',
    coc: '',
    watchkeeping: '',
    profilePicture: null,
    resume: null,
    employeeId: null,
    status: 'active',
});

const { data: session, status: authStatus } = useSession();

const employeeId = session?.user?.id;

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [profileData, setProfileData] = useState(null);

const [copOptions, setCopOptions] = useState([]);
const [cocOptions, setCocOptions] = useState([]);
const [shipOptions, setShipOptions] = useState([]);
const [watchKeepingOptions, setWatchKeepingOptions] = useState([]);
const [rankOptions, setRankOptions] = useState([]);
const [vesselExpOptions, setVesselExpOptions] = useState([]);
const [nationalityOptions, setNationalityOptions] = useState([]);
const [genderOptions] = useState([
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
]);

const calculateAge = (dob) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  } 

  return age.toString();
};

    // Fetch Attribute Data
    useEffect(() => {

      const fetchAttributes = async () => {
          try {
              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attributes/get`, {}, {
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': '*/*',
                      'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
                  }
              });

              if (response.data && response.data.code === 200) {
                  const attributes = response.data.data;

                  const copAttribute = attributes.find(attr => attr.name.toLowerCase() === 'cop');
                  const cocAttribute = attributes.find(attr => attr.name.toLowerCase() === 'coc');
                  const shipAttribute = attributes.find(attr => attr.name.toLowerCase() === 'ships');
                  const watchKeepingAttribute = attributes.find(attr => attr.name.toLowerCase() === 'watch keeping');
                  const rankAttribute = attributes.find(attr => attr.name.toLowerCase() === 'rank');
                  const nationalityAttribute = attributes.find(attr => attr.name.toLowerCase() === 'nationality');

                  const copData = copAttribute ? copAttribute.values : [];
                  const cocData = cocAttribute ? cocAttribute.values.sort((a, b) => a.localeCompare(b)) : [];
                  const shipData = shipAttribute ? shipAttribute.values.sort((a, b) => a.localeCompare(b)) : [];
                  const watchKeepingData = watchKeepingAttribute ? watchKeepingAttribute.values : [];
                  const rankData = rankAttribute ? rankAttribute.values.sort((a, b) => a.localeCompare(b)) : [];
                  const nationalityData = nationalityAttribute ? nationalityAttribute.values.sort((a, b) => a.localeCompare(b)) : [];

                  setCopOptions(copData.map(option => ({ value: option, label: option })));
                  setCocOptions(cocData.map(option => ({ value: option, label: option })));
                  setShipOptions(shipData.map(option => ({ value: option, label: option })));
                  setWatchKeepingOptions(watchKeepingData.map(option => ({ value: option, label: option })));
                  setRankOptions(rankData.map(option => ({ value: option, label: option })));
                  setVesselExpOptions(shipData.map(option => ({ value: option, label: option })));
                  setNationalityOptions(nationalityData.map(option => ({ value: option, label: option })));

              } else {
                  console.error('Failed to fetch attributes:', response.data.msg);
              }
          } catch (error) {
              console.error('Failed to fetch attributes:', error);
          }
      };

      fetchAttributes();

  }, []);

  const handleFinalSubmit = async () => {
    try {
        if (!formData.employeeId) {
            toast.error('Employee ID not found. Please try again or contact support.');
            return;
        }

        // Validate required fields for final submission
        const requiredFields = [
            'nationality', 'dateOfAvailability', 'presentRank', 'appliedRank',
            'lastVessel', 'appliedVessel',
        ];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate date of availability
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of the day
        
        const availabilityDate = new Date(formData.dateOfAvailability);
        availabilityDate.setHours(0, 0, 0, 0); // Reset time to start of the day
        
        // Calculate the maximum date (1 year from now)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        maxDate.setHours(0, 0, 0, 0); // Reset time to start of the day
        
        if (availabilityDate < today) {
            toast.error('Date of Availability cannot be in the past');
            return;
        }
        
        if (availabilityDate > maxDate) {
            toast.error('Date of Availability cannot be more than 1 year in the future');
            return;
        }

        const updatePayload = {
            employee_id: formData.employeeId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            age: formData.age,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            whatsappNumber: formData.whatsappNumber,
            gender: formData.gender,
            nationality: formData.nationality,
            dateOfAvailability: formData.dateOfAvailability,
            sid: formData.sid,
            usVisa: formData.usVisa,
            presentRank: formData.presentRank,
            appliedRank: formData.appliedRank,
            presentVessel: formData.lastVessel,
            appliedVessel: formData.appliedVessel,
            vesselExp: formData.vesselExperience,
            totalSeaExperienceYear: formData.totalSeaExperienceYear,
            totalSeaExperienceMonth: formData.totalSeaExperienceMonth,
            presentRankExperienceInMonth: formData.presentRankExperienceInMonth,
            coc: formData.coc,
            cop: formData.cop,
            watchkeeping: formData.watchKeeping,
            registerCompleted: true,
        };

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update`,
            updatePayload
        );

        if (response.data && response.data.code === 200) {
            toast.success('Data updated successfully!');
          
        } else {
            throw new Error(response.data?.msg || 'Failed to complete registration');
        }
    } catch (error) {
        if (error.response) {
            const errorMessage = error.response.data?.msg || 'An error occurred while completing registration';
            toast.error(errorMessage);
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            toast.error('Network error: Please check your internet connection');
            console.error('Network Error:', error.request);
        } else {
            toast.error('An unexpected error occurred');
            console.error('Error:', error.message);
        }
    }
};

useEffect(() => {
  const fetchProfileData = async () => {
    if (authStatus === 'loading') return;
    
    if (!session?.user?.id) {
      setError('Unable to determine user ID. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/get`, {
        employee_id: session.user.id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        }
      });
      
      if (response.data && response.data.code === 200 && response.data.data?.length > 0) {
        const userData = response.data.data[0];
        setProfileData(userData);

        // Format the date from "1996-05-17" to "1996-05-17"
        const formattedDOB = userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '';
        const formattedAvailability = userData.availability ? new Date(userData.availability).toISOString().split('T')[0] : '';

        setFormData({
          ...formData,
          firstName: userData.firstName?.trim() || '',
          lastName: userData.lastName?.trim() || '',
          dateOfBirth: formattedDOB,
          age: userData.age || '',
          email: userData.email || '',
          mobileNumber: userData.mobile_no || '',
          whatsappNumber: userData.whatsappNumber || '',
          gender: userData.gender || '',
          nationality: userData.nationality || '',
          dateOfAvailability: formattedAvailability,
          sid: userData.sid || '',
          usVisa: userData.usVisa || '',
          presentRank: userData.presentRank || '',
          appliedRank: userData.appliedRank || '',
          lastVessel: userData.presentVessel || '',
          appliedVessel: userData.appliedVessel || '',
          vesselExperience: userData.vesselExp || [],
          totalSeaExperienceYear: userData.totalSeaExperienceYear || '',
          totalSeaExperienceMonth: userData.totalSeaExperienceMonth || '',
          presentRankExperienceInMonth: userData.presentRankExperienceInMonth || '',
          cop: userData.cop || '',
          coc: userData.coc || '',
          watchkeeping: userData.watchkeeping || '',
          employeeId: session.user.id,
          profilePicture: userData.profilePicture || null,
          resume: userData.resume || null,
        });
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
  
  if (authStatus === 'authenticated' && session?.user?.id) {
    fetchProfileData();
  }
}, [authStatus, session]);


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-500">Update your personal and professional information</p>
            </div>
          </div>
          <Button 
            onClick={handleFinalSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Save Changes
          </Button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile data...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src={formData.profilePicture || 'https://via.placeholder.com/128?text=Profile'}
                      alt="Profile"
                      className="rounded-full w-full h-full object-cover border-4 border-white shadow-md"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-sm text-gray-500">{formData.presentRank}</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button className="w-full" variant="outline">
                    Change Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Form Section */}
            <div className="lg:col-span-3 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        const age = calculateAge(e.target.value);
                        setFormData({ 
                          ...formData, 
                          dateOfBirth: e.target.value,
                          age: age
                        });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={formData.age}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <Select
                      value={genderOptions.find(option => option.value === formData.gender)}
                      onChange={(option) => setFormData({ ...formData, gender: option.value })}
                      options={genderOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <Select
                      value={nationalityOptions.find(option => option.value === formData.nationality)}
                      onChange={(option) => setFormData({ ...formData, nationality: option.value })}
                      options={nationalityOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Availability</label>
                    <input
                      type="date"
                      value={formData.dateOfAvailability}
                      onChange={(e) => setFormData({ ...formData, dateOfAvailability: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SID</label>
                    <Select
                      value={{ value: formData.sid, label: formData.sid }}
                      onChange={(option) => setFormData({ ...formData, sid: option.value })}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                      ]}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">US Visa</label>
                    <Select
                      value={{ value: formData.usVisa, label: formData.usVisa }}
                      onChange={(option) => setFormData({ ...formData, usVisa: option.value })}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                      ]}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Experience Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Experience Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Rank</label>
                    <Select
                      value={rankOptions.find(option => option.value === formData.presentRank)}
                      onChange={(option) => setFormData({ ...formData, presentRank: option.value })}
                      options={rankOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applied Rank</label>
                    <Select
                      value={rankOptions.find(option => option.value === formData.appliedRank)}
                      onChange={(option) => setFormData({ ...formData, appliedRank: option.value })}
                      options={rankOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Vessel</label>
                    <Select
                      value={shipOptions.find(option => option.value === formData.lastVessel)}
                      onChange={(option) => setFormData({ ...formData, lastVessel: option.value })}
                      options={shipOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applied Vessel</label>
                    <Select
                      value={shipOptions.find(option => option.value === formData.appliedVessel)}
                      onChange={(option) => setFormData({ ...formData, appliedVessel: option.value })}
                      options={shipOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Experience</label>
                    <Select
                      isMulti
                      value={formData.vesselExperience.map(exp => ({ value: exp, label: exp }))}
                      onChange={(options) => setFormData({ ...formData, vesselExperience: options.map(opt => opt.value) })}
                      options={vesselExpOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate of Proficiency (COP)</label>
                    <Select
                      value={copOptions.find(option => option.value === formData.cop)}
                      onChange={(option) => setFormData({ ...formData, cop: option.value })}
                      options={copOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate of Competency (COC)</label>
                    <Select
                      value={cocOptions.find(option => option.value === formData.coc)}
                      onChange={(option) => setFormData({ ...formData, coc: option.value })}
                      options={cocOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Watchkeeping</label>
                    <Select
                      value={watchKeepingOptions.find(option => option.value === formData.watchkeeping)}
                      onChange={(option) => setFormData({ ...formData, watchkeeping: option.value })}
                      options={watchKeepingOptions}
                      className="react-select"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '42px',
                          borderRadius: '0.5rem',
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sea Experience */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sea Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Sea Experience (Years)</label>
                    <input
                      type="number"
                      value={formData.totalSeaExperienceYear}
                      onChange={(e) => setFormData({ ...formData, totalSeaExperienceYear: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Sea Experience (Months)</label>
                    <input
                      type="number"
                      value={formData.totalSeaExperienceMonth}
                      onChange={(e) => setFormData({ ...formData, totalSeaExperienceMonth: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Present Rank Experience (Months)</label>
                    <input
                      type="number"
                      value={formData.presentRankExperienceInMonth}
                      onChange={(e) => setFormData({ ...formData, presentRankExperienceInMonth: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                    <div className="flex items-center gap-4">
                      {formData.resume ? (
                        <a 
                          href={formData.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          View Current Resume
                        </a>
                      ) : (
                        <p className="text-gray-500">No resume uploaded</p>
                      )}
                      <Button variant="outline">Upload New Resume</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
