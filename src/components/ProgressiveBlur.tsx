import React, { memo } from "react";

export interface ProgressiveBlurProps {
  className?: string;
}

/**
 * Reusable progressive backdrop blur component (Optimized for 60FPS / 3 GPU layers).
 * Confined strictly to `top-[35%]` (`65%` height) so it stays slightly higher than originally (`40%`)
 * but below the upper color gradient (`0% to 50%`), ensuring a clean depth-of-field transition behind text.
 */
export const ProgressiveBlur = memo(function ProgressiveBlur({
  className = "",
}: ProgressiveBlurProps) {
  const topClass = className.includes("top-") ? "" : "top-[48%]";

  return (
    <div
      className={`absolute ${topClass} bottom-0 inset-x-0 pointer-events-none z-[5] rounded-b-[inherit] overflow-hidden transform-gpu translate-z-0 backface-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Layer 1: 3px blur */}
      <div
        className="absolute inset-0 backdrop-blur-[3px] transform-gpu translate-z-0 backface-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)",
          zIndex: 1,
        }}
      />
      {/* Layer 2: 8px blur */}
      <div
        className="absolute top-[25%] bottom-0 inset-x-0 backdrop-blur-[8px] transform-gpu translate-z-0 backface-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 100%)",
          zIndex: 2,
        }}
      />
      {/* Layer 3: 16px blur */}
      <div
        className="absolute top-[48%] bottom-0 inset-x-0 backdrop-blur-[16px] transform-gpu translate-z-0 backface-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 100%)",
          zIndex: 3,
        }}
      />
    </div>
  );
});

ProgressiveBlur.displayName = "ProgressiveBlur";
