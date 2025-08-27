// File: src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Use environment variables for configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const MAX_SESSION_TIME = parseInt(process.env.NEXT_AUTH_SESSION_MAXAGE, 10) || 24 * 60 * 60; // 24 hours default
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp); // Assuming 6-digit OTP
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp-login',
      name: 'OTP Login',
      credentials: {
        contactType: { label: "Contact Type", type: "text" },
        contactValue: { label: "Contact Value", type: "text" },
        otp: { label: "OTP", type: "text" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (IS_DEVELOPMENT) {
            console.log('NextAuth authorize credentials:', {
              contactType: credentials.contactType,
              contactValue: '***hidden***',
              userType: credentials.userType
            });
          }
          
          // Enhanced input validation
          if (!credentials.contactType || !credentials.contactValue || !credentials.otp || !credentials.userType) {
            throw new Error("All fields are required");
          }

          if (!['phone', 'email'].includes(credentials.contactType)) {
            throw new Error("Invalid contact type");
          }

          if (!['employee', 'company'].includes(credentials.userType)) {
            throw new Error("Invalid user type");
          }

          if (credentials.contactType === 'email' && !validateEmail(credentials.contactValue)) {
            throw new Error("Invalid email format");
          }

          if (credentials.contactType === 'phone' && !validatePhone(credentials.contactValue)) {
            throw new Error("Invalid phone number format");
          }

          if (!validateOTP(credentials.otp)) {
            throw new Error("Invalid OTP format");
          }

          const payload = {
            [credentials.contactType === 'phone' ? 'mobile_no' : 'email']: credentials.contactValue,
            otp: credentials.otp,
            user_type: credentials.userType === 'employee' ? 'employee' : 'company_team'
          };
          
          const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest' // CSRF protection
            },
            body: JSON.stringify(payload),
          });
          
          const responseData = await response.json();
          
          if (!response.ok || responseData.code !== 200) {
            throw new Error("Authentication failed");
          }
          
          // Return minimal required user data in the expected NextAuth format
          const userData = {
            id: responseData.user.id,
            email: responseData.user.email,
            mobileNo: responseData.user.mobile_no,
            type: responseData.user.type,
            token: responseData.token,
            name: responseData.user.email || responseData.user.mobile_no,
            userType: credentials.userType, // Store the user type
          };

          // Validate that the user type matches their role in the system
          if (credentials.userType === 'employee' && responseData.user.type !== 'employee') {
            throw new Error("Access denied: Invalid user type");
          }

          if (credentials.userType === 'company' && !responseData.user.company_id) {
            throw new Error("Access denied: Invalid user type");
          }

          if (credentials.userType !== 'employee' && responseData.user.company_id) {
            userData.companyId = responseData.user.company_id;
          }

          if (IS_DEVELOPMENT) {
            console.log('Returning user data:', userData);
          }

          return userData;
        } catch (error) {
          if (IS_DEVELOPMENT) {
            console.error("Authentication error:", error);
          }
          return null; // Return null instead of throwing to let NextAuth handle the error
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Only store essential data in JWT
        token.id = user.id;
        token.email = user.email;
        token.mobileNo = user.mobileNo;
        token.type = user.type;
        token.name = user.name;
        token.userType = user.userType; // Store user type in token
        if (user.companyId) {
          token.companyId = user.companyId;
        }
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          mobileNo: token.mobileNo,
          type: token.type,
          name: token.name,
          userType: token.userType, // Include user type in session
        };
        
        if (token.companyId) {
          session.user.companyId = token.companyId;
        }
        
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle routing based on user type and requested URL
      if (url.startsWith('/profile') && session?.user?.userType !== 'employee') {
        return '/company'; // Redirect admins away from employee routes
      }
      if (url.startsWith('/company') && session?.user?.userType === 'employee') {
        return '/'; // Redirect employees away from admin routes
      }
      return url;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error', // Add custom error page
  },
  session: {
    strategy: 'jwt',
    maxAge: MAX_SESSION_TIME,
  },
  debug: IS_DEVELOPMENT,
  // Additional security configurations
  secret: 'Gy8P#mK9$vL2@nX5qR7*tJ4wZ1hF3bN6cA8dE0',
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
