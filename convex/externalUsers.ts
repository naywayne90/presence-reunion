import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste tous les utilisateurs externes
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("externalUsers");

    // Filtrer par type si spécifié
    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type));
    }

    const users = await query.collect();

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return users.filter((u) => u.isActive === args.isActive);
    }

    return users;
  },
});

// Récupère un utilisateur externe par ID
export const getById = query({
  args: { id: v.id("externalUsers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Récupère un utilisateur externe par email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Liste les utilisateurs externes par type
export const listByType = query({
  args: {
    type: v.union(
      v.literal("PARTNER"),
      v.literal("SUPPLIER"),
      v.literal("DONOR"),
      v.literal("VIP")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalUsers")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Liste les utilisateurs externes par organisation
export const listByOrganization = query({
  args: { organization: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalUsers")
      .withIndex("by_organization", (q) => q.eq("organization", args.organization))
      .collect();
  },
});

// Recherche d'utilisateurs externes
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("externalUsers").collect();

    const searchLower = args.searchTerm.toLowerCase();

    return allUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.organization.toLowerCase().includes(searchLower)
    );
  },
});

// Statistiques des utilisateurs externes
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("externalUsers").collect();

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Compter par type
    const byType: Record<string, number> = {
      PARTNER: 0,
      SUPPLIER: 0,
      DONOR: 0,
      VIP: 0,
    };

    allUsers.forEach((user) => {
      byType[user.type] = (byType[user.type] || 0) + 1;
    });

    // Compter par organisation (top 10)
    const byOrganization: Record<string, number> = {};
    allUsers.forEach((user) => {
      byOrganization[user.organization] =
        (byOrganization[user.organization] || 0) + 1;
    });

    const topOrganizations = Object.entries(byOrganization)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([org, count]) => ({ organization: org, count }));

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byType,
      topOrganizations,
    };
  },
});

// ===== MUTATIONS =====

// Créer un nouvel utilisateur externe
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    organization: v.string(),
    position: v.string(),
    type: v.union(
      v.literal("PARTNER"),
      v.literal("SUPPLIER"),
      v.literal("DONOR"),
      v.literal("VIP")
    ),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'email existe déjà
    const existingByEmail = await ctx.db
      .query("externalUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      throw new Error("Un utilisateur externe avec cet email existe déjà");
    }

    const now = Date.now();

    const userId = await ctx.db.insert("externalUsers", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      organization: args.organization,
      position: args.position,
      type: args.type,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Mettre à jour un utilisateur externe
export const update = mutation({
  args: {
    id: v.id("externalUsers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    position: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("PARTNER"),
        v.literal("SUPPLIER"),
        v.literal("DONOR"),
        v.literal("VIP")
      )
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que l'utilisateur existe
    const existingUser = await ctx.db.get(id);
    if (!existingUser) {
      throw new Error("Utilisateur externe non trouvé");
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updates.email && updates.email !== existingUser.email) {
      const existingByEmail = await ctx.db
        .query("externalUsers")
        .withIndex("by_email", (q) => q.eq("email", updates.email))
        .first();

      if (existingByEmail) {
        throw new Error("Un utilisateur externe avec cet email existe déjà");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver un utilisateur externe (soft delete)
export const deactivate = mutation({
  args: { id: v.id("externalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer un utilisateur externe
export const activate = mutation({
  args: { id: v.id("externalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement un utilisateur externe (hard delete)
export const remove = mutation({
  args: { id: v.id("externalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Import en masse d'utilisateurs externes
export const bulkCreate = mutation({
  args: {
    users: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        organization: v.string(),
        position: v.string(),
        type: v.union(
          v.literal("PARTNER"),
          v.literal("SUPPLIER"),
          v.literal("DONOR"),
          v.literal("VIP")
        ),
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

    for (const user of args.users) {
      try {
        // Vérifier si l'email existe déjà
        const existingByEmail = await ctx.db
          .query("externalUsers")
          .withIndex("by_email", (q) => q.eq("email", user.email))
          .first();

        if (existingByEmail) {
          results.skipped++;
          results.errors.push(
            `Email ${user.email} existe déjà - ignoré`
          );
          continue;
        }

        await ctx.db.insert("externalUsers", {
          ...user,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        results.created++;
      } catch (error) {
        results.errors.push(
          `Erreur pour ${user.email}: ${error instanceof Error ? error.message : "Erreur inconnue"}`
        );
      }
    }

    return results;
  },
});
