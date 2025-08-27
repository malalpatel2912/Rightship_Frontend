// /src/app/dashboard/page.js

'use client'
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  console.log(user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome! Your token is: {user?.name}</p>
    </div>
  );
}
