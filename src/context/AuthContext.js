// File: src/context/AuthContext.js
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

// Simple token validator function (internal to this file)
const validateToken = async (token) => {
  if (!token) return false;
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data && response.data.code === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [localAuth, setLocalAuth] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);

  // Logout function
  const logout = useCallback(async () => {
    console.log('Logging out user');
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setLocalAuth(null);
    
    // Use NextAuth signOut
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  // Check for localStorage auth on mount
  useEffect(() => {
    //fetch company
    const fetchCompanyLogo = async (companyId) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/company/get`,
          { company_id: companyId },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }
        );
        const company = response.data.data[0]; // ✅ Fix: Directly use response.data
        if (company && company.companyLogo) {
          setCompanyLogo(company.companyLogo);
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      }
    };
    

    const loadLocalAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Set local auth immediately for better UX
          const parsedUserData = JSON.parse(userData);
          setLocalAuth({
            token,
            user: parsedUserData
          });

          // Fetch company logo if company_id exists
          if (parsedUserData.company_id) {
            fetchCompanyLogo(parsedUserData.company_id);
          }
          
          // Then validate the token
          setIsValidating(true);
          const isValid = await validateToken(token);
          setIsValidating(false);
          
          if (!isValid) {
            console.log('Initial token validation failed - logging out');
            logout();
          }
        }
        
        // Mark initial load as complete regardless of outcome
        setInitialLoadComplete(true);
      } catch (e) {
        console.error('Error reading auth from localStorage:', e);
        setInitialLoadComplete(true);
      }
    };
    
    loadLocalAuth();
  }, [logout]);

  // Keep localStorage in sync with NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // Store NextAuth session in localStorage for redundancy
      localStorage.setItem('token', session.accessToken);
      
      if (session.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          mobile_no: session.user.mobileNo,
          type: session.user.type
        };
        
        // Only include company_id if it exists
        if (session.user.companyId) {
          userData.company_id = session.user.companyId;
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update localAuth state too for immediate access
        setLocalAuth({
          token: session.accessToken,
          user: userData
        });
      }
      
      setInitialLoadComplete(true);
    } else if (status === 'unauthenticated') {
      // Make sure initialLoadComplete is set when session is definitely unauthenticated
      setInitialLoadComplete(true);
    }
  }, [session, status]);

  // Set up axios interceptor for token validation
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          if (!isValidating) {
            const token = session?.accessToken || (localAuth ? localAuth.token : null);
            
            if (token) {
              setIsValidating(true);
              const isValid = await validateToken(token);
              setIsValidating(false);
              
              if (!isValid) {
                console.log('Token invalid - logging out');
                logout();
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [session, localAuth, logout, isValidating]);

  const login = async (token, userData) => {
    // Store credentials in localStorage
    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setLocalAuth({ token, user: userData });
      return true;
    }
    return false;
  }

  const loginWithNextAuth = async (credentials) => {
    return signIn('otp-login', {
      contactType: credentials.contactType,
      contactValue: credentials.contactValue,
      otp: credentials.otp,
      userType: credentials.userType,
      redirect: false,
    });
  }

  // Determine actual auth state - giving preference to localStorage during initialization
  const isAuthenticated = 
    (status === 'loading' && localAuth !== null) ||  // Use localAuth during NextAuth loading
    status === 'authenticated' || 
    (initialLoadComplete && !!localAuth);  // Only use localAuth once initial load is complete
    
  const user = (status === 'loading' && localAuth?.user) 
    ? localAuth.user 
    : (session?.user || (localAuth ? localAuth.user : null));
    
  const token = (status === 'loading' && localAuth?.token) 
    ? localAuth.token 
    : (session?.accessToken || (localAuth ? localAuth.token : null));
    
  const isLoading = (status === 'loading' && !localAuth) || isValidating || !initialLoadComplete;

  // const companyLogoUrl = localAuth?.user?.companyLogo || session?.user?.companyLogo || null;

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginWithNextAuth,
    logout,
    companyLogo,

  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);