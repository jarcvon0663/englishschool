"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./submissions.module.css";

export default function FeedbackForm({ submissionId, currentFeedback }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(currentFeedback);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar retroalimentación");
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.feedbackForm}>
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
        {saving ? "Guardando..." : "Guardar retroalimentación"}
      </button>

      {success && <p className={styles.success}>✓ Retroalimentación guardada</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}