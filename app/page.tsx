"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { FormEvent, useState } from "react";

export default function Home() {
  const users = useQuery(api.users.list);
  const messages = useQuery(api.messages.list);
  const createUser = useMutation(api.users.create);
  const sendMessage = useMutation(api.messages.send);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    await createUser({ name: userName, email: userEmail });
    setUserName("");
    setUserEmail("");
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageContent || !selectedUserId) return;

    await sendMessage({
      userId: selectedUserId as any,
      content: messageContent,
    });
    setMessageContent("");
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>🎉 Presence Reunion</h1>
        <p style={styles.subtitle}>
          Application configurée avec Convex Development (gregarious-gnat-103)
        </p>

        <div style={styles.grid}>
          {/* Section Utilisateurs */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👥 Créer un utilisateur</h2>
            <form onSubmit={handleCreateUser} style={styles.form}>
              <input
                type="text"
                placeholder="Nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Créer
              </button>
            </form>

            <h3 style={styles.listTitle}>Liste des utilisateurs</h3>
            <div style={styles.list}>
              {users?.map((user) => (
                <div key={user._id} style={styles.listItem}>
                  <strong>{user.name}</strong>
                  <span style={styles.email}>{user.email}</span>
                </div>
              ))}
              {(!users || users.length === 0) && (
                <p style={styles.empty}>Aucun utilisateur pour le moment</p>
              )}
            </div>
          </div>

          {/* Section Messages */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💬 Envoyer un message</h2>
            <form onSubmit={handleSendMessage} style={styles.form}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={styles.input}
              >
                <option value="">Sélectionner un utilisateur</option>
                {users?.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Votre message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                style={{ ...styles.input, minHeight: "80px" }}
              />
              <button type="submit" style={styles.button}>
                Envoyer
              </button>
            </form>

            <h3 style={styles.listTitle}>Messages récents</h3>
            <div style={styles.list}>
              {messages?.map((message) => (
                <div key={message._id} style={styles.messageItem}>
                  <strong>{message.user?.name || "Utilisateur inconnu"}</strong>
                  <p style={styles.messageContent}>{message.content}</p>
                  <span style={styles.date}>
                    {new Date(message.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
              ))}
              {(!messages || messages.length === 0) && (
                <p style={styles.empty}>Aucun message pour le moment</p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <p>✅ Connecté à Convex Development</p>
          <p style={styles.deployment}>Deployment: gregarious-gnat-103</p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    padding: "2rem",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "white",
    textAlign: "center" as const,
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
    marginBottom: "3rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "2rem",
    marginBottom: "2rem",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  },
  cardTitle: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    marginBottom: "2rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  listTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    color: "#555",
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  listItem: {
    padding: "1rem",
    background: "#f7f7f7",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  email: {
    color: "#666",
    fontSize: "0.9rem",
  },
  messageItem: {
    padding: "1rem",
    background: "#f7f7f7",
    borderRadius: "8px",
  },
  messageContent: {
    margin: "0.5rem 0",
    color: "#333",
  },
  date: {
    fontSize: "0.8rem",
    color: "#999",
  },
  empty: {
    color: "#999",
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    padding: "1rem",
  },
  footer: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center" as const,
    color: "white",
  },
  deployment: {
    fontSize: "0.9rem",
    marginTop: "0.5rem",
    opacity: 0.8,
  },
};
