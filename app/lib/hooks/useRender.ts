"use client";

import { useEffect, useState } from "react";
import { typst } from "markup/typst";

interface RenderProps {
  code: string;
}

export interface Render {
  code: string;
  setCode: (code: string) => void;
  svg: string;
}

export function useRender({ code }: RenderProps): Render {
  const [input, setInput] = useState(code);
  const [rendered, setRendered] = useState<string | null>(null);

  useEffect(() => {
    console.log("code", code);
    const render = async () => {
      const svg = await typst.svg(code);
      setRendered(svg);
    };
    render();
  }, [code]);

  return {
    code: input,
    setCode: setInput,
    svg: rendered ?? "",
  };
}
