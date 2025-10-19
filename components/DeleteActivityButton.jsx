"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DeleteActivityButton.module.css";

export default function DeleteActivityButton({ activityId, activityTitle }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = confirm(
      `¿Estás seguro de eliminar la actividad "${activityTitle}"?\n\nEsta acción eliminará también todas las entregas de los estudiantes y no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la actividad");
      }

      alert("Actividad eliminada correctamente");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la actividad. Intenta nuevamente.");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={styles.deleteButton}
    >
      {deleting ? "Eliminando..." : "🗑️ Eliminar Actividad"}
    </button>
  );
}