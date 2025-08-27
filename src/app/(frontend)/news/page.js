"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const articles = [
  {
    category: "SHIPPING",
    image: "https://via.placeholder.com/300x200?text=Shipping", // Replace with actual image
    title: "Drew Marine Sets the Standard in Safeguarding Voyages",
    items: [
      "Australia Confirms Discovery of the Wreck of Cook’s HMB Endeavour",
      "Supertanker Disconnects from Pipeline in Storm Causing Oil Slick",
      "New Zealand Calls for Banning Substandard Vessels Based on 2023 Incident",
      "Video: Damaged Mexican Sail Training Ship Moved for Repairs",
    ],
  },
  {
    category: "TUGS & SALVAGE",
    image: "https://via.placeholder.com/300x200?text=Tugs+%26+Salvage", // Replace with actual image
    title:
      "Updated: Crew Missing and Injured as Fire Spreads on Wan Hai Ship Off India",
    items: [
      "California Hauls Abandoned Crane Barges Out of San Joaquin Delta",
      "Australia Honors Lost American Warships From WWII With New Protections",
      "Second Bulker Refloated After Grounding off Sweden",
      "Salvage Teams Making Progress Removing Boxes and Fuel from MSC Baltic III",
    ],
  },
  {
    category: "GOVERNMENT",
    image: "https://via.placeholder.com/300x200?text=Government", // Replace with actual image
    title: "UK to Ban Bottom Trawling in Marine Protected Areas",
    items: [
      "More Iranian Ships Inbound with Ballistic Missile Propellant",
      "U.S. Smuggling Trial Sheds Light on Iranian Arms Trafficking",
      "White House Walks Back U.S.-Built LNG Carrier Ambitions",
      "Israel Takes 'All Necessary Measures' to Block Greta Thunberg's Boat",
    ],
  },
];

const NewsCard = ({ category, image, title, items }) => (
  <div className="bg-white overflow-hidden">
    <div className="bg-[#5DC1EE] text-white text-xs font-bold uppercase px-3 py-1 inline-block">
      {category}
    </div>
    <div className="relative mb-8">
      <div className="h-40 bg-gray-200"></div>
      <h4 className="font-bold text-xl text-gray-900 bg-white py-2.5 px-2 ml-4 -mt-10 right-auto">
        {title}
      </h4>
      <ul
        className="text-sm text-gray-800 font-bold
       py-2.5 px-2 ml-4 right-auto"
      >
        {items.map((item, idx) => (
          <li key={item._id || idx}>
            {typeof item === "object" && item._id ? (
              <Link
                href={`/news/${item._id}`}
                style={{ textDecoration: "none" }}
              >
                {item.title}
              </Link>
            ) : (
              item.title || item
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function News() {
  const [newsData, setNewsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [topStories, setTopStories] = useState([]);
  const [mainStorie, setMainStorie] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [editorials, setEditorial] = useState([]);

  useEffect(() => {
    axios("http://127.0.0.1:7800/news/category-wise")
      .then((response) => {
        setNewsData(response?.data);
        setLoading(false);
        setTopStories(response?.data["top-stories"]);
        setMainStorie(response?.data["main-stories"]);
        setTrendingStories(response?.data["trending-stories"]);
        setEditorial(response?.data["editorials"]);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setLoading(false);
      });
  }, []);
  return (
    <div className="bg-white min-h-screen">
      {/* Container */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-10 py-4 border-t border-b">
        {topStories?.length > 0 && (
          <h2 className="font-semibold text-lg mb-4 border-l-4 border-red-600 pl-2">
            TOP
            <span className="text-gray-500"> STORIES</span>
          </h2>
        )}
        {topStories?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topStories.map((story, index) => (
              <div
                key={index}
                className="flex space-x-2 border-r last:border-r-0 pr-2"
              >
                {/* <Link
                  href={`/news/${story._id}`}
                  className="text-sm font-semibold w-[50px] h-[50px]"
                  style={{ textDecoration: "none" }}
                > */}
                <img
                  src={
                    story.thumbnail_path
                      ? `http://localhost:7800/${story.thumbnail_path.replace(
                          /\\/g,
                          "/"
                        )}`
                      : "/default-image.jpg"
                  }
                  alt={story.title}
                  width={50}
                  height={50}
                  className="object-cover w-[50px] h-[50px]"
                />
                {/* </Link> */}
                <Link
                  href={`/news/${story._id}`}
                  className="text-sm font-semibold"
                  style={{ textDecoration: "none" }}
                >
                  {story.title}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {mainStorie?.map((story) => {
                return (
                  <div className="md:col-span-2">
                    <Link
                      href={`/news/${story._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        src={
                          story.thumbnail_path
                            ? `http://localhost:7800/${story.thumbnail_path.replace(
                                /\\/g,
                                "/"
                              )}`
                            : "/default-image.jpg"
                        }
                        alt={story.title}
                        className="w-full h-auto rounded"
                      />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold bg-white py-2.5 px-2 ml-4 -mt-10 relative">
                      <Link
                        href={`/news/${story._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        {story.title}
                      </Link>
                    </h1>
                    <div className="w-20 h-1 bg-red-600 mt-2 ml-4"></div>
                  </div>
                );
              })}
              <div className="space-y-8">
                <div>
                  <h2 className="font-semibold text-lg border-l-4 border-red-600 pl-2">
                    TRENDING <span className="text-gray-500">STORIES</span>
                  </h2>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-2">
                    {trendingStories?.map((story) => {
                      return (
                        <li key={story._id}>
                          <Link
                            href={`/news/${story._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            {story.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h2 className="font-semibold text-lg border-l-4 border-red-600 pl-2">
                    EDITORIALS
                  </h2>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-2">
                    {editorials?.map((story) => {
                      return (
                        <li key={story._id}>
                          <Link
                            href={`/news/${story._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            {story.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg border-l-4 mb-4 border-red-600 pl-2">
              MORE <span className="text-gray-500">TOP STORIES</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topStories.map((story, idx) => (
                <div key={idx} className="rounded-md relative mb-8">
                  <div className="rounded min-w-[400px] min-h-[242px]">
                    <Link
                      href={`/news/${story._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        src={
                          story.thumbnail_path
                            ? `http://localhost:7800/${story.thumbnail_path.replace(
                                /\\/g,
                                "/"
                              )}`
                            : "/default-image.jpg"
                        }
                        alt={story.title}
                      />
                    </Link>
                  </div>
                  <h4 className="relative font-bold text-xl text-gray-900 bg-white py-2.5 px-2 ml-4 -mt-10 right-auto">
                    <Link
                      href={`/news/${story._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      {story.title}
                    </Link>
                  </h4>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg border-l-4 mb-4 border-red-600 pl-2">
              STORIES <span className="text-gray-500">BY CATEGORY</span>
            </h2>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <NewsCard key={index} {...article} />
              ))}
            </div>
          </div>
        </div>
        {/* {/ Right Sidebar /} */}
        <div className="lg:col-span-4 space-y-6">
          {/* {/ Trending Stories /} */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold text-orange-600 mb-4">
              TRENDING STORIES
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>🔥 Burning Car Carrier Abandoned in Pacific</li>
              <li>⚓ HMS Prince of Wales Indian Ocean Mission</li>
              <li>📦 Global Shipping Delays Intensify</li>
              <li>🛳️ Europe Ports Struggle with Capacity</li>
            </ul>
          </div>
          {/* {/ Advertisement /} */}
          <div className="bg-blue-50 p-4 rounded shadow text-center">
            <h3 className="font-bold mb-2">Jobs in Germany</h3>
            <p className="text-sm text-gray-600">
              Find high-paying maritime jobs abroad
            </p>
          </div>
          {/* {/ Featured Stories /} */}
          <div className="">
            <h2 className="font-semibold text-lg border-l-4 mb-4 border-red-600 pl-2">
              FEATURED <span className="text-gray-500">STORIES</span>
            </h2>
            <div className="space-y-2">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">PODCASTS</h2>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
