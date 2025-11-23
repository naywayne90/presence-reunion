"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";

export default function Dashboard() {
  const internalUsersStats = useQuery(api.internalUsers.stats);
  const externalUsersStats = useQuery(api.externalUsers.stats);
  const directionsStats = useQuery(api.directions.stats);
  const roomsStats = useQuery(api.rooms.stats);

  return (
    <div>
      <h1 style={{ ...sharedStyles.cardTitle, color: "white", marginBottom: "2rem" }}>
        📊 Tableau de Bord
      </h1>

      {/* Statistiques Utilisateurs */}
      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Utilisateurs</h2>
        <div style={sharedStyles.statsGrid}>
          <div style={sharedStyles.statCard}>
            <div style={sharedStyles.statLabel}>Utilisateurs Internes</div>
            <div style={sharedStyles.statValue}>
              {internalUsersStats?.totalUsers || 0}
            </div>
            <div style={{ ...sharedStyles.statLabel, marginTop: "0.5rem" }}>
              {internalUsersStats?.activeUsers || 0} actifs
            </div>
          </div>

          <div style={sharedStyles.statCard}>
            <div style={sharedStyles.statLabel}>Utilisateurs Externes</div>
            <div style={sharedStyles.statValue}>
              {externalUsersStats?.totalUsers || 0}
            </div>
            <div style={{ ...sharedStyles.statLabel, marginTop: "0.5rem" }}>
              {externalUsersStats?.activeUsers || 0} actifs
            </div>
          </div>

          <div style={sharedStyles.statCard}>
            <div style={sharedStyles.statLabel}>Directions</div>
            <div style={sharedStyles.statValue}>
              {directionsStats?.totalDirections || 0}
            </div>
            <div style={{ ...sharedStyles.statLabel, marginTop: "0.5rem" }}>
              {directionsStats?.activeDirections || 0} actives
            </div>
          </div>

          <div style={sharedStyles.statCard}>
            <div style={sharedStyles.statLabel}>Salles & Lieux</div>
            <div style={sharedStyles.statValue}>
              {roomsStats?.totalRooms || 0}
            </div>
            <div style={{ ...sharedStyles.statLabel, marginTop: "0.5rem" }}>
              {roomsStats?.internalRooms || 0} internes, {roomsStats?.externalRooms || 0} externes
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par Rôle */}
      {internalUsersStats?.byRole && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>Répartition par Rôle</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {Object.entries(internalUsersStats.byRole).map(([role, count]) => (
              <div
                key={role}
                style={{
                  padding: "1rem 1.5rem",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  minWidth: "150px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                  {count as number}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  {role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Répartition Utilisateurs Externes */}
      {externalUsersStats?.byType && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>Utilisateurs Externes par Type</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {Object.entries(externalUsersStats.byType).map(([type, count]) => (
              <div
                key={type}
                style={{
                  padding: "1rem 1.5rem",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  minWidth: "150px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#764ba2" }}>
                  {count as number}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  {type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations Système */}
      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Informations Système</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Version:</span>
            <span style={{ color: "#6b7280" }}>1.0.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Convex Deployment:</span>
            <span style={{ color: "#6b7280" }}>gregarious-gnat-103</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Statut:</span>
            <span style={{ ...sharedStyles.badge, ...sharedStyles.badgeSuccess }}>
              Opérationnel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
