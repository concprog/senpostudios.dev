"use client"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"

// Define letter patterns as coordinate arrays for "SENPO STUDIOS"
const letterPatterns = {
  S: [
    [1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [2, 6], [1, 6], [0, 6],
  ],
  E: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 0], [1, 3], [1, 6], [2, 0], [2, 3], [2, 6], [3, 0], [3, 6],
  ],
  N: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 1], [2, 2], [2, 3], [3, 4], [3, 5], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
  ],
  P: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 0], [1, 3], [2, 0], [2, 3], [3, 1], [3, 2],
  ],
  O: [
    [1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [0, 3], [3, 3], [0, 4], [3, 4], [0, 5], [3, 5], [1, 6], [2, 6],
  ],
  T: [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
  ],
  U: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [2, 6], [3, 5], [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
  ],
  D: [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 0], [1, 6], [2, 1], [2, 5], [3, 2], [3, 3], [3, 4],
  ],
  I: [
    [0, 0], [1, 0], [2, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [0, 6], [1, 6], [2, 6],
  ],
  " ": [] // Add space character
}

interface PixelTextRevealProps {
  className?: string
  autoStart?: boolean
  startDelay?: number
}

export default function PixelTextReveal({ 
  className = "", 
  autoStart = false, 
  startDelay = 0 
}: PixelTextRevealProps) {
  const [isFormed, setIsFormed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const text = "SENPO STUDIOS"

  // Handle mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-start effect
  useEffect(() => {
    if (autoStart && isMounted) {
      const timer = setTimeout(() => {
        setIsFormed(true)
      }, startDelay)
      return () => clearTimeout(timer)
    }
  }, [autoStart, startDelay, isMounted])

  // Generate pixels
  const pixels = useMemo(() => {
    const pixelArray = []
    for (let i = 0; i < 400; i++) {
      pixelArray.push({
        id: i,
        startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        startY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        color: '#FFD700', // Bright yellow color
        size: Math.random() * 3 + 2,
      })
    }
    return pixelArray
  }, [isMounted])

  // Calculate text positions - positioned on left side
  const textPositions = useMemo(() => {
    if (!isMounted) return []
    
    const positions: Array<{x: number, y: number, letterIndex: number}> = []
    const letters = text.split("")
    const scale = 6
    const letterSpacing = 6
    const wordSpacing = 12
    
    // Position text on left side, vertically centered
    const startX = 100 // Left margin
    const centerY = (typeof window !== 'undefined' ? window.innerHeight : 800) / 2
    
    let currentX = startX

    letters.forEach((letter, letterIndex) => {
      if (letter === " ") {
        currentX += wordSpacing * scale
        return
      }

      const pattern = letterPatterns[letter as keyof typeof letterPatterns]
      if (pattern) {
        pattern.forEach(([x, y]) => {
          positions.push({
            x: currentX + x * scale,
            y: centerY - 3.5 * scale + y * scale,
            letterIndex,
          })
        })
      }
      currentX += letterSpacing * scale
    })

    return positions
  }, [text, isMounted])

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Instructions */}
      {!autoStart && isMounted && (
        <div className="absolute top-1/4 left-32 z-10">
          <motion.p 
            className="text-yellow-400 text-lg" 
            animate={{ opacity: isFormed ? 0.3 : 1 }}
          >
            Click to reveal Senpo Studios
          </motion.p>
        </div>
      )}

      {/* Animated Pixels */}
      {isMounted && pixels.map((pixel, index) => {
        const targetPosition = isFormed && textPositions[index] ? textPositions[index] : null

        return (
          <motion.div
            key={pixel.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: pixel.color,
              width: pixel.size,
              height: pixel.size,
            }}
            initial={{
              x: pixel.startX,
              y: pixel.startY,
              opacity: 0.8,
            }}
            animate={{
              x: targetPosition ? targetPosition.x : pixel.startX,
              y: targetPosition ? targetPosition.y : pixel.startY,
              opacity: targetPosition ? 1 : 0.6,
              scale: targetPosition ? 1.2 : 1,
            }}
            transition={{
              duration: 1.5,
              delay: targetPosition ? index * 0.005 : 0,
              type: "spring",
              stiffness: 60,
              damping: 15,
            }}
          />
        )
      })}

      {/* Click handler for manual trigger */}
      {!autoStart && (
        <div 
          className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
          onClick={() => setIsFormed(!isFormed)}
        />
      )}
    </div>
  )
}