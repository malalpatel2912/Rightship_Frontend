'use client';

import Link from 'next/link';

const HeroSection2 = () => {
  return (
    <div className="relative py-60 w-full overflow-hidden">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="https://videos.pexels.com/video-files/2942803/2942803-uhd_2560_1440_24fps.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <h1 className="text-white font-poppins font-bold text-4xl md:text-[48px] leading-[1.2] text-center mb-12">
          Fill your dreams here with RightShips
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Job Seeker Button */}
          <div className="flex flex-col items-center">
            <Link href="/login" className="flex items-center justify-center gap-2 bg-[#084C73] text-white px-8 py-3 rounded-lg font-normal text-xl md:text-2xl leading-9 hover:bg-[#063a58] transition-colors">
              I want a Job
              <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.9997 26.1666C20.443 26.1666 25.6663 20.9433 25.6663 14.5C25.6663 8.05666 20.443 2.83331 13.9997 2.83331C7.55635 2.83331 2.33301 8.05666 2.33301 14.5C2.33301 20.9433 7.55635 26.1666 13.9997 26.1666Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.2999 17.7999V11.2002H10.7002" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.7002 17.7998L17.2999 11.2001" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <span className="text-white font-medium text-base leading-6 mt-2">
              For Candidate
            </span>
          </div>
          
          {/* Employer Button */}
          <div className="flex flex-col items-center">
            <Link href="/company" className="flex items-center justify-center gap-2 bg-[#8B0606] text-white px-8 py-3 rounded-lg font-normal text-xl md:text-2xl leading-9 hover:bg-[#6b0505] transition-colors">
              I want to Hire
              <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.9997 26.1666C20.443 26.1666 25.6663 20.9433 25.6663 14.5C25.6663 8.05666 20.443 2.83331 13.9997 2.83331C7.55635 2.83331 2.33301 8.05666 2.33301 14.5C2.33301 20.9433 7.55635 26.1666 13.9997 26.1666Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.2999 17.7999V11.2002H10.7002" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.7002 17.7998L17.2999 11.2001" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <span className="text-white font-medium text-base leading-6 mt-2">
              For Company
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection2;
