'use client';

import { useRef, useEffect, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { AnimatePresence, m } from 'framer-motion';

interface LabEntryProps {
  number: string;
  title: string;
  description: string;
  date: string;
  slug: string;
  iframeUrl: string;
  codeUrl?: string;
  previewVideo?: string;
  posterImage?: string;
  index?: number;
  isFocused?: boolean;
  isOtherFocused?: boolean;
  focusedIndex?: number | null;
  currentIndex?: number;
  onFocus?: () => void;
  onUnfocus?: () => void;
}

export default function LabEntry({
  number,
  title,
  date,
  slug,
  iframeUrl,
  codeUrl,
  previewVideo,
  posterImage,
  index = 0,
  isFocused = false,
  isOtherFocused = false,
  focusedIndex = null,
  currentIndex = 0,
  onFocus,
  onUnfocus
}: LabEntryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const entryRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeContent, setCodeContent] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [centeredOffset, setCenteredOffset] = useState(0);
  const initialScrollY = useRef(0);
  const hasCalculatedOffset = useRef(false);

  // Center the entry on screen when focused
  useEffect(() => {
    if (isFocused && entryRef.current) {
      if (!showCode) {
        // Only calculate offset once per focus session
        if (!hasCalculatedOffset.current) {
          const rect = entryRef.current.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const entryCenter = rect.top + rect.height / 2;
          const offset = viewportCenter - entryCenter;
          setCenteredOffset(offset);
          initialScrollY.current = window.scrollY;
          hasCalculatedOffset.current = true;
        } else {
          // When hiding code, restore scroll position
          window.scrollTo(0, initialScrollY.current);
        }
        document.body.style.overflow = 'hidden';
      } else {
        // When showing code, unlock scrolling but keep transform
        document.body.style.overflow = '';
      }
    } else {
      document.body.style.overflow = '';
      setCenteredOffset(0);
      initialScrollY.current = 0;
      hasCalculatedOffset.current = false;
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFocused, showCode]);

  // Prevent scrolling up past the initial position when code is shown
  useEffect(() => {
    if (!isFocused || !showCode) return;

    const handleWheel = (e: WheelEvent) => {
      // If scrolling up and at or near the initial position, prevent it
      if (e.deltaY < 0 && window.scrollY <= initialScrollY.current) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // For touch devices
      if (window.scrollY <= initialScrollY.current) {
        const touch = e.touches[0];
        if (touch && (window as any).lastTouchY !== undefined) {
          if (touch.clientY > (window as any).lastTouchY) {
            e.preventDefault();
          }
        }
        (window as any).lastTouchY = touch?.clientY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      (window as any).lastTouchY = e.touches[0]?.clientY;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      delete (window as any).lastTouchY;
    };
  }, [isFocused, showCode]);

  const handleViewCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!codeUrl) return;

    if (showCode) {
      setShowCode(false);
      return;
    }

    setShowCode(true);
    if (!codeContent) {
      setCodeLoading(true);
      try {
        const res = await fetch(codeUrl);
        const text = await res.text();
        setCodeContent(text);
      } catch (err) {
        setCodeContent('// Failed to load code');
      }
      setCodeLoading(false);
    }
  };

  const handleClick = () => {
    if (!isFocused) {
      onFocus?.();
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showCode) {
      setShowCode(false);
      setTimeout(() => onUnfocus?.(), 200);
    } else {
      onUnfocus?.();
    }
  };

  useEffect(() => {
    if (!previewVideo || !videoRef.current) return;

    const video = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-25% 0px -25% 0px'
      }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [previewVideo]);

  return (
    <div
      ref={entryRef}
      className="relative overflow-visible"
      onClick={handleClick}
      style={{
        transform: isFocused ? `translateY(${centeredOffset}px)` : 'translateY(0)',
        transition: 'transform 300ms ease-out',
        pointerEvents: isOtherFocused ? 'none' : 'auto'
      }}
    >
      <AnimatePresence>
        {isFocused && (
          <m.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBack}
            className="absolute w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-black top-[209px]"
            style={{
              left: '-48px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </m.button>
        )}
      </AnimatePresence>
      <article
        className="flex flex-col gap-2 cursor-pointer"
        style={{
          opacity: isOtherFocused ? 0 : 1,
          transform: isOtherFocused && focusedIndex !== null
            ? `translateY(${currentIndex < focusedIndex ? '-100px' : '100px'})`
            : 'translateY(0)',
          transition: 'opacity 300ms, transform 300ms',
          pointerEvents: isOtherFocused ? 'none' : 'auto'
        }}
      >
        <div
          className={`relative w-full max-w-[628px] ${slug === 'semantic-image-hover' ? 'aspect-[628/730] overflow-visible rounded-xl' : slug === 'progressive-confidence-agent-tasks' ? 'aspect-square overflow-hidden rounded-lg' : 'aspect-[628/450] overflow-hidden rounded-lg'} ${slug === 'inline-auto-suggest' ? 'border border-neutral-500' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {previewVideo ? (
            <>
              {/* Wrapper for video/poster with overflow-hidden to clip zoom effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  borderRadius: slug === 'semantic-image-hover' ? '0.75rem' : '0.5rem'
                }}
              >
                {posterImage && (
                  <img
                    src={posterImage}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: (videoReady && !isHovered && !isFocused) ? 'blur(0px)' : 'blur(8px)',
                      opacity: isFocused ? 0 : 1,
                      transition: 'filter 300ms, opacity 300ms'
                    }}
                  />
                )}
                <video
                  ref={videoRef}
                  src={previewVideo}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: (videoReady && (!isFocused || slug === 'progressive-confidence-agent-tasks')) ? 1 : 0,
                    filter: (isHovered || (isFocused && slug !== 'progressive-confidence-agent-tasks')) ? 'blur(8px)' : 'blur(0px)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'opacity 300ms, filter 300ms, transform 300ms'
                  }}
                  loop
                  muted
                  playsInline
                  onCanPlay={() => setVideoReady(true)}
                />
              </div>
              <iframe
                src={iframeUrl}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: slug === 'semantic-image-hover' ? '175%' : '125%',
                  height: slug === 'semantic-image-hover' ? '175%' : '125%',
                  transform: `translate(-50%, -50%) scale(${slug === 'semantic-image-hover' ? '0.57' : '0.8'})`,
                  transformOrigin: 'center center',
                  border: 'none',
                  borderRadius: slug === 'semantic-image-hover' ? '0.75rem' : '0.5rem',
                  opacity: (isFocused && slug !== 'progressive-confidence-agent-tasks') ? 1 : 0,
                  pointerEvents: (isFocused && slug !== 'progressive-confidence-agent-tasks') ? 'auto' : 'none',
                  transition: 'opacity 300ms'
                }}
                title={title}
              />
            </>
          ) : (
            <iframe
              src={iframeUrl}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={title}
              loading="lazy"
              {...(!isFocused && { inert: true })}
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs">{number} — {date}</span>
          <h3>{title}</h3>
        </div>
        {isFocused && codeUrl && (
          <button
            onClick={handleViewCode}
            className="px-3 py-1.5 bg-neutral-100 rounded-full text-sm font-medium text-black hover:bg-neutral-200 transition-colors w-fit"
          >
            {showCode ? 'Hide code' : 'View code'}
          </button>
        )}
        <AnimatePresence>
          {showCode && (
            <m.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {codeLoading ? (
                <p className="text-neutral-500">Loading...</p>
              ) : codeContent ? (
                <Highlight theme={themes.github} code={codeContent} language="tsx">
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre style={{ ...style, background: 'transparent' }} className="text-sm font-mono">
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="inline-block w-12 text-neutral-400 select-none text-right pr-4">{i + 1}</span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              ) : null}
            </m.div>
          )}
        </AnimatePresence>
      </article>
    </div>
  );
}
