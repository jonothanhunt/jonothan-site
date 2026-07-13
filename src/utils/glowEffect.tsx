import React from 'react';

/**
 * Shared utility for creating hover glow effects
 */

export interface GlowEffectHandlers {
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Creates mouse event handlers for the hover glow effect
 * @param glowSelector CSS selector for the glow element (optional, uses default if not provided)
 * @returns Object with onMouseMove and onMouseLeave handlers
 */
export function createGlowEffect(glowSelector?: string): GlowEffectHandlers {
  const defaultSelector = '.glow-effect';
  const selector = glowSelector || defaultSelector;

  return {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.dataset.hovered = 'true';
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Calculate dynamic glow size based on container dimensions
      const containerSize = Math.max(rect.width, rect.height);
      const glowRadius = Math.round(containerSize * 2); // 2x the container size
      
      const glowElement = e.currentTarget.querySelector(selector) as HTMLElement;
      if (glowElement) {
        glowElement.style.setProperty('--mouse-x', `${x}%`);
        glowElement.style.setProperty('--mouse-y', `${y}%`);
        glowElement.style.setProperty('--glow-size', `${glowRadius}px`);
        glowElement.style.opacity = '1';
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      if (e.currentTarget.dataset.clicking === 'true') {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        return;
      }
      delete e.currentTarget.dataset.hovered;
      const glowElement = e.currentTarget.querySelector(selector) as HTMLElement;
      if (glowElement) {
        glowElement.style.opacity = '0';
      }
    }
  };
}

/**
 * Default glow effect component that can be included in any container
 */
export const GlowEffect = React.memo(function GlowEffect({ 
  className = "", 
  variant = "default" 
}: { 
  className?: string; 
  variant?: "default" | "dark" 
}) {
  const glowStyles = {
    default: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.18) 40%, transparent 70%)',
    dark: 'radial-gradient(circle var(--glow-size, 400px) at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.32) 0%, rgba(139, 92, 246, 0.16) 40%, transparent 70%)'
  };

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.backgroundImage = glowStyles[variant];
    }
  }, [variant]);

  return (
    <div 
      ref={ref}
      className={`glow-effect absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 ${className}`}
    />
  );
});
