import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Store Google OAuth tokens
export const storeGoogleTokens = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if tokens already exist for this user
    const existingTokens = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingTokens) {
      // Update existing tokens
      await ctx.db.patch(existingTokens._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken || existingTokens.refreshToken,
        expiresAt: args.expiresAt,
      });
    } else {
      // Create new token record
      await ctx.db.insert("googleTokens", {
        userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
      });
    }

    return null;
  },
});

// Get Google OAuth tokens for current user
export const getGoogleTokens = query({
  args: {},
  returns: v.union(
    v.object({
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const tokens = await ctx.db
      .query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!tokens) {
      return null;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
  },
});

// Fetch documents from Google Docs API
export const fetchGoogleDocs = action({
  args: {},
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    modifiedTime: v.string(),
    webViewLink: v.string(),
  })),
  handler: async (ctx) => {
    const tokens = await ctx.runQuery(internal.google.getGoogleTokensInternal);
    if (!tokens) {
      throw new Error("No Google tokens found");
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime,webViewLink)",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files.map((file: any) => ({
        id: file.id,
        title: file.name,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      }));
    } catch (error) {
      console.error("Error fetching Google Docs:", error);
      throw new Error("Failed to fetch documents from Google Drive");
    }
  },
});

// Internal query to get tokens (for use in actions)
export const getGoogleTokensInternal = internalQuery({
  args: {},
  returns: v.union(
    v.object({
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    // This would need to be called with a specific user context
    // For now, we'll implement a basic version
    const tokens = await ctx.db.query("googleTokens").first();
    if (!tokens) {
      return null;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
  },
});

// Fetch document content from Google Docs API
export const fetchDocumentContent = action({
  args: {
    documentId: v.string(),
  },
  returns: v.object({
    title: v.string(),
    content: v.string(),
    wordCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(internal.google.getGoogleTokensInternal);
    if (!tokens) {
      throw new Error("No Google tokens found");
    }

    try {
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${args.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Docs API error: ${response.statusText}`);
      }

      const doc = await response.json();
      
      // Extract text content from the document structure
      let content = "";
      let wordCount = 0;
      
      if (doc.body && doc.body.content) {
        for (const element of doc.body.content) {
          if (element.paragraph && element.paragraph.elements) {
            for (const textElement of element.paragraph.elements) {
              if (textElement.textRun && textElement.textRun.content) {
                content += textElement.textRun.content;
                // Simple word count (split by whitespace and filter empty strings)
                wordCount += textElement.textRun.content.split(/\s+/).filter(word => word.length > 0).length;
              }
            }
          }
        }
      }

      return {
        title: doc.title || "Untitled Document",
        content,
        wordCount,
      };
    } catch (error) {
      console.error("Error fetching document content:", error);
      throw new Error("Failed to fetch document content");
    }
  },
});

// Create a new Google Doc
export const createGoogleDoc = action({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
  },
  returns: v.object({
    documentId: v.string(),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(internal.google.getGoogleTokensInternal);
    if (!tokens) {
      throw new Error("No Google tokens found");
    }

    try {
      // Create the document
      const createResponse = await fetch(
        "https://docs.googleapis.com/v1/documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: args.title,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Google Docs API error: ${createResponse.statusText}`);
      }

      const doc = await createResponse.json();

      // If content is provided, add it to the document
      if (args.content) {
        await fetch(
          `https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requests: [
                {
                  insertText: {
                    location: {
                      index: 1,
                    },
                    text: args.content,
                  },
                },
              ],
            }),
          }
        );
      }

      return {
        documentId: doc.documentId,
        title: doc.title,
      };
    } catch (error) {
      console.error("Error creating Google Doc:", error);
      throw new Error("Failed to create document");
    }
  },
});