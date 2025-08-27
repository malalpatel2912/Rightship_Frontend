"use client";
import NewsHeader from "@/components/NewsHeader";
import { usePathname } from "next/navigation";

export default function NewsLayout({ children }) {
  const pathname = usePathname();
  const isFlipbookViewer = pathname.includes("/magazine/");

  return (
    <div className="bg-white min-h-screen">
      {!isFlipbookViewer && <NewsHeader />}
      <main>{children}</main>
    </div>
  );
}
