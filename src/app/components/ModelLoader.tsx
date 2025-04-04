"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface ModelLoaderProps {
  progress: number;
}

export default function ModelLoader({ progress }: ModelLoaderProps) {
  // Add smoothed progress state
  const [smoothProgress, setSmoothProgress] = useState(1); // Start at 1% immediately
  // Track if we're in artificial loading mode
  const [artificialLoading, setArtificialLoading] = useState(true);

  // Constants for artificial loading
  const ARTIFICIAL_DURATION = 8000; // 8 seconds
  const ARTIFICIAL_MAX = 66; // Go up to 66% artificially
  const startTime = React.useRef(Date.now());

  // Handle artificial loading progress - start immediately
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const artificialProgress = Math.min(
        ARTIFICIAL_MAX * (elapsed / ARTIFICIAL_DURATION),
        ARTIFICIAL_MAX
      );

      // If real progress exceeds artificial or we've reached the artificial max, switch to real progress
      if (
        progress > artificialProgress ||
        artificialProgress >= ARTIFICIAL_MAX
      ) {
        setArtificialLoading(false);
        clearInterval(interval);
      } else {
        setSmoothProgress(artificialProgress);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [progress]);

  // Handle real progress after artificial phase
  useEffect(() => {
    if (artificialLoading) return;

    const interval = setInterval(() => {
      setSmoothProgress((current) => {
        // Move toward target progress
        if (current < progress) {
          // Accelerate as we get closer to 100%
          const increment = (progress - current) * 0.1;
          return Math.min(current + Math.max(0.5, increment), progress);
        }
        return current;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [artificialLoading, progress]);

  return (
    <motion.div
      className="fixed inset-0 -z-10 flex flex-col items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center">
        <div className="w-64 h-3 bg-white/20 bg-opacity-30 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${smoothProgress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
