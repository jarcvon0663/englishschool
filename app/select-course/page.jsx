"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./select-course.module.css";

export default function SelectCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (!session || session.user.role !== "student") {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!course.trim()) {
      setError("Por favor ingresa tu curso");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/users/course", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el curso");
      }

      alert("Curso guardado correctamente. Por favor cierra sesión y vuelve a iniciar para ver los cambios.");
      
      // Cerrar sesión para que se actualice la sesión con el nuevo curso
      window.location.href = "/api/auth/signout";
      
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar el curso. Intenta nuevamente.");
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Selecciona tu curso</h1>
        <p className={styles.subtitle}>
          Para ver las actividades asignadas a tu curso, por favor selecciónalo.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="course" className={styles.label}>
              Curso *
            </label>
            <input
              type="text"
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ej: 901, 9A, 802, 8B"
              className={styles.input}
              required
            />
            <p className={styles.hint}>
              Escribe el nombre de tu curso tal como te lo indica tu maestro
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className={styles.submitButton}
          >
            {saving ? "Guardando..." : "Guardar curso"}
          </button>
        </form>
      </div>
    </div>
  );
}