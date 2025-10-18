import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// GET - Obtener todos los usuarios (solo admin)
export async function GET(req) {
  try {
    const session = await auth();
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const users = await User.find().sort({ createdAt: -1 }).lean();

    // Convertir ObjectId a string
    const usersData = users.map(user => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(usersData);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}