import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste tous les services
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
    directionId: v.optional(v.id("directions")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("services");

    // Filtrer par direction si spécifié
    if (args.directionId) {
      query = query.withIndex("by_direction", (q) =>
        q.eq("directionId", args.directionId)
      );
    }

    const services = await query.collect();

    // Enrichir avec les informations de la direction et du responsable
    const enrichedServices = await Promise.all(
      services.map(async (service) => {
        const direction = await ctx.db.get(service.directionId);
        const responsible = service.responsibleId
          ? await ctx.db.get(service.responsibleId)
          : null;

        // Compter le nombre d'agents dans le service
        const agents = await ctx.db
          .query("internalUsers")
          .withIndex("by_service", (q) => q.eq("serviceId", service._id))
          .collect();

        return {
          ...service,
          direction,
          responsible,
          agentsCount: agents.length,
        };
      })
    );

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return enrichedServices.filter((s) => s.isActive === args.isActive);
    }

    return enrichedServices;
  },
});

// Récupère un service par ID
export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service) return null;

    const direction = await ctx.db.get(service.directionId);
    const responsible = service.responsibleId
      ? await ctx.db.get(service.responsibleId)
      : null;

    // Récupérer les agents du service
    const agents = await ctx.db
      .query("internalUsers")
      .withIndex("by_service", (q) => q.eq("serviceId", service._id))
      .collect();

    return {
      ...service,
      direction,
      responsible,
      agents,
    };
  },
});

// Récupère un service par code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db
      .query("services")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!service) return null;

    const direction = await ctx.db.get(service.directionId);
    const responsible = service.responsibleId
      ? await ctx.db.get(service.responsibleId)
      : null;

    return {
      ...service,
      direction,
      responsible,
    };
  },
});

// Liste les services par direction
export const listByDirection = query({
  args: { directionId: v.id("directions") },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_direction", (q) => q.eq("directionId", args.directionId))
      .collect();

    // Enrichir avec les informations du responsable
    return await Promise.all(
      services.map(async (service) => {
        const responsible = service.responsibleId
          ? await ctx.db.get(service.responsibleId)
          : null;

        return {
          ...service,
          responsible,
        };
      })
    );
  },
});

// ===== MUTATIONS =====

// Créer un nouveau service
export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    directionId: v.id("directions"),
    responsibleId: v.optional(v.id("internalUsers")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si le code existe déjà
    const existingByCode = await ctx.db
      .query("services")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingByCode) {
      throw new Error("Un service avec ce code existe déjà");
    }

    // Vérifier que la direction existe
    const direction = await ctx.db.get(args.directionId);
    if (!direction) {
      throw new Error("Direction non trouvée");
    }

    const now = Date.now();

    const serviceId = await ctx.db.insert("services", {
      code: args.code,
      name: args.name,
      directionId: args.directionId,
      responsibleId: args.responsibleId,
      description: args.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return serviceId;
  },
});

// Mettre à jour un service
export const update = mutation({
  args: {
    id: v.id("services"),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    directionId: v.optional(v.id("directions")),
    responsibleId: v.optional(v.id("internalUsers")),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que le service existe
    const existingService = await ctx.db.get(id);
    if (!existingService) {
      throw new Error("Service non trouvé");
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updates.code && updates.code !== existingService.code) {
      const existingByCode = await ctx.db
        .query("services")
        .withIndex("by_code", (q) => q.eq("code", updates.code))
        .first();

      if (existingByCode) {
        throw new Error("Un service avec ce code existe déjà");
      }
    }

    // Si la direction est modifiée, vérifier qu'elle existe
    if (updates.directionId) {
      const direction = await ctx.db.get(updates.directionId);
      if (!direction) {
        throw new Error("Direction non trouvée");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver un service (soft delete)
export const deactivate = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer un service
export const activate = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement un service (hard delete)
export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    // Vérifier qu'il n'y a pas d'agents rattachés
    const agents = await ctx.db
      .query("internalUsers")
      .withIndex("by_service", (q) => q.eq("serviceId", args.id))
      .collect();

    if (agents.length > 0) {
      throw new Error(
        "Impossible de supprimer un service avec des agents rattachés"
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
