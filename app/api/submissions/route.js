import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";

// GET - Obtener entregas de una actividad específica
export async function GET(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activityId");
    const studentId = searchParams.get("studentId");

    await connectDB();

    let query = {};

    if (activityId) {
      query.activityId = activityId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    const submissions = await Submission.find(query)
      .populate("studentId", "name email")
      .populate("activityId", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error al obtener entregas:", error);
    return NextResponse.json({ error: "Error al obtener entregas" }, { status: 500 });
  }
}

// POST - Crear una nueva entrega
export async function POST(req) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { activityId, fileUrl } = body;

    if (!activityId || !fileUrl) {
      return NextResponse.json({ error: "Actividad y archivo son requeridos" }, { status: 400 });
    }

    // Verificar si ya existe una entrega para esta actividad
    const existingSubmission = await Submission.findOne({
      studentId: session.user.id,
      activityId,
    });

    if (existingSubmission) {
      // Actualizar la entrega existente
      existingSubmission.fileUrl = fileUrl;
      await existingSubmission.save();
      return NextResponse.json(existingSubmission);
    }

    // Crear nueva entrega
    const newSubmission = await Submission.create({
      studentId: session.user.id,
      activityId,
      fileUrl,
    });

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error("Error al crear entrega:", error);
    return NextResponse.json({ error: "Error al crear entrega" }, { status: 500 });
  }
}

// PUT - Actualizar feedback de una entrega (solo maestros)
export async function PUT(req) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { submissionId, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "ID de entrega es requerido" }, { status: 400 });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { feedback },
      { new: true }
    ).populate("studentId", "name email");

    if (!submission) {
      return NextResponse.json({ error: "Entrega no encontrada" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error al actualizar entrega:", error);
    return NextResponse.json({ error: "Error al actualizar entrega" }, { status: 500 });
  }
}