import { useEffect } from 'react';

/**
 * Custom hook to activate Scroll Reveal Animations on scroll
 * @param {Array} deps Dependencies to trigger re-observation (e.g. data arrays)
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.08,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Allow DOM to finish rendering
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
      elements.forEach((el) => observer.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
      elements.forEach((el) => observer.unobserve(el));
    };
  }, deps);
}
