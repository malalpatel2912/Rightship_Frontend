"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Briefcase,
  User,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);
  const pathname = usePathname();

  const courses = [
    { name: "Pre Sea Courses", path: "/courses/pre-sea-courses" },
    { name: "Post Sea Courses", path: "/courses/post-sea-courses" },
  ];

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about-us" },
    { name: "Services", path: "/our-services" },
    { name: "Contact Us", path: "/contact-us" },
    { name: "News", path: "/news" },
  ];

  // Employee menu items
  const employeeMenuItems = [
    { name: "Profile", path: "/profile", icon: User },
    { name: "Applied Jobs", path: "/applied-jobs", icon: FileText },
  ];

  // Company menu items
  const companyMenuItems = [
    { name: "Jobs", path: "/company/job", icon: Briefcase },
    { name: "Summary", path: "/company/history", icon: FileText },
    { name: "Settings", path: "/company/settings", icon: Settings },
  ];

  // Choose menu items based on user type
  const profileMenuItems =
    user?.userType === "company" ? companyMenuItems : employeeMenuItems;

  const isActiveLink = (path) => pathname === path;

  const handleDropdownEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsDesktopDropdownOpen(true);
    }
  };

  const handleDropdownLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      timeoutRef.current = setTimeout(() => {
        setIsDesktopDropdownOpen(false);
      }, 200);
    }
  };

  const handleProfileDropdownEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
      setIsProfileDropdownOpen(true);
    }
  };

  const handleProfileDropdownLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      profileTimeoutRef.current = setTimeout(() => {
        setIsProfileDropdownOpen(false);
      }, 200);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image
                src="/full-logo.png"
                alt="Logo"
                width={200}
                height={50}
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm lg:text-base hover:bg-blue-50 transition-colors ${
                    isActiveLink(link.path)
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Courses Dropdown */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`px-3 py-2 rounded-md text-sm lg:text-base hover:bg-blue-50 transition-colors flex items-center gap-1 ${
                    courses.some((course) => isActiveLink(course.path))
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Courses
                  <ChevronDown className="w-4 h-4 mt-0.5" />
                </button>

                {isDesktopDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="py-1">
                      {courses.map((course) => (
                        <Link
                          key={course.path}
                          href={course.path}
                          className={`block px-4 py-2 text-sm hover:bg-blue-50 ${
                            isActiveLink(course.path)
                              ? "text-blue-600 font-semibold bg-blue-50"
                              : "text-gray-700 hover:text-blue-600"
                          }`}
                        >
                          {course.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Right Menu - Conditional based on authentication */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </Link>
            {isAuthenticated && user?.userType === "employee" && (
              <NotificationDropdown />
            )}
            {isAuthenticated && (
              <div
                ref={profileDropdownRef}
                className="relative"
                onMouseEnter={handleProfileDropdownEnter}
                onMouseLeave={handleProfileDropdownLeave}
              >
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {user?.name || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onMouseEnter={handleProfileDropdownEnter}
                    onMouseLeave={handleProfileDropdownLeave}
                  >
                    <div className="py-1">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`flex items-center px-4 py-2 text-sm ${
                            isActiveLink(item.path)
                              ? "text-blue-600 bg-blue-50 font-semibold"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink(link.path)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Courses Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
            >
              <span className="font-medium">Courses</span>
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  isMobileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isMobileDropdownOpen && (
              <div className="pl-4 space-y-1">
                {courses.map((course) => (
                  <div key={course.path}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileDropdownOpen(false);
                        setIsOpen(false);
                        setTimeout(() => {
                          router.push(course.path);
                        }, 50);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        isActiveLink(course.path)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {course.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu items based on user type */}
          {isAuthenticated ? (
            <>
              {/* Profile Section for Mobile */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Logged in as:{" "}
                  <span className="font-medium">{user?.name || "User"}</span>
                </div>

                {/* Profile menu items */}
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActiveLink(item.path)
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}

                {/* Logout button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </>
          ) : null}

          {/* Jobs Link - Mobile (for all users) */}
          <Link
            href="/jobs"
            className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-2 mx-1"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
