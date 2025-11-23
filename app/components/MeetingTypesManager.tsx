"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";

export default function MeetingTypesManager() {
  const meetingTypes = useQuery(api.meetingTypes.list, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          📝 Types de Réunions
        </h1>
      </div>

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Liste des types de réunions ({meetingTypes?.length || 0})</h2>

        {!meetingTypes || meetingTypes.length === 0 ? (
          <div style={sharedStyles.empty}>Aucun type de réunion. Utilisez le menu Paramètres pour initialiser les données.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Code</th>
                  <th style={sharedStyles.th}>Nom</th>
                  <th style={sharedStyles.th}>Icône</th>
                  <th style={sharedStyles.th}>Approbation</th>
                  <th style={sharedStyles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {meetingTypes.map((type) => (
                  <tr key={type._id}>
                    <td style={sharedStyles.td}>{type.code}</td>
                    <td style={sharedStyles.td}>{type.name}</td>
                    <td style={sharedStyles.td}>{type.icon}</td>
                    <td style={sharedStyles.td}>
                      {type.requiresApproval ? "Oui" : "Non"}
                    </td>
                    <td style={sharedStyles.td}>
                      <span style={{ ...sharedStyles.badge, ...(type.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                        {type.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
