"use client";

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/news");
  const isFlipbookViewer = pathname.includes("/magazine/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!isFlipbookViewer && <Footer />}
    </>
  );
}
