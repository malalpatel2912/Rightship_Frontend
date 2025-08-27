'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import DOMPurify from 'dompurify';

const PreCourseCalendar = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState({ '1': 0 });

  const ITEMS_PER_SLIDE = {
    mobile: 2,
    tablet: 4,
    desktop: 6
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const itemsPerSlide = window.innerWidth < 640 ? ITEMS_PER_SLIDE.mobile : 
                           window.innerWidth < 1024 ? ITEMS_PER_SLIDE.tablet : 
                           ITEMS_PER_SLIDE.desktop;
      const totalSlides = Math.ceil(courses.length / itemsPerSlide);
      
      if (totalSlides <= 1) return;

      setCurrentSlide(prev => ({
        '1': prev['1'] >= totalSlides - 1 ? 0 : prev['1'] + 1
      }));
    }, 10000);

    
    return () => clearInterval(interval);
  }, [currentSlide, courses, categories]);


  
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/course/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 1,
          limit: 100,
          category_id: '6791f751a7ab08416474022a' // Replace with actual category ID
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    if (course.course_type === 'monthly') {
      setLoading(true);
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/course/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_id: course._id })
        });
        const data = await response.json();
        if (data.code === 200 && data.courses.length > 0) {
          const courseDetails = data.courses[0];
          setSelectedCourse(courseDetails);
          setSeatAvailability(courseDetails.seats_availability || {});
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevSlide = (categoryId) => {
    setCurrentSlide(prev => ({
      ...prev,
      [categoryId]: Math.max(0, prev[categoryId] - 1)
    }));
  };

  const handleNextSlide = (categoryId) => {
    const categoryItems = courses.filter(course => course.category === categoryId);
    const maxSlides = Math.ceil(categoryItems.length / ITEMS_PER_SLIDE.desktop) - 1;
    setCurrentSlide(prev => ({
      ...prev,
      [categoryId]: Math.min(maxSlides, prev[categoryId] + 1)
    }));
  };

  const renderCourseList = () => {
    const categoryId = '1'; // Using single category for pre-sea courses
    const totalSlides = Math.ceil(courses.length / ITEMS_PER_SLIDE.desktop);
    const currentItems = courses.slice(
      currentSlide[categoryId] * ITEMS_PER_SLIDE.desktop,
      (currentSlide[categoryId] + 1) * ITEMS_PER_SLIDE.desktop
    );

    const showPrevButton = currentSlide[categoryId] > 0;
    const showNextButton = currentSlide[categoryId] < totalSlides - 1;
    const showIndicators = totalSlides > 1;

    return (
      <div className="bg-[#EFF7FF] py-8 md:py-16">
        <div className="container mx-auto px-4 relative">
          {showPrevButton && (
            <button 
              onClick={() => handlePrevSlide(categoryId)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10"
            >
              <ChevronLeft className="h-4 md:h-6 w-4 md:w-6 text-gray-600" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-6xl">
            {currentItems.map((course) => (
              <div
                key={course._id}
                onClick={() => handleCourseClick(course)}
                className="p-4 md:p-8 py-8 md:py-16 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-white"
              >
                <h3 className="text-lg md:text-2xl font-bold mb-3 text-center">{course.title}</h3>
                <p className="text-sm md:text-base text-gray-600 text-center">{course.subtitle}</p>
              </div>
            ))}
          </div>

          {showNextButton && (
            <button 
              onClick={() => handleNextSlide(categoryId)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-8 md:w-10 h-8 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10"
            >
              <ChevronRight className="h-4 md:h-6 w-4 md:w-6 text-gray-600" />
            </button>
          )}

          {showIndicators && (
            <div className="flex justify-center mt-6 md:mt-8 gap-2">
              {[...Array(totalSlides)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 md:h-2 w-1.5 md:w-2 rounded-full ${
                    index === currentSlide[categoryId] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendarModal = () => (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-blue-900">
            {selectedCourse?.title}
          </h2>
          <p className="text-sm md:text-base text-gray-500">{selectedCourse?.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 md:h-6 w-5 md:w-6" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-4 md:h-5 w-4 md:w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-4 md:h-5 w-4 md:w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                    <th key={day} className="p-2 font-medium text-xs md:text-sm">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderCalendar()}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2 text-xs md:text-sm text-gray-600">
            {selectedCourse?.enquiries_email && (
              <p>Email at - <span className="text-blue-600">{selectedCourse.enquiries_email}</span></p>
            )}
            {selectedCourse?.whatsapp_number && (
              <p>WhatsApp on - <span className="text-blue-600">{selectedCourse.whatsapp_number}</span></p>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderAnnualModal = () => (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">{selectedCourse.title}</h2>
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-y-auto flex-grow">
        <div className="space-y-4">
          <p className="text-lg text-gray-700">{selectedCourse.subtitle}</p>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(selectedCourse.description) 
            }}
          />
        </div>
      </div>

      <div className="p-6 border-t mt-auto">
        <div className="space-y-2 text-sm text-gray-600">
        <div className="space-y-2 text-xs md:text-sm text-gray-600"><p>For further enquiries call on - <span className="text-blue-600"> 0 22 4516 4128, 0 22 4516 4141 </span></p><p>WhatsApp on - <span className="text-blue-600"> +91 7738350137, +91 7738350138</span></p><p>Email at - <span className="text-blue-600">info@rightships.com</span></p></div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const weeks = [];
    let days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-${i}`} className="border p-2 md:p-3"></td>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const availability = selectedCourse?.seats_availability?.find(seat => seat.date === dateStr);
      
      days.push(
        <td key={day} className="border p-2 md:p-3 text-center relative">
          {availability && <div className="absolute inset-0 bg-blue-100 opacity-20"></div>}
          <div className="relative z-10">
            <div className="text-sm md:text-base">{day}</div>
            {availability && (
              <div className="text-xs text-gray-600">{availability.seats} seats</div>
            )}
          </div>
        </td>
      );

      if (days.length === 7) {
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
        days = [];
      }
    }

    // Add empty cells for days after the last day of the month
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(
          <td 
            key={`empty-end-${days.length}`} 
            className="border p-2 md:p-3 text-center text-gray-400"
          >
          </td>
        );
      }
      weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    }

    return weeks;
  };

  return (
    <>
      <section className="relative h-[300px] md:h-[500px] overflow-hidden">
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

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <h2 className="text-3xl md:text-5xl font-bold text-white px-4">
            Pre Sea Course
          </h2>
        </div>
      </section>

    
      <div className="">
        {renderCourseList()}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {selectedCourse?.course_type === 'annual' ? renderAnnualModal() : renderCalendarModal()}
          </div>
        )}
      </div>
    </>
  );
};

export default PreCourseCalendar;