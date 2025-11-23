"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sharedStyles } from "./styles";
import { Id } from "../../convex/_generated/dataModel";

export default function ServicesManager() {
  const services = useQuery(api.services.list, {});
  const directions = useQuery(api.directions.list, { isActive: true });
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    directionId: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({ code: "", name: "", directionId: "", description: "" });
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
        await updateService({
          id: editingId as Id<"services">,
          code: formData.code,
          name: formData.name,
          directionId: formData.directionId as Id<"directions">,
          description: formData.description,
        });
        setSuccess("Service modifié avec succès");
      } else {
        await createService({
          code: formData.code,
          name: formData.name,
          directionId: formData.directionId as Id<"directions">,
          description: formData.description,
        });
        setSuccess("Service créé avec succès");
      }
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      code: service.code,
      name: service.name,
      directionId: service.directionId,
      description: service.description || "",
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ ...sharedStyles.cardTitle, color: "white", margin: 0 }}>
          📋 Services
        </h1>
        <button style={sharedStyles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Nouveau Service"}
        </button>
      </div>

      {error && <div style={sharedStyles.error}>{error}</div>}
      {success && <div style={sharedStyles.success}>{success}</div>}

      {showForm && (
        <div style={sharedStyles.card}>
          <h2 style={sharedStyles.cardTitle}>
            {editingId ? "Modifier le service" : "Nouveau service"}
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

              <label style={sharedStyles.label}>
                Direction *
                <select required style={sharedStyles.select}
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
        <h2 style={sharedStyles.cardTitle}>Liste des services ({services?.length || 0})</h2>

        {!services || services.length === 0 ? (
          <div style={sharedStyles.empty}>Aucun service pour le moment.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={sharedStyles.table}>
              <thead>
                <tr>
                  <th style={sharedStyles.th}>Code</th>
                  <th style={sharedStyles.th}>Nom</th>
                  <th style={sharedStyles.th}>Direction</th>
                  <th style={sharedStyles.th}>Agents</th>
                  <th style={sharedStyles.th}>Statut</th>
                  <th style={sharedStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td style={sharedStyles.td}>{service.code}</td>
                    <td style={sharedStyles.td}>{service.name}</td>
                    <td style={sharedStyles.td}>{service.direction?.code || "-"}</td>
                    <td style={sharedStyles.td}>{service.agentsCount}</td>
                    <td style={sharedStyles.td}>
                      <span style={{ ...sharedStyles.badge, ...(service.isActive ? sharedStyles.badgeSuccess : sharedStyles.badgeDanger) }}>
                        {service.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={sharedStyles.td}>
                      <button style={sharedStyles.buttonSecondary} onClick={() => handleEdit(service)}>
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
