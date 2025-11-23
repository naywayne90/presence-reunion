import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste tous les types de réunions
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const types = await ctx.db.query("meetingTypes").collect();

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return types.filter((t) => t.isActive === args.isActive);
    }

    return types;
  },
});

// Récupère un type de réunion par ID
export const getById = query({
  args: { id: v.id("meetingTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Récupère un type de réunion par code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetingTypes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// Liste les types de réunions nécessitant une approbation
export const listRequiringApproval = query({
  args: {},
  handler: async (ctx) => {
    const allTypes = await ctx.db.query("meetingTypes").collect();
    return allTypes.filter((t) => t.requiresApproval && t.isActive);
  },
});

// ===== MUTATIONS =====

// Créer un nouveau type de réunion
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    requiresApproval: v.boolean(),
    approvalWorkflow: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Vérifier si le code existe déjà
    const existingByCode = await ctx.db
      .query("meetingTypes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingByCode) {
      throw new Error("Un type de réunion avec ce code existe déjà");
    }

    const now = Date.now();

    const typeId = await ctx.db.insert("meetingTypes", {
      name: args.name,
      code: args.code,
      description: args.description,
      icon: args.icon,
      color: args.color,
      requiresApproval: args.requiresApproval,
      approvalWorkflow: args.approvalWorkflow,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return typeId;
  },
});

// Mettre à jour un type de réunion
export const update = mutation({
  args: {
    id: v.id("meetingTypes"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    requiresApproval: v.optional(v.boolean()),
    approvalWorkflow: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que le type existe
    const existingType = await ctx.db.get(id);
    if (!existingType) {
      throw new Error("Type de réunion non trouvé");
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updates.code && updates.code !== existingType.code) {
      const existingByCode = await ctx.db
        .query("meetingTypes")
        .withIndex("by_code", (q) => q.eq("code", updates.code))
        .first();

      if (existingByCode) {
        throw new Error("Un type de réunion avec ce code existe déjà");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver un type de réunion (soft delete)
export const deactivate = mutation({
  args: { id: v.id("meetingTypes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer un type de réunion
export const activate = mutation({
  args: { id: v.id("meetingTypes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement un type de réunion (hard delete)
export const remove = mutation({
  args: { id: v.id("meetingTypes") },
  handler: async (ctx, args) => {
    // TODO: Vérifier qu'il n'y a pas de réunions utilisant ce type
    // Sera implémenté dans Phase 3

    await ctx.db.delete(args.id);
    return args.id;
  },
});
