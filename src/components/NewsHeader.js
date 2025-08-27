"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NewsHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: "/news", label: "News" },
    { href: "/news/magazine", label: "Magazine" },
    { href: "/news/circular", label: "Circular" },
    { href: "/news/classified", label: "Classified" },
    { href: "/news/academics", label: "Academics" },
    { href: "/news/subscription", label: "Subscription" },
    { href: "/news/feedback", label: "Feedback" },
  ];

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-center py-6 px-4">
        {/* Logo */}
        <div className="md:hidden flex flex-col items-center w-full md:flex-row md:items-center md:w-auto">
          <Link href="/">
            <Image
              src="/executive-logo.png"
              alt="The Maritime Executive"
              width={220}
              height={80}
              className="object-contain mx-auto"
              priority
            />
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-black text-center md:text-left md:ml-6 mt-2 md:mt-0">
            Media Kit 2025
          </h1>
        </div>
        {/* Hamburger Icon */}
        <button
          className="absolute right-4 top-4 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect y="5" width="24" height="2" rx="1" fill="#222" />
            <rect y="11" width="24" height="2" rx="1" fill="#222" />
            <rect y="17" width="24" height="2" rx="1" fill="#222" />
          </svg>
        </button>
        <div className="hidden md:flex flex-shrink-0">
          <Link href="/">
            <Image
              src="/executive-logo.png" // Place your logo in /public
              alt="The Maritime Executive"
              width={260}
              height={80}
              className="object-contain"
              priority
            />
          </Link>
        </div>
        {/* Vertical Divider */}
        <div className="hidden md:flex h-20 w-px bg-gray-300 mx-8" />
        {/* Title */}
        <h1 className="hidden md:flex text-[54px] font-bold-600 text-black">
          Media Kit 2025
        </h1>
      </div>
      <nav className="hidden md:flex max-w-7xl mx-auto px-4 flex-wrap space-x-6 text-base justify-center font-semibold py-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-gray-600 border-b-2 border-gray-600 pb-1"
                : "text-blue-700 hover:text-blue-900"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {menuOpen && (
        <nav className="flex flex-col items-stretch md:hidden bg-white w-full border-t z-50 px-2 py-4 space-y-2">
          {navLinks.map((item) =>
            item.submenu ? (
              <div key={item.label}>
                <div className="bg-gray-100 font-semibold text-blue-700 px-2 py-2 rounded">
                  {item.label}
                </div>
                <div className="pl-4 flex flex-col">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="py-1 text-blue-700 hover:underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="font-semibold text-blue-700 px-2 py-2 hover:bg-blue-50 rounded"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
