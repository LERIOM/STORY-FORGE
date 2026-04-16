"use client";

import Lottie from "lottie-react";

import generationAnimation from "@/lib/animations/generation-animation.json";


export function GenerationMotion() {
  return (
    <div
      style={{
        width: "min(100%, 340px)",
        justifySelf: "center"
      }}
    >
      <Lottie
        animationData={generationAnimation}
        loop
        autoplay
        style={{
          width: "100%",
          height: "auto"
        }}
      />
    </div>
  );
}
