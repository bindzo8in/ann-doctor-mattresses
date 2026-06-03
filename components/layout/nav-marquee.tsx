"use client";

import { useEffect, useRef } from "react";

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    while (track.scrollWidth < window.innerWidth * 2) {
      const children = [...track.children];

      children.forEach((child) => {
        track.appendChild(child.cloneNode(true));
      });
    }
  }, []);

  return (
    <div className="overflow-hidden bg-red-600 text-white">
      <div ref={trackRef} className="flex w-max gap-8 animate-marquee">
        <span>✦</span>
        <span className="[word-spacing:0.25rem]">Sale is Live </span>
        <span>✦</span>
        <span className="[word-spacing:0.25rem]">Company Direct Sales</span>
        <span>✦</span>
        <span className="[word-spacing:0.25rem]">Best Mattress</span>
        <span>✦</span>
        <span className="[word-spacing:0.25rem]">Buy 1 Get 1</span>
      </div>
    </div>
  );
}
