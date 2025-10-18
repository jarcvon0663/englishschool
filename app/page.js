import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Si no está autenticado, redirigir al login
  redirect("/login");
}