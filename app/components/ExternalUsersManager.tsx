"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";
import { Id } from "../../convex/_generated/dataModel";

export default function ExternalUsersManager() {
  const users = useQuery(api.externalUsers.list, {});
  const createUser = useMutation(api.externalUsers.create);
  const updateUser = useMutation(api.externalUsers.update);
  const deactivateUser = useMutation(api.externalUsers.deactivate);
  const activateUser = useMutation(api.externalUsers.activate);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    type: "PARTNER" as any,
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organization: "",
      position: "",
      type: "PARTNER",
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
        await updateUser({ id: editingId as Id<"externalUsers">, ...formData });
        setSuccess("Utilisateur externe modifié avec succès");
      } else {
        await createUser(formData);
        setSuccess("Utilisateur externe créé avec succès");
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
      organization: user.organization,
      position: user.position,
      type: user.type,
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser({ id: id as Id<"externalUsers"> });
      } else {
        await activateUser({ id: id as Id<"externalUsers"> });
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
          🌐 Utilisateurs Externes
        </h1>
        <button style={sharedStyles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Nouvel Utilisateur"}
        </button>
      </div>

      {error && <div style={sharedStyles.error}>{error}</div>}
      {success && <div style={sharedStyles.success}>{success}</div>}

      {showForm && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>
            {editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur externe"}
          </h2>
          <form onSubmit={handleSubmit} style={sharedStyles.form}>
            <div style={sharedStyles.formGrid}>
              <label style={sharedStyles.label}>
                Prénom *
                <input type="text" required style={sharedStyles.input}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Nom *
                <input type="text" required style={sharedStyles.input}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Email *
                <input type="email" required style={sharedStyles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Téléphone
                <input type="tel" style={sharedStyles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Organisation *
                <input type="text" required style={sharedStyles.input}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Fonction *
                <input type="text" required style={sharedStyles.input}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Type *
                <select required style={sharedStyles.select}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="PARTNER">Partenaire</option>
                  <option value="SUPPLIER">Fournisseur</option>
                  <option value="DONOR">Bailleur</option>
                  <option value="VIP">VIP</option>
                </select>
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="submit" style={sharedStyles.button}>
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
              <button type="button" style={sharedStyles.buttonSecondary} onClick={resetForm}>
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
            Aucun utilisateur externe pour le moment.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Nom Complet</th>
                  <th style={sharedStyles.th}>Email</th>
                  <th style={sharedStyles.th}>Organisation</th>
                  <th style={sharedStyles.th}>Fonction</th>
                  <th style={sharedStyles.th}>Type</th>
                  <th style={sharedStyles.th}>Statut</th>
                  <th style={sharedStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={sharedStyles.td}>{user.firstName} {user.lastName}</td>
                    <td style={sharedStyles.td}>{user.email}</td>
                    <td style={sharedStyles.td}>{user.organization}</td>
                    <td style={sharedStyles.td}>{user.position}</td>
                    <td style={sharedStyles.td}>{user.type}</td>
                    <td style={sharedStyles.td}>
                      <span style={{ ...sharedStyles.badge, ...(user.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={sharedStyles.td}>
                      <div style={sharedStyles.actionButtons}>
                        <button style={sharedStyles.buttonSecondary} onClick={() => handleEdit(user)}>
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
