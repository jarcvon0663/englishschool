import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  let activities = [];
  let submissions = []; // Para guardar las entregas del estudiante
  let submissionsCount = {}; // Para contar entregas sin feedback (maestros)

  if (session.user.role === "teacher") {
    // Maestros ven solo sus actividades
    activities = await Activity.find({ teacherId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Obtener todas las entregas de las actividades del maestro
    const Submission = (await import("@/models/Submission")).default;
    const allSubmissions = await Submission.find({
      activityId: { $in: activities.map(a => a._id) }
    }).lean();

    // Contar entregas sin feedback por actividad
    allSubmissions.forEach(sub => {
      const activityId = sub.activityId.toString();
      if (!submissionsCount[activityId]) {
        submissionsCount[activityId] = { total: 0, pending: 0 };
      }
      submissionsCount[activityId].total++;
      if (!sub.feedback) {
        submissionsCount[activityId].pending++;
      }
    });

  } else {
    // Estudiantes ven todas las actividades
    activities = await Activity.find()
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .lean();
    
    // Obtener todas las entregas del estudiante
    const Submission = (await import("@/models/Submission")).default;
    submissions = await Submission.find({ studentId: session.user.id })
      .lean();
  }

  // Convertir ObjectId a string para evitar errores de serialización
  activities = activities.map(activity => ({
    ...activity,
    _id: activity._id.toString(),
    teacherId: activity.teacherId?._id?.toString() || activity.teacherId?.toString(),
    teacherName: activity.teacherId?.name || "Desconocido",
  }));

  // Convertir entregas a un objeto para búsqueda rápida
  const submissionsMap = {};
  submissions.forEach(sub => {
    submissionsMap[sub.activityId.toString()] = true;
  });

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {session.user.role === "teacher" ? "Mis Actividades" : "Actividades Disponibles"}
            </h1>
            {session.user.role === "teacher" && (
              <Link href="/dashboard/activities/new" className={styles.newButton}>
                + Nueva Actividad
              </Link>
            )}
          </div>

          {activities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay actividades disponibles</p>
            </div>
          ) : (
            <div className={styles.activitiesGrid}>
              {activities.map((activity) => (
                <div key={activity._id} className={styles.activityCard}>
                  {session.user.role === "student" && submissionsMap[activity._id] && (
                    <div className={styles.submittedBadge}>
                      ✓ Entregada
                    </div>
                  )}
                  
                  <h3 className={styles.activityTitle}>{activity.title}</h3>
                  <p className={styles.activityDescription}>{activity.description}</p>
                  
                  {session.user.role === "student" && (
                    <p className={styles.teacherName}>
                      Profesor: {activity.teacherName}
                    </p>
                  )}
                  
                  {activity.dueDate && (
                    <p className={styles.dueDate}>
                      Fecha límite: {new Date(activity.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  )}

                  <div className={styles.actions}>
                    {session.user.role === "student" ? (
                      <Link 
                        href={`/dashboard/activities/${activity._id}`}
                        className={styles.viewButton}
                      >
                        {submissionsMap[activity._id] ? "Ver Detalles" : "Ver y Entregar"}
                      </Link>
                    ) : (
                      <>
                        <Link 
                          href={`/dashboard/activities/${activity._id}`}
                          className={styles.viewButton}
                        >
                          Ver Detalles
                        </Link>
                        <Link 
                          href={`/dashboard/activities/submissions/${activity._id}`}
                          className={styles.submissionsButton}
                        >
                          Ver Entregas
                          {submissionsCount[activity._id] && (
                            <span className={styles.submissionCount}>
                              {submissionsCount[activity._id].total}
                              {submissionsCount[activity._id].pending > 0 && (
                                <span className={styles.pendingBadge}>
                                  {submissionsCount[activity._id].pending}
                                </span>
                              )}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}