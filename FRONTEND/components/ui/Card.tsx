import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "priority" | "info";
}

export default function Card({
  children,
  className,
  variant = "glass",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-surface border border-border",
    glass: "glass-card",
    priority: "glass-priority",
    info: "glass-info",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
