import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Submission from "@/models/Submission";
import FeedbackForm from "./FeedbackForm";
import styles from "./submissions.module.css";

export default async function SubmissionsPage({ params }) {
  // Await params primero
  const { id } = await params;

  const session = await auth();

  if (!session || session.user.role !== "teacher") {
    redirect("/dashboard");
  }

  await connectDB();

  const activity = await Activity.findById(id).lean();

  if (!activity) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <h1>Actividad no encontrada</h1>
          </div>
        </main>
      </>
    );
  }

  // Obtener todas las entregas de esta actividad
  const submissions = await Submission.find({ activityId: id })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Convertir ObjectId a string
  const submissionsData = submissions.map(sub => ({
    ...sub,
    _id: sub._id.toString(),
    studentId: {
      _id: sub.studentId._id.toString(),
      name: sub.studentId.name,
      email: sub.studentId.email,
    },
    activityId: sub.activityId.toString(),
    grade: sub.grade !== undefined ? sub.grade : null, // Agregar esta línea si no está
  }));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Entregas de: {activity.title}
          </h1>

          {submissionsData.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aún no hay entregas para esta actividad</p>
            </div>
          ) : (
            <div className={styles.submissionsList}>
              {submissionsData.map((submission) => (
                <div key={submission._id} className={styles.submissionCard}>
                  <div className={styles.studentInfo}>
                    <h3>{submission.studentId.name}</h3>
                    <p className={styles.email}>{submission.studentId.email}</p>
                    <p className={styles.date}>
                      Entregado: {new Date(submission.createdAt).toLocaleDateString('es-ES')} a las {new Date(submission.createdAt).toLocaleTimeString('es-ES')}
                    </p>
                  </div>

                  <div className={styles.fileSection}>
                    <a 
                      href={submission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      📎 Ver archivo entregado
                    </a>
                  </div>

                  <div className={styles.feedbackSection}>
                    <h4>Retroalimentación:</h4>
                    {submission.feedback ? (
                      <p className={styles.existingFeedback}>{submission.feedback}</p>
                    ) : (
                      <p className={styles.noFeedback}>Sin retroalimentación aún</p>
                    )}

                    {submission.grade && (
                      <div className={styles.gradeDisplay}>
                        <strong>Calificación:</strong> 
                        <span className={styles.gradeNumber}>{submission.grade.toFixed(1)}</span>
                        <span className={styles.gradeOutOf}>/ 5.0</span>
                      </div>
                    )}
                    
                    <FeedbackForm 
                      submissionId={submission._id}
                      currentFeedback={submission.feedback || ""}
                      currentGrade={submission.grade || null}
                    />
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