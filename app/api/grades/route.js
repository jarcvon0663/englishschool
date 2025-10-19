import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Submission from "@/models/Submission";
import User from "@/models/User";

// GET - Obtener calificaciones de estudiantes por curso
export async function GET(req) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");

    await connectDB();

    // Obtener todas las actividades del maestro para ese curso
    const activities = await Activity.find({ 
      teacherId: session.user.id,
      course: course 
    }).lean();

    if (activities.length === 0) {
      return NextResponse.json({ students: [], activities: [] });
    }

    const activityIds = activities.map(a => a._id);

    // Obtener todas las entregas de esas actividades
    const submissions = await Submission.find({ 
      activityId: { $in: activityIds } 
    })
    .populate("studentId", "name email course")
    .lean();

    // Organizar datos por estudiante
    const studentsMap = {};

    submissions.forEach(sub => {
      const studentId = sub.studentId._id.toString();
      
      if (!studentsMap[studentId]) {
        studentsMap[studentId] = {
          _id: studentId,
          name: sub.studentId.name,
          email: sub.studentId.email,
          course: sub.studentId.course,
          grades: [],
          average: 0,
        };
      }

      if (sub.grade) {
        studentsMap[studentId].grades.push({
          activityId: sub.activityId.toString(),
          grade: sub.grade,
        });
      }
    });

    // Calcular promedios
    const students = Object.values(studentsMap).map(student => {
      if (student.grades.length > 0) {
        const sum = student.grades.reduce((acc, g) => acc + g.grade, 0);
        student.average = parseFloat((sum / student.grades.length).toFixed(2)); // Convertir a número
      } else {
        student.average = 0; // Si no hay calificaciones, promedio es 0
      }
      return student;
    });

    // Convertir ObjectIds a strings
    const activitiesData = activities.map(a => ({
      _id: a._id.toString(),
      title: a.title,
      course: a.course,
    }));

    return NextResponse.json({ 
      students: students.sort((a, b) => b.average - a.average),
      activities: activitiesData 
    });

  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    return NextResponse.json({ error: "Error al obtener calificaciones" }, { status: 500 });
  }
}