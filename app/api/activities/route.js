import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";

// GET - Obtener todas las actividades
export async function GET(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    let activities;

    if (session.user.role === "teacher") {
      // Maestros ven solo sus actividades
      activities = await Activity.find({ teacherId: session.user.id })
        .sort({ createdAt: -1 });
    } else {
      // Estudiantes ven todas las actividades
      activities = await Activity.find()
        .populate("teacherId", "name")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return NextResponse.json({ error: "Error al obtener actividades" }, { status: 500 });
  }
}

// POST - Crear una nueva actividad
export async function POST(req) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { title, description, fileUrl, dueDate } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Título y descripción son requeridos" }, { status: 400 });
    }

    const newActivity = await Activity.create({
      title,
      description,
      fileUrl,
      dueDate: dueDate ? new Date(dueDate) : null,
      teacherId: session.user.id,
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error al crear actividad:", error);
    return NextResponse.json({ error: "Error al crear actividad" }, { status: 500 });
  }
}