"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          English I.E.A.C
        </Link>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>
            Inicio
          </Link>

          {session.user.role === "teacher" && (
            <>
              <Link href="/dashboard/activities/new" className={styles.navLink}>
                Nueva Actividad
              </Link>
              <Link href="/grades" className={styles.navLink}>
                Calificaciones
              </Link>
            </>
          )}

          {session.user.role === "student" && session.user.course && (
            <Link href="/select-course" className={styles.navLink}>
              Cambiar Curso
            </Link>
          )}

          {session.user.isAdmin && (
            <Link href="/admin/users" className={styles.navLink}>
              Administrar Usuarios
            </Link>
          )}

          <div className={styles.userInfo}>
            <img 
              src={session.user.image} 
              alt={session.user.name}
              className={styles.avatar}
            />
            <span className={styles.userName}>{session.user.name}</span>
            <span className={styles.userRole}>
              ({session.user.role === "teacher" ? "Maestro" : "Estudiante"})
            </span>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={styles.logoutButton}
          >
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}