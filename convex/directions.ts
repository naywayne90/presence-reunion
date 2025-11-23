import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste toutes les directions
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const directions = await ctx.db.query("directions").collect();

    // Enrichir avec les informations du responsable
    const enrichedDirections = await Promise.all(
      directions.map(async (direction) => {
        const responsible = direction.responsibleId
          ? await ctx.db.get(direction.responsibleId)
          : null;

        // Compter le nombre de services rattachés
        const services = await ctx.db
          .query("services")
          .withIndex("by_direction", (q) =>
            q.eq("directionId", direction._id)
          )
          .collect();

        // Compter le nombre d'agents dans la direction
        const agents = await ctx.db
          .query("internalUsers")
          .withIndex("by_direction", (q) =>
            q.eq("directionId", direction._id)
          )
          .collect();

        return {
          ...direction,
          responsible,
          servicesCount: services.length,
          agentsCount: agents.length,
        };
      })
    );

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return enrichedDirections.filter((d) => d.isActive === args.isActive);
    }

    return enrichedDirections;
  },
});

// Récupère une direction par ID
export const getById = query({
  args: { id: v.id("directions") },
  handler: async (ctx, args) => {
    const direction = await ctx.db.get(args.id);
    if (!direction) return null;

    const responsible = direction.responsibleId
      ? await ctx.db.get(direction.responsibleId)
      : null;

    // Récupérer les services rattachés
    const services = await ctx.db
      .query("services")
      .withIndex("by_direction", (q) => q.eq("directionId", direction._id))
      .collect();

    // Récupérer les agents de la direction
    const agents = await ctx.db
      .query("internalUsers")
      .withIndex("by_direction", (q) => q.eq("directionId", direction._id))
      .collect();

    return {
      ...direction,
      responsible,
      services,
      agents,
    };
  },
});

// Récupère une direction par code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const direction = await ctx.db
      .query("directions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!direction) return null;

    const responsible = direction.responsibleId
      ? await ctx.db.get(direction.responsibleId)
      : null;

    return {
      ...direction,
      responsible,
    };
  },
});

// Statistiques des directions
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const directions = await ctx.db.query("directions").collect();

    const totalDirections = directions.length;
    const activeDirections = directions.filter((d) => d.isActive).length;

    // Compter les services par direction
    const servicesPerDirection = await Promise.all(
      directions.map(async (direction) => {
        const services = await ctx.db
          .query("services")
          .withIndex("by_direction", (q) =>
            q.eq("directionId", direction._id)
          )
          .collect();

        return {
          directionCode: direction.code,
          directionName: direction.name,
          servicesCount: services.length,
        };
      })
    );

    return {
      totalDirections,
      activeDirections,
      servicesPerDirection,
    };
  },
});

// ===== MUTATIONS =====

// Créer une nouvelle direction
export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    responsibleId: v.optional(v.id("internalUsers")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si le code existe déjà
    const existingByCode = await ctx.db
      .query("directions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingByCode) {
      throw new Error("Une direction avec ce code existe déjà");
    }

    const now = Date.now();

    const directionId = await ctx.db.insert("directions", {
      code: args.code,
      name: args.name,
      responsibleId: args.responsibleId,
      description: args.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return directionId;
  },
});

// Mettre à jour une direction
export const update = mutation({
  args: {
    id: v.id("directions"),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    responsibleId: v.optional(v.id("internalUsers")),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que la direction existe
    const existingDirection = await ctx.db.get(id);
    if (!existingDirection) {
      throw new Error("Direction non trouvée");
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updates.code && updates.code !== existingDirection.code) {
      const existingByCode = await ctx.db
        .query("directions")
        .withIndex("by_code", (q) => q.eq("code", updates.code))
        .first();

      if (existingByCode) {
        throw new Error("Une direction avec ce code existe déjà");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver une direction (soft delete)
export const deactivate = mutation({
  args: { id: v.id("directions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer une direction
export const activate = mutation({
  args: { id: v.id("directions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement une direction (hard delete)
export const remove = mutation({
  args: { id: v.id("directions") },
  handler: async (ctx, args) => {
    // Vérifier qu'il n'y a pas de services rattachés
    const services = await ctx.db
      .query("services")
      .withIndex("by_direction", (q) => q.eq("directionId", args.id))
      .collect();

    if (services.length > 0) {
      throw new Error(
        "Impossible de supprimer une direction avec des services rattachés"
      );
    }

    // Vérifier qu'il n'y a pas d'agents rattachés
    const agents = await ctx.db
      .query("internalUsers")
      .withIndex("by_direction", (q) => q.eq("directionId", args.id))
      .collect();

    if (agents.length > 0) {
      throw new Error(
        "Impossible de supprimer une direction avec des agents rattachés"
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
