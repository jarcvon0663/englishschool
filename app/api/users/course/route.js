import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// PUT - Actualizar el curso del usuario actual
export async function PUT(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { course } = body;

    if (!course || course.trim() === "") {
      return NextResponse.json({ error: "El curso es requerido" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { course: course.trim() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Curso actualizado correctamente",
      course: updatedUser.course
    });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    return NextResponse.json({ error: "Error al actualizar curso" }, { status: 500 });
  }
}