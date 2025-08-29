"use client";

import "./document-styles.css";
import { useServer } from "lib";

export function Editor() {
  const render = useServer({ url: "http://127.0.0.1:3001" });
  const html = render.data;

  return (
    <div
      className="w-full h-full overflow-scroll prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
