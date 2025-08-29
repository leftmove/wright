import { Editor } from "components/document/document-editor";

export default function Document() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50">
      <div className="w-full h-10 bg-slate-200 p-2">Sidebar</div>
      <main className="w-full h-full p-4">
        <Editor />
      </main>
    </div>
  );
}
