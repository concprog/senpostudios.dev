'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pixelify_Sans } from 'next/font/google';
import { OptimizedParticleSystem } from './OptimizedParticleSystem';

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

// Define letter patterns for "Senpo Studios"
const letterPatterns = {
  S: [
    [1,0], [2,0], [3,0],
    [0,1], 
    [0,2], [1,2],
    [0,3], [2,3], [3,3],
    [3,4],
    [0,5], [3,5],
    [1,6], [2,6], [3,6]
  ],
  E: [
    [0,0], [1,0], [2,0], [3,0],
    [0,1],
    [0,2], 
    [0,3],[1,3],[2,3],
    [0,4],
    [0,5],
    [0,6], [1,6], [2,6], [3,6]
  ],
  N: [
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
    [1,1],
    [2,2],
    [3,3], [3,4], [3,5], [3,6]
  ],
  P: [
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
    [1,0], [2,0], [3,0],
    [3,1], [3,2],
    [1,3], [2,3], [3,3]
  ],
  O: [
    [1,0], [2,0],
    [0,1], [3,1],
    [0,2], [3,2],
    [0,3], [3,3],
    [0,4], [3,4],
    [0,5], [3,5],
    [1,6], [2,6]
  ],
  T: [
    [0,0], [1,0], [2,0], [3,0],
    [1,1], [1,2], [1,3], [1,4], [1,5], [1,6]
  ],
  U: [
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5],
    [3,0], [3,1], [3,2], [3,3], [3,4], [3,5],
    [1,6], [2,6]
  ],
  D: [
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
    [1,0], [2,0],
    [3,1], [3,2], [3,3], [3,4], [3,5],
    [1,6], [2,6]
  ],
  I: [
    [0,0], [1,0], [2,0], [3,0],
    [1,1], [1,2], [1,3], [1,4], [1,5],
    [0,6], [1,6], [2,6], [3,6]
  ],
  ' ': [] // Space character
};

// Pixelated Text Animation Component
const PixelatedText = ({ isFormed }: { isFormed: boolean }) => {
  const lines = ["SENPO", "STUDIOS"];
  
  // Calculate text positions
  const getTextPositions = () => {
    const positions: { x: number; y: number }[] = [];
    const scale = 12;
    const letterSpacing = 10;
    const lineHeight = 12 * scale;
    const startX = window.innerWidth * 0.15;
    const startY = window.innerHeight / 2 - lineHeight;
    
    lines.forEach((line, lineIndex) => {
      const letters = line.split("");
      let currentX = startX;
      const currentY = startY + lineIndex * lineHeight;
      
      letters.forEach((letter) => {
        if (letter === " ") {
          currentX += letterSpacing * scale;
          return;
        }
        
        const pattern = letterPatterns[letter as keyof typeof letterPatterns];
        if (pattern) {
          pattern.forEach(([x, y]) => {
            for (let offsetX = 0; offsetX < 2; offsetX++) {
              for (let offsetY = 0; offsetY < 2; offsetY++) {
                positions.push({
                  x: currentX + x * scale + offsetX * 2,
                  y: currentY + y * scale + offsetY * 2,
                });
              }
            }
          });
        }
        
        currentX += letterSpacing * scale;
      });
    });
    
    return positions;
  };
  
  const textPositions = useMemo(() => getTextPositions(), []);
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Text Pixels */}
      {textPositions.map((pos, index) => (
        <motion.div
          key={`text-${index}`}
          className="absolute rounded-sm bg-yellow-400"
          style={{
            width: 9,
            height: 12,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            x: isFormed ? pos.x : Math.random() * window.innerWidth,
            y: isFormed ? pos.y : Math.random() * window.innerHeight,
            opacity: isFormed ? 1 : 0,
          }}
          transition={{
            duration: 0.5,
            delay: isFormed ? index * 0.005 : 0,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Main Component
export const ThreePixelBackground = () => {
  const [textFormed, setTextFormed] = useState(false);
  const [showText, setShowText] = useState(false);
  
  // Automatically show text after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
      setTextFormed(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="landing-section relative h-screen w-full overflow-hidden">
      <OptimizedParticleSystem 
        imagePath="/Frame1.png" 
        sectionClassName="landing-section"
        intensity={0.8}
      />
      
      {showText && <PixelatedText isFormed={textFormed} />}
      
      {/* Click instruction */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <motion.button
          className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-sm"
          onClick={() => setTextFormed(!textFormed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {textFormed ? "Scatter Text" : "Form Text"}
        </motion.button>
      </div>
    </div>
  );
};