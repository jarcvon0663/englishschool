import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Submission from "@/models/Submission";

// DELETE - Eliminar una actividad (solo el maestro que la creó)
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Verificar que la actividad existe y pertenece al maestro
    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    if (activity.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta actividad" }, { status: 403 });
    }

    // Eliminar todas las entregas asociadas a esta actividad
    await Submission.deleteMany({ activityId: id });

    // Eliminar la actividad
    await Activity.findByIdAndDelete(id);

    return NextResponse.json({ message: "Actividad eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    return NextResponse.json({ error: "Error al eliminar actividad" }, { status: 500 });
  }
}