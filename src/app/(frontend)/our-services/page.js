import React from 'react'



export default function SevicePage() {

    const f1 = '../services/2.webp';
    const f2 = '../services/3.webp';
    const f3 = '../services/4.webp';
    const f4 = '../services/5.webp';
    const f5 = '../services/6.webp';
    const f6 = '../services/7.webp';
    const f7 = '../services/8.webp';
    const f9 = '../services/9.webp';

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
                        OUR SERVICES
                    </h2>
                </div>
            </section>

            <section className="py-8 md:py-16">
                <div className='mx-auto w-[90%] md:w-4/5'>
                    <p className="text-center text-lg md:text-xl font-light leading-7 md:leading-8">
                        Our platform connects skilled seafarers with reputed shipping companies through verified job postings and personalized profile matching. We offer guidance on interview preparation, document submission, certifications, and CDC updates, along with regular updates on global shipping job opportunities.
                    </p>
                </div>
            </section>

            <section className='py-8 md:py-16 bg-[#EFF7FF]'>

                <div className="max-w-6xl mx-auto p-6 space-y-12">
                    {/* Job Portal Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f1}
                                alt="Person using laptop with Job Portal"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Job Portal</h2>
                            <p className="text-gray-600 leading-relaxed">
                                RightShip's job portal is a platform dedicated to facilitating connections
                                between seafarers and reputable shipping companies. It is part of RightShip, a
                                global maritime organization known for promoting safe, sustainable, and
                                socially responsible shipping practices. The portal primarily focuses on making
                                the hiring process transparent and efficient for seafarers while helping
                                shipowners access a pool of verified talent.
                            </p>
                        </div>
                    </div>

                    {/* Pre-Sea Training Section */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f2}
                                alt="Maritime officers examining diagrams"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Pre-Sea Training</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We offer specialized training for seafarers, including basic seamanship and
                                safety for Ratings, navigation and leadership for Deck Cadets, machinery
                                maintenance for TMEs, and electronics training for ETOs. Partnering with DG-
                                approved institutes, we assist in course selection to match your career goals,
                                qualifications, and aspirations. Our programs are designed to ensure a strong
                                foundation for a successful maritime career.
                            </p>
                        </div>
                    </div>

                    {/* Job Portal Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f3}
                                alt="Person using laptop with Job Portal"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Post- Sea Training</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We offer comprehensive STCW courses, including basic modules like PSSR, PST, EFA, FPFF, and advanced modules such as AFF and PSCRB. Our advanced safety courses provide management-level training for career progression. With end-to-end booking support and real-time availability, we guide you on mandatory courses essential for career growth and specific shipping line requirements.
                            </p>
                        </div>
                    </div>

                    {/* Pre-Sea Training Section */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f9}
                                alt="Maritime officers examining diagrams"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Flag Documentation Services</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We assist seafarers with flag state certifications for popular flags like Panama, Honduras, and Cook Islands. Our services include application, renewal, and document verification, ensuring compliance with international standards. With fast-track processing and guidance on prerequisites, we streamline the certification process for your convenience.
                            </p>
                        </div>
                    </div>


                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f6}
                                alt="Person using laptop with Job Portal"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Travel and Accommodation Solutions</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We provide affordable, safe, and seafarer-friendly accommodation options near maritime institutes and port cities. Our accommodations are designed to offer comfort and convenience for seafarers, ensuring a hassle-free stay while pursuing their training or working in key maritime locations. With a focus on quality and security, we make it easy for seafarers to find reliable housing that suits their needs and budget.
                            </p>
                        </div>
                    </div>

                    {/* Pre-Sea Training Section */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f7}
                                alt="Maritime officers examining diagrams"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Cheapest Ticket Booking</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We’ve partnered with travel agencies to offer discounted flight tickets for seafarers, ensuring cost-effective travel for training and job assignments. We also provide special deals on group travel and last-minute bookings, helping seafarers save on travel expenses. Our goal is to make travel more convenient and affordable, so seafarers can focus on their careers while enjoying exclusive offers.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f4}
                                alt="Person using laptop with Job Portal"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Airport Pickups and Local Transportation.</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We offer comprehensive support with travel documentation, including visa assistance for seafarers. Our services ensure that all necessary paperwork is handled smoothly and efficiently, helping seafarers meet the requirements for international travel. With expert guidance, we streamline the visa application process, ensuring that seafarers can focus on their careers without the stress of travel documentation.
                            </p>
                        </div>
                    </div>

                    {/* Pre-Sea Training Section */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <img
                                src={f5}
                                alt="Maritime officers examining diagrams"
                                className="rounded-lg shadow-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">CDC Services</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We provide full support for Continuous Discharge Certificates (CDC), including applications, renewals, replacements of lost or damaged certificates, and updating sea service records. We assist with CDCs for India and other international flags, ensuring a smooth process for seafarers to maintain essential documentation for their maritime careers.
                            </p>
                        </div>
                    </div>


                </div>

            </section>

            <section className="py-8 md:py-16">
                <div className='mx-auto w-[90%] md:w-4/5'>
                    <p className="text-center text-lg md:text-xl font-light leading-7 md:leading-8">
                        These services provide a one-stop solution for seafarers at every stage of their careers. If you’re managing these offerings, promoting them through a professional website, social media, and seafarer networks will be key to success.
                    </p>
                </div>
            </section>

        </div>
    );
}
