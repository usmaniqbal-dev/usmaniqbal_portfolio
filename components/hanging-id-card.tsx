"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

  // Mouse tilt motion values for magnetic 3D feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Drag displacement values for ribbon tethering
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Spring physics for smooth tilt and return
  const springConfig = { damping: 22, stiffness: 380 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.4, 0.05]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["10%", "90%"]), springConfig);

  // Dynamic tilt angle during dragging
  const dragRotate = useSpring(useTransform(dragX, [-140, 140], [-16, 16]), { damping: 25, stiffness: 400 });

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
      className="relative flex flex-col items-center justify-start w-[240px] sm:w-[260px] select-none mx-auto"
      style={{ perspective: 1200 }}
    >
      {/* =========================================================================
          LANYARD RIBBON (Attached directly to Theme Toggle Button above)
          ========================================================================= */}
      <div className="relative flex flex-col items-center pointer-events-none z-10">
        {/* Metal Attachment Ring / Clip directly touching the Theme Button */}
        <div className="h-2 w-5 rounded-b-full bg-gradient-to-b from-slate-400 to-slate-600 shadow-sm border-t border-slate-300" />

        {/* Woven Blue Fabric Ribbon Strap with realistic satin texture */}
        <div className="relative w-6 sm:w-7 h-24 sm:h-32 overflow-hidden flex justify-center shadow-md">
          {/* Main Blue Fabric Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#172554] via-[#2563eb] to-[#1e40af]" />

          {/* Woven Fabric Texture Pattern */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.7) 2px, rgba(255,255,255,0.7) 4px)"
            }}
          />

          {/* Satin Highlight Sheen */}
          <div className="absolute inset-y-0 w-2 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[0.5px]" />

          {/* Side Stitch Lines */}
          <div className="absolute inset-y-0 left-[2px] w-[1px] bg-blue-300/60" />
          <div className="absolute inset-y-0 right-[2px] w-[1px] bg-blue-300/60" />
        </div>

        {/* White Plastic Breakaway Connector Buckle */}
        <div className="relative -mt-1 h-4 w-7 rounded-[4px] bg-gradient-to-b from-slate-100 to-slate-300 shadow border border-slate-300 flex items-center justify-center">
          <div className="h-1.5 w-3.5 rounded-full bg-slate-400/80 shadow-inner" />
        </div>

        {/* Clear Vinyl Strap with Silver Metallic Snap Button */}
        <div className="relative -mt-0.5 h-5 w-3 rounded-[3px] bg-white/45 backdrop-blur-[2px] border border-white/70 shadow-xs flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-gradient-to-br from-white via-slate-300 to-slate-500 shadow border border-slate-400" />
        </div>

        {/* Chrome Metal Swivel Hook */}
        <div className="relative -mt-0.5 h-3.5 w-3.5 rounded-b-full border-2 border-slate-400 bg-gradient-to-b from-slate-200 to-slate-400 shadow-sm" />
      </div>

      {/* =========================================================================
          DRAGGABLE & SWINGING 3D ID CARD (STRICTLY PHOTO ONLY - NO TEXT)
          ========================================================================= */}
      <motion.div
        drag
        dragConstraints={dragConstraints || { top: -60, bottom: 180, left: -140, right: 140 }}
        dragElastic={0.16}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 420, bounceDamping: 18 }}
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
                rotate: [-1.8, 1.8, -1.8],
                y: [0, -4, 0]
              }
            : undefined
        }
        transition={
          !isDragging && !isHovered
            ? {
                duration: 4,
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
        className="relative z-20 cursor-grab active:cursor-grabbing touch-none"
      >
        {/* =======================================================================
            TRANSPARENT ACRYLIC BADGE HOLDER (Sleeve with Slot)
            ======================================================================= */}
        <div
          className={`relative rounded-[22px] p-2.5 transition-shadow duration-300 ${
            darkMode
              ? "bg-white/[0.08] border border-white/25 shadow-[0_22px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(37,99,235,0.25)]"
              : "bg-white/45 border border-white/85 shadow-[0_22px_45px_rgba(15,23,42,0.22),0_4px_12px_rgba(0,0,0,0.08)]"
          } backdrop-blur-md`}
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* Top Slot Hole for Lanyard Clip */}
          <div className="mx-auto mb-2 h-2 w-10 rounded-full bg-slate-900/30 border border-white/50 shadow-inner" />

          {/* =====================================================================
              CARD INTERIOR: 100% PHOTO ONLY (NO TEXT, NO BARCODES, NO HEADERS)
              ===================================================================== */}
          <div
            className={`relative w-[210px] sm:w-[225px] h-[270px] sm:h-[290px] rounded-[15px] overflow-hidden ${
              darkMode ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200/80 shadow-inner"
            }`}
          >
            {/* Usman Iqbal's Portrait Photo Filling the Card */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedPhoto}
              alt="Usman Iqbal"
              draggable={false}
              className="w-full h-full object-cover object-top select-none pointer-events-none rounded-[15px]"
            />

            {/* Specular Diagonal Reflection Glare on the Card Surface */}
            <motion.div
              style={{
                opacity: glareOpacity,
                left: glareX
              }}
              className="absolute inset-y-0 w-28 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent pointer-events-none blur-[2px]"
            />
          </div>
        </div>

        {/* 3D Acrylic Glass Glaze Top Surface Layer */}
        <div
          className="absolute inset-0 rounded-[22px] pointer-events-none overflow-hidden"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/30 opacity-70" />
        </div>
      </motion.div>
    </div>
  );
}
