'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Search, Calendar, Info } from 'lucide-react';
import DOMPurify from 'dompurify';

const PostCourseCalendar = () => {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState({});
  const [isHovering, setIsHovering] = useState({});
  const [activeGroup, setActiveGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const carouselRefs = useRef({});
  const groupRefs = useRef({});

  const ITEMS_PER_SLIDE = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchGroups();
    // Setup scroll event listener for sticky navigation
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    // Find which group is currently in view
    if (groups.length === 0 || Object.keys(groupRefs.current).length === 0) return;
    
    const scrollPosition = window.scrollY + 100;
    
    for (const groupId in groupRefs.current) {
      const ref = groupRefs.current[groupId];
      if (!ref) continue;
      
      const element = ref;
      if (!element) continue;
      
      const offsetTop = element.offsetTop;
      const height = element.offsetHeight;
      
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
        setActiveGroup(groupId);
        break;
      }
    }
  };

  useEffect(() => {
    // Setup autoplay for each group carousel that's not being hovered
    const intervalIds = {};

    groups.forEach(group => {
      const groupCoursesList = groupCourses(group.group_id);
      
      // Skip empty groups
      if (groupCoursesList.length === 0) return;
      
      // Calculate the total slides correctly
      const itemsPerSlide = window.innerWidth < 640 ? ITEMS_PER_SLIDE.mobile : 
                          window.innerWidth < 1024 ? ITEMS_PER_SLIDE.tablet : 
                          ITEMS_PER_SLIDE.desktop;
      
      // Build slides array to get accurate count
      const slides = [];
      for (let i = 0; i < groupCoursesList.length; i += itemsPerSlide) {
        const slideItems = groupCoursesList.slice(i, i + itemsPerSlide);
        if (slideItems.length > 0) {
          slides.push(slideItems);
        }
      }
      
      const slidesCount = slides.length;
      
      // Only setup autoplay if there are multiple slides and not being hovered
      if (slidesCount > 1 && !isHovering[group.group_id]) {
        intervalIds[group.group_id] = setInterval(() => {
          handleSlideChange(group.group_id, 'next');
        }, 5000); // 5 second interval for auto-sliding
      }
    });

    // Cleanup intervals
    return () => {
      Object.values(intervalIds).forEach(id => clearInterval(id));
    };
  }, [groups, currentSlide, isHovering, searchTerm]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courseCategoryGroup/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: '6791f761a7ab08416474022b',
          page: 1,
          limit: 100
        })
      });
      const data = await response.json();
      if (data.code === 200) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setActiveGroup(data.groups[0].group_id);
        }
        const initialSlides = {};
        const initialHoverState = {};
        data.groups.forEach(group => {
          initialSlides[group.group_id] = 0;
          initialHoverState[group.group_id] = false;
          carouselRefs.current[group.group_id] = React.createRef();
          groupRefs.current[group.group_id] = null;
        });
        setCurrentSlide(initialSlides);
        setIsHovering(initialHoverState);
        fetchCourses();
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/course/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 1,
          limit: 100,
          category_id: '6791f761a7ab08416474022b'
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

  const groupCourses = (groupId) => {
    const filteredCourses = courses.filter(course => course.group_id === groupId);
    
    if (searchTerm) {
      return filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredCourses;
  };

  const handleSlideChange = (groupId, direction) => {
    const groupCoursesList = groupCourses(groupId);
    const itemsPerSlide = window.innerWidth < 640 ? ITEMS_PER_SLIDE.mobile : 
                         window.innerWidth < 1024 ? ITEMS_PER_SLIDE.tablet : 
                         ITEMS_PER_SLIDE.desktop;
    
    // Calculate the actual number of slides needed
    const slides = [];
    for (let i = 0; i < groupCoursesList.length; i += itemsPerSlide) {
      const slideItems = groupCoursesList.slice(i, i + itemsPerSlide);
      if (slideItems.length > 0) {
        slides.push(slideItems);
      }
    }
    
    const maxSlides = slides.length;
    
    // Don't attempt to change slides if there's only one or zero slides
    if (maxSlides <= 1) return;
    
    if (direction === 'prev') {
      setCurrentSlide(prev => ({
        ...prev,
        [groupId]: (prev[groupId] <= 0) ? maxSlides - 1 : prev[groupId] - 1
      }));
    } else {
      setCurrentSlide(prev => ({
        ...prev,
        [groupId]: (prev[groupId] >= maxSlides - 1) ? 0 : prev[groupId] + 1
      }));
    }
  };

  const handlePrevSlide = (groupId) => {
    handleSlideChange(groupId, 'prev');
  };

  const handleNextSlide = (groupId) => {
    handleSlideChange(groupId, 'next');
  };

  const handleMouseEnter = (groupId) => {
    setIsHovering(prev => ({
      ...prev,
      [groupId]: true
    }));
  };

  const handleMouseLeave = (groupId) => {
    setIsHovering(prev => ({
      ...prev,
      [groupId]: false
    }));
  };

  const scrollToGroup = (groupId) => {
    const element = groupRefs.current[groupId];
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveGroup(groupId);
    }
  };

  const renderSideNavigation = () => {
    // Only show side navigation if we have valid groups with courses
    const validGroups = groups.filter(group => {
      const groupCoursesList = groupCourses(group.group_id);
      return groupCoursesList.length > 0;
    });
    
    if (validGroups.length === 0) return null;
    
    return (
      <div className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-r-lg z-20">
        <div className="py-4 px-2">
          {validGroups.map(group => (
            <div 
              key={group.group_id}
              onClick={() => scrollToGroup(group.group_id)}
              className={`cursor-pointer my-2 px-3 py-2 rounded transition-all ${
                activeGroup === group.group_id ? 
                'bg-blue-50 border-l-4 border-blue-500 font-medium' : 
                'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm whitespace-nowrap">{group.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSearchBar = () => {
    // Only show groups with courses
    const validGroups = groups.filter(group => groupCourses(group.group_id).length > 0);
    
    if (validGroups.length === 0) return null;
    
    return (
      <div className="sticky top-0 z-30 bg-white shadow-md py-3 px-4 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 w-full md:w-auto mb-3 md:mb-0">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {validGroups.map(group => (
              <button
                key={group.group_id}
                onClick={() => scrollToGroup(group.group_id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeGroup === group.group_id ?
                  'bg-blue-500 text-white' :
                  'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCourseList = () => {
    if (loading && courses.length === 0) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return groups.map(group => {
      const groupCoursesList = groupCourses(group.group_id);
      
      // Skip rendering if there are no courses in this group
      if (groupCoursesList.length === 0) return null;
      
      const itemsPerSlide = window.innerWidth < 640 ? ITEMS_PER_SLIDE.mobile : 
                           window.innerWidth < 1024 ? ITEMS_PER_SLIDE.tablet : 
                           ITEMS_PER_SLIDE.desktop;
      
      // Calculate the actual number of slides needed
      const slides = [];
      for (let i = 0; i < groupCoursesList.length; i += itemsPerSlide) {
        const slideItems = groupCoursesList.slice(i, i + itemsPerSlide);
        if (slideItems.length > 0) {
          slides.push(slideItems);
        }
      }
      
      const totalSlides = slides.length - 1;

      // Only render this group if it has valid slides
      if (totalSlides === 0) return null;

      // Initialize current slide index if not already set or is out of bounds
      if (currentSlide[group.group_id] === undefined || currentSlide[group.group_id] >= totalSlides) {
        setCurrentSlide(prev => ({...prev, [group.group_id]: 0}));
      }

      return (
        <div 
          key={group.group_id} 
          className={`py-14 ${groups.indexOf(group) % 2 === 0 ? 'bg-[#F9FBFF]' : 'bg-[#EFF7FF]'}`}
          ref={el => groupRefs.current[group.group_id] = el}
          id={`group-${group.group_id}`}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 capitalize">
              <span className="bg-gradient-to-r from-[#1079B5] to-[#C11010] bg-clip-text text-transparent">
                {group.name}
              </span>
            </h2>
            
            <div 
              className="relative overflow-hidden rounded-lg"
              onMouseEnter={() => handleMouseEnter(group.group_id)}
              onMouseLeave={() => handleMouseLeave(group.group_id)}
              ref={el => carouselRefs.current[group.group_id] = el}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide[group.group_id] * 100}%)` }}
              >
                {slides.map((slideItems, i) => (
                  <div 
                    key={i}
                    className="carousel-slide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-6xl w-full flex-shrink-0 px-8 py-4"
                  >
                    {slideItems.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => handleCourseClick(course)}
                        className={`p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col ${groups.indexOf(group) % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-white to-blue-50'}`}
                      >
                        <div className="flex items-center justify-center mb-3">
                          {course.course_type === 'monthly' ? (
                            <Calendar className="h-8 w-8 text-blue-500" />
                          ) : (
                            <Info className="h-8 w-8 text-blue-500" />
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-3 text-center text-gray-800">{course.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 text-center flex-grow">{course.subtitle}</p>
                        <div className="mt-4 text-center">
                          <span className="inline-block px-4 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {course.course_type === 'monthly' ? 'Monthly Schedule' : 'Course Details'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {totalSlides > 1 && (
                <>
                  <button 
                    onClick={() => handlePrevSlide(group.group_id)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10 hover:bg-blue-50 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6 text-blue-600" />
                  </button>

                  <button 
                    onClick={() => handleNextSlide(group.group_id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10 hover:bg-blue-50 transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6 text-blue-600" />
                  </button>

                  <div className="flex justify-center mt-8 gap-2">
                    {[...Array(totalSlides)].map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide[group.group_id] 
                            ? 'w-6 bg-blue-600' 
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        onClick={() => setCurrentSlide(prev => ({...prev, [group.group_id]: index}))}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderCalendarModal = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-blue-900">
            {selectedCourse?.title}
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-1">{selectedCourse?.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading calendar data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 bg-blue-50 p-3 rounded-lg">
            <h3 className="text-lg md:text-xl font-medium text-blue-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-blue-700" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-blue-700" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                    <th key={day} className="p-2.5 font-medium text-sm text-gray-600 border-b">
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

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Call: <span className="text-blue-600 font-medium">0 22 4516 4128, 0 22 4516 4141</span></p>
              <p>WhatsApp: <span className="text-blue-600 font-medium">+91 7738350137, +91 7738350138</span></p>
              <p>Email: <span className="text-blue-600 font-medium">info@rightships.com</span></p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAnnualModal = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">{selectedCourse.title}</h2>
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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

      <div className="p-6 border-t mt-auto bg-gray-50">
        <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Call: <span className="text-blue-600 font-medium">0 22 4516 4128, 0 22 4516 4141</span></p>
          <p>WhatsApp: <span className="text-blue-600 font-medium">+91 7738350137, +91 7738350138</span></p>
          <p>Email: <span className="text-blue-600 font-medium">info@rightships.com</span></p>
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
      days.push(<td key={`empty-${i}`} className="border p-2.5 bg-gray-50"></td>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const availability = selectedCourse?.seats_availability?.find(seat => seat.date === dateStr);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <td 
          key={day} 
          className={`border p-2.5 text-center relative ${
            isToday ? 'bg-blue-50' : availability ? 'bg-green-50' : ''
          }`}
        >
          <div className="relative z-10">
            <div className={`text-sm md:text-base ${isToday ? 'font-bold text-blue-700' : ''}`}>
              {day}
            </div>
            {availability && (
              <div className="text-xs text-green-600 font-medium mt-1">
                {availability.seats} seats
              </div>
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
            className="border p-2.5 bg-gray-50"
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40"></div>

        <div className="relative z-10 flex items-center justify-center h-full container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Post Sea Courses
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto text-base md:text-lg">
              Explore our comprehensive range of post-sea training courses designed for maritime professionals
            </p>
          </div>
        </div>
      </section>
      
      {renderSearchBar()}

      <div className="bg-[#EFF7FF] pb-12">
        {renderSideNavigation()}
        {renderCourseList()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          {selectedCourse?.course_type === 'annual' ? renderAnnualModal() : renderCalendarModal()}
        </div>
      )}
    </>
  );
};

export default PostCourseCalendar;