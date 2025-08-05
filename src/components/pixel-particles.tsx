'use client';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

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

export default PixelParticles;
