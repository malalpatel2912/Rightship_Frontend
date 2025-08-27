'use client';

// StepForm.js
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import PersonalDetails from './PersonalDetails';
import ContactDetails from './ContactDetails';
import BasicInformation from './BasicInformation';
import RankDetails from './RankDetails';
import VesselDetails from './VesselDetails';
import ExperienceDetails from './ExperienceDetails';
import CertificateDetails from './CertificateDetails';
import UploadDocuments from './UploadDocuments';
import ProgressBar from './ProgressBar';
import RegistrationSuccess from './RegistrationSuccess';

const StepForm = () => {

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        lastRank: '',
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

    // COC | COP | WATCHKEEPING | RANK | VESSEL | NATIONALITY | GENDER 
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

    // Calculated Age
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

    const nextStep = () => {
        window.scrollTo(0, 0);
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        window.scrollTo(0, 0);
        setCurrentStep(prev => prev - 1);
    };

    const handleInputChange = (name, value) => {
        // Validate date of availability
        if (name === 'dateOfAvailability' && value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of the day
            
            const availabilityDate = new Date(value);
            availabilityDate.setHours(0, 0, 0, 0); // Reset time to start of the day
            
            // Calculate the maximum date (1 year from now)
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            maxDate.setHours(0, 0, 0, 0); // Reset time to start of the day
            
            if (availabilityDate < today) {
                toast.error('Date of Availability cannot be in the past');
                return; // Don't update state
            }
            
            if (availabilityDate > maxDate) {
                toast.error('Date of Availability cannot be more than 1 year in the future');
                return; // Don't update state
            }
        }
        
        setFormData(prev => {
            const updates = { [name]: value };

            // Auto-calculate age when date of birth changes
            if (name === 'dateOfBirth') {
                updates.age = calculateAge(value);
            }

            // Sync WhatsApp number with mobile number if WhatsApp is blank
            if (name === 'mobileNumber' && !prev.whatsappNumber) {
                updates.whatsappNumber = value;
            }

            return { ...prev, ...updates };
        });
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
                toast.error('Failed to load form options. Please refresh the page.');
                console.error('Failed to fetch attributes:', error);
            }
        };

        fetchAttributes();

    }, []);

    // Handle Form Submit Till 3rd Step
    const handleStep3Submission = async () => {
        try {
            setIsSubmitting(true);
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'mobileNumber', 'gender', 'age', 'dateOfBirth'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error('Please enter a valid email address');
                return;
            }

            // Validate mobile number format (basic validation)
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(formData.mobileNumber)) {
                toast.error('Please enter a valid 10-digit mobile number');
                return;
            }

            if (formData.employeeId) {
                // If employeeId exists, use update endpoint
                const updatePayload = {
                    employee_id: formData.employeeId,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    mobile_no: formData.mobileNumber,
                    whatsappNumber: formData.whatsappNumber,
                    gender: formData.gender,
                    age: formData.age,
                    dob: formData.dateOfBirth,
                    status: 'active',
                    profilePicture: formData.profilePictureUrl || '',
                    resume: formData.resumeUrl || '',
                    registerCompleted: false,
                };

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update`,
                    updatePayload
                );

                if (response.data && response.data.code === 200) {
                    toast.success('Personal details updated successfully');
                    nextStep();
                } else {
                    throw new Error(response.data?.msg || 'Failed to update employee details');
                }
            } else {
                // If no employeeId, create new employee
                const createPayload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    mobile_no: formData.mobileNumber,
                    whatsappNumber: formData.whatsappNumber,
                    gender: formData.gender,
                    age: formData.age,
                    dob: formData.dateOfBirth,
                    status: 'active',
                    profilePicture: formData.profilePictureUrl || '',
                    resume: formData.resumeUrl || '',
                };

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/add-employee`,
                    createPayload
                );

                if (response.data && response.data.code === 200) {
                    const employeeId = response.data.employee._id;
                    setFormData(prev => ({
                        ...prev,
                        employeeId: employeeId
                    }));
                    toast.success('Employee created successfully');
                    nextStep();
                } else {
                    throw new Error(response.data?.msg || 'Failed to create employee');
                }
            }
        } catch (error) {
            if (error.response) {
                // Server responded with error status
                if (error.response.status === 400) {
                    const errorMessage = error.response.data?.msg || 'Invalid request data';
                    toast.error(errorMessage);
                } else {
                    const errorMessage = error.response.data?.msg || 'An error occurred while processing your request';
                    toast.error(errorMessage);
                    console.error('API Error:', error.response.data);
                }
            } else if (error.request) {
                // Request was made but no response received
                toast.error('Network error: Please check your internet connection');
                console.error('Network Error:', error.request);
            } else {
                // Something else went wrong
                toast.error('An unexpected error occurred');
                console.error('Error:', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (!formData.employeeId) {
                toast.error('Employee ID not found. Please try again or contact support.');
                return;
            }

            // Validate required fields for final submission
            const requiredFields = [
                'nationality', 'dateOfAvailability', 'lastRank', 'appliedRank',
                'lastVessel', 'appliedVessel', 'coc', 'cop', 'watchKeeping'
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
                setIsSubmitting(false);
                return;
            }
            
            if (availabilityDate > maxDate) {
                toast.error('Date of Availability cannot be more than 1 year in the future');
                setIsSubmitting(false);
                return;
            }

            const updatePayload = {
                employee_id: formData.employeeId,
                nationality: formData.nationality,
                availability: formData.dateOfAvailability,
                sid: formData.sid,
                usVisa: formData.usVisa,
                presentRank: formData.lastRank,
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
                toast.success('Registration completed successfully!');
                nextStep();
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const commonProps = {
            formData,
            handleInputChange,
            nextStep,
            prevStep,
            isSubmitting,
        };

        switch (currentStep) {
            case 1:
                return <UploadDocuments {...commonProps} />;
            case 2:
                return <PersonalDetails {...commonProps} calculateAge={calculateAge} />;
            case 3:
                return <ContactDetails 
                    {...commonProps} 
                    genderOptions={genderOptions}
                    nextStep={handleStep3Submission}
                />;
            case 4:
                return <BasicInformation {...commonProps} nationalityOptions={nationalityOptions} />;
            case 5:
                return <RankDetails {...commonProps} rankOptions={rankOptions} />;
            case 6:
                return <VesselDetails {...commonProps} vesselExpOptions={vesselExpOptions} />;
            case 7:
                return <ExperienceDetails {...commonProps} />;
            case 8:
                return <CertificateDetails 
                    {...commonProps}
                    copOptions={copOptions}
                    cocOptions={cocOptions}
                    watchKeepingOptions={watchKeepingOptions}
                    handleFinalSubmit={handleFinalSubmit}
                />;
            case 9:
                return <RegistrationSuccess />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            {/* Progress Bar - Fixed on mobile, sidebar on desktop */}
            <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
                <ProgressBar currentStep={currentStep} />
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-12">
                    {/* Form Progress Indicator - Mobile Only */}
                    <div className="lg:hidden mb-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Step {currentStep} of 8</span>
                                <span className="text-sm text-gray-500">{Math.round((currentStep / 8) * 100)}% Complete</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${(currentStep / 8) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Step Content */}
                    <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default StepForm; 