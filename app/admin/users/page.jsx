import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserRoleManager from "./UserRoleManager";
import styles from "./admin.module.css";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || !session.user.isAdmin) {
    redirect("/dashboard");
  }

  await connectDB();

  const users = await User.find().sort({ createdAt: -1 }).lean();

  // Convertir ObjectId a string
  const usersData = users.map(user => ({
    ...user,
    _id: user._id.toString(),
  }));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Administración de Usuarios</h1>
          
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total de Usuarios</h3>
              <p className={styles.statNumber}>{usersData.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Maestros</h3>
              <p className={styles.statNumber}>
                {usersData.filter(u => u.role === "teacher").length}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>Estudiantes</h3>
              <p className={styles.statNumber}>
                {usersData.filter(u => u.role === "student").length}
              </p>
            </div>
          </div>

          <div className={styles.usersTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol Actual</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.userCell}>
                        <img 
                          src={user.image} 
                          alt={user.name}
                          className={styles.userAvatar}
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[user.role]}`}>
                        {user.role === "teacher" ? "Maestro" : "Estudiante"}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <UserRoleManager 
                        userId={user._id} 
                        currentRole={user.role}
                        isCurrentUser={session.user.id === user._id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}