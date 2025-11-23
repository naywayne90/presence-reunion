import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ===== QUERIES =====

// Liste toutes les salles/lieux
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
    type: v.optional(v.union(v.literal("INTERNAL"), v.literal("EXTERNAL"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("rooms");

    // Filtrer par type si spécifié
    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type));
    }

    const rooms = await query.collect();

    // Filtrer par statut actif si spécifié
    if (args.isActive !== undefined) {
      return rooms.filter((r) => r.isActive === args.isActive);
    }

    return rooms;
  },
});

// Récupère une salle par ID
export const getById = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Liste les salles internes
export const listInternal = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_type", (q) => q.eq("type", "INTERNAL"))
      .collect();
  },
});

// Liste les lieux externes
export const listExternal = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_type", (q) => q.eq("type", "EXTERNAL"))
      .collect();
  },
});

// Recherche de salles disponibles par capacité
export const searchByCapacity = query({
  args: {
    minCapacity: v.number(),
    type: v.optional(v.union(v.literal("INTERNAL"), v.literal("EXTERNAL"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("rooms");

    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type));
    }

    const rooms = await query.collect();

    return rooms.filter(
      (room) =>
        room.isActive &&
        room.capacity !== undefined &&
        room.capacity >= args.minCapacity
    );
  },
});

// Recherche de salles par équipement
export const searchByEquipment = query({
  args: {
    equipment: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_type", (q) => q.eq("type", "INTERNAL"))
      .collect();

    // Filtrer les salles qui ont tous les équipements demandés
    return rooms.filter((room) => {
      if (!room.equipment || room.equipment.length === 0) return false;

      return args.equipment.every((eq) =>
        room.equipment?.some((roomEq) =>
          roomEq.toLowerCase().includes(eq.toLowerCase())
        )
      );
    });
  },
});

// Statistiques des salles
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const allRooms = await ctx.db.query("rooms").collect();

    const totalRooms = allRooms.length;
    const activeRooms = allRooms.filter((r) => r.isActive).length;
    const internalRooms = allRooms.filter((r) => r.type === "INTERNAL").length;
    const externalRooms = allRooms.filter((r) => r.type === "EXTERNAL").length;

    // Capacité totale des salles internes
    const totalCapacity = allRooms
      .filter((r) => r.type === "INTERNAL" && r.capacity)
      .reduce((sum, r) => sum + (r.capacity || 0), 0);

    // Équipements les plus courants
    const equipmentCount: Record<string, number> = {};
    allRooms.forEach((room) => {
      if (room.equipment) {
        room.equipment.forEach((eq) => {
          equipmentCount[eq] = (equipmentCount[eq] || 0) + 1;
        });
      }
    });

    return {
      totalRooms,
      activeRooms,
      internalRooms,
      externalRooms,
      totalCapacity,
      equipmentCount,
    };
  },
});

// ===== MUTATIONS =====

// Créer une nouvelle salle/lieu
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("INTERNAL"), v.literal("EXTERNAL")),
    capacity: v.optional(v.number()),
    floor: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    address: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si une salle avec le même nom existe déjà
    const existing = await ctx.db.query("rooms").collect();
    const existingByName = existing.find(
      (r) => r.name.toLowerCase() === args.name.toLowerCase()
    );

    if (existingByName) {
      throw new Error("Une salle/lieu avec ce nom existe déjà");
    }

    const now = Date.now();

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      type: args.type,
      capacity: args.capacity,
      floor: args.floor,
      equipment: args.equipment,
      address: args.address,
      contactPerson: args.contactPerson,
      contactPhone: args.contactPhone,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return roomId;
  },
});

// Mettre à jour une salle/lieu
export const update = mutation({
  args: {
    id: v.id("rooms"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("INTERNAL"), v.literal("EXTERNAL"))),
    capacity: v.optional(v.number()),
    floor: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    address: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Vérifier que la salle existe
    const existingRoom = await ctx.db.get(id);
    if (!existingRoom) {
      throw new Error("Salle/lieu non trouvé");
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (updates.name && updates.name !== existingRoom.name) {
      const rooms = await ctx.db.query("rooms").collect();
      const existingByName = rooms.find(
        (r) => r.name.toLowerCase() === updates.name!.toLowerCase()
      );

      if (existingByName) {
        throw new Error("Une salle/lieu avec ce nom existe déjà");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Désactiver une salle (soft delete)
export const deactivate = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Activer une salle
export const activate = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Supprimer définitivement une salle (hard delete)
export const remove = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    // TODO: Vérifier qu'il n'y a pas de réunions programmées dans cette salle
    // Sera implémenté dans Phase 3

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Ajouter un équipement à une salle
export const addEquipment = mutation({
  args: {
    id: v.id("rooms"),
    equipment: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room) {
      throw new Error("Salle non trouvée");
    }

    const currentEquipment = room.equipment || [];

    // Vérifier que l'équipement n'existe pas déjà
    if (currentEquipment.includes(args.equipment)) {
      throw new Error("Cet équipement existe déjà pour cette salle");
    }

    await ctx.db.patch(args.id, {
      equipment: [...currentEquipment, args.equipment],
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Retirer un équipement d'une salle
export const removeEquipment = mutation({
  args: {
    id: v.id("rooms"),
    equipment: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);
    if (!room) {
      throw new Error("Salle non trouvée");
    }

    const currentEquipment = room.equipment || [];
    const newEquipment = currentEquipment.filter((eq) => eq !== args.equipment);

    await ctx.db.patch(args.id, {
      equipment: newEquipment,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
