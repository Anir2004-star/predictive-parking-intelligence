"use client";

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "priority" | "info" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    primary:
      "glass-interactive text-foreground hover:border-white/20 active:scale-[0.98]",
    secondary:
      "bg-surface-elevated text-foreground/80 hover:text-foreground hover:bg-surface active:scale-[0.98]",
    priority:
      "bg-priority text-white hover:bg-priority-hover shadow-priority-glow active:scale-[0.98]",
    info:
      "bg-info text-black font-semibold hover:bg-info-hover shadow-info-glow active:scale-[0.98]",
    ghost:
      "bg-transparent text-foreground/70 hover:text-foreground hover:bg-white/5",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
