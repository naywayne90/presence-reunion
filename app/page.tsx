"use client";

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import InternalUsersManager from "./components/InternalUsersManager";
import ExternalUsersManager from "./components/ExternalUsersManager";
import DirectionsManager from "./components/DirectionsManager";
import ServicesManager from "./components/ServicesManager";
import RoomsManager from "./components/RoomsManager";
import MeetingTypesManager from "./components/MeetingTypesManager";
import MeetingMotifsManager from "./components/MeetingMotifsManager";
import InitializeData from "./components/InitializeData";

type Tab =
  | "dashboard"
  | "internal-users"
  | "external-users"
  | "directions"
  | "services"
  | "rooms"
  | "meeting-types"
  | "meeting-motifs"
  | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "internal-users":
        return <InternalUsersManager />;
      case "external-users":
        return <ExternalUsersManager />;
      case "directions":
        return <DirectionsManager />;
      case "services":
        return <ServicesManager />;
      case "rooms":
        return <RoomsManager />;
      case "meeting-types":
        return <MeetingTypesManager />;
      case "meeting-motifs":
        return <MeetingMotifsManager />;
      case "settings":
        return <InitializeData />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>ARTI - Gestion des Réunions</h1>
          <p style={styles.subtitle}>Administration & Configuration</p>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Tableau de bord
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "internal-users" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("internal-users")}
        >
          👥 Utilisateurs Internes
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "external-users" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("external-users")}
        >
          🌐 Utilisateurs Externes
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "directions" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("directions")}
        >
          🏢 Directions
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "services" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("services")}
        >
          📋 Services
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "rooms" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("rooms")}
        >
          🏛️ Salles & Lieux
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "meeting-types" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("meeting-types")}
        >
          📝 Types de Réunions
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "meeting-motifs" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("meeting-motifs")}
        >
          🎯 Motifs
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(activeTab === "settings" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Paramètres
        </button>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>{renderContent()}</main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>ARTI - Agence de Régulation des Télécommunications de Côte d'Ivoire</p>
        <p style={styles.footerSmall}>Connecté à Convex Development (gregarious-gnat-103)</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  header: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
    margin: 0,
  },
  subtitle: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0.25rem 0 0 0",
  },
  nav: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    padding: "1rem 2rem",
    display: "flex",
    gap: "0.5rem",
    overflowX: "auto" as const,
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  },
  navButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  },
  navButtonActive: {
    background: "white",
    color: "#667eea",
    fontWeight: "600",
  },
  main: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
  },
  footer: {
    background: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem 2rem",
    textAlign: "center" as const,
    color: "white",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  },
  footerSmall: {
    fontSize: "0.85rem",
    marginTop: "0.5rem",
    opacity: 0.7,
  },
};
