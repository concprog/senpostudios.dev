// File: src/app/landing-page.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VignetteBackground from './vignette-background';

const LandingPage = () => {
  const [isTextFormed, setIsTextFormed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextFormed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
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
        <ambientLight intensity={0.5} />
        <VignetteBackground
          text="senpo studios"
          formText={isTextFormed}
        />
      </Canvas>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <motion.button
          className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-sm"
          onClick={() => setIsTextFormed(!isTextFormed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isTextFormed ? 'Scatter' : 'Form'}
        </motion.button>
      </div>
    </div>
  );
};

export default LandingPage;
