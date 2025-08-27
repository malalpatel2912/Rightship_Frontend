import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext';

export const useAuthUtils = () => {
  const { data: session } = useSession();
  const { user: authUser, token: authToken } = useAuth();

  const getAuthToken = () => {
    if (session?.accessToken) return session.accessToken;
    if (authToken) return authToken;
    return localStorage.getItem('token');
  };

  const getUserId = () => {
    if (session?.user?.id) return session.user.id;
    if (authUser?.id) return authUser.id;
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id;
      }
    } catch (e) {
      console.error('Error parsing userData from localStorage:', e);
    }
    return null;
  };

  return {
    getAuthToken,
    getUserId,
    isAuthenticated: !!getAuthToken(),
  };
}; 