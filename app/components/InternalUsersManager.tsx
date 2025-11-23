"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";
import { Id } from "../../convex/_generated/dataModel";

export default function InternalUsersManager() {
  const users = useQuery(api.internalUsers.list, {});
  const directions = useQuery(api.directions.list, { isActive: true });
  const services = useQuery(api.services.list, { isActive: true });

  const createUser = useMutation(api.internalUsers.create);
  const updateUser = useMutation(api.internalUsers.update);
  const deactivateUser = useMutation(api.internalUsers.deactivate);
  const activateUser = useMutation(api.internalUsers.activate);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    matricule: "",
    position: "",
    role: "AGENT" as any,
    directionId: "",
    serviceId: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      matricule: "",
      position: "",
      role: "AGENT",
      directionId: "",
      serviceId: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateUser({
          id: editingId as Id<"internalUsers">,
          ...formData,
          directionId: formData.directionId ? (formData.directionId as Id<"directions">) : undefined,
          serviceId: formData.serviceId ? (formData.serviceId as Id<"services">) : undefined,
        });
        setSuccess("Utilisateur modifié avec succès");
      } else {
        await createUser({
          ...formData,
          directionId: formData.directionId ? (formData.directionId as Id<"directions">) : undefined,
          serviceId: formData.serviceId ? (formData.serviceId as Id<"services">) : undefined,
        });
        setSuccess("Utilisateur créé avec succès");
      }
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      matricule: user.matricule,
      position: user.position,
      role: user.role,
      directionId: user.directionId || "",
      serviceId: user.serviceId || "",
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser({ id: id as Id<"internalUsers"> });
      } else {
        await activateUser({ id: id as Id<"internalUsers"> });
      }
      setSuccess(isActive ? "Utilisateur désactivé" : "Utilisateur activé");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          👥 Utilisateurs Internes
        </h1>
        <button
          style={sharedStyles.button}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Annuler" : "+ Nouvel Utilisateur"}
        </button>
      </div>

      {error && <div style={sharedStyles.error}>{error}</div>}
      {success && <div style={sharedStyles.success}>{success}</div>}

      {showForm && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>
            {editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur interne"}
          </h2>
          <form onSubmit={handleSubmit} style={sharedStyles.form}>
            <div style={sharedStyles.formGrid}>
              <label style={sharedStyles.label}>
                Prénom *
                <input
                  type="text"
                  required
                  style={sharedStyles.input}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Nom *
                <input
                  type="text"
                  required
                  style={sharedStyles.input}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Email *
                <input
                  type="email"
                  required
                  style={sharedStyles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Téléphone
                <input
                  type="tel"
                  style={sharedStyles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Matricule *
                <input
                  type="text"
                  required
                  style={sharedStyles.input}
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Poste/Fonction *
                <input
                  type="text"
                  required
                  style={sharedStyles.input}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Rôle *
                <select
                  required
                  style={sharedStyles.select}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="DG">Directeur Général</option>
                  <option value="DIRECTOR">Directeur</option>
                  <option value="SERVICE_HEAD">Chef de Service</option>
                  <option value="AGENT">Agent</option>
                  <option value="SECRETARY">Secrétariat</option>
                  <option value="COMMUNICATION">Communication</option>
                  <option value="HR">Ressources Humaines</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </label>

              <label style={sharedStyles.label}>
                Direction
                <select
                  style={sharedStyles.select}
                  value={formData.directionId}
                  onChange={(e) => setFormData({ ...formData, directionId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {directions?.map((dir) => (
                    <option key={dir._id} value={dir._id}>
                      {dir.code} - {dir.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={sharedStyles.label}>
                Service
                <select
                  style={sharedStyles.select}
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {services?.map((srv) => (
                    <option key={srv._id} value={srv._id}>
                      {srv.code} - {srv.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="submit" style={sharedStyles.button}>
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
              <button
                type="button"
                style={sharedStyles.buttonSecondary}
                onClick={resetForm}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={sharedStyles.card}>
        <h2 style={sharedStyles.cardTitle}>Liste des utilisateurs ({users?.length || 0})</h2>

        {!users || users.length === 0 ? (
          <div style={sharedStyles.empty}>
            Aucun utilisateur interne pour le moment. Cliquez sur "+ Nouvel Utilisateur" pour commencer.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Nom Complet</th>
                  <th style={sharedStyles.th}>Email</th>
                  <th style={sharedStyles.th}>Matricule</th>
                  <th style={sharedStyles.th}>Poste</th>
                  <th style={sharedStyles.th}>Rôle</th>
                  <th style={sharedStyles.th}>Direction</th>
                  <th style={sharedStyles.th}>Statut</th>
                  <th style={sharedStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={sharedStyles.td}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={sharedStyles.td}>{user.email}</td>
                    <td style={sharedStyles.td}>{user.matricule}</td>
                    <td style={sharedStyles.td}>{user.position}</td>
                    <td style={sharedStyles.td}>{user.role}</td>
                    <td style={sharedStyles.td}>
                      {user.direction?.code || "-"}
                    </td>
                    <td style={sharedStyles.td}>
                      <span
                        style={{
                          ...sharedStyles.badge,
                          ...(user.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger),
                        }}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={sharedStyles.td}>
                      <div style={sharedStyles.actionButtons}>
                        <button
                          style={sharedStyles.buttonSecondary}
                          onClick={() => handleEdit(user)}
                        >
                          Modifier
                        </button>
                        <button
                          style={user.isActive ? sharedStyles.buttonDanger : sharedStyles.buttonSuccess}
                          onClick={() => handleToggleActive(user._id, user.isActive)}
                        >
                          {user.isActive ? "Désactiver" : "Activer"}
                        </button>
                      </div>
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
