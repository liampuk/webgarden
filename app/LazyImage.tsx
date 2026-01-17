'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface LazyImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}

export function LazyImage({ src, alt, width, height, className }: LazyImageProps) {
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                // Start loading when image is 200px away from viewport
                rootMargin: '200px',
                threshold: 0,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={imgRef}>
            {isInView ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={className}
                    loading="lazy"
                />
            ) : (
                // Placeholder to maintain layout
                <div
                    style={{ width, height }}
                    className={`bg-gray-100/5 rounded-md animate-pulse ${className || ''}`}
                />
            )}
        </div>
    );
}
