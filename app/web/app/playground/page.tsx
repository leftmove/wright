"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function PlaygroundPage() {
  const [code, setCode] = useState<string>(
    () => `#set page(width: 320pt, height: 200pt)
= Hello
This is Typst in the browser.`
  );
  const [svgs, setSvgs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wasmRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod: any = await import("wright-wasm");
        await mod.default();
        if (!cancelled) {
          wasmRef.current = mod;
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!wasmRef.current) return;
    const handle = setTimeout(async () => {
      try {
        const out: string[] = await wasmRef.current.compile_svg(code);
        setSvgs(out);
        setError(null);
      } catch (e) {
        setError(String(e));
        setSvgs([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [code]);

  const editor = useMemo(
    () => (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b">Editor</div>
        <textarea
          className="flex-1 resize-none outline-none p-3 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
        {error ? (
          <div className="border-t text-red-600 text-xs p-2 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}
      </div>
    ),
    [code, error]
  );

  const preview = useMemo(
    () => (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b">Preview</div>
        <div className="flex-1 overflow-auto p-4 bg-neutral-50">
          {svgs.map((svg, i) => (
            <div
              key={i}
              className="mb-6"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ))}
        </div>
      </div>
    ),
    [svgs]
  );

  return (
    <div className="grid grid-cols-2 h-[100dvh]">
      <div className="border-r min-w-0">{editor}</div>
      <div className="min-w-0">{preview}</div>
    </div>
  );
}

