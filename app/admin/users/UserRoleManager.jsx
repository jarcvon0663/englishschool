"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function UserRoleManager({ userId, currentRole, isCurrentUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = async (newRole) => {
    if (newRole === currentRole) return;

    if (isCurrentUser) {
      alert("No puedes cambiar tu propio rol");
      return;
    }

    const confirmChange = confirm(
      `¿Estás seguro de cambiar este usuario a ${newRole === "teacher" ? "Maestro" : "Estudiante"}?`
    );

    if (!confirmChange) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el rol");
      }

      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentUser) {
    return <span className={styles.currentUser}>Tu cuenta</span>;
  }

  return (
    <div className={styles.roleSelector}>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={loading}
        className={styles.select}
      >
        <option value="student">Estudiante</option>
        <option value="teacher">Maestro</option>
      </select>
      {loading && <span className={styles.loading}>...</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}