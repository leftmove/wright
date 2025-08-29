import { Doc } from "../convex/_generated/dataModel";
import { QueryCtx } from "../convex/_generated/server";
import { ConvexError } from "convex/values";
import { authorizeUser } from "../convex/auth";

class ChecksInitial {
  ctx: QueryCtx;
  document: Doc<"documents"> | null;
  promises: Array<(doc: Doc<"documents">) => Promise<void> | void> = [];

  constructor(ctx: QueryCtx, document: Doc<"documents"> | null) {
    this.ctx = ctx;
    this.document = document;
  }

  exists() {
    this.promises.push((doc) => {
      if (!doc) {
        throw new ConvexError({
          message: "Document not found",
          code: "NotFound",
        });
      }
    });
    return new Checks(this.ctx, this.document as Doc<"documents">);
  }

  async apply(): Promise<Doc<"documents">> {
    for (const promise of this.promises) {
      await promise(this.document as Doc<"documents">);
    }
    return this.document as Doc<"documents">;
  }
}

/*
Checks that the document exists, is authorized, and returns the document.
*/
class Checks extends ChecksInitial {
  constructor(ctx: QueryCtx, document: Doc<"documents">) {
    super(ctx, document);
  }

  /*
  Checks that the document is authorized.
  */
  authorized() {
    this.promises.push(async (doc) => {
      if (doc.visibility === "private") {
        const user = await authorizeUser(this.ctx);
        if (!user) {
          throw new ConvexError({
            message: "Not authorized to view this document",
            code: "Unauthorized",
          });
        }
        if (doc.userId !== user.tokenIdentifier) {
          throw new ConvexError({
            message: "Access not allowed",
            code: "Forbidden",
          });
        }
      }
    });
    return this;
  }
}

/*
Creates a new document adapter.

Allows for chaining of document checks and returns the document.

@param ctx - The query context.
@param document - The document to check.
@returns A new document adapter.
*/
export const documentAdapter = (
  ctx: QueryCtx,
  document: Doc<"documents"> | null
) => new ChecksInitial(ctx, document);
