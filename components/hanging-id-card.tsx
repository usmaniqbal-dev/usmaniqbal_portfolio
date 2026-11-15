"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

interface HangingIdCardProps {
  imageSrc: string;
  shouldAnimate: boolean;
  dragConstraints?: React.RefObject<HTMLElement | null>;
  darkMode?: boolean;
}

export default function HangingIdCard({
  imageSrc,
  shouldAnimate,
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
  const springConfig = { damping: 20, stiffness: 350 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.35, 0.05]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["15%", "85%"]), springConfig);

  // Drag tilt based on sideways displacement
  const dragRotate = useSpring(useTransform(dragX, [-150, 150], [-18, 18]), { damping: 25, stiffness: 400 });

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

  return (
    <div
      className="relative flex flex-col items-center justify-end w-full max-w-[340px] sm:max-w-[380px] h-[460px] sm:h-[510px] select-none mx-auto"
      style={{ perspective: 1200 }}
    >
      {/* =========================================================================
          LANYARD RIBBON (Blue Fabric Ribbon Attached to Navbar)
          ========================================================================= */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        {/* Ribbon Mount Point Anchor under the Navbar */}
        <div className="h-2 w-14 rounded-b-md bg-[#1e3a8a] shadow-md border-t border-blue-400/40" />

        {/* Hanging Fabric Strap with woven texture highlights */}
        <div className="relative w-8 sm:w-9 h-28 sm:h-36 overflow-hidden flex justify-center shadow-md">
          {/* Main Blue Fabric Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#172554] via-[#2563eb] to-[#1e40af]" />

          {/* Realistic Fabric Ribbing Texture */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.7) 2px, rgba(255,255,255,0.7) 4px)"
            }}
          />

          {/* Satin Center Sheen Highlight */}
          <div className="absolute inset-y-0 w-2.5 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]" />

          {/* Side Stitch Lines */}
          <div className="absolute inset-y-0 left-[2px] w-[1px] bg-blue-300/60" />
          <div className="absolute inset-y-0 right-[2px] w-[1px] bg-blue-300/60" />
        </div>

        {/* White Plastic Breakaway Buckle / Connector */}
        <div className="relative -mt-1 h-5 w-8 rounded-[4px] bg-gradient-to-b from-slate-100 to-slate-300 shadow-md border border-slate-300 flex items-center justify-center">
          <div className="h-1.5 w-4 rounded-full bg-slate-400/80 shadow-inner" />
        </div>

        {/* Clear Vinyl Strap Loop with Silver Rivet */}
        <div className="relative -mt-0.5 h-6 w-3.5 rounded-[3px] bg-white/40 backdrop-blur-[2px] border border-white/70 shadow-sm flex items-center justify-center">
          {/* Metallic Snap Rivet */}
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-white via-slate-300 to-slate-500 shadow border border-slate-400" />
        </div>

        {/* Chrome Metal Swivel Hook */}
        <div className="relative -mt-1 h-4 w-4 rounded-b-full border-2 border-slate-400 bg-gradient-to-b from-slate-200 to-slate-400 shadow-sm" />
      </div>

      {/* =========================================================================
          DRAGGABLE & SWINGING 3D ID CARD HOLDER
          ========================================================================= */}
      <motion.div
        drag
        dragConstraints={dragConstraints}
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
                y: [0, -5, 0]
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
        className="relative z-20 cursor-grab active:cursor-grabbing mb-2 touch-none"
      >
        {/* =======================================================================
            TRANSPARENT ACRYLIC BADGE HOLDER (Sleeve with Slot)
            ======================================================================= */}
        <div
          className={`relative rounded-[22px] p-2.5 sm:p-3 transition-shadow duration-300 ${
            darkMode
              ? "bg-white/[0.07] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(37,99,235,0.2)]"
              : "bg-white/40 border border-white/80 shadow-[0_20px_45px_rgba(15,23,42,0.2),0_4px_12px_rgba(0,0,0,0.08)]"
          } backdrop-blur-md`}
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* Top Slot Hole for Lanyard Clip */}
          <div className="mx-auto mb-2.5 h-2 w-11 rounded-full bg-slate-900/25 border border-white/40 shadow-inner" />

          {/* =====================================================================
              PHYSICAL INSERTED ID CARD (Corporate Identification Badge)
              ===================================================================== */}
          <div
            className={`relative w-[235px] sm:w-[250px] h-[345px] sm:h-[365px] rounded-[16px] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 text-slate-800 ${
              darkMode ? "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border border-white/10" : "bg-gradient-to-b from-white via-slate-50 to-white border border-slate-200/80 shadow-inner"
            }`}
          >
            {/* Background Guilloche Security Pattern */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#0284c7 1px, transparent 1px), radial-gradient(#00dca0 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                backgroundPosition: "0 0, 6px 6px"
              }}
            />

            {/* CARD HEADER */}
            <div className="relative z-10 flex items-center justify-between border-b pb-2 border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded bg-gradient-to-tr from-[#0284c7] to-[#00DCA0] text-white shadow-sm">
                  <ShieldCheck size={12} strokeWidth={2.5} />
                </span>
                <div>
                  <h4 className="text-[11px] font-black tracking-wider leading-none uppercase">
                    NURAXTECH
                  </h4>
                  <span className="text-[7.5px] font-bold text-[#0284c7] dark:text-[#38bdf8] tracking-widest uppercase">
                    SOLUTIONS
                  </span>
                </div>
              </div>

              {/* Security Hologram Chip Icon */}
              <div className="flex items-center gap-1">
                <div className="h-4 w-5 rounded bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-500 border border-amber-400/80 shadow-xs flex items-center justify-center">
                  <Sparkles size={8} className="text-amber-800" />
                </div>
              </div>
            </div>

            {/* PROFILE PHOTO FRAME */}
            <div className="relative z-10 flex flex-col items-center mt-1">
              <div className="relative h-24 w-24 sm:h-[102px] sm:w-[102px] rounded-full p-[3px] bg-gradient-to-tr from-[#0284c7] via-[#00DCA0] to-[#2563eb] shadow-md">
                <div className="relative h-full w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={imageSrc}
                    alt="Usman Iqbal"
                    fill
                    priority
                    draggable={false}
                    sizes="110px"
                    className="object-cover object-top select-none"
                  />
                </div>
                {/* Active Verified Status Pip */}
                <span
                  title="Verified Professional"
                  className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm"
                />
              </div>

              {/* VERIFIED MEMBER BADGE */}
              <span className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#0284c7] dark:text-[#38bdf8]">
                EMPLOYEE
              </span>

              {/* NAME */}
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-none mt-0.5 text-center">
                USMAN IQBAL
              </h3>

              {/* DESIGNATION */}
              <p className="text-[9.5px] sm:text-[10px] font-bold text-center leading-tight mt-1 text-slate-600 dark:text-slate-300">
                Salesforce Administrator & Developer
              </p>

              {/* ID NUMBER */}
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[8px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400">
                ID No. 923145678
              </div>
            </div>

            {/* CARD FOOTER: BARCODE & GRAPHIC WAVES */}
            <div className="relative z-10 mt-1 flex flex-col items-center">
              {/* Authentic Barcode Pattern */}
              <div className="w-full flex items-center justify-center gap-[2.5px] h-5 px-3 opacity-80">
                {[
                  2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 1,
                  2, 4, 1, 2, 3, 1, 2, 4
                ].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className={`h-full ${
                      darkMode ? "bg-white/80" : "bg-slate-900"
                    } inline-block`}
                  />
                ))}
              </div>

              {/* Wave Graphic Swoosh at Bottom (Reference Match) */}
              <div className="relative w-full h-5 mt-1 overflow-hidden rounded-b-[12px]">
                <svg
                  viewBox="0 0 200 40"
                  className="absolute inset-0 w-full h-full preserve-3d"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,25 C40,5 90,38 140,15 C170,3 190,20 200,10 L200,40 L0,40 Z"
                    fill="#0284c7"
                    opacity="0.85"
                  />
                  <path
                    d="M0,32 C50,15 110,35 160,20 C180,12 195,25 200,18 L200,40 L0,40 Z"
                    fill="#1d4ed8"
                  />
                </svg>
              </div>
            </div>

            {/* Specular Diagonal Reflection Glare on Card Surface */}
            <motion.div
              style={{
                opacity: glareOpacity,
                left: glareX
              }}
              className="absolute inset-y-0 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none blur-[2px]"
            />
          </div>
        </div>

        {/* Dynamic 3D Plastic Gloss on Acrylic Outer Holder */}
        <div
          className="absolute inset-0 rounded-[22px] pointer-events-none overflow-hidden"
          style={{ transform: "translateZ(25px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/30 opacity-70" />
        </div>
      </motion.div>
    </div>
  );
}
