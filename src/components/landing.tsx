'use client';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Pixelify_Sans } from 'next/font/google'

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

// Three.js Pixel Particles Background
const PixelParticles = () => {
  const texture = useLoader(TextureLoader, '/Frame1.png');
  const mouse = useRef<[number, number]>([9999, 9999]);
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = [];
    const colors = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    ctx.drawImage(texture.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Scale factor to fit the image in the viewport
    const scale = Math.min(window.innerWidth, window.innerHeight) / Math.max(canvas.width, canvas.height) * 1.725;
    
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        if (a > 0) {
          const px = (x - canvas.width / 2) * scale;
          const py = (canvas.height / 2 - y) * scale;
          const pz = 0;
          positions.push(px, py, pz);
          colors.push(r / 255, g / 255, b / 255);
        }
      }
    }
    
    return {
      count: positions.length / 3,
      positions: new Float32Array(positions),
      basePositions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, [texture]);
  
  useFrame(({ mouse: m }) => {
    // Fix mouse coordinate conversion - remove the negative sign for Y
    const mouseX = (m.x * window.innerWidth) / 2;
    const mouseY = (m.y * window.innerHeight) / 2; // Removed negative sign
    mouse.current = [mouseX, mouseY];
    
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const base = particles.basePositions;
    
    for (let i = 0; i < positions.length; i += 3) {
      const dx = positions[i] - mouse.current[0];
      const dy = positions[i + 1] - mouse.current[1];
      
      // Create pixelated distance calculation
      const pixelSize = 12;
      const gridX = Math.floor(dx / pixelSize) * pixelSize;
      const gridY = Math.floor(dy / pixelSize) * pixelSize;
      const pixelatedDist = Math.max(Math.abs(gridX), Math.abs(gridY));
      
      const radius = 45;
      const force = pixelatedDist < radius ? 1 : 0;
      
      if (force) {
        // Pixelated movement in 8-directional grid
        const moveStep = 8;
        let moveX = 0, moveY = 0;
        
        // Only move if not already at the edge to prevent jitter
        if (pixelatedDist < radius - pixelSize) {
          if (Math.abs(gridX) > Math.abs(gridY)) {
            moveX = gridX > 0 ? moveStep : -moveStep;
          } else {
            moveY = gridY > 0 ? moveStep : -moveStep;
          }
          
          // Add diagonal movement for 8-direction effect
          if (Math.abs(gridX) === Math.abs(gridY)) {
            moveX = gridX > 0 ? moveStep : -moveStep;
            moveY = gridY > 0 ? moveStep : -moveStep;
          }
          
          positions[i] += moveX;
          positions[i + 1] += moveY;
        }
      } else {
        // Pixelated return movement
        const returnX = (base[i] - positions[i]);
        const returnY = (base[i + 1] - positions[i + 1]);
        
        const step = 4;
        if (Math.abs(returnX) > step) {
          positions[i] += returnX > 0 ? step : -step;
        } else {
          positions[i] = base[i];
        }
        
        if (Math.abs(returnY) > step) {
          positions[i + 1] += returnY > 0 ? step : -step;
        } else {
          positions[i + 1] = base[i + 1];
        }
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={particles.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
          count={particles.count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={6}
        sizeAttenuation={false}
      />
    </points>
  );
};

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
    <div className="relative h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 500], fov: 75 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          background: 'black',
        }}
      >
        <ambientLight />
        <PixelParticles />
      </Canvas>
      
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