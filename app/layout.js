import { auth } from "@/app/api/auth/[...nextauth]/route";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata = {
  title: "I.E.A.C - Plataforma Educativa",
  description: "Plataforma educativa para estudiantes de inglés",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="es">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}