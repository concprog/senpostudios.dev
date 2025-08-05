// File: src/components/vignette-background.tsx
'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface VignetteBackgroundProps {
  text: string;
  formText: boolean;
}

const VignetteBackground: React.FC<VignetteBackgroundProps> = ({
  text,
  formText,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [font, setFont] = useState<THREE.Font | null>(null);
  const [initialPositions, setInitialPositions] = useState<Float32Array | null>(
    null
  );
  const [textTargets, setTextTargets] = useState<Float32Array | null>(null);
  const { viewport } = useThree();

  const count = 2000;

  // 1. Load font
  useEffect(() => {
    new FontLoader().load('/font.json', (f) => setFont(f));
  }, []);

  // 2. Generate vignette positions once
  const rawVignette = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const radius = 4;
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      const x =
        Math.sign(r * Math.cos(theta)) *
        Math.pow(Math.abs(r * Math.cos(theta)), 1.5);
      const y =
        Math.sign(r * Math.sin(theta)) *
        Math.pow(Math.abs(r * Math.sin(theta)), 1.5);
      arr[3 * i] = x;
      arr[3 * i + 1] = y;
      arr[3 * i + 2] = (Math.random() - 0.5) * 0.5;
    }
    return arr;
  }, [count]);

  // 3. Clone for buffer (will be mutated)
  useEffect(() => {
    setInitialPositions(rawVignette.slice());
  }, [rawVignette]);

  // 4. Sample text, then **sort both arrays by polar angle**
  useEffect(() => {
    if (!font || !initialPositions) return;

    const fontSize = Math.min(viewport.width, viewport.height) * 0.2;
    const maxWidth = viewport.width * 0.8;

    const createTextGeometry = (
      text: string,
      font: THREE.Font,
      size: number
    ) => {
      return new TextGeometry(text, {
        font,
        size,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      });
    };

    const lines = text.split(' ');
    let currentLine = '';
    const lineGeometries: THREE.BufferGeometry[] = [];
    let yOffset = 0;

    lines.forEach((word) => {
      const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
      const testGeom = createTextGeometry(testLine, font, fontSize);
      testGeom.computeBoundingBox();
      const testWidth =
        testGeom.boundingBox!.max.x - testGeom.boundingBox!.min.x;

      if (testWidth > maxWidth && currentLine !== '') {
        const lineGeom = createTextGeometry(currentLine, font, fontSize);
        lineGeom.translate(0, yOffset, 0);
        lineGeometries.push(lineGeom);
        yOffset -= fontSize * 1.2;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine !== '') {
      const lineGeom = createTextGeometry(currentLine, font, fontSize);
      lineGeom.translate(0, yOffset, 0);
      lineGeometries.push(lineGeom);
    }

    const mergedGeometry = mergeGeometries(lineGeometries);
    if (!mergedGeometry) return;

    mergedGeometry.center();
    const mesh = new THREE.Mesh(mergedGeometry);
    const sampler = new MeshSurfaceSampler(mesh).build();

    const sampled = new Float32Array(count * 3);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      sampler.sample(tmp);
      sampled[3 * i] = tmp.x;
      sampled[3 * i + 1] = tmp.y;
      sampled[3 * i + 2] = tmp.z;
    }

    // --- compute polar angles for both sets
    const initialIdx = Array.from({ length: count }, (_, i) => i);
    const textIdx = Array.from({ length: count }, (_, i) => i);

    const angleOf = (arr: Float32Array, i: number) =>
      Math.atan2(arr[3 * i + 1], arr[3 * i]);

    initialIdx.sort(
      (a, b) => angleOf(rawVignette, a) - angleOf(rawVignette, b)
    );
    textIdx.sort((a, b) => angleOf(sampled, a) - angleOf(sampled, b));

    // --- re-align into two new arrays, sorted by angle
    const sortedText = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      const ti = textIdx[k];
      sortedText[3 * k] = sampled[3 * ti];
      sortedText[3 * k + 1] = sampled[3 * ti + 1];
      sortedText[3 * k + 2] = sampled[3 * ti + 2];
    }

    setTextTargets(sortedText);
  }, [font, text, initialPositions, count, rawVignette, viewport]);

  // 5. On each frame, lerp toward textTargets or back to initialPositions + wave
  useFrame(({ clock }) => {
    if (!pointsRef.current || !initialPositions) return;
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = 3 * i;
      const cur = new THREE.Vector3(
        posArr[idx],
        posArr[idx + 1],
        posArr[idx + 2]
      );

      if (formText && textTargets) {
        const tx = textTargets[idx],
          ty = textTargets[idx + 1],
          tz = textTargets[idx + 2];
        cur.lerp(new THREE.Vector3(tx, ty, tz), 0.04);
      } else {
        const x0 = initialPositions[idx],
          y0 = initialPositions[idx + 1];
        const r = Math.hypot(x0, y0);
        const waveZ = Math.sin(t + r * 2) * 0.2;
        cur.lerp(new THREE.Vector3(x0, y0, waveZ), 0.04);
      }

      posArr[idx] = cur.x;
      posArr[idx + 1] = cur.y;
      posArr[idx + 2] = cur.z;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!initialPositions) return null;
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="white" />
    </points>
  );
};

export default VignetteBackground;
