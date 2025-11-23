"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";

export default function RoomsManager() {
  const rooms = useQuery(api.rooms.list, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          🏛️ Salles & Lieux
        </h1>
      </div>

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Liste des salles & lieux ({rooms?.length || 0})</h2>

        {!rooms || rooms.length === 0 ? (
          <div style={sharedStyles.empty}>Aucune salle pour le moment. Utilisez le menu Paramètres pour initialiser les données.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Nom</th>
                  <th style={sharedStyles.th}>Type</th>
                  <th style={sharedStyles.th}>Capacité</th>
                  <th style={sharedStyles.th}>Étage</th>
                  <th style={sharedStyles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td style={sharedStyles.td}>{room.name}</td>
                    <td style={sharedStyles.td}>{room.type === "INTERNAL" ? "Interne" : "Externe"}</td>
                    <td style={sharedStyles.td}>{room.capacity || "-"}</td>
                    <td style={sharedStyles.td}>{room.floor || "-"}</td>
                    <td style={sharedStyles.td}>
                      <span style={{ ...sharedStyles.badge, ...(room.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                        {room.isActive ? "Actif" : "Inactif"}
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
