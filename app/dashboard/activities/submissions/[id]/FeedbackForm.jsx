"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./submissions.module.css";

export default function FeedbackForm({ submissionId, currentFeedback, currentGrade }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(currentFeedback || "");
  const [grade, setGrade] = useState(currentGrade !== null && currentGrade !== undefined ? currentGrade.toString() : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar calificación si se proporciona
    if (grade && grade.trim() !== "") {
      // Reemplazar coma por punto para normalizar
      const normalizedGrade = grade.replace(',', '.');
      const gradeNum = parseFloat(normalizedGrade);
      
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 5) {
        setError("La calificación debe ser un número entre 1 y 5");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const bodyData = {
        submissionId,
        feedback,
      };

      // Solo incluir grade si tiene valor
      if (grade && grade.trim() !== "") {
        // Reemplazar coma por punto antes de convertir
        const normalizedGrade = grade.replace(',', '.');
        bodyData.grade = parseFloat(normalizedGrade);
      }

      console.log("Enviando datos:", bodyData); // Para debug

      const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result); // Para debug

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.feedbackForm}>
      <div className={styles.gradeInput}>
        <label htmlFor="grade" className={styles.gradeLabel}>
          Calificación (1-5):
        </label>
        <input
          type="text"
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Ej: 4.5 o 4,5"
          className={styles.gradeField}
          pattern="[0-5][.,]?[0-9]?"
        />
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Escribe tu retroalimentación aquí..."
        rows={4}
        className={styles.feedbackTextarea}
      />
      
      <button
        type="submit"
        disabled={saving}
        className={styles.saveButton}
      >
        {saving ? "Guardando..." : "Guardar retroalimentación y calificación"}
      </button>

      {success && <p className={styles.success}>✓ Guardado correctamente</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}