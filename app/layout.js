import { auth } from "@/app/api/auth/[...nextauth]/route";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata = {
  title: "EscuelaCol - Plataforma Educativa",
  description: "Plataforma educativa para escuelas rurales",
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