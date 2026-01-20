'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
}

export function LazyImage({ src, alt }: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoading(true);
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        // Start loading when image is 200px away from viewport
        rootMargin: '200px',
        threshold: 0,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className="w-full aspect-video relative">
      {isInView ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-card-foreground rounded-md animate-pulse" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`w-full aspect-video rounded-md transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </>
      ) : (
        // Placeholder to maintain layout
        <div className="bg-card-background rounded-md w-full aspect-video animate-pulse" />
      )}
    </div>
  );
}
