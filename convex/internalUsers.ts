import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ===== HELPER FUNCTIONS =====

// Fonction pour obtenir les permissions par défaut selon le rôle
export function getDefaultPermissions(role: string) {
  switch (role) {
    case "DG":
      return {
        canCreateMeeting: true,
        canValidateMeeting: true,
        canReserveRoom: true,
        canModifyAgenda: true,
        canCloseMeeting: true,
        canViewAllMeetings: true,
        canViewOnlyDirection: false,
        canViewStats: true,
      };
    case "DIRECTOR":
      return {
        canCreateMeeting: true,
        canValidateMeeting: true,
        canReserveRoom: true,
        canModifyAgenda: true,
        canCloseMeeting: true,
        canViewAllMeetings: false,
        canViewOnlyDirection: true,
        canViewStats: true,
      };
    case "SERVICE_HEAD":
      return {
        canCreateMeeting: true,
        canValidateMeeting: true,
        canReserveRoom: true,
        canModifyAgenda: true,
        canCloseMeeting: false,
        canViewAllMeetings: false,
        canViewOnlyDirection: true,
        canViewStats: false,
      };
    case "SECRETARY":
      return {
        canCreateMeeting: true,
        canValidateMeeting: false,
        canReserveRoom: true,
        canModifyAgenda: true,
        canCloseMeeting: false,
        canViewAllMeetings: false,
        canViewOnlyDirection: true,
        canViewStats: false,
      };
    case "COMMUNICATION":
      return {
        canCreateMeeting: true,
        canValidateMeeting: false,
        canReserveRoom: true,
        canModifyAgenda: false,
        canViewAllMeetings: true,
        canViewOnlyDirection: false,
        canViewStats: true,
      };
    case "HR":
      return {
        canCreateMeeting: true,
        canValidateMeeting: false,
        canReserveRoom: true,
        canModifyAgenda: false,
        canViewAllMeetings: true,
        canViewOnlyDirection: false,
        canViewStats: true,
      };
    case "AGENT":
      return {
        canCreateMeeting: false,
        canValidateMeeting: false,
        canReserveRoom: false,
        canModifyAgenda: false,
        canCloseMeeting: false,
        canViewAllMeetings: false,
        canViewOnlyDirection: true,
        canViewStats: false,
      };
    case "ADMIN":
      return {
        canCreateMeeting: true,
        canValidateMeeting: true,
        canReserveRoom: true,
        canModifyAgenda: true,
        canCloseMeeting: true,
        canViewAllMeetings: true,
        canViewOnlyDirection: false,
        canViewStats: true,
      };
    default:
      return {
        canCreateMeeting: false,
        canValidateMeeting: false,
        canReserveRoom: false,
        canModifyAgenda: false,
        canCloseMeeting: false,
        canViewAllMeetings: false,
        canViewOnlyDirection: true,
        canViewStats: false,
      };
  }
}

// ===== QUERIES =====

// Liste tous les utilisateurs internes
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
    role: v.optional(v.string()),
    directionId: v.optional(v.id("directions")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("internalUsers");

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      const users = await query.collect();
      return users.filter((u) => u.isActive === args.isActive);
    }

    // Filtrer par rôle si spécifié
    if (args.role) {
      query = query.withIndex("by_role", (q) => q.eq("role", args.role));
    }

    // Filtrer par direction si spécifié
    if (args.directionId) {
      query = query.withIndex("by_direction", (q) =>
        q.eq("directionId", args.directionId)
      );
    }

    const users = await query.collect();

    // Enrichir avec les informations de direction et service
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const direction = user.directionId
          ? await ctx.db.get(user.directionId)
          : null;
        const service = user.serviceId ? await ctx.db.get(user.serviceId) : null;

        return {
          ...user,
          direction,
          service,
        };
      })
    );

    return enrichedUsers;
  },
});

// Récupère un utilisateur par ID
export const getById = query({
  args: { id: v.id("internalUsers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    const direction = user.directionId
      ? await ctx.db.get(user.directionId)
      : null;
    const service = user.serviceId ? await ctx.db.get(user.serviceId) : null;

    return {
      ...user,
      direction,
      service,
    };
  },
});

// Récupère un utilisateur par email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("internalUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    const direction = user.directionId
      ? await ctx.db.get(user.directionId)
      : null;
    const service = user.serviceId ? await ctx.db.get(user.serviceId) : null;

    return {
      ...user,
      direction,
      service,
    };
  },
});

// Récupère un utilisateur par matricule
export const getByMatricule = query({
  args: { matricule: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("internalUsers")
      .withIndex("by_matricule", (q) => q.eq("matricule", args.matricule))
      .first();

    if (!user) return null;

    const direction = user.directionId
      ? await ctx.db.get(user.directionId)
      : null;
    const service = user.serviceId ? await ctx.db.get(user.serviceId) : null;

    return {
      ...user,
      direction,
      service,
    };
  },
});

// Liste les utilisateurs par direction
export const listByDirection = query({
  args: { directionId: v.id("directions") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("internalUsers")
      .withIndex("by_direction", (q) => q.eq("directionId", args.directionId))
      .collect();

    return users;
  },
});

// Liste les utilisateurs par service
export const listByService = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("internalUsers")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();

    return users;
  },
});

// Liste les utilisateurs par rôle
export const listByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("internalUsers")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();

    return users;
  },
});

// Statistiques des utilisateurs
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("internalUsers").collect();

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Compter par rôle
    const byRole: Record<string, number> = {};
    allUsers.forEach((user) => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byRole,
    };
  },
});

// ===== MUTATIONS =====

// Créer un nouvel utilisateur interne
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    matricule: v.string(),
    directionId: v.optional(v.id("directions")),
    serviceId: v.optional(v.id("services")),
    position: v.string(),
    role: v.union(
      v.literal("DG"),
      v.literal("DIRECTOR"),
      v.literal("SERVICE_HEAD"),
      v.literal("AGENT"),
      v.literal("SECRETARY"),
      v.literal("COMMUNICATION"),
      v.literal("HR"),
      v.literal("ADMIN")
    ),
    customPermissions: v.optional(
      v.object({
        canCreateMeeting: v.boolean(),
        canValidateMeeting: v.boolean(),
        canReserveRoom: v.boolean(),
        canModifyAgenda: v.boolean(),
        canCloseMeeting: v.boolean(),
        canViewAllMeetings: v.boolean(),
        canViewOnlyDirection: v.boolean(),
        canViewStats: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'email existe déjà
    const existingByEmail = await ctx.db
      .query("internalUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Vérifier si le matricule existe déjà
    const existingByMatricule = await ctx.db
      .query("internalUsers")
      .withIndex("by_matricule", (q) => q.eq("matricule", args.matricule))
      .first();

    if (existingByMatricule) {
      throw new Error("Un utilisateur avec ce matricule existe déjà");
    }

    // Obtenir les permissions par défaut ou utiliser les permissions personnalisées
    const permissions = args.customPermissions || getDefaultPermissions(args.role);

    const now = Date.now();

    const userId = await ctx.db.insert("internalUsers", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      matricule: args.matricule,
      directionId: args.directionId,
      serviceId: args.serviceId,
      position: args.position,
      role: args.role,
      permissions,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Mettre à jour un utilisateur interne
export const update = mutation({
  args: {
    id: v.id("internalUsers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    matricule: v.optional(v.string()),
    directionId: v.optional(v.id("directions")),
    serviceId: v.optional(v.id("services")),
    position: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("DG"),
        v.literal("DIRECTOR"),
        v.literal("SERVICE_HEAD"),
        v.literal("AGENT"),
        v.literal("SECRETARY"),
        v.literal("COMMUNICATION"),
        v.literal("HR"),
        v.literal("ADMIN")
      )
    ),
    permissions: v.optional(
      v.object({
        canCreateMeeting: v.boolean(),
        canValidateMeeting: v.boolean(),
        canReserveRoom: v.boolean(),
        canModifyAgenda: v.boolean(),
        canCloseMeeting: v.boolean(),
        canViewAllMeetings: v.boolean(),
        canViewOnlyDirection: v.boolean(),
        canViewStats: v.boolean(),
      })
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que l'utilisateur existe
    const existingUser = await ctx.db.get(id);
    if (!existingUser) {
      throw new Error("Utilisateur non trouvé");
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updates.email && updates.email !== existingUser.email) {
      const existingByEmail = await ctx.db
        .query("internalUsers")
        .withIndex("by_email", (q) => q.eq("email", updates.email))
        .first();

      if (existingByEmail) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }
    }

    // Si le matricule est modifié, vérifier qu'il n'existe pas déjà
    if (updates.matricule && updates.matricule !== existingUser.matricule) {
      const existingByMatricule = await ctx.db
        .query("internalUsers")
        .withIndex("by_matricule", (q) => q.eq("matricule", updates.matricule))
        .first();

      if (existingByMatricule) {
        throw new Error("Un utilisateur avec ce matricule existe déjà");
      }
    }

    // Si le rôle change et qu'aucune permission personnalisée n'est fournie,
    // mettre à jour avec les permissions par défaut du nouveau rôle
    let finalPermissions = updates.permissions;
    if (updates.role && updates.role !== existingUser.role && !updates.permissions) {
      finalPermissions = getDefaultPermissions(updates.role);
    }

    await ctx.db.patch(id, {
      ...updates,
      ...(finalPermissions && { permissions: finalPermissions }),
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver un utilisateur (soft delete)
export const deactivate = mutation({
  args: { id: v.id("internalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer un utilisateur
export const activate = mutation({
  args: { id: v.id("internalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement un utilisateur (hard delete)
export const remove = mutation({
  args: { id: v.id("internalUsers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mettre à jour uniquement les permissions
export const updatePermissions = mutation({
  args: {
    id: v.id("internalUsers"),
    permissions: v.object({
      canCreateMeeting: v.boolean(),
      canValidateMeeting: v.boolean(),
      canReserveRoom: v.boolean(),
      canModifyAgenda: v.boolean(),
      canCloseMeeting: v.boolean(),
      canViewAllMeetings: v.boolean(),
      canViewOnlyDirection: v.boolean(),
      canViewStats: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      permissions: args.permissions,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Réinitialiser les permissions aux valeurs par défaut du rôle
export const resetPermissions = mutation({
  args: { id: v.id("internalUsers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const defaultPermissions = getDefaultPermissions(user.role);

    await ctx.db.patch(args.id, {
      permissions: defaultPermissions,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
