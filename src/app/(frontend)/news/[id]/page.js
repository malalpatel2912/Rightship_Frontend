"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ArticlePage() {
  const params = useParams();
  const { id } = params;

  const [topStories, setTopStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(true);

  useEffect(() => {
    axios("https://marinnews-api.legitinfosystem.online/news/category-wise")
      .then((response) => {
        setTopStories(response?.data["top-stories"]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (id) {
      setArticleLoading(true);
      axios(`https://marinnews-api.legitinfosystem.online/news/${id}`)
        .then((response) => {
          setArticle(response.data);
          setArticleLoading(false);
        })
        .catch((error) => {
          setArticle(null);
          setArticleLoading(false);
        });
    }
  }, [id]);

  return (
    <div className="bg-white min-h-screen">
      {/* Top Stories Bar (copied from news/page.js) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-4 border-t border-b">
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
                <Link
                  href={`/news/${story._id}`}
                  className="text-sm font-semibold"
                >
                  {story.title}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:col-span-3 border-r pr-3">
          <h2 className="font-semibold text-lg mb-4 border-l-4 border-red-600 pl-2">
            MORE
            <span className="text-gray-500">TOP STORIES</span>
          </h2>
          <ul className="space-y-3 text-sm">
            {topStories?.map((story) => (
              <li key={story._id}>
                <Link
                  href={`/news/${story._id}`}
                  style={{ textDecoration: "none" }}
                >
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Article */}
        <main className="lg:col-span-6 md:col-span-6 col-span-12">
          {articleLoading ? (
            <div>Loading...</div>
          ) : article ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-white relative">
                {article.title}
              </h1>
              <div className="w-20 h-1 bg-red-600 mt-2 mb-4"></div>
              <img
                src={
                  article.thumbnail_path
                    ? `https://marinnews-api.legitinfosystem.online/${article.thumbnail_path.replace(
                        /\\/g,
                        "/"
                      )}`
                    : "/default-image.jpg"
                }
                alt={article.title}
                className="w-full h-72 object-cover rounded mb-4 border"
              />
              <article className="prose max-w-none mb-6 text-gray-800">
                <p>{article.content}</p>
              </article>
            </>
          ) : (
            <div>Article not found.</div>
          )}
          {article && article.video_path && (
            <div className="mb-6">
              <video controls className="w-full rounded border">
                <source
                  src={`https://marinnews-api.legitinfosystem.online/${article.video_path.replace(
                    /\\/g,
                    "/"
                  )}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              <div className="text-xs text-gray-500 mt-2">
                Video: {article.title}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 md:col-span-3 col-span-12 space-y-6">
          <div className="bg-green-100 p-4 rounded shadow text-center">
            <h3 className="font-bold mb-2">
              BE PREPARED FOR YOUR SUPPLY CHAIN
            </h3>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              Ad
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold text-blue-800 mb-4">
              Maritime Executive
            </h2>
            <div className="h-20 bg-gray-200 rounded mb-2 flex items-center justify-center">
              Ad
            </div>
            <div className="h-20 bg-gray-200 rounded flex items-center justify-center">
              Ad
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-4">FEATURED STORIES</h2>
            <div className="h-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
