import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // Store Google OAuth tokens for users
  googleTokens: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_user", ["userId"]),

  // Store document metadata and enhanced features
  documents: defineTable({
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
  }).index("by_owner", ["ownerId"])
    .index("by_google_doc_id", ["googleDocId"])
    .index("by_collaborator", ["collaborators"]),

  // Store document versions for enhanced version control
  documentVersions: defineTable({
    documentId: v.id("documents"),
    versionNumber: v.number(),
    title: v.string(),
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    changeDescription: v.optional(v.string()),
  }).index("by_document", ["documentId"])
    .index("by_document_and_version", ["documentId", "versionNumber"]),

  // Store comments and annotations
  documentComments: defineTable({
    documentId: v.id("documents"),
    googleDocId: v.string(),
    authorId: v.id("users"),
    content: v.string(),
    position: v.optional(v.object({
      startIndex: v.number(),
      endIndex: v.number(),
    })),
    isResolved: v.boolean(),
    parentCommentId: v.optional(v.id("documentComments")),
    createdAt: v.number(),
  }).index("by_document", ["documentId"])
    .index("by_google_doc", ["googleDocId"])
    .index("by_parent", ["parentCommentId"]),

  // Store document templates
  documentTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    content: v.string(),
    createdBy: v.id("users"),
    isPublic: v.boolean(),
    usageCount: v.number(),
  }).index("by_category", ["category"])
    .index("by_creator", ["createdBy"]),

  // Store user preferences and settings
  userPreferences: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
    defaultFont: v.string(),
    defaultFontSize: v.number(),
    autoSave: v.boolean(),
    showWordCount: v.boolean(),
    showReadingTime: v.boolean(),
    notifications: v.object({
      comments: v.boolean(),
      mentions: v.boolean(),
      documentShared: v.boolean(),
    }),
  }).index("by_user", ["userId"]),
});