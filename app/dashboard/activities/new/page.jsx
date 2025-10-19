"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import styles from "./new.module.css";

export default function NewActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    dueDate: "",
    course: "", // Nuevo campo
  });

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (!session || session.user.role !== "teacher") {
    router.push("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (url) => {
    setFormData({
      ...formData,
      fileUrl: url,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al crear la actividad");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error:", err);
      setError("Error al crear la actividad. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Crear Nueva Actividad</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Ej: Tarea de Matemáticas"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className={styles.textarea}
                placeholder="Describe la actividad en detalle..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="course" className={styles.label}>
                Curso *
              </label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Ej: 901, 9A, 802, 8B"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dueDate" className={styles.label}>
                Fecha límite
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Archivo adjunto (opcional)
              </label>
              <FileUploader onUploadSuccess={handleFileUpload} />
              {formData.fileUrl && (
                <p className={styles.uploadedFile}>
                  ✓ Archivo subido correctamente
                </p>
              )}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? "Creando..." : "Crear Actividad"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}