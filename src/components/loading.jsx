import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = ({ message = "Loading..." }) => {
  // Animation variants for the circles
  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 0.5
      }
    })
  };

  // Animation for the text
  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.8
      }
    }
  };
  
  // Logo pulse animation
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        {/* Company logo placeholder */}
        <motion.div
          className="mb-6"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
        </motion.div>
        
        {/* Animated circles */}
        <div className="flex space-x-3 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-blue-500"
              variants={circleVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}
        </div>
        
        {/* Loading text */}
        <motion.div
          className="text-center"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <p className="text-gray-700 text-lg font-medium">{message}</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your dashboard</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingAnimation;