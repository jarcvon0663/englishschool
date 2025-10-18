"use client";

import { signIn } from "next-auth/react";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>EscuelaCol</h1>
        <p className={styles.subtitle}>Plataforma educativa para escuelas rurales</p>
        
        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className={styles.googleButton}
        >
          <span>Iniciar sesión con Google</span>
        </button>
      </div>
    </div>
  );
}