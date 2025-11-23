"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";
import { Id } from "../../convex/_generated/dataModel";

export default function DirectionsManager() {
  const directions = useQuery(api.directions.list, {});
  const createDirection = useMutation(api.directions.create);
  const updateDirection = useMutation(api.directions.update);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({ code: "", name: "", description: "" });
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
        await updateDirection({ id: editingId as Id<"directions">, ...formData });
        setSuccess("Direction modifiée avec succès");
      } else {
        await createDirection(formData);
        setSuccess("Direction créée avec succès");
      }
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleEdit = (direction: any) => {
    setFormData({
      code: direction.code,
      name: direction.name,
      description: direction.description || "",
    });
    setEditingId(direction._id);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          🏢 Directions
        </h1>
        <button style={sharedStyles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Nouvelle Direction"}
        </button>
      </div>

      {error && <div style={sharedStyles.error}>{error}</div>}
      {success && <div style={sharedStyles.success}>{success}</div>}

      {showForm && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>
            {editingId ? "Modifier la direction" : "Nouvelle direction"}
          </h2>
          <form onSubmit={handleSubmit} style={sharedStyles.form}>
            <div style={sharedStyles.formGrid}>
              <label style={sharedStyles.label}>
                Code *
                <input type="text" required style={sharedStyles.input}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </label>

              <label style={sharedStyles.label}>
                Nom *
                <input type="text" required style={sharedStyles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>
            </div>

            <label style={sharedStyles.label}>
              Description
              <textarea style={sharedStyles.textarea}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </label>

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
        <h2 style={sharedStyles.cardTitle}>Liste des directions ({directions?.length || 0})</h2>

        {!directions || directions.length === 0 ? (
          <div style={sharedStyles.empty}>
            Aucune direction pour le moment.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Code</th>
                  <th style={sharedStyles.th}>Nom</th>
                  <th style={sharedStyles.th}>Services</th>
                  <th style={sharedStyles.th}>Agents</th>
                  <th style={sharedStyles.th}>Statut</th>
                  <th style={sharedStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {directions.map((direction) => (
                  <tr key={direction._id}>
                    <td style={sharedStyles.td}>{direction.code}</td>
                    <td style={sharedStyles.td}>{direction.name}</td>
                    <td style={sharedStyles.td}>{direction.servicesCount}</td>
                    <td style={sharedStyles.td}>{direction.agentsCount}</td>
                    <td style={sharedStyles.td}>
                      <span style={{ ...sharedStyles.badge, ...(direction.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                        {direction.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={sharedStyles.td}>
                      <button style={sharedStyles.buttonSecondary} onClick={() => handleEdit(direction)}>
                        Modifier
                      </button>
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
