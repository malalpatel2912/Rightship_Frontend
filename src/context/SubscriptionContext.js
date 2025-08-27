"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const SubscriptionContext = createContext();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export const SubscriptionProvider = ({ children }) => {
  const { token, user } = useAuth();
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState(0);
  const [views, setViews] = useState(0);
  const [teams, setTeams] = useState(1);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!token || !user) {
        setLoading(false);
        return;
      }

      const companyId = user.companyId || user.company_id;
      if (!companyId) {
        console.log("No company ID found in user data:", user);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/company/get`,
          { company_id: companyId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const companyData = response?.data?.data?.[0];
        const subscriptionData = companyData?.subscription;

        if (!subscriptionData || Object.keys(subscriptionData).length === 0) {
          router.push("/company/select-plan");
          return; // Important: prevent further state updates after redirect
        }

        setSubscription(subscriptionData);
        setIsVerified(companyData?.admin_verify);
        setDownloads(subscriptionData?.remaining_resume_downloads || 0);
        setViews(subscriptionData?.remaining_profile_views || 0);
        setTeams(subscriptionData?.can_add_user || 1);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [token, user]);

  const updateSubscriptionUsage = async (type) => {
    if (!token || !user) return;

    const companyId = user.companyId || user.company_id;
    if (!companyId) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/company/get`,
        { company_id: companyId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const subscriptionData = response?.data?.data?.[0]?.subscription;

      if (type === "resume_download") setDownloads(subscriptionData?.remaining_resume_downloads || 0);
      if (type === "profile_view") setViews(subscriptionData?.remaining_profile_views || 0);
      if (type === "add_team") setTeams(subscriptionData?.can_add_user || 1);
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isVerified, loading, downloads, views, teams, updateSubscriptionUsage }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
