"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";

export default function MeetingMotifsManager() {
  const motifs = useQuery(api.meetingMotifs.list, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          🎯 Motifs de Réunions
        </h1>
      </div>

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Liste des motifs ({motifs?.length || 0})</h2>

        {!motifs || motifs.length === 0 ? (
          <div style={sharedStyles.empty}>Aucun motif de réunion. Utilisez le menu Paramètres pour initialiser les données.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {motifs.map((motif) => (
              <div
                key={motif._id}
                style={{
                  padding: "1rem",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "#333" }}>{motif.name}</div>
                  {motif.description && (
                    <div style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      {motif.description}
                    </div>
                  )}
                </div>
                <span style={{ ...sharedStyles.badge, ...(motif.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                  {motif.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
