import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export default function GlassPanel({
  children,
  className,
  interactive = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-glass",
        interactive ? "glass-interactive cursor-pointer" : "glass-panel",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
