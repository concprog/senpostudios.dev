'use client';
import { motion } from 'framer-motion';
import { Pixelify_Sans } from 'next/font/google';
import { OptimizedParticleSystem } from './OptimizedParticleSystem';

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

// Our Goal Section Component
const OurGoalSection = () => {
  return (
    <div className="relative z-20 px-8 py-16 our-goal-section pointer-events-none">
      {/* Main heading positioned on the left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 ml-8 pointer-events-none"
      >
        <h1 className={`${pixelifySans.className} text-5xl md:text-6xl font-bold text-yellow-400 mb-4 ml-12 mt-12`}>
          Our Goal
        </h1>
        <div className="w-32 h-1 bg-yellow-400 ml-22"></div>
      </motion.div>
      
      {/* Three cards container */}
      <div className="flex gap-8 max-w-7xl mx-auto pointer-events-none">
        {[
          { 
            title: "Optimized", 
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque is, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa"
          },
          { 
            title: "AI the right way", 
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque is, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa"
          },
          { 
            title: "Immersive", 
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque is, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa"
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 * index }}
            className="flex-1 bg-[rgba(68,30,77,0.38)] backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 shadow-xl flex flex-col min-h-[400px] pointer-events-none"
            style={{
              background: 'rgba(68, 30, 77, 0.38)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <h2 className={`${pixelifySans.className} text-3xl font-bold text-orange-400 mb-6 pointer-events-none`}>
              {item.title}
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm flex-1 pointer-events-none">
              {item.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Component
export const OurGoalBackground = () => {
  return (
    <div className="relative min-h-screen w-full our-goal-section overflow-hidden">
      <OptimizedParticleSystem 
        imagePath="/image17.png" 
        sectionClassName="our-goal-section"
        intensity={0.5}
      />
      
      <OurGoalSection />
    </div>
  );
};