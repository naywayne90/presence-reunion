import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ===== UTILISATEURS & PROFILS =====

  // Utilisateurs internes (personnel ARTI)
  internalUsers: defineTable({
    // Informations personnelles
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    matricule: v.string(), // Matricule RH

    // Poste et organisation
    directionId: v.optional(v.id("directions")),
    serviceId: v.optional(v.id("services")),
    position: v.string(), // Poste/fonction

    // Rôle dans l'application
    role: v.union(
      v.literal("DG"), // Directeur Général
      v.literal("DIRECTOR"), // Directeur de direction
      v.literal("SERVICE_HEAD"), // Chef de service / Chef de projet
      v.literal("AGENT"), // Agent / Collaborateur
      v.literal("SECRETARY"), // Secrétariat / Assistante
      v.literal("COMMUNICATION"), // Service Communication
      v.literal("HR"), // Service RH
      v.literal("ADMIN") // Administrateur système
    ),

    // Permissions
    permissions: v.object({
      canCreateMeeting: v.boolean(),
      canValidateMeeting: v.boolean(),
      canReserveRoom: v.boolean(),
      canModifyAgenda: v.boolean(),
      canCloseMeeting: v.boolean(), // Valider le PV
      canViewAllMeetings: v.boolean(), // Toutes les réunions ARTI
      canViewOnlyDirection: v.boolean(), // Seulement sa direction
      canViewStats: v.boolean(),
    }),

    // Statut
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_matricule", ["matricule"])
    .index("by_direction", ["directionId"])
    .index("by_service", ["serviceId"])
    .index("by_role", ["role"]),

  // Utilisateurs externes (partenaires, fournisseurs, etc.)
  externalUsers: defineTable({
    // Informations personnelles
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),

    // Organisation
    organization: v.string(), // Nom de l'organisation/entreprise
    position: v.string(), // Fonction

    // Type de profil externe
    type: v.union(
      v.literal("PARTNER"), // Partenaire (Ministères, AGEROUTE, SOTRA, etc.)
      v.literal("SUPPLIER"), // Fournisseur / Prestataire
      v.literal("DONOR"), // Bailleur / Organisme international
      v.literal("VIP") // Invité VIP (ambassade, etc.)
    ),

    // Statut
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_type", ["type"])
    .index("by_organization", ["organization"]),

  // ===== STRUCTURE ORGANISATIONNELLE =====

  // Directions
  directions: defineTable({
    code: v.string(), // Code de la direction (ex: DSI, DCSTI, DGPEC)
    name: v.string(), // Nom complet
    responsibleId: v.optional(v.id("internalUsers")), // Responsable de la direction
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"]),

  // Services
  services: defineTable({
    code: v.string(),
    name: v.string(),
    directionId: v.id("directions"), // Service rattaché à une direction
    responsibleId: v.optional(v.id("internalUsers")),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_direction", ["directionId"])
    .index("by_code", ["code"]),

  // ===== SALLES & LIEUX =====

  rooms: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("INTERNAL"), // Salle interne ARTI
      v.literal("EXTERNAL") // Lieu externe (hôtel, ministère, partenaire)
    ),

    // Pour les salles internes
    capacity: v.optional(v.number()),
    floor: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())), // TV, Visio, Micro, Projecteur, etc.

    // Pour les lieux externes
    address: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"]),

  // ===== TYPES DE RÉUNIONS & MOTIFS =====

  meetingTypes: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    requiresApproval: v.boolean(), // Nécessite validation
    approvalWorkflow: v.optional(v.array(v.string())), // SERVICE_HEAD -> DIRECTOR -> DG
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"]),

  // Motifs/Objectifs prédéfinis
  meetingMotifs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ===== RÉUNIONS (pour Phase 3) =====

  meetings: defineTable({
    // Informations de base
    title: v.string(),
    typeId: v.id("meetingTypes"),
    motifId: v.optional(v.id("meetingMotifs")),
    customMotif: v.optional(v.string()), // Si "Autre"

    // Organisation
    organizingDirectionId: v.id("directions"),
    responsibleUserId: v.id("internalUsers"), // Responsable de la réunion
    createdById: v.id("internalUsers"), // Créateur

    // Date et lieu
    scheduledDate: v.number(),
    startTime: v.string(), // Format HH:mm
    endTime: v.string(),
    roomId: v.optional(v.id("rooms")),
    isVirtual: v.boolean(),
    virtualLink: v.optional(v.string()),

    // Statut et workflow
    status: v.union(
      v.literal("DRAFT"), // Brouillon
      v.literal("PENDING_APPROVAL"), // En attente de validation
      v.literal("APPROVED"), // Approuvée
      v.literal("REJECTED"), // Rejetée
      v.literal("CONFIRMED"), // Confirmée
      v.literal("IN_PROGRESS"), // En cours
      v.literal("COMPLETED"), // Terminée
      v.literal("CANCELLED") // Annulée
    ),

    // Validation
    validationHistory: v.optional(v.array(v.object({
      validatorId: v.id("internalUsers"),
      action: v.string(), // APPROVED, REJECTED, REQUESTED_INFO
      comment: v.optional(v.string()),
      timestamp: v.number(),
    }))),

    // Récurrence
    isRecurring: v.boolean(),
    recurrencePattern: v.optional(v.object({
      frequency: v.union(
        v.literal("DAILY"),
        v.literal("WEEKLY"),
        v.literal("MONTHLY"),
        v.literal("QUARTERLY"),
        v.literal("YEARLY")
      ),
      interval: v.number(), // Tous les X jours/semaines/mois
      endDate: v.optional(v.number()),
      occurrences: v.optional(v.number()),
    })),

    // Timing réel
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_date", ["scheduledDate"])
    .index("by_type", ["typeId"])
    .index("by_direction", ["organizingDirectionId"])
    .index("by_responsible", ["responsibleUserId"])
    .index("by_room", ["roomId"]),

  // Participants aux réunions
  meetingParticipants: defineTable({
    meetingId: v.id("meetings"),

    // Participant (interne ou externe)
    internalUserId: v.optional(v.id("internalUsers")),
    externalUserId: v.optional(v.id("externalUsers")),

    // Rôle dans la réunion
    role: v.union(
      v.literal("PRESIDENT"), // Président de séance
      v.literal("SECRETARY"), // Secrétaire de séance
      v.literal("SPEAKER"), // Intervenant
      v.literal("OBSERVER"), // Observateur
      v.literal("PARTICIPANT") // Participant
    ),

    // Statut de participation
    invitationStatus: v.union(
      v.literal("INVITED"), // Invité
      v.literal("CONFIRMED"), // Confirmé
      v.literal("DECLINED"), // Refusé
      v.literal("PENDING") // En attente de réponse
    ),

    // Présence effective
    attended: v.optional(v.boolean()),
    arrivalTime: v.optional(v.number()),
    departureTime: v.optional(v.number()),
    isLate: v.optional(v.boolean()),
    isExcused: v.optional(v.boolean()),
    excuseReason: v.optional(v.string()),

    // Signature numérique
    signatureData: v.optional(v.string()), // Base64 de la signature
    signedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_internal_user", ["internalUserId"])
    .index("by_external_user", ["externalUserId"]),

  // Ordre du jour
  agendaItems: defineTable({
    meetingId: v.id("meetings"),
    order: v.number(), // Ordre d'affichage
    title: v.string(),
    description: v.optional(v.string()),
    responsibleUserId: v.optional(v.id("internalUsers")), // Responsable du point
    estimatedDuration: v.optional(v.number()), // En minutes
    actualDuration: v.optional(v.number()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("POSTPONED")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"]),

  // Documents attachés
  meetingDocuments: defineTable({
    meetingId: v.optional(v.id("meetings")),
    agendaItemId: v.optional(v.id("agendaItems")),

    fileName: v.string(),
    fileType: v.string(), // PDF, DOCX, XLSX, PPTX, etc.
    fileSize: v.number(),
    fileUrl: v.string(), // URL du fichier (Convex storage)
    storageId: v.string(), // ID Convex storage

    uploadedById: v.id("internalUsers"),
    description: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_agenda_item", ["agendaItemId"]),

  // Comptes rendus / PV
  meetingMinutes: defineTable({
    meetingId: v.id("meetings"),

    summary: v.string(), // Résumé
    discussions: v.optional(v.string()), // Discussions détaillées
    decisions: v.optional(v.string()), // Décisions prises

    status: v.union(
      v.literal("DRAFT"),
      v.literal("IN_REVIEW"),
      v.literal("VALIDATED")
    ),

    createdById: v.id("internalUsers"),
    validatedById: v.optional(v.id("internalUsers")),
    validatedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"]),

  // Actions / Tâches issues des réunions
  meetingActions: defineTable({
    meetingId: v.id("meetings"),
    minutesId: v.optional(v.id("meetingMinutes")),

    title: v.string(),
    description: v.optional(v.string()),

    // Attribution
    responsibleUserId: v.id("internalUsers"),
    directionId: v.optional(v.id("directions")),

    // Échéances
    startDate: v.optional(v.number()),
    dueDate: v.number(),

    // Priorité
    priority: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH"),
      v.literal("CRITICAL")
    ),

    // Statut
    status: v.union(
      v.literal("TODO"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("OVERDUE"),
      v.literal("CANCELLED")
    ),

    completedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_responsible", ["responsibleUserId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("internalUsers"),
    type: v.union(
      v.literal("MEETING_CREATED"),
      v.literal("MEETING_INVITATION"),
      v.literal("MEETING_UPDATED"),
      v.literal("MEETING_CANCELLED"),
      v.literal("MEETING_REMINDER"),
      v.literal("APPROVAL_REQUIRED"),
      v.literal("ACTION_ASSIGNED"),
      v.literal("ACTION_REMINDER"),
      v.literal("ACTION_OVERDUE")
    ),

    title: v.string(),
    message: v.string(),

    relatedMeetingId: v.optional(v.id("meetings")),
    relatedActionId: v.optional(v.id("meetingActions")),

    isRead: v.boolean(),
    readAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_read_status", ["userId", "isRead"]),

  // Audit logs
  auditLogs: defineTable({
    userId: v.id("internalUsers"),
    action: v.string(), // CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
    entityType: v.string(), // meetings, users, rooms, etc.
    entityId: v.string(),
    changes: v.optional(v.string()), // JSON des changements
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_date", ["createdAt"]),
});
