"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import styles from "./activity.module.css";

export default function SubmissionForm({ activityId, existingSubmission }) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (url) => {
    setFileUrl(url);
  };

  const handleSubmit = async () => {
    if (!fileUrl) {
      setError("Por favor sube un archivo primero");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la tarea");
      }

      router.refresh();
      setFileUrl("");
    } catch (err) {
      console.error("Error:", err);
      setError("Error al enviar la tarea. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.submissionForm}>
      <h3>{existingSubmission ? "Actualizar entrega" : "Entregar tarea"}</h3>
      <FileUploader onUploadSuccess={handleFileUpload} />
      
      {fileUrl && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={styles.submitButton}
        >
          {submitting ? "Enviando..." : (existingSubmission ? "Actualizar entrega" : "Entregar tarea")}
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}