"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Archive, 
  MoreVertical, 
  ExternalLink,
  Clock,
  FileText,
  Calendar,
  Flag
} from "lucide-react";
import { formatDate, formatReadingTime } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface DocumentCardProps {
  document: {
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
  };
  onEdit?: (documentId: Id<"documents">) => void;
}

export function DocumentCard({ document, onEdit }: DocumentCardProps) {
  const toggleStar = useMutation(api.documents.toggleStar);
  const toggleArchive = useMutation(api.documents.toggleArchive);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar({ documentId: document._id });
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleArchive({ documentId: document._id });
  };

  const handleOpenDocument = () => {
    window.open(`https://docs.google.com/document/d/${document.googleDocId}/edit`, '_blank');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "final": return "bg-green-100 text-green-800 border-green-200";
      case "review": return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">
              {document.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDate(document.lastModified)}</span>
              {document.readingTime && (
                <>
                  <span>•</span>
                  <span>{formatReadingTime(document.readingTime)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleStar}
              className="h-8 w-8"
            >
              <Star 
                className={`w-4 h-4 ${document.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleArchive}
              className="h-8 w-8"
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenDocument}
              className="h-8 w-8"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2">
            {document.category && (
              <Badge variant="secondary" className="text-xs">
                {document.category}
              </Badge>
            )}
            {document.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Custom Metadata */}
          {document.customMetadata && (
            <div className="flex flex-wrap gap-2">
              {document.customMetadata.priority && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(document.customMetadata.priority)}`}
                >
                  <Flag className="w-3 h-3 mr-1" />
                  {document.customMetadata.priority}
                </Badge>
              )}
              {document.customMetadata.status && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(document.customMetadata.status)}`}
                >
                  {document.customMetadata.status}
                </Badge>
              )}
              {document.customMetadata.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Due {formatDate(document.customMetadata.dueDate)}
                </Badge>
              )}
            </div>
          )}

          {/* Document Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {document.wordCount && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{document.wordCount.toLocaleString()} words</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}