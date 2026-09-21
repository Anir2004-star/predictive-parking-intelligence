"use client";

import React, { ReactNode, Suspense } from "react";
import { Canvas } from "@react-three/fiber";

interface SceneContainerProps {
  children?: ReactNode;
  className?: string;
}

export default function SceneContainer({
  children,
  className = "w-full h-full min-h-[300px]",
}: SceneContainerProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
