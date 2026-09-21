"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Activity, Sparkles, Terminal } from "lucide-react";
import HeroScene from "@/components/three/HeroScene";
import PipelineScrollStory from "@/components/motion/PipelineScrollStory";

// Framer Motion staggered entrance orchestration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HomePage() {
  return (
    <div className="relative w-full min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-teal/20 selection:text-teal font-sans">
      {/* ========================================================================= */}
      {/* FLOATING GLASS HEADER / NAVBAR                                            */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
        <nav className="w-full max-w-5xl glass-panel px-6 py-3 rounded-full flex items-center justify-between pointer-events-auto border border-white/10 shadow-glass">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-teal/15 border border-teal/40 flex items-center justify-center shadow-teal-glow transition-transform group-hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            </div>
            <span className="text-lg font-black tracking-wider text-foreground font-display">
              VIGIL
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted uppercase tracking-widest">
            <Link
              href="#pipeline"
              className="hover:text-foreground transition-colors"
            >
              Pipeline Story
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Command Center
            </Link>
            <Link
              href="/dashboard/patrol"
              className="hover:text-foreground transition-colors"
            >
              Patrol Grid
            </Link>
            <Link
              href="/dashboard/citizen"
              className="hover:text-foreground transition-colors"
            >
              Citizen Portal
            </Link>
          </div>

          {/* Right Status / Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              140+ Sectors Online
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/15 text-foreground border border-white/15 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5 text-teal" />
              <span>Launch</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1 — HERO SECTION (Full-Viewport + 3D Cityscape & Antigravity)     */}
      {/* ========================================================================= */}
      <section className="relative w-full h-screen min-h-[720px] flex items-center justify-center px-6 md:px-12 overflow-hidden">
        {/* Background 3D Low-Poly Silhouette & Floating Spheres */}
        <HeroScene />

        {/* Foreground Content with generous negative space & floating weightless feel */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center pointer-events-auto mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Pill: Civic Tech Status */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle border border-teal/30 shadow-teal-glow mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-teal font-mono">
              Civic Traffic Command & Predictive Engine
            </span>
          </motion.div>

          {/* Center/Left-Balanced Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] max-w-3xl font-display"
          >
            AI-Driven Parking{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal via-[#7cf0e5] to-foreground drop-shadow-[0_0_25px_rgba(62,214,200,0.3)]">
              Intelligence
            </span>
          </motion.h1>

          {/* Smaller Subheadline about detecting illegal parking & quantifying congestion */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted max-w-2xl font-normal leading-relaxed"
          >
            Detecting unauthorized curb parking in real time and quantifying
            cascading congestion impact across metropolitan transit grids with
            92.3% predictive accuracy.
          </motion.p>

          {/* Primary CTA (Pill-shaped, teal accent, subtle glow) & Secondary CTA */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Pill-shaped Teal Primary CTA */}
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-teal text-[#0A0A0F] shadow-pill-glow hover:shadow-[0_0_35px_rgba(62,214,200,0.55)] hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 text-[#0A0A0F]" />
            </Link>

            {/* Pill-shaped Secondary Frosted Glass CTA */}
            <Link
              href="/dashboard/citizen"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm glass-interactive text-foreground/90 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Citizen Portal</span>
            </Link>
          </motion.div>

          {/* Floating Elevation Metric Pills */}
          <motion.div
            variants={itemVariants}
            className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl w-full"
          >
            <div className="glass-card px-4 py-3.5 rounded-2xl border border-white/10 text-center">
              <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                92.27%
              </div>
              <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">
                Model Accuracy
              </div>
            </div>

            <div className="glass-card px-4 py-3.5 rounded-2xl border border-teal/20 text-center -translate-y-2 shadow-teal-glow">
              <div className="text-xl sm:text-2xl font-bold font-mono text-teal">
                140+
              </div>
              <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">
                Police Sectors
              </div>
            </div>

            <div className="glass-card px-4 py-3.5 rounded-2xl border border-priority/20 text-center shadow-priority-glow">
              <div className="text-xl sm:text-2xl font-bold font-mono text-priority">
                &lt; 4.2m
              </div>
              <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">
                Recovery Time
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Prompt */}
        <div className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center text-xs text-muted/40 pointer-events-none">
          <span className="uppercase tracking-widest text-[10px] mb-1 font-mono">
            Scroll to discover
          </span>
          <div className="w-4 h-7 rounded-full border border-white/20 flex justify-center p-1">
            <div className="w-1 h-2 bg-teal rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — 4-STAGE CONNECTED PIPELINE STORY                             */}
      {/* ========================================================================= */}
      <div id="pipeline">
        <PipelineScrollStory />
      </div>
    </div>
  );
}
