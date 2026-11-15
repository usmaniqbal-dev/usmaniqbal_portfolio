"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { User } from "lucide-react";

interface HangingIdCardProps {
  imageSrc: string;
  shouldAnimate?: boolean;
  dragConstraints?: React.RefObject<HTMLElement | null>;
  darkMode?: boolean;
}

export default function HangingIdCard({
  imageSrc,
  dragConstraints,
  darkMode = false
}: HangingIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt motion values for magnetic 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Drag displacement values
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Spring physics for smooth tilt and return
  const springConfig = { damping: 25, stiffness: 380 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.35, 0.05]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["15%", "85%"]), springConfig);

  // Dynamic tilt angle during dragging
  const dragRotate = useSpring(useTransform(dragX, [-150, 150], [-14, 14]), { damping: 25, stiffness: 400 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || isDragging) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  const resolvedPhoto = imageSrc || "/images/usman-hero.png";

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full max-w-[370px] sm:max-w-[410px] lg:max-w-[440px] xl:max-w-[460px] select-none mx-auto pt-8 sm:pt-10"
      style={{ perspective: 1400 }}
    >
      {/* =========================================================================
          BLUE SATIN V-LANYARD RIBBON (Exact V-Shape Passing Behind Top Navbar)
          ========================================================================= */}
      <div className="absolute -top-12 sm:-top-16 inset-x-[-30px] sm:inset-x-[-60px] h-36 pointer-events-none z-10 overflow-visible">
        {/* Continuous Gentle Breeze Sway Animation */}
        <motion.div
          animate={{
            rotate: [-1.2, 1.2, -1.2],
            skewX: [-0.8, 0.8, -0.8],
            y: [0, -3, 0]
          }}
          transition={{
            duration: 4.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-full h-full"
        >
          <svg
            viewBox="0 0 460 140"
            fill="none"
            className="w-full h-full drop-shadow-[0_6px_12px_rgba(29,78,216,0.35)] overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Left Strap Gradient */}
              <linearGradient id="vRibbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="35%" stopColor="#1d4ed8" />
                <stop offset="65%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>

              {/* Right Strap Gradient */}
              <linearGradient id="vRibbonRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="35%" stopColor="#1d4ed8" />
                <stop offset="65%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>

              {/* Sheen Gradient */}
              <linearGradient id="ribbonSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Left Strap: Goes from behind top navbar down to the central medallion */}
            <path
              d="M 120 0 L 155 0 L 235 125 L 210 130 Z"
              fill="url(#vRibbonLeft)"
            />
            {/* Left Strap Satin Center Highlight */}
            <path
              d="M 137 0 L 222 127"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Left Strap Outer Edge Shadow */}
            <path
              d="M 120 0 L 210 130"
              stroke="rgba(15,23,42,0.3)"
              strokeWidth="2"
            />

            {/* Right Strap: Goes from medallion up to the top-right screen edge */}
            <path
              d="M 225 125 L 305 0 L 340 0 L 250 130 Z"
              fill="url(#vRibbonRight)"
            />
            {/* Right Strap Satin Center Highlight */}
            <path
              d="M 322 0 L 238 127"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Right Strap Outer Edge Shadow */}
            <path
              d="M 340 0 L 250 130"
              stroke="rgba(15,23,42,0.3)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      </div>

      {/* =========================================================================
          DRAGGABLE & BREEZE-SWAYING 3D ID CARD HOLDER
          ========================================================================= */}
      <motion.div
        drag
        dragConstraints={dragConstraints || { top: -70, bottom: 100, left: -120, right: 120 }}
        dragElastic={0.16}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 420, bounceDamping: 22 }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => {
          dragX.set(info.offset.x);
          dragY.set(info.offset.y);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          dragX.set(0);
          dragY.set(0);
        }}
        animate={
          !isDragging && !isHovered
            ? {
                rotate: [-1, 1, -1],
                y: [0, -4, 0]
              }
            : undefined
        }
        transition={
          !isDragging && !isHovered
            ? {
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut"
              }
            : undefined
        }
        style={{
          transformStyle: "preserve-3d",
          rotateX: isDragging ? 0 : rotateX,
          rotateY: isDragging ? 0 : rotateY,
          rotateZ: isDragging ? dragRotate : undefined
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        className="relative z-20 cursor-grab active:cursor-grabbing touch-none w-full flex flex-col items-center"
      >
        {/* =======================================================================
            CIRCULAR METALLIC MEDALLION (Pin holding the card at top center)
            ======================================================================= */}
        <div
          className="relative -mb-7 sm:-mb-8 z-30 h-14 w-14 sm:h-16 sm:w-16 rounded-full p-[3px] shadow-[0_8px_24px_rgba(2,132,199,0.5),0_0_20px_rgba(0,220,160,0.4)]"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #64748b 70%, #ffffff 100%)",
            transform: "translateZ(35px)"
          }}
        >
          {/* Inner Radiant Cyan/Blue Core with Glowing Avatar Icon */}
          <div className="relative h-full w-full rounded-full bg-gradient-to-tr from-[#0284c7] via-[#00DCA0] to-[#2563eb] flex items-center justify-center shadow-inner overflow-hidden">
            {/* Ambient Radial Core Light */}
            <div className="absolute inset-0 bg-radial from-white/45 via-transparent to-black/20" />
            <User size={26} strokeWidth={2.6} className="text-white drop-shadow relative z-10" />
          </div>
        </div>

        {/* =======================================================================
            FROSTED ACRYLIC GLASS HOLDER WITH LUMINOUS NEON CYAN GLOW
            ======================================================================= */}
        <div
          className={`relative w-full rounded-[32px] sm:rounded-[36px] p-2.5 sm:p-3 transition-shadow duration-300 ${
            darkMode
              ? "bg-white/[0.08] border-2 border-white/25 shadow-[0_0_38px_rgba(0,220,160,0.4),inset_0_0_22px_rgba(0,220,160,0.28),0_30px_70px_rgba(0,0,0,0.9)]"
              : "bg-white/50 border-2 border-white/85 shadow-[0_0_36px_rgba(0,220,160,0.42),inset_0_0_20px_rgba(0,220,160,0.24),0_25px_60px_rgba(15,23,42,0.18)]"
          } backdrop-blur-xl`}
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* Glass Bevel Highlight Rim */}
          <div className="absolute inset-0 rounded-[32px] sm:rounded-[36px] pointer-events-none border border-cyan-400/35 dark:border-cyan-300/25" />

          {/* =====================================================================
              CARD INTERIOR: ACTUAL USMAN IQBAL PORTRAIT PHOTO ONLY (NO TEXT)
              ===================================================================== */}
          <div
            className={`relative w-full aspect-[3.8/4.7] sm:aspect-[3.9/4.8] rounded-[24px] sm:rounded-[28px] overflow-hidden ${
              darkMode ? "bg-slate-950 border border-white/10" : "bg-slate-100 border border-white/60 shadow-inner"
            }`}
          >
            {/* High-Resolution Portrait Photo of Usman Iqbal */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedPhoto}
              alt="Usman Iqbal"
              draggable={false}
              className="w-full h-full object-cover object-top select-none pointer-events-none rounded-[24px] sm:rounded-[28px]"
            />

            {/* Subtle bottom fade vignette matching reference screenshot */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

            {/* Specular Diagonal Reflection Glare across Glass Surface */}
            <motion.div
              style={{
                opacity: glareOpacity,
                left: glareX
              }}
              className="absolute inset-y-0 w-36 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none blur-[3px]"
            />
          </div>
        </div>

        {/* 3D Acrylic Glass Glaze Top Surface Layer */}
        <div
          className="absolute inset-0 rounded-[32px] sm:rounded-[36px] pointer-events-none overflow-hidden"
          style={{ transform: "translateZ(24px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/35 opacity-70" />
        </div>
      </motion.div>
    </div>
  );
}
