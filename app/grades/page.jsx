"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import styles from "./grades.module.css";

export default function GradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session && session.user.role !== "teacher") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!course.trim()) {
      setError("Por favor ingresa un curso");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/grades?course=${encodeURIComponent(course)}`);
      
      if (!response.ok) {
        throw new Error("Error al obtener calificaciones");
      }

      const data = await response.json();
      setStudents(data.students);
      
      if (data.students.length === 0) {
        setError("No hay estudiantes con calificaciones en este curso");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar las calificaciones");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (!session || session.user.role !== "teacher") {
    return null;
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Calificaciones por Curso</h1>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ingresa el curso (Ej: 901, 9A)"
              className={styles.searchInput}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={styles.searchButton}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {students.length > 0 && (
            <div className={styles.resultsSection}>
              <h2 className={styles.courseTitle}>Curso: {course}</h2>
              
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Estudiante</th>
                      <th>Email</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student._id}>
                        <td>{index + 1}</td>
                        <td className={styles.studentName}>{student.name}</td>
                        <td className={styles.studentEmail}>{student.email}</td>
                        <td>
                          <span className={styles.average}>
                            {student.average}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <h3>Total de estudiantes</h3>
                  <p className={styles.statNumber}>{students.length}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Promedio del curso</h3>
                  <p className={styles.statNumber}>
                    {(students.reduce((acc, s) => acc + parseFloat(s.average), 0) / students.length).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}