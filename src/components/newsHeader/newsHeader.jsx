import Link from "next/link";
import Image from "next/image";

export default function NewsHeader() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-6 px-4">
        <div className="flex items-center space-x-4">
          {/* <Link href="/news">
            <Image
              src="/logo-maritime-executive.png"
              alt="The Maritime Executive"
              width={300}
              height={80}
              className="object-contain cursor-pointer"
            />
          </Link> */}
        </div>
        <h1 className="text-5xl font-bold text-black whitespace-nowrap">
          Media Kit 2025
        </h1>
      </div>
      <nav className="max-w-7xl mx-auto px-4 flex flex-wrap space-x-6 text-base content-center font-semibold py-2">
        <a href="/news/about-us" className="text-gray-600 hover:text-blue-700">
          About Us
        </a>
        <a href="/news/magazine" className="text-blue-700">
          Magazine
        </a>
        <a href="/news/newsletter" className="text-blue-700">
          Newsletter
        </a>
        <a href="/news/website" className="text-blue-700">
          Website
        </a>
        <a href="/news/email-marketing" className="text-blue-700">
          Email Marketing
        </a>
        <a href="/news/content-marketing" className="text-blue-700">
          Content Marketing
        </a>
        <a href="/news/jobs-board" className="text-blue-700">
          Jobs Board
        </a>
        <a href="/news/podcast" className="text-blue-700">
          Podcast
        </a>
        <a href="/news/posidonia" className="text-blue-700">
          Posidonia
        </a>
      </nav>
    </header>
  );
}
