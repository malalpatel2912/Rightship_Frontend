// File: src/components/layouts/LayoutSwitcher.js
'use client'
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import { usePathname } from "next/navigation";

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export default function LayoutSwitcher({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Check if current path is a public path
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // If user is not logged in and trying to access protected route,
  // they will be redirected by AuthContext useEffect

  // Show AuthLayout for public paths, regardless of auth status
  if (isPublicPath) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // Show DashboardLayout for authenticated users
  if (user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Fallback to AuthLayout for non-authenticated users
  return <AuthLayout>{children}</AuthLayout>;
}