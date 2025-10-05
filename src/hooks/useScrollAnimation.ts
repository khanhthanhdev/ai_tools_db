import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number; // 0 to 1, percentage of element visible
  triggerOnce?: boolean; // Only trigger animation once
  rootMargin?: string; // Margin around root
}

export function useScrollAnimation({
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = "0px",
}: UseScrollAnimationOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, triggerOnce, rootMargin]);

  return { ref: elementRef, isVisible };
}
