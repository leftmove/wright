"use client";

import { DocumentCard } from "./DocumentCard";
import { Id } from "@/convex/_generated/dataModel";

interface Document {
  _id: Id<"documents">;
  googleDocId: string;
  title: string;
  tags: string[];
  category?: string;
  isStarred: boolean;
  lastModified: number;
  wordCount?: number;
  readingTime?: number;
  isArchived: boolean;
  customMetadata?: {
    priority?: "low" | "medium" | "high";
    status?: "draft" | "review" | "final";
    dueDate?: number;
  };
}

interface DocumentGridProps {
  documents: Document[];
  onEditDocument?: (documentId: Id<"documents">) => void;
}

export function DocumentGrid({ documents, onEditDocument }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm mt-1">Connect your Google account to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((document) => (
        <DocumentCard
          key={document._id}
          document={document}
          onEdit={onEditDocument}
        />
      ))}
    </div>
  );
}