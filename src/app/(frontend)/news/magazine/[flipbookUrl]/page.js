"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// import PDFFlipBook from "@/components/PDFFlipBook";
import FlipBook from "@/components/FlipPage";

export default function FlipbookPage() {
  const params = useParams();
  const flipbookUrl = params.flipbookUrl;
  const [decodedUrl, setDecodedUrl] = useState("");

  useEffect(() => {
    if (flipbookUrl) {
      // Decode the URL parameter
      const decoded = decodeURIComponent(flipbookUrl);
      setDecodedUrl(decoded);
    }
  }, [flipbookUrl]);

  if (!decodedUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating Close Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 right-4 z-50 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
        style={{ textDecoration: "none" }}
      >
        <span className="text-gray-700 text-xl font-bold">×</span>
      </button>

      {/* PDFFlipBook Component */}
      <FlipBook pdfUrl={decodedUrl} />
    </div>
  );
}
