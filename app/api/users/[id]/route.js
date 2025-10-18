import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// PUT - Actualizar rol de usuario (solo admin)
export async function PUT(req, { params }) {
  try {
    const session = await auth();
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();
    const { role } = body;

    if (!role || !["student", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedUser.toObject(),
      _id: updatedUser._id.toString(),
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}