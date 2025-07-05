import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create or update document metadata
export const upsertDocument = mutation({
  args: {
    googleDocId: v.string(),
    title: v.string(),
    wordCount: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    isStarred: v.optional(v.boolean()),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if document already exists
    const existingDoc = await ctx.db
      .query("documents")
      .withIndex("by_google_doc_id", (q) => q.eq("googleDocId", args.googleDocId))
      .unique();

    const now = Date.now();
    const readingTime = args.wordCount ? Math.ceil(args.wordCount / 200) : undefined; // Assume 200 WPM

    if (existingDoc) {
      // Update existing document
      await ctx.db.patch(existingDoc._id, {
        title: args.title,
        lastModified: now,
        wordCount: args.wordCount,
        readingTime,
        ...(args.tags && { tags: args.tags }),
        ...(args.category && { category: args.category }),
        ...(args.isStarred !== undefined && { isStarred: args.isStarred }),
      });
      return existingDoc._id;
    } else {
      // Create new document
      return await ctx.db.insert("documents", {
        googleDocId: args.googleDocId,
        title: args.title,
        ownerId: userId,
        collaborators: [],
        tags: args.tags || [],
        category: args.category,
        isStarred: args.isStarred || false,
        lastModified: now,
        wordCount: args.wordCount,
        readingTime,
        isArchived: false,
      });
    }
  },
});

// Get all documents for current user
export const getUserDocuments = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    googleDocId: v.string(),
    title: v.string(),
    ownerId: v.id("users"),
    collaborators: v.array(v.id("users")),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    isStarred: v.boolean(),
    lastModified: v.number(),
    wordCount: v.optional(v.number()),
    readingTime: v.optional(v.number()),
    isArchived: v.boolean(),
    customMetadata: v.optional(v.object({
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("final"))),
      dueDate: v.optional(v.number()),
    })),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("documents").withIndex("by_owner", (q) => q.eq("ownerId", userId));
    
    const documents = await query.collect();
    
    return documents.filter(doc => {
      // Filter by archived status
      if (!args.includeArchived && doc.isArchived) {
        return false;
      }
      
      // Filter by category
      if (args.category && doc.category !== args.category) {
        return false;
      }
      
      // Filter by tags
      if (args.tags && args.tags.length > 0) {
        const hasMatchingTag = args.tags.some(tag => doc.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      return true;
    });
  },
});

// Toggle star status
export const toggleStar = mutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    if (doc.ownerId !== userId && !doc.collaborators.includes(userId)) {
      throw new Error("Not authorized to modify this document");
    }

    await ctx.db.patch(args.documentId, {
      isStarred: !doc.isStarred,
    });

    return null;
  },
});

// Archive/unarchive document
export const toggleArchive = mutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    if (doc.ownerId !== userId) {
      throw new Error("Only the owner can archive documents");
    }

    await ctx.db.patch(args.documentId, {
      isArchived: !doc.isArchived,
    });

    return null;
  },
});

// Update document metadata
export const updateDocumentMetadata = mutation({
  args: {
    documentId: v.id("documents"),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    customMetadata: v.optional(v.object({
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("final"))),
      dueDate: v.optional(v.number()),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    if (doc.ownerId !== userId && !doc.collaborators.includes(userId)) {
      throw new Error("Not authorized to modify this document");
    }

    const updates: any = {};
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.category !== undefined) updates.category = args.category;
    if (args.customMetadata !== undefined) updates.customMetadata = args.customMetadata;

    await ctx.db.patch(args.documentId, updates);

    return null;
  },
});

// Get document by Google Doc ID
export const getDocumentByGoogleId = query({
  args: {
    googleDocId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      googleDocId: v.string(),
      title: v.string(),
      ownerId: v.id("users"),
      collaborators: v.array(v.id("users")),
      tags: v.array(v.string()),
      category: v.optional(v.string()),
      isStarred: v.boolean(),
      lastModified: v.number(),
      wordCount: v.optional(v.number()),
      readingTime: v.optional(v.number()),
      isArchived: v.boolean(),
      customMetadata: v.optional(v.object({
        priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
        status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("final"))),
        dueDate: v.optional(v.number()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_google_doc_id", (q) => q.eq("googleDocId", args.googleDocId))
      .unique();

    return doc || null;
  },
});