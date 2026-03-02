import { useRef, useEffect } from 'react';

/**
 * useScrollReveal — IntersectionObserver-based scroll-reveal with staggered children.
 * When the target element becomes visible (threshold 15%), adds 'visible' class
 * and staggers children with `.scroll-reveal-child` class at 100ms intervals.
 */
export function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const children = entry.target.querySelectorAll('.scroll-reveal-child');
            children.forEach((child, i) => {
              setTimeout(() => child.classList.add('visible'), i * 100);
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
