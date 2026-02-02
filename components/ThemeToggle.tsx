'use client';
import { useEffect } from 'react';
import { m, useAnimationControls } from 'framer-motion';
import { useAnimation } from '@/lib/animationContext';

export default function ThemeToggle() {
  const { hasAnimated } = useAnimation();
  const upperFillControls = useAnimationControls();
  const upperEdgeControls = useAnimationControls();
  const lowerFillControls = useAnimationControls();
  const lowerEdgeControls = useAnimationControls();
  const pupilControls = useAnimationControls();

  // Path definitions
  // Open: inner ry=12.59 (curves away from center)
  // Closed: inner ry=1 (nearly flat at center line)
  const upperOpen = {
    fill: "M 1.75 24.64 A 29.25 22.89 0 0 1 60.25 24.64 A 29.25 12.59 0 0 0 1.75 24.64 Z",
    edge: "M 1.75 24.42 A 29.25 12.59 0 0 1 60.25 24.42"
  };
  const upperClosed = {
    fill: "M 1.75 24.64 A 29.25 22.89 0 0 1 60.25 24.64 A 29.25 1 0 0 0 1.75 24.64 Z",
    edge: "M 1.75 24.64 A 29.25 1 0 0 1 60.25 24.64"
  };
  const lowerOpen = {
    fill: "M 1.75 24.64 A 29.25 22.89 0 0 0 60.25 24.64 A 29.25 12.59 0 0 1 1.75 24.64 Z",
    edge: "M 1.75 24.42 A 29.25 12.59 0 0 0 60.25 24.42"
  };
  const lowerClosed = {
    fill: "M 1.75 24.64 A 29.25 22.89 0 0 0 60.25 24.64 A 29.25 1 0 0 1 1.75 24.64 Z",
    edge: "M 1.75 24.64 A 29.25 1 0 0 0 60.25 24.64"
  };

  const singleBlink = async (duration: number, ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1]) => {
    await Promise.all([
      upperFillControls.start({
        d: [upperOpen.fill, upperClosed.fill, upperOpen.fill],
        transition: { duration, ease }
      }),
      upperEdgeControls.start({
        d: [upperOpen.edge, upperClosed.edge, upperOpen.edge],
        transition: { duration, ease }
      }),
      lowerFillControls.start({
        d: [lowerOpen.fill, lowerClosed.fill, lowerOpen.fill],
        transition: { duration, ease }
      }),
      lowerEdgeControls.start({
        d: [lowerOpen.edge, lowerClosed.edge, lowerOpen.edge],
        transition: { duration, ease }
      })
    ]);
  };

  const triggerBlink = async () => {
    // Snappy ease for reactive blinks
    const snappy: [number, number, number, number] = [0.4, 0, 0.2, 1];
    // Weighted ease with overshoot feel
    const weighted: [number, number, number, number] = [0.34, 1.2, 0.64, 1];
    // Gentle ease for settling
    const gentle: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

    // Startle pupil - recoils from being poked with strong bounce
    pupilControls.start({
      scale: [1, 0.7, 0.95, 0.82, 0.88],
      transition: { duration: 0.3, times: [0, 0.15, 0.4, 0.7, 1], ease: "easeOut" }
    });

    // Initial reactive blink
    await singleBlink(0.2, snappy);
    // Quick follow-up
    await singleBlink(0.16, snappy);

    // Brief pause - pupil bounces back slightly
    pupilControls.start({
      scale: [0.88, 0.95, 0.92],
      transition: { duration: 0.25, times: [0, 0.5, 1], ease: gentle }
    });
    await new Promise(r => setTimeout(r, 180));

    // Slower settling blink with weight
    await singleBlink(0.3, weighted);

    // Longer pause - pupil settling with subtle bounce
    pupilControls.start({
      scale: [0.92, 1.02, 0.98],
      transition: { duration: 0.35, times: [0, 0.6, 1], ease: gentle }
    });
    await new Promise(r => setTimeout(r, 350));

    // Final gentle blink - pupil fully reset with tiny overshoot
    pupilControls.start({
      scale: [0.98, 1.01, 1],
      transition: { duration: 0.4, times: [0, 0.7, 1], ease: gentle }
    });
    await singleBlink(0.35, gentle);
  };

  // Trigger on page load after animations complete
  useEffect(() => {
    if (hasAnimated) {
      const timeout = setTimeout(triggerBlink, 1300);
      return () => clearTimeout(timeout);
    }
  }, [hasAnimated]);

  return (
    <button onClick={triggerBlink}>
      <svg
        className="w-[18px] h-[18px]"
        viewBox="-3 0 68 49.28"
        xmlns="http://www.w3.org/2000/svg"
         style={{ cursor: 'pointer' }}
      >
        <defs>
          <clipPath id="eyeClip">
            <ellipse cx="31" cy="24.64" rx="29.25" ry="22.89" />
          </clipPath>
        </defs>

        {/* Outer eye outline */}
        <ellipse
          cx="31" cy="24.64" rx="29.25" ry="22.89"
          fill="none"
          stroke="#0059ff"
          strokeWidth="5"
          strokeMiterlimit="10"
        />

        {/* Pupil - wrapped in g for centered transform */}
        <g style={{ transformOrigin: 'center' }}>
          <m.ellipse
            cx="30.82" cy="24.44" rx="16.08" ry="12.58"
            fill="#0059ff"
            stroke="#0059ff"
            strokeWidth="3.5"
            strokeMiterlimit="10"
            animate={pupilControls}
            style={{ transformOrigin: '30.82px 24.44px', transformBox: 'fill-box' }}
          />
        </g>

        {/* Eyelids - clipped to outer eye */}
        <g clipPath="url(#eyeClip)">
          {/* Upper eyelid - inner curve flattens to close */}
          <m.path
            fill="var(--color-bg)"
            stroke="none"
            animate={upperFillControls}
            initial={{ d: upperOpen.fill }}
          />
          <m.path
            fill="none"
            stroke="#0059ff"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={upperEdgeControls}
            initial={{ d: upperOpen.edge }}
          />

          {/* Lower eyelid - inner curve flattens to close */}
          <m.path
            fill="var(--color-bg)"
            stroke="none"
            animate={lowerFillControls}
            initial={{ d: lowerOpen.fill }}
          />
          <m.path
            fill="none"
            stroke="#0059ff"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={lowerEdgeControls}
            initial={{ d: lowerOpen.edge }}
          />
        </g>
      </svg>
    </button>
  );
}
