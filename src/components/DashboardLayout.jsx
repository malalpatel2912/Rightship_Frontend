"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  Users,
  UserPlus,
  Download,
  CheckSquare,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { companyLogo } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainColor = "rgb(8 76 115)";

  const menuItems = [
    // { title: 'Dashboard', icon: <Home size={20} />, path: '/company/' },
    {
      title: "Create Job",
      icon: <Briefcase size={20} />,
      path: "/company/job/create",
    },
    { title: "Job", icon: <Briefcase size={20} />, path: "/company/job" },
    {
      title: "Profiles",
      icon: <Briefcase size={20} />,
      path: "/company/candidates",
    },
    {
      title: "Account Summary",
      icon: <Users size={20} />,
      path: "/company/candidates/history",
      // submenu: [
      //   { title: 'Viewed Account', path: '/company/candidates/viewed' },
      //   { title: 'Resume Downloaded', path: '/company/candidates/downloads' },
      //   { title: 'Shorted Candidates', path: '/company/candidates/shorted' }
      // ]
    },
    // { title: 'Applicant', icon: <UserPlus size={20} />, path: '/company/applicants' },
    { title: "Team", icon: <Users size={20} />, path: "/company/team" },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/company/setting",
      // submenu: [
      //   { title: 'Basic', path: '/company/settings/basic' },
      //   { title: 'Security', path: '/company/settings/security' },
      //   { title: 'Company Detail', path: '/company/settings/company' }
      // ]
    },
  ];

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      // Router will handle redirect to login page based on AuthContext
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 h-full transition-all duration-300 z-40
          ${isSidebarOpen ? "w-64" : "w-20"} 
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          border-r border-gray-200 overflow-hidden`}
        style={{ backgroundColor: mainColor }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-opacity-20 border-gray-200">
          {isSidebarOpen && (
            <div className="text-xl font-bold text-white">
              <img src="../logo-white.svg" alt="Logo" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <div className="relative">
                    {item.submenu ? (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <Link
                            href={item.path}
                            className="flex-1 flex items-center p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {isSidebarOpen && <span>{item.title}</span>}
                          </Link>
                          {isSidebarOpen && (
                            <button
                              onClick={() => toggleSubmenu(index)}
                              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${
                                  activeSubmenu === index ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        {isSidebarOpen && activeSubmenu === index && (
                          <ul className="pl-8 mt-2 space-y-2">
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  href={subItem.path}
                                  className="block p-2 text-gray-100 rounded-lg hover:bg-white/10 transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className="flex items-center p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {isSidebarOpen && <span>{item.title}</span>}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={20} className="mr-3" />
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 h-screen transition-all duration-300
        ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}
        ml-0
      `}
      >
        {/* Top Navbar */}
        <div
          className={`fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 shadow-sm transition-all duration-300
            ${isMobileMenuOpen ? "pl-4" : "pl-16 md:pl-4"}
            ${isSidebarOpen ? "md:left-64" : "md:left-20"}`}
        >
          <div className="flex items-center justify-end h-full px-4 space-x-4">
            {/* Notifications */}
            {/* <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        Mark all as read
                      </span>
                    </div>
                    <div className="mt-2 space-y-3">
                      <div className="p-3 bg-blue-50 text-sm text-gray-700 rounded-lg">
                        <div className="font-medium">New Application</div>
                        <p className="text-gray-600 mt-1">John Doe applied for Software Engineer position</p>
                        <span className="text-xs text-gray-500 mt-2 block">2 minutes ago</span>
                      </div>
                      <div className="p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
                        <div className="font-medium">Team Meeting</div>
                        <p className="text-gray-600 mt-1">Weekly sync at 2:00 PM</p>
                        <span className="text-xs text-gray-500 mt-2 block">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div> */}

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="w-6 h-6 rounded-full object-cover" // Adjust size to match UserCircle
                  />
                ) : (
                  <UserCircle size={20} />
                )}
                {
                  <span className="ml-2 hidden md:inline">
                    {user?.email || "User"}
                  </span>
                }
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-medium text-gray-800">
                      {user?.type === "company" ? "Company Admin" : "User"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    {/* <Link
                      href="/company/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircle size={16} className="mr-2" />
                      View Account
                    </Link> */}
                    <Link
                      href="/company/setting"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 mt-16 bg-gray-100">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
