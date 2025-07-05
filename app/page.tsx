"use client";

import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { DocumentGrid } from "@/components/DocumentGrid";
import { DocumentFilters } from "@/components/DocumentFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  FileText, 
  Star, 
  Clock, 
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  const [filters, setFilters] = useState<{
    category?: string;
    tags?: string[];
    starred?: boolean;
    archived?: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Queries and mutations
  const googleTokens = useQuery(api.google.getGoogleTokens);
  const documents = useQuery(api.documents.getUserDocuments, {
    includeArchived: filters.archived,
    category: filters.category,
    tags: filters.tags,
  });
  const fetchGoogleDocs = useAction(api.google.fetchGoogleDocs);
  const createGoogleDoc = useAction(api.google.createGoogleDoc);
  const upsertDocument = useMutation(api.documents.upsertDocument);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter documents based on search query
  const filteredDocuments = documents?.filter(doc => {
    if (!searchQuery) return true;
    return doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  }) || [];

  // Get unique categories and tags for filters
  const availableCategories = [...new Set(documents?.map(doc => doc.category).filter(Boolean) || [])];
  const availableTags = [...new Set(documents?.flatMap(doc => doc.tags) || [])];

  // Calculate stats
  const stats = {
    total: documents?.length || 0,
    starred: documents?.filter(doc => doc.isStarred).length || 0,
    recentlyModified: documents?.filter(doc => 
      Date.now() - doc.lastModified < 7 * 24 * 60 * 60 * 1000
    ).length || 0,
    totalWords: documents?.reduce((sum, doc) => sum + (doc.wordCount || 0), 0) || 0,
  };

  const handleRefreshDocuments = async () => {
    if (!googleTokens) return;
    
    setIsRefreshing(true);
    try {
      const googleDocs = await fetchGoogleDocs();
      
      // Update local document metadata
      for (const googleDoc of googleDocs) {
        await upsertDocument({
          googleDocId: googleDoc.id,
          title: googleDoc.title,
        });
      }
    } catch (error) {
      console.error("Error refreshing documents:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateDocument = async () => {
    setIsCreating(true);
    try {
      const newDoc = await createGoogleDoc({
        title: "Untitled Document",
        content: "Start writing your document here...",
      });
      
      await upsertDocument({
        googleDocId: newDoc.documentId,
        title: newDoc.title,
      });

      // Open the new document
      window.open(`https://docs.google.com/document/d/${newDoc.documentId}/edit`, '_blank');
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to DocsPlus</CardTitle>
            <p className="text-muted-foreground">
              Enhanced Google Docs with powerful features
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to continue
              </p>
              <Button onClick={() => router.push("/signin")}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!googleTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Google Docs</CardTitle>
            <p className="text-muted-foreground">
              Connect your Google account to access and enhance your documents
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleAuthButton />
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => signOut().then(() => router.push("/signin"))}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">DocsPlus</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleCreateDocument}
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "New Document"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshDocuments}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                onClick={() => signOut().then(() => router.push("/signin"))}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Starred</p>
                  <p className="text-2xl font-bold">{stats.starred}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Recent</p>
                  <p className="text-2xl font-bold">{stats.recentlyModified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <DocumentFilters
            onSearchChange={setSearchQuery}
            onFilterChange={setFilters}
            availableCategories={availableCategories}
            availableTags={availableTags}
          />
        </div>

        {/* Documents Grid */}
        <DocumentGrid documents={filteredDocuments} />
      </main>
    </div>
  );
}