"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const previousEditions = [
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition1.jpg",
    label: "JUL/AUG 2024",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition2.jpg",
    label: "SEP/OCT 2023",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition3.jpg",
    label: "NOV/DEC 2023",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition4.jpg",
    label: "JAN/FEB 2023",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition5.jpg",
    label: "MAR/APR 2023",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
  {
    img: "https://maritime-executive.com/media/images/article/Photos/Magazine/edition6.jpg",
    label: "MAY/JUN 2023",
    flipbookUrl:
      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
  },
];

export default function MagazinePage() {
  const [start, setStart] = useState(0);
  const router = useRouter();
  const visible = 5;
  const canLeft = start > 0;
  const canRight = start + visible < previousEditions.length;

  const handleReadNow = (flipbookUrl) => {
    // Encode the URL for safe navigation
    const encodedUrl = encodeURIComponent(flipbookUrl);
    router.push(`/news/magazine/${encodedUrl}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Magazine Editions Title */}
          <h2 className="font-semibold text-lg mb-4 border-l-4 border-red-600 pl-2">
            MAGAZINE
            <span className="text-gray-500"> EDITIONS</span>
          </h2>
          {/* Magazine Edition */}
          <div className="col-sm-12 col-xs-12 border-b pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image - Smaller */}
              <div className="md:w-1/3 flex-shrink-0">
                <img
                  src="https://maritime-executive.com/media/images/magazine/2025/covers/MayJune25Cover.cf7ad7.jpg"
                  alt="Maritime Executive Magazine Cover"
                  className="rounded shadow w-full h-auto object-cover max-w-xs"
                />
              </div>
              {/* Edition Info - Beside Image */}
              <div className="md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    MAY/JUNE 2025 EDITION
                  </div>
                  <h2 className="text-2xl font-bold mb-2 leading-tight">
                    2025 Global Shipbuilding Report
                  </h2>
                  <div className="text-xs font-semibold text-red-600 mb-1">
                    CASE STUDY
                  </div>
                  <div className="text-xs font-bold text-gray-700 mb-1">
                    EXECUTIVE INTERVIEW
                  </div>
                  <div className="text-base font-semibold text-gray-800 mb-1">
                    Randall Crutchfield
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Chairman & CEO, Colonna's Shipyard
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    By Tony Munoz
                  </div>
                </div>
                <button
                  className="bg-red-600 text-white font-bold px-6 py-2 rounded shadow w-max hover:bg-red-700 transition-colors"
                  onClick={() =>
                    handleReadNow(
                      "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf"
                    )
                  }
                >
                  READ NOW
                </button>
              </div>
            </div>
          </div>
          {/* Previous Editions Carousel */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-4 border-l-4 border-red-600 pl-2">
              PREVIOUS
              <span className="text-gray-500"> EDITIONS</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                className={`rounded-full w-8 h-8 flex items-center justify-center border ${
                  canLeft
                    ? "bg-white hover:bg-gray-100"
                    : "bg-gray-100 cursor-not-allowed"
                } text-gray-700`}
                onClick={() => canLeft && setStart(start - 1)}
                disabled={!canLeft}
                aria-label="Scroll left"
              >
                &#8592;
              </button>
              <div className="flex space-x-4 overflow-x-hidden">
                {previousEditions
                  .slice(start, start + visible)
                  .map((edition, idx) => (
                    <div
                      key={edition.img}
                      className="flex flex-col items-center min-w-[100px]"
                    >
                      <img
                        src={edition.img}
                        alt={edition.label}
                        className="w-20 h-28 object-cover rounded shadow mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleReadNow(edition.flipbookUrl)}
                      />
                      <div className="text-xs text-gray-700 font-semibold text-center whitespace-nowrap">
                        {edition.label}
                      </div>
                      <button
                        className="text-xs text-red-600 hover:text-red-700 font-semibold mt-1"
                        onClick={() => handleReadNow(edition.flipbookUrl)}
                      >
                        READ NOW
                      </button>
                    </div>
                  ))}
              </div>
              <button
                className={`rounded-full w-8 h-8 flex items-center justify-center border ${
                  canRight
                    ? "bg-white hover:bg-gray-100"
                    : "bg-gray-100 cursor-not-allowed"
                } text-gray-700`}
                onClick={() => canRight && setStart(start + 1)}
                disabled={!canRight}
                aria-label="Scroll right"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Social Icons */}
          <div className="flex justify-end space-x-2 mb-2">
            <a href="#" className="text-gray-400 hover:text-blue-600">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-700">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-500">
              <i className="fab fa-telegram-plane"></i>
            </a>
          </div>
          {/* Ads */}
          <div className="space-y-4">
            <div className="bg-green-100 rounded shadow p-2 flex items-center justify-center h-28">
              <img
                src="https://maritime-executive.com/media/images/article/Photos/Ads/supply-chain-ad.jpg"
                alt="Ad 1"
                className="object-contain h-full"
              />
            </div>
            <div className="bg-white rounded shadow p-2 flex items-center justify-center h-28">
              <img
                src="https://maritime-executive.com/media/images/article/Photos/Ads/macgregor-ad.jpg"
                alt="Ad 2"
                className="object-contain h-full"
              />
            </div>
            <div className="bg-white rounded shadow p-2 flex items-center justify-center h-28">
              <img
                src="https://maritime-executive.com/media/images/article/Photos/Ads/groceries-ad.jpg"
                alt="Ad 3"
                className="object-contain h-full"
              />
            </div>
            <div className="bg-white rounded shadow p-2 flex items-center justify-center h-28">
              <img
                src="https://maritime-executive.com/media/images/article/Photos/Ads/asea-ad.jpg"
                alt="Ad 4"
                className="object-contain h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
