"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import DashboardLayout from "@/components/DashboardLayout";
import VerificationStatus from "@/components/custom/VerificationStatus";
import LoadingAnimation from "@/components/loading";

const Layout = ({ children }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth(); // Add isLoading from AuthContext
  const { isVerified, loading: subscriptionLoading } = useSubscription();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Wait for auth to complete loading before making decisions
  useEffect(() => {
    // Only proceed with auth checks if loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/company/login");
      } else if (user?.type === "employee") {
        console.log("Employee user, redirecting to home");
        router.push("/");
      } else {
        console.log("Auth check complete, user is authenticated");
        setCheckingAuth(false);
      }
    }
  }, [isAuthenticated, user, router, isLoading]); // Add isLoading as dependency

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { 
      isLoading, 
      isAuthenticated, 
      userType: user?.type,
      checkingAuth
    });
  }, [isLoading, isAuthenticated, user, checkingAuth]);

  // Show loading while auth context is initializing
  if (isLoading) {
    return <LoadingAnimation message="Initializing authentication..." />;
  }

  // Show initial loading while authentication redirect decision is being made
  if (checkingAuth || !isAuthenticated || user?.type === "employee") {
    return <LoadingAnimation message="Checking authentication..." />;
  }

  // Show loading while subscription status is being checked
  if (subscriptionLoading) {
    return <LoadingAnimation message="Checking subscription status..." />;
  }

  // If not verified, show verification screen
  if (!isVerified) {
    return <VerificationStatus />;
  }

  // All checks passed, show dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;