"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Radar, BrainCircuit, Navigation, CheckCircle2, ArrowRight } from "lucide-react";

// 4 Connected Stages according to VIGIL specification
const STAGES = [
  {
    id: "detect",
    step: "01",
    title: "Detect",
    shortLabel: "Edge Sensor & Geohash Ingestion",
    description:
      "Continuous IoT telemetry isolates illegal curb-parking violations before congestion cascades across the grid.",
    icon: Radar,
    accent: "#3ED6C8", // Teal-cyan
    badgeClass: "bg-teal/10 text-teal border-teal/30",
    glowClass: "shadow-teal-glow border-teal/40",
    depthElevation: "translate-y-0",
  },
  {
    id: "score",
    step: "02",
    title: "Score",
    shortLabel: "Predictive ML & SHAP Breakdown",
    description:
      "Stacking regressors quantify congestion severity and pinpoint root causes in under 120ms with 92.3% accuracy.",
    icon: BrainCircuit,
    accent: "#FF6B4A", // Warm red-orange
    badgeClass: "bg-priority/10 text-priority border-priority/30",
    glowClass: "shadow-priority-glow border-priority/40",
    depthElevation: "-translate-y-4 md:scale-[1.03]", // Floating at slightly different depth
  },
  {
    id: "dispatch",
    step: "03",
    title: "Dispatch",
    shortLabel: "Dynamic Enforcement Routing",
    description:
      "Automated routing directs nearest patrol wardens with precision turn-by-turn priority vectors to rapidly clear bottlenecks.",
    icon: Navigation,
    accent: "#3ED6C8", // Teal-cyan
    badgeClass: "bg-teal/10 text-teal border-teal/30",
    glowClass: "shadow-teal-glow border-teal/40",
    depthElevation: "translate-y-2 md:scale-[0.99]", // Subtle depth offset
  },
  {
    id: "measure",
    step: "04",
    title: "Measure",
    shortLabel: "Closed-Loop Telemetry Verification",
    description:
      "Real-time street sensors confirm bottleneck recovery and feed outcome metrics back into model retraining.",
    icon: CheckCircle2,
    accent: "#FF6B4A", // Warm red-orange
    badgeClass: "bg-priority/10 text-priority border-priority/30",
    glowClass: "shadow-priority-glow border-priority/40",
    depthElevation: "-translate-y-2 md:scale-[1.02]", // Subtle depth offset
  },
];

export default function PipelineScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const connectingLineRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);

  // References for stage card elements
  const card0Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!pinSectionRef.current || !containerRef.current) return;

      const cards = [card0Ref.current, card1Ref.current, card2Ref.current, card3Ref.current];

      // Initial state: Cards begin slightly translucent and ready for scrubbed illumination
      gsap.set(cards, { opacity: 0.75, y: (i) => (i % 2 === 0 ? 0 : -8) });
      gsap.set(connectingLineRef.current, { scaleX: 0, transformOrigin: "left center" });

      // Master scroll-driven GSAP timeline with viewport pinning and scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2600", // Pinned scroll window
          pin: pinSectionRef.current,
          scrub: 1.2, // Smooth scrub tied directly to scroll position
          anticipatePin: 1,
        },
      });

      // =========================================================================
      // GSAP TWEENS: Progressively animate connecting gradient beam & floating cards
      // =========================================================================

      // Tween 1: Draw the thin animated-looking gradient line across stages (0% -> 33%)
      tl.to(
        connectingLineRef.current,
        {
          scaleX: 0.33,
          duration: 1,
          ease: "none",
        },
        "phase1"
      );

      // Tween 2: Elevate & illuminate Stage 1 (Detect)
      tl.to(
        card0Ref.current,
        {
          opacity: 1,
          scale: 1.05,
          y: -10,
          borderColor: "rgba(62, 214, 200, 0.5)",
          boxShadow: "0 25px 60px -10px rgba(62, 214, 200, 0.25)",
          duration: 0.8,
          ease: "power2.out",
        },
        "phase1"
      );

      // Tween 3: Advance connecting gradient beam to Stage 2 (33% -> 66%)
      tl.to(
        connectingLineRef.current,
        {
          scaleX: 0.66,
          duration: 1,
          ease: "none",
        },
        "phase2"
      );

      // Tween 4: De-emphasize Stage 1 slightly while elevating Stage 2 (Score)
      tl.to(
        card0Ref.current,
        {
          opacity: 0.8,
          scale: 1,
          y: 0,
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
          duration: 0.6,
        },
        "phase2"
      );
      tl.to(
        card1Ref.current,
        {
          opacity: 1,
          scale: 1.06,
          y: -16,
          borderColor: "rgba(255, 107, 74, 0.5)",
          boxShadow: "0 25px 60px -10px rgba(255, 107, 74, 0.25)",
          duration: 0.8,
          ease: "power2.out",
        },
        "phase2"
      );

      // Tween 5: Advance connecting gradient beam to Stage 3 (66% -> 100%)
      tl.to(
        connectingLineRef.current,
        {
          scaleX: 1,
          duration: 1,
          ease: "none",
        },
        "phase3"
      );

      // Tween 6: Illuminate Stage 3 (Dispatch) with teal glow
      tl.to(
        card1Ref.current,
        {
          opacity: 0.8,
          scale: 1.02,
          y: -8,
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
          duration: 0.6,
        },
        "phase3"
      );
      tl.to(
        card2Ref.current,
        {
          opacity: 1,
          scale: 1.05,
          y: -10,
          borderColor: "rgba(62, 214, 200, 0.5)",
          boxShadow: "0 25px 60px -10px rgba(62, 214, 200, 0.25)",
          duration: 0.8,
          ease: "power2.out",
        },
        "phase3"
      );

      // Tween 7: Final phase illuminates Stage 4 (Measure) with warm red-orange verification glow
      tl.to(
        card2Ref.current,
        {
          opacity: 0.8,
          scale: 1,
          y: 0,
          borderColor: "rgba(255, 255, 255, 0.12)",
          duration: 0.6,
        },
        "phase4"
      );
      tl.to(
        card3Ref.current,
        {
          opacity: 1,
          scale: 1.06,
          y: -14,
          borderColor: "rgba(255, 107, 74, 0.5)",
          boxShadow: "0 25px 60px -10px rgba(255, 107, 74, 0.25)",
          duration: 0.8,
          ease: "power2.out",
        },
        "phase4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const cardRefs = [card0Ref, card1Ref, card2Ref, card3Ref];

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background text-foreground py-16 overflow-hidden"
    >
      {/* Viewport Pinned Container */}
      <div
        ref={pinSectionRef}
        className="w-full min-h-screen flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-subtle border border-white/10 text-xs font-semibold uppercase tracking-widest text-teal mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Autonomous Incident Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-display">
            The VIGIL Pipeline
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
            From edge anomaly detection to verified curb clearance: a closed-loop
            intelligence workflow operating across 140+ metropolitan zones.
          </p>
        </div>

        {/* 4 Connected Stages Container */}
        <div className="relative w-full">
          {/* Thin Animated Gradient Connecting Beam (Desktop Horizontal Line) */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-[2px] -translate-y-1/2 bg-white/10 z-0">
            <div
              ref={connectingLineRef}
              className="h-full w-full bg-gradient-to-r from-teal via-priority to-teal"
            />
          </div>

          {/* 4 Floating Glassmorphic Cards */}
          <div
            ref={cardsWrapperRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
          >
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  ref={cardRefs[idx]}
                  className={`glass-card p-6 md:p-7 rounded-2xl flex flex-col justify-between border border-white/12 backdrop-blur-2xl transition-all duration-300 relative group ${stage.depthElevation}`}
                  style={{
                    boxShadow:
                      "0 20px 45px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {/* Top: Step Number & Glow Beacon */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
                      style={{
                        color: stage.accent,
                        borderColor: `${stage.accent}40`,
                        backgroundColor: `${stage.accent}12`,
                      }}
                    >
                      STAGE {stage.step}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: stage.accent,
                        boxShadow: `0 0 12px ${stage.accent}`,
                      }}
                    />
                  </div>

                  {/* Icon & Title */}
                  <div className="mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${stage.accent}12`,
                        borderColor: `${stage.accent}35`,
                        color: stage.accent,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
                      {stage.title}
                    </h3>
                    <div className="text-xs font-semibold text-muted mt-1 uppercase tracking-wider">
                      {stage.shortLabel}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mt-2 pt-4 border-t border-white/10">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Progress Hint */}
        <div className="mt-12 text-center text-xs text-muted/60 font-mono flex items-center justify-center gap-2">
          <span>Scroll to scrub through the 4-stage pipeline</span>
          <ArrowRight className="w-3.5 h-3.5 animate-pulse text-teal" />
        </div>
      </div>
    </section>
  );
}
