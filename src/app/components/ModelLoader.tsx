"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

interface ModelLoaderProps {
  progress: number;
}

// Use a module-level variable to track if we've completed loading
let hasCompletedLoading = false;

export default function ModelLoader({ progress }: ModelLoaderProps) {
  // Always declare all hooks at the top level
  const [smoothProgress, setSmoothProgress] = useState(1); // Start at 1% immediately
  const [artificialLoading, setArtificialLoading] = useState(true);
  const startTime = useRef(Date.now());
  const [shouldRender, setShouldRender] = useState(!hasCompletedLoading);

  // Handle artificial loading progress - start immediately
  useEffect(() => {
    if (!shouldRender || hasCompletedLoading) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const artificialProgress = Math.min(
        ARTIFICIAL_MAX * (elapsed / ARTIFICIAL_DURATION),
        ARTIFICIAL_MAX
      );

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
  }, [progress, shouldRender]);

  // Handle real progress after artificial phase
  useEffect(() => {
    if (artificialLoading || !shouldRender || hasCompletedLoading) return;

    const interval = setInterval(() => {
      setSmoothProgress((current) => {
        if (current < progress) {
          const increment = (progress - current) * 0.1;
          return Math.min(current + Math.max(0.5, increment), progress);
        }
        return current;
      });
    }, 16);

    if (progress >= 100) {
      hasCompletedLoading = true;
      setTimeout(() => {
        setShouldRender(false);
      }, 500);
    }

    return () => clearInterval(interval);
  }, [artificialLoading, progress, shouldRender]);

  // Constants for artificial loading
  const ARTIFICIAL_DURATION = 8000;
  const ARTIFICIAL_MAX = 66;

  // If we've already completed loading or shouldn't render, return null
  if (!shouldRender || hasCompletedLoading) {
    return null;
  }

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
