"use client";

import { useState } from "react";
import styles from "./FileUploader.module.css";

export default function FileUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const data = await response.json();
      
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      setFile(null);
      // Limpiar el input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";

    } catch (err) {
      console.error("Error:", err);
      setError("Error al subir el archivo. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          className={styles.fileInput}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
        />
        <label htmlFor="file-input" className={styles.fileLabel}>
          {file ? file.name : "Seleccionar archivo"}
        </label>
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={styles.uploadButton}
        >
          {uploading ? "Subiendo..." : "Subir archivo"}
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}