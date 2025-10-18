import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Submission from "@/models/Submission";
import SubmissionForm from "./SubmissionForm";
import styles from "./activity.module.css";

export default async function ActivityDetailPage({ params }) {
  // Await params primero
  const { id } = await params;

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const activity = await Activity.findById(id)
    .populate("teacherId", "name")
    .lean();

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

  // Convertir ObjectId a string
  activity._id = activity._id.toString();
  activity.teacherId._id = activity.teacherId._id.toString();

  // Si es estudiante, buscar su entrega
  let submission = null;
  if (session.user.role === "student") {
    submission = await Submission.findOne({
      studentId: session.user.id,
      activityId: id,
    }).lean();

    if (submission) {
      submission = {
        _id: submission._id.toString(),
        studentId: submission.studentId.toString(),
        activityId: submission.activityId.toString(),
        fileUrl: submission.fileUrl,
        feedback: submission.feedback || null,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      };
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>{activity.title}</h1>
            
            <div className={styles.meta}>
              <p className={styles.teacher}>
                Profesor: {activity.teacherId.name}
              </p>
              {activity.dueDate && (
                <p className={styles.dueDate}>
                  Fecha límite: {new Date(activity.dueDate).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>

            <div className={styles.description}>
              <h2>Descripción</h2>
              <p>{activity.description}</p>
            </div>

            {activity.fileUrl && (
              <div className={styles.attachment}>
                <h3>Archivo adjunto:</h3>
                <a 
                  href={activity.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  📎 Descargar archivo
                </a>
              </div>
            )}

            {session.user.role === "student" && (
              <div className={styles.submissionSection}>
                <h2>Tu entrega</h2>
                {submission ? (
                  <div className={styles.submittedInfo}>
                    <p className={styles.submittedText}>
                      ✓ Ya entregaste esta actividad
                    </p>
                    <a 
                      href={submission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.viewSubmission}
                    >
                      Ver mi entrega
                    </a>
                    {submission.feedback && (
                      <div className={styles.feedback}>
                        <h3>Retroalimentación del profesor:</h3>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                    <SubmissionForm 
                      activityId={activity._id}
                      existingSubmission={submission}
                    />
                  </div>
                ) : (
                  <SubmissionForm activityId={activity._id} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}