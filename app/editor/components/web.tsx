"use client";
import "../styles.css";

import { cva, type VariantProps } from "class-variance-authority";

import {
  useEditor,
  useEditorState,
  EditorContent as Editor,
} from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
} from "@radix-ui/react-icons";

import { cn } from "./utils";

// import { Toolbar } from "./bubble-menu";

export type EditorVariantProps = VariantProps<typeof editorClass>;
export const editorClass = cva(
  "content prose w-full h-full p-2 focus:outline-2 outline-blue-500 border-2 overflow-auto "
);

export type EditorState = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
};

export const initialEditorContent: string = "<p>Hello World! 🌎️</p>";

export const initialEditorState: EditorState = {
  bold: false,
  italic: false,
  strike: false,
};

export default function Web() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialEditorContent,
    editorProps: {
      attributes: {
        class: editorClass(),
      },
    },
    immediatelyRender: false,
  });
  const editorState = useEditorState({
    editor,
    selector: (ctx): EditorState | null => {
      if (ctx.editor) {
        return {
          bold: ctx.editor.isActive("bold"),
          italic: ctx.editor.isActive("italic"),
          strike: ctx.editor.isActive("strike"),
        };
      } else {
        return null;
      }
    },
  });

  const { bold, italic, strike } = editorState ?? initialEditorState;

  return (
    <div className="w-full h-screen">
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {editor && (
        <BubbleMenu editor={editor}>
          <button
            className={cn(
              "p-2 h-12 w-12 rounded-md bg-slate-200 hover:bg-s   late-400",
              bold ? "bg-slate-400 text-white" : ""
            )}
            title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            className={cn(
              "p-2 h-12 w-12 rounded-md bg-slate-200 hover:bg-s   late-400",
              italic ? "bg-slate-400 text-white" : ""
            )}
            title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
          <button
            className={cn(
              "p-2 h-12 w-12 rounded-md bg-slate-200 hover:bg-s   late-400",
              strike ? "bg-slate-400 text-white" : ""
            )}
            title="Strike"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            Strike
          </button>
        </BubbleMenu>
      )}
      <Editor className="w-full h-full" editor={editor} />
    </div>
  );
}
