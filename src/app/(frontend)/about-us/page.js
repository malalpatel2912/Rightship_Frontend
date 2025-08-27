'use client'

import React from 'react'

export default function AboutUs() {
    return (
        <div>
          
          <section className="relative h-[300px] md:h-[500px] overflow-hidden">
          {/* Video Background */}
          <video 
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source 
              src="https://videos.pexels.com/video-files/2942803/2942803-uhd_2560_1440_24fps.mp4" 
              type="video/mp4" 
            />
          </video>
    
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
    
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <h2 className="text-3xl md:text-5xl font-bold text-white px-4">
              ABOUT RIGHTSHIPS
            </h2>
          </div>
        </section>
    
          <section className="py-8 md:py-16">
            <div className='mx-auto w-[90%] md:w-4/5'>
              <p className="text-center text-lg md:text-xl font-light leading-7 md:leading-8">
                RightShips job portal is a platform dedicated to facilitating connections between seafarers and reputable shipping companies. It is part of RightShipS, a global maritime organization known for promoting safe, sustainable, and socially responsible shipping practices. The portal primarily focuses on making the hiring process transparent and efficient for seafarers while helping shipowners access a pool of verified talent.
              </p>
            </div>
          </section>
    
          <section className='bg-[#EFF7FF]'>
            <div className="mx-auto w-[90%] md:w-4/5 py-8 md:py-16">
              <h5 className="mb-6 md:mb-10 bg-gradient-to-r from-[#1079B5] to-[#C11010] bg-clip-text text-center text-2xl md:text-4xl font-bold text-transparent">
                Features of RIGHTSHIP'S Job Portal
              </h5>
    
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    img: '../aboutUs/whyus/one.webp',
                    title: "Verified Job Listings",
                    description: "Ensures the authenticity of job opportunities, reducing the risk of fraudulent offers."
                  },
                  {
                    img: '../aboutUs/whyus/two.webp',
                    title: "Seafarer Profiles",
                    description: "Seafarers can create comprehensive profiles showcasing their qualifications, certifications, and experience, increasing their visibility to potential employers."
                  },
                  {
                    img: '../aboutUs/whyus/three.webp',
                    title: "Access to Reputable Employers",
                    description: "Connects seafarers with vetted shipping companies that meet RightShip's safety and compliance standards."
                  },
                  {
                    img: '../aboutUs/whyus/four.webp',
                    title: "Enhanced Compliance",
                    description: "Employers benefit from RightShip's vetting system, ensuring seafarers meet necessary certification and experience requirements."
                  },
                  {
                    img: '../aboutUs/whyus/five.webp',
                    title: "Global Reach",
                    description: "The platform caters to seafarers and employers worldwide, facilitating a diverse maritime workforce."
                  },
                  {
                    img: '../aboutUs/whyus/six.webp',
                    title: "User-friendly Interface",
                    description: "Easy navigation for both job seekers and employers, simplifying the hiring process."
                  }
                ].map((feature, index) => (
                  <div key={index} className="p-4 md:p-5 hover:bg-white rounded-lg transition-colors duration-300">
                    <img src={feature.img} alt="" className="mb-4 md:mb-5 mx-auto w-16 md:w-auto" />
                    <p className="text-xl md:text-2xl text-center mb-2 md:mb-3">{feature.title}</p>
                    <p className="text-center font-normal text-[16px] leading-[22.4px]">
                      {feature.description}
                    </p>
    
                  </div>
                ))}
              </div>
            </div>
          </section>
    
          <section className="py-8 md:py-16">
            <div className='mx-auto w-[90%] md:w-4/5'>
            <p className="text-center text-lg md:text-xl font-light leading-7 md:leading-8">
              This portal is part of RightShips broader efforts to enhance transparency, safety, and welfare within the maritime industry. It is an excellent resource for seafarers seeking legitimate job opportunities and for companies aiming to hire qualified personnel efficiently.
            </p>
    
            </div>
          </section>
    
        </div>
      );
}
