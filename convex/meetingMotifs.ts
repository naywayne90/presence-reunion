import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste tous les motifs de réunions
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const motifs = await ctx.db.query("meetingMotifs").collect();

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return motifs.filter((m) => m.isActive === args.isActive);
    }

    return motifs;
  },
});

// Récupère un motif par ID
export const getById = query({
  args: { id: v.id("meetingMotifs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Recherche de motifs
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allMotifs = await ctx.db.query("meetingMotifs").collect();

    const searchLower = args.searchTerm.toLowerCase();

    return allMotifs.filter(
      (motif) =>
        motif.name.toLowerCase().includes(searchLower) ||
        motif.description?.toLowerCase().includes(searchLower)
    );
  },
});

// ===== MUTATIONS =====

// Créer un nouveau motif
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si un motif avec le même nom existe déjà
    const allMotifs = await ctx.db.query("meetingMotifs").collect();
    const existingByName = allMotifs.find(
      (m) => m.name.toLowerCase() === args.name.toLowerCase()
    );

    if (existingByName) {
      throw new Error("Un motif avec ce nom existe déjà");
    }

    const now = Date.now();

    const motifId = await ctx.db.insert("meetingMotifs", {
      name: args.name,
      description: args.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return motifId;
  },
});

// Mettre à jour un motif
export const update = mutation({
  args: {
    id: v.id("meetingMotifs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que le motif existe
    const existingMotif = await ctx.db.get(id);
    if (!existingMotif) {
      throw new Error("Motif non trouvé");
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (updates.name && updates.name !== existingMotif.name) {
      const allMotifs = await ctx.db.query("meetingMotifs").collect();
      const existingByName = allMotifs.find(
        (m) => m.name.toLowerCase() === updates.name!.toLowerCase()
      );

      if (existingByName) {
        throw new Error("Un motif avec ce nom existe déjà");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver un motif (soft delete)
export const deactivate = mutation({
  args: { id: v.id("meetingMotifs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer un motif
export const activate = mutation({
  args: { id: v.id("meetingMotifs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement un motif (hard delete)
export const remove = mutation({
  args: { id: v.id("meetingMotifs") },
  handler: async (ctx, args) => {
    // TODO: Vérifier qu'il n'y a pas de réunions utilisant ce motif
    // Sera implémenté dans Phase 3

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Import en masse de motifs
export const bulkCreate = mutation({
  args: {
    motifs: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const motif of args.motifs) {
      try {
        // Vérifier si le nom existe déjà
        const allMotifs = await ctx.db.query("meetingMotifs").collect();
        const existingByName = allMotifs.find(
          (m) => m.name.toLowerCase() === motif.name.toLowerCase()
        );

        if (existingByName) {
          results.skipped++;
          results.errors.push(`Motif "${motif.name}" existe déjà - ignoré`);
          continue;
        }

        await ctx.db.insert("meetingMotifs", {
          ...motif,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        results.created++;
      } catch (error) {
        results.errors.push(
          `Erreur pour "${motif.name}": ${error instanceof Error ? error.message : "Erreur inconnue"}`
        );
      }
    }

    return results;
  },
});
