import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        // Nuevo usuario → se crea como estudiante por defecto
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "student",
          isAdmin: false,
        });
      }

      return true;
    },
    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        session.user.role = dbUser.role;
        session.user.id = dbUser._id.toString();
        session.user.isAdmin = dbUser.isAdmin;
        session.user.course = dbUser.course; // Agregar el curso
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;