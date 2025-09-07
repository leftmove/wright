"use client";

import { useState, useEffect } from "react";

interface DocumentProps {
  canvas: string;
}

export default function Document({ canvas }: DocumentProps) {
  // const [width, setWidth] = useState<string | null>(null);
  // const [height, setHeight] = useState<string | null>(null);

  // useEffect(() => {
  //   const parser = new DOMParser();
  //   const element = parser.parseFromString(canvas, "image/svg+xml");
  //   const svg = element.querySelector("svg");

  //   if (svg === null) {
  //     return;
  //   }

  //   const w = svg.getAttribute("width");
  //   const h = svg.getAttribute("height");

  //   setWidth(w);
  //   setHeight(h);
  // }, [canvas]);

  // if (width === null || height === null) {
  //   return <span className="text-slate-800 z-20">Loading</span>;
  // }

  return (
    <div className="flex flex-col h-screen w-screen items-center relative">
      <svg viewBox="0 0 100 100">
        <text className="text-black" x="20" y="20">
          Hello
        </text>
      </svg>
      {/* <div className="w-full h-10 bg-slate-200 p-2">Editor</div>
      <main
        className="z-10 scale-150 border-slate-200 border-x-2"
        dangerouslySetInnerHTML={{ __html: canvas }}
      /> */}
    </div>
  );
}
