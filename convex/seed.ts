import { mutation } from "./_generated/server";

// Fonction pour initialiser les données de base de l'application
export const initializeData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      directions: 0,
      services: 0,
      rooms: 0,
      meetingTypes: 0,
      meetingMotifs: 0,
      internalUsers: 0,
    };

    // 1. Créer les directions
    const directionsData = [
      { code: "DG", name: "Direction Générale" },
      { code: "DSI", name: "Direction des Systèmes d'Information" },
      { code: "DCSTI", name: "Direction de la Coordination et du Suivi Technique des Investissements" },
      { code: "DGPEC", name: "Direction Générale du Personnel et des Compétences" },
      { code: "DAF", name: "Direction Administrative et Financière" },
      { code: "DCOM", name: "Direction de la Communication" },
      { code: "DT", name: "Direction Technique" },
      { code: "DRH", name: "Direction des Ressources Humaines" },
    ];

    const directionIds: Record<string, string> = {};

    for (const dir of directionsData) {
      // Vérifier si existe déjà
      const existing = await ctx.db
        .query("directions")
        .withIndex("by_code", (q) => q.eq("code", dir.code))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("directions", {
          ...dir,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        directionIds[dir.code] = id;
        results.directions++;
      } else {
        directionIds[dir.code] = existing._id;
      }
    }

    // 2. Créer des services (exemples)
    const servicesData = [
      { code: "DSI-DEV", name: "Service Développement", directionCode: "DSI" },
      { code: "DSI-INF", name: "Service Infrastructure", directionCode: "DSI" },
      { code: "DSI-SUP", name: "Service Support", directionCode: "DSI" },
      { code: "DAF-COMPTA", name: "Service Comptabilité", directionCode: "DAF" },
      { code: "DAF-BUDGET", name: "Service Budget", directionCode: "DAF" },
      { code: "DRH-REC", name: "Service Recrutement", directionCode: "DRH" },
      { code: "DRH-FORM", name: "Service Formation", directionCode: "DRH" },
    ];

    for (const srv of servicesData) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_code", (q) => q.eq("code", srv.code))
        .first();

      if (!existing && directionIds[srv.directionCode]) {
        await ctx.db.insert("services", {
          code: srv.code,
          name: srv.name,
          directionId: directionIds[srv.directionCode] as any,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.services++;
      }
    }

    // 3. Créer des salles de réunion
    const roomsData = [
      {
        name: "Salle du Conseil",
        type: "INTERNAL" as const,
        capacity: 30,
        floor: "3ème étage",
        equipment: ["Visioconférence", "Écran TV", "Projecteur", "Microphones"],
      },
      {
        name: "Salle de Réunion A",
        type: "INTERNAL" as const,
        capacity: 15,
        floor: "2ème étage",
        equipment: ["TV", "Tableau blanc"],
      },
      {
        name: "Salle de Réunion B",
        type: "INTERNAL" as const,
        capacity: 10,
        floor: "2ème étage",
        equipment: ["TV", "Tableau blanc"],
      },
      {
        name: "Salle de Formation",
        type: "INTERNAL" as const,
        capacity: 25,
        floor: "1er étage",
        equipment: ["Projecteur", "Tableau blanc", "Microphones"],
      },
      {
        name: "Open Space DG",
        type: "INTERNAL" as const,
        capacity: 8,
        floor: "3ème étage",
        equipment: ["TV"],
      },
      {
        name: "Hôtel Azalaï",
        type: "EXTERNAL" as const,
        address: "Bd de la République, Abidjan",
        contactPerson: "Service Événements",
        contactPhone: "+225 XX XX XX XX",
      },
      {
        name: "Ministère des Transports",
        type: "EXTERNAL" as const,
        address: "Plateau, Abidjan",
      },
    ];

    for (const room of roomsData) {
      const existing = await ctx.db.query("rooms").collect();
      const found = existing.find(
        (r) => r.name.toLowerCase() === room.name.toLowerCase()
      );

      if (!found) {
        await ctx.db.insert("rooms", {
          ...room,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.rooms++;
      }
    }

    // 4. Créer les types de réunions
    const meetingTypesData = [
      {
        code: "COORD",
        name: "Réunion de coordination interne",
        icon: "👥",
        color: "#3B82F6",
        requiresApproval: false,
      },
      {
        code: "COMITE",
        name: "Comité technique",
        icon: "🔧",
        color: "#8B5CF6",
        requiresApproval: true,
        approvalWorkflow: ["SERVICE_HEAD", "DIRECTOR"],
      },
      {
        code: "STRATEG",
        name: "Réunion stratégique DG",
        icon: "🎯",
        color: "#EF4444",
        requiresApproval: true,
        approvalWorkflow: ["DIRECTOR", "DG"],
      },
      {
        code: "FORMATION",
        name: "Formation interne",
        icon: "📚",
        color: "#10B981",
        requiresApproval: false,
      },
      {
        code: "SEMINAIRE",
        name: "Séminaire / Atelier",
        icon: "🎓",
        color: "#F59E0B",
        requiresApproval: true,
        approvalWorkflow: ["DIRECTOR", "DG"],
      },
      {
        code: "COURTOISIE",
        name: "Visite de courtoisie",
        icon: "🤝",
        color: "#06B6D4",
        requiresApproval: true,
        approvalWorkflow: ["DG"],
      },
      {
        code: "PARTENAIRE",
        name: "Réunion avec partenaires externes",
        icon: "🌐",
        color: "#6366F1",
        requiresApproval: true,
        approvalWorkflow: ["DIRECTOR", "DG"],
      },
      {
        code: "CRISE",
        name: "Réunion de crise",
        icon: "⚠️",
        color: "#DC2626",
        requiresApproval: false,
      },
      {
        code: "ENTRETIEN",
        name: "Entretien individuel",
        icon: "💼",
        color: "#64748B",
        requiresApproval: false,
      },
    ];

    for (const type of meetingTypesData) {
      const existing = await ctx.db
        .query("meetingTypes")
        .withIndex("by_code", (q) => q.eq("code", type.code))
        .first();

      if (!existing) {
        await ctx.db.insert("meetingTypes", {
          ...type,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.meetingTypes++;
      }
    }

    // 5. Créer les motifs de réunion
    const motifsData = [
      { name: "Suivi feuille de route 2025" },
      { name: "Validation budget" },
      { name: "Lancement de projet" },
      { name: "Point d'avancement" },
      { name: "Résolution de problème" },
      { name: "Restitution d'étude" },
      { name: "Cérémonie / Événement social" },
      { name: "Revue de performance" },
      { name: "Planification stratégique" },
      { name: "Présentation de projet" },
      { name: "Validation de livrables" },
      { name: "Coordination inter-directions" },
      { name: "Autre" },
    ];

    for (const motif of motifsData) {
      const existing = await ctx.db.query("meetingMotifs").collect();
      const found = existing.find(
        (m) => m.name.toLowerCase() === motif.name.toLowerCase()
      );

      if (!found) {
        await ctx.db.insert("meetingMotifs", {
          ...motif,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.meetingMotifs++;
      }
    }

    // 6. Créer un utilisateur admin par défaut (optionnel)
    const adminEmail = "admin@arti.ci";
    const existingAdmin = await ctx.db
      .query("internalUsers")
      .withIndex("by_email", (q) => q.eq("email", adminEmail))
      .first();

    if (!existingAdmin && directionIds["DG"]) {
      await ctx.db.insert("internalUsers", {
        firstName: "Admin",
        lastName: "ARTI",
        email: adminEmail,
        matricule: "ADMIN001",
        position: "Administrateur Système",
        role: "ADMIN",
        directionId: directionIds["DG"] as any,
        permissions: {
          canCreateMeeting: true,
          canValidateMeeting: true,
          canReserveRoom: true,
          canModifyAgenda: true,
          canCloseMeeting: true,
          canViewAllMeetings: true,
          canViewOnlyDirection: false,
          canViewStats: true,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.internalUsers++;
    }

    return {
      success: true,
      message: "Données initialisées avec succès",
      results,
    };
  },
});

// Fonction pour réinitialiser toutes les données (ATTENTION: supprime tout!)
export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Supprimer toutes les données dans l'ordre inverse des dépendances
    const tables = [
      "meetingActions",
      "meetingMinutes",
      "meetingDocuments",
      "agendaItems",
      "meetingParticipants",
      "meetings",
      "meetingMotifs",
      "meetingTypes",
      "rooms",
      "internalUsers",
      "externalUsers",
      "services",
      "directions",
      "notifications",
      "auditLogs",
    ];

    const results: Record<string, number> = {};

    for (const tableName of tables) {
      const items = await (ctx.db as any).query(tableName).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      results[tableName] = items.length;
    }

    return {
      success: true,
      message: "Toutes les données ont été supprimées",
      results,
    };
  },
});
