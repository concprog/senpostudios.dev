'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

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
    const scale = 12; // Increased scale for bolder appearance
    const letterSpacing = 10; // Increased from 6 to 8 for more gap between letters
    const lineHeight = 12 * scale; // Increased from 8 * scale to 12 * scale for more gap
    const startX = window.innerWidth * 0.15;
    const startY = window.innerHeight / 2 - lineHeight; // Center both lines
    
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
            // Add multiple pixels for each position to make it bolder
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
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Text Pixels */}
      {textPositions.map((pos, index) => (
        <motion.div
          key={`text-${index}`}
          className="absolute rounded-sm bg-yellow-400" // Changed from bg-white to bg-yellow-400
          style={{
            width: 9, // Increased size for bolder appearance
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
            delay: isFormed ? index * 0.005 : 0, // Reduced delay for smoother animation
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default PixelatedText;
