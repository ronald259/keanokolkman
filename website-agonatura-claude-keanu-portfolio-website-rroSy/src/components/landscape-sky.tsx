"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Cinematic SVG landscape used as Hero background.
 * Layered hills, drifting mist, a distant flock of birds.
 */
export function LandscapeSky() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-canopy" />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f3a2c" />
            <stop offset="55%" stopColor="#2c4c39" />
            <stop offset="100%" stopColor="#16261c" />
          </linearGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a5a44" />
            <stop offset="100%" stopColor="#243d2f" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c4c39" />
            <stop offset="100%" stopColor="#1c3023" />
          </linearGradient>
          <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f3a2c" />
            <stop offset="100%" stopColor="#0e1c15" />
          </linearGradient>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3ecda" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#d6bd85" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d6bd85" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mist" x1="0" x2="1" y1="0.5" y2="0.5">
            <stop offset="0%" stopColor="#f9f5ec" stopOpacity="0" />
            <stop offset="50%" stopColor="#f9f5ec" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f9f5ec" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />

        {/* sun */}
        <circle cx="1080" cy="240" r="230" fill="url(#sun)" />

        {/* distant flock */}
        <motion.g
          fill="none"
          stroke="#f9f5ec"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeLinecap="round"
          animate={reduce ? undefined : { x: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M880 220 q6 -6 12 0 q6 -6 12 0" />
          <path d="M910 235 q5 -5 10 0 q5 -5 10 0" />
          <path d="M860 250 q5 -5 10 0 q5 -5 10 0" />
        </motion.g>

        {/* far hills */}
        <motion.path
          initial={reduce ? false : { y: 12 }}
          animate={reduce ? undefined : { y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          d="M0 560 C 180 500, 320 540, 480 520 C 640 500, 760 560, 920 540 C 1080 520, 1240 560, 1440 530 L 1440 900 L 0 900 Z"
          fill="url(#hill3)"
          opacity="0.9"
        />

        {/* mid hills */}
        <path
          d="M0 640 C 200 580, 340 640, 520 620 C 700 600, 860 660, 1040 640 C 1220 620, 1340 660, 1440 640 L 1440 900 L 0 900 Z"
          fill="url(#hill2)"
        />

        {/* tree silhouettes on mid hill */}
        <g fill="#1c3023" opacity="0.95">
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 80 + i * 78 + (i % 2) * 12;
            const h = 26 + ((i * 7) % 18);
            return (
              <path
                key={i}
                d={`M${x} ${640 - h * 1.4} l${h * 0.45} ${h * 1.4} h-${
                  h * 0.9
                } z`}
              />
            );
          })}
        </g>

        {/* near hill */}
        <path
          d="M0 740 C 220 680, 380 760, 580 740 C 780 720, 940 780, 1140 750 C 1260 732, 1360 760, 1440 740 L 1440 900 L 0 900 Z"
          fill="url(#hill1)"
        />

        {/* drifting mist bands */}
        <motion.rect
          x="-200"
          y="600"
          width="1800"
          height="60"
          fill="url(#mist)"
          animate={reduce ? undefined : { x: [-200, 80, -200] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="-200"
          y="700"
          width="1800"
          height="40"
          fill="url(#mist)"
          opacity="0.7"
          animate={reduce ? undefined : { x: [-100, 200, -100] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* subtle grain & vignette */}
      <div className="pointer-events-none absolute inset-0 grain opacity-[0.25] mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 110%, rgba(0,0,0,0.55), transparent 60%)",
        }}
      />
    </div>
  );
}
