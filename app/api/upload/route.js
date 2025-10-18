import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Obtener el nombre original del archivo
    const originalFilename = file.name;

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary usando upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "escuelacol",
          resource_type: "raw", // Documentos sin procesar
          public_id: originalFilename, // Preservar nombre original
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id,
      originalName: originalFilename
    });

  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}