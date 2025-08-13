// @ts-nocheck
'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface OptimizedParticleSystemProps {
  imagePath: string;
  sectionClassName: string;
  intensity?: number;
}

// Three.js Pixel Particles Background Component
const PixelParticles = ({ imagePath, sectionClassName }: { imagePath: string; sectionClassName: string }) => {
  // ALL HOOKS MUST BE AT THE TOP - NEVER CONDITIONAL OR IN DIFFERENT ORDER
  const texture = useLoader(TextureLoader, imagePath);
  const mouse = useRef<[number, number]>([9999, 9999]);
  const lastMouseUpdate = useRef(Date.now());
  const pointsRef = useRef<THREE.Points>(null);
  const isMouseInSection = useRef(true);
  const frameSkip = useRef(0);
  const { viewport } = useThree();

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

    // Aggressive particle reduction for smooth performance
    const screenArea = window.innerWidth * window.innerHeight;

    // Much more aggressive step sizes to dramatically reduce particles
    let step = 4; // Base step for small screens
    if (screenArea > 1000000) step = 6; // Tablets and small laptops
    if (screenArea > 1500000) step = 8; // Medium screens (1366x768+)
    if (screenArea > 2000000) step = 12; // Large screens (1920x1080+)
    if (screenArea > 3000000) step = 16; // Very large screens (2560x1440+)
    if (screenArea > 4000000) step = 20; // Ultra-wide/4K screens

    console.log(`Screen area: ${screenArea}, Using step: ${step}`);

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
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

    console.log(`Total particles created: ${positions.length / 3}`);

    return {
      count: positions.length / 3,
      positions: new Float32Array(positions),
      basePositions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, [texture]);

  // Fixed mouse tracking with proper coordinate conversion
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const sectionElement = document.querySelector(`.${sectionClassName}`);

      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        const isInSection = (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        );

        isMouseInSection.current = isInSection;

        if (isInSection) {
          // Convert screen coordinates to Three.js world coordinates
          const x = ((clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((clientY - rect.top) / rect.height) * 2 + 1;

          // Convert to viewport coordinates
          const mouseX = (x * viewport.width) / 2;
          const mouseY = (y * viewport.height) / 2;

          mouse.current = [mouseX, mouseY];
          lastMouseUpdate.current = Date.now();
        }
      }
    };

    const handleScroll = () => {
      // Trigger mouse position update during scroll
      const lastKnownMouseEvent = new MouseEvent('mousemove', {
        clientX: window.lastMouseX || 0,
        clientY: window.lastMouseY || 0
      });
      handleMouseMove(lastKnownMouseEvent);
    };

    const handleMouseMoveWithTracking = (event: MouseEvent) => {
      // Store last known mouse position globally
      (window as any).lastMouseX = event.clientX;
      (window as any).lastMouseY = event.clientY;
      handleMouseMove(event);
    };

    const handleMouseLeave = () => {
      isMouseInSection.current = false;
      // Don't reset lastMouseUpdate - let particles return naturally
    };

    window.addEventListener('mousemove', handleMouseMoveWithTracking);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWithTracking);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [viewport, sectionClassName]);

  useFrame(() => {
    // Skip more frames for better performance
    const maxFPS = particles.count > 5000 ? 30 : 60; // Lower FPS for high particle counts
    const frameInterval = Math.floor(60 / maxFPS);

    frameSkip.current = (frameSkip.current + 1) % frameInterval;
    if (frameSkip.current !== 0) return; // Skip this frame

    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const base = particles.basePositions;

    // Keep the void effect while mouse is in section - don't use staleness check
    const mouseX = mouse.current[0];
    const mouseY = mouse.current[1];
    const updateRadius = 50; // Reduced from 200 for smaller trail

    for (let i = 0; i < positions.length; i += 3) {
      const currentX = positions[i];
      const currentY = positions[i + 1];

      // Always check distance to mouse when in section
      let shouldRepel = false;
      if (isMouseInSection.current) {
        const dx = currentX - mouseX;
        const dy = currentY - mouseY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < updateRadius) {
          shouldRepel = true;
        }
      }

      // If not in section, always return to base
      if (!isMouseInSection.current) {
        const returnX = base[i] - positions[i];
        const returnY = base[i + 1] - positions[i + 1];

        const step = 8;
        const threshold = 0.5; // Smaller threshold to prevent residue

        if (Math.abs(returnX) > threshold) {
          positions[i] += returnX > 0 ? Math.min(step, returnX) : Math.max(-step, returnX);
        } else {
          positions[i] = base[i]; // Snap to exact position
        }

        if (Math.abs(returnY) > threshold) {
          positions[i + 1] += returnY > 0 ? Math.min(step, returnY) : Math.max(-step, returnY);
        } else {
          positions[i + 1] = base[i + 1]; // Snap to exact position
        }
        continue;
      }

      if (shouldRepel) {
        const dx = positions[i] - mouseX;
        const dy = positions[i + 1] - mouseY;

        // Create pixelated distance calculation
        const pixelSize = 12;
        const gridX = Math.floor(dx / pixelSize) * pixelSize;
        const gridY = Math.floor(dy / pixelSize) * pixelSize;
        const pixelatedDist = Math.max(Math.abs(gridX), Math.abs(gridY));

        const radius = 45; // Reduced from 45 for smaller trail

        if (pixelatedDist < radius) {
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
        }
      } else {
        // Return to base position with improved precision
        const returnX = base[i] - positions[i];
        const returnY = base[i + 1] - positions[i + 1];

        const step = 6;
        const threshold = 0.5; // Small threshold to prevent residue

        if (Math.abs(returnX) > threshold) {
          positions[i] += returnX > 0 ? Math.min(step, returnX) : Math.max(-step, returnX);
        } else {
          positions[i] = base[i]; // Snap to exact position
        }

        if (Math.abs(returnY) > threshold) {
          positions[i + 1] += returnY > 0 ? Math.min(step, returnY) : Math.max(-step, returnY);
        } else {
          positions[i + 1] = base[i + 1]; // Snap to exact position
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

// Main Optimized Particle System Component
export const OptimizedParticleSystem = ({ imagePath, sectionClassName, intensity = 0.5 }: OptimizedParticleSystemProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 500], fov: 75 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
      // Aggressive performance settings for large screens
      dpr={typeof window !== 'undefined' && window.innerWidth > 1920 ? 1 : [1, 2]} // Force lower pixel ratio on large screens
      performance={{ min: 0.2 }} // Allow more aggressive performance scaling
      frameloop="always" // Only render when needed
    >
      <ambientLight intensity={intensity} />
      <PixelParticles imagePath={imagePath} sectionClassName={sectionClassName} />
    </Canvas>
  );
};
