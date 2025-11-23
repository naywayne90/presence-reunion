"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";

export default function InitializeData() {
  const initializeData = useMutation(api.seed.initializeData);
  const resetAllData = useMutation(api.seed.resetAllData);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInitialize = async () => {
    if (!confirm("Voulez-vous initialiser les données de base ?")) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await initializeData();
      setMessage(`Succès! ${JSON.stringify(result.results, null, 2)}`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("ATTENTION: Cette action supprimera TOUTES les données. Êtes-vous sûr ?")) return;
    if (!confirm("Dernière confirmation: Toutes les données seront perdues!")) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await resetAllData();
      setMessage(`Données supprimées: ${JSON.stringify(result.results, null, 2)}`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ ...sharedStyles.cardTitle, color: "white", marginBottom: "2rem" }}>
        ⚙️ Paramètres & Configuration
      </h1>

      {error && <div style={sharedStyles.error}>{error}</div>}
      {message && <div style={sharedStyles.success}><pre>{message}</pre></div>}

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Initialisation des Données</h2>
        <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
          Initialisez la base de données avec des données de référence (directions, salles, types de réunions, etc.)
        </p>

        <button
          style={sharedStyles.button}
          onClick={handleInitialize}
          disabled={loading}
        >
          {loading ? "Initialisation..." : "Initialiser les Données"}
        </button>
      </div>

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Informations Système</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Application:</span>
            <span style={{ color: "#6b7280" }}>ARTI - Gestion des Réunions</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Version:</span>
            <span style={{ color: "#6b7280" }}>1.0.0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Backend:</span>
            <span style={{ color: "#6b7280" }}>Convex (gregarious-gnat-103)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" }}>
            <span style={{ fontWeight: "500" }}>Frontend:</span>
            <span style={{ color: "#6b7280" }}>Next.js 14 + React</span>
          </div>
        </div>
      </div>

      <div style={sharedStyles.card}>
        <h2 style={{ ...sharedStyles.cardTitle, color: "#ef4444" }}>Zone Dangereuse</h2>
        <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
          <strong>ATTENTION:</strong> Cette action supprimera toutes les données de l'application.
        </p>

        <button
          style={{ ...sharedStyles.button, background: "#ef4444" }}
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Suppression..." : "Réinitialiser Toutes les Données"}
        </button>
      </div>
    </div>
  );
}
