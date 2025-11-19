"use client";

import React from "react";

import { useEditor, EditorContent as Editor } from "@tiptap/react";

import { Preset, TypstBasic } from "../extensions";

export function App() {
  const editor = useEditor({
    extensions: [Preset, TypstBasic],
    content: "<p>Hello World! 🌎️</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  return (
    <div className="w-screen h-screen">
      <Editor editor={editor} className="w-full h-full select-none" />
    </div>
  );
}

export default App;
