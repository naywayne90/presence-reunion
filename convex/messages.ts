import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query pour récupérer tous les messages
export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").collect();

    // Enrichir avec les informations de l'utilisateur
    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        user: await ctx.db.get(message.userId),
      }))
    );
  },
});

// Query pour récupérer les messages d'un utilisateur
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Mutation pour créer un nouveau message
export const send = mutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      content: args.content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// Mutation pour supprimer un message
export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
