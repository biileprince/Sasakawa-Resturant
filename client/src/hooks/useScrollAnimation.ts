import { useEffect, useRef } from 'react';

export const useScrollAnimation = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add the animation class when element comes into view
            entry.target.classList.add('animate-in');
            // Optional: unobserve after animation to improve performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px', // Start animation 50px before element enters viewport
      }
    );

    // Observe all elements with scroll-reveal classes
    const scrollElements = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-zoom'
    );
    
    scrollElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Re-observe new elements when components update
  const reobserve = () => {
    if (observerRef.current) {
      // Disconnect existing observer
      observerRef.current.disconnect();
      
      // Re-observe all scroll reveal elements
      const scrollElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-zoom'
      );
      
      scrollElements.forEach((el) => {
        // Reset animation state
        el.classList.remove('animate-in');
        observerRef.current?.observe(el);
      });
    }
  };

  return { reobserve };
};

// Enhanced CSS-only approach with better browser support
export const initScrollAnimations = () => {
  // Add CSS that triggers animations when elements are in view
  const style = document.createElement('style');
  style.textContent = `
    .animate-in.scroll-reveal {
      animation: slideInFromBottom 0.8s ease-out forwards !important;
    }
    
    .animate-in.scroll-reveal-left {
      animation: slideInFromLeft 0.8s ease-out forwards !important;
    }
    
    .animate-in.scroll-reveal-right {
      animation: slideInFromRight 0.8s ease-out forwards !important;
    }
    
    .animate-in.scroll-reveal-zoom {
      animation: zoomIn 0.8s ease-out forwards !important;
    }

    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
      .scroll-reveal,
      .scroll-reveal-left,
      .scroll-reveal-right,
      .scroll-reveal-zoom {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  
  document.head.appendChild(style);
};
