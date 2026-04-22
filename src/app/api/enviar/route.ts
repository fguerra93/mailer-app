import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, nombre, asunto, cuerpo } = body;

    if (!to || !asunto || !cuerpo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: to, asunto, cuerpo" },
        { status: 400 }
      );
    }

    // Buscar configuración del proveedor en Supabase
    let apiKey = process.env.RESEND_API_KEY || "";
    let desdeEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
    let desdeNombre = process.env.FROM_NAME || "MailerApp";

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: config } = await supabase
          .from("configuracion")
          .select("*")
          .order("actualizado_en", { ascending: false })
          .limit(1)
          .single();

        if (config) {
          apiKey = config.api_key || apiKey;
          desdeEmail = config.desde_email || desdeEmail;
          desdeNombre = config.desde_nombre || desdeNombre;
        }
      } catch {
        // Si no hay configuración en DB, usar env vars
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "No hay API Key configurada. Ve a Configuración para agregar tu token." },
        { status: 401 }
      );
    }

    // Personalizar cuerpo con nombre del destinatario
    const cuerpoPersonalizado = cuerpo.replace(/\{\{nombre\}\}/g, nombre || "Usuario");
    const asuntoPersonalizado = asunto.replace(/\{\{nombre\}\}/g, nombre || "Usuario");

    // Enviar con Resend
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: `${desdeNombre} <${desdeEmail}>`,
      to: [to],
      subject: asuntoPersonalizado,
      text: cuerpoPersonalizado,
    });

    // Guardar en historial
    const estado = error ? "fallido" : "enviado";
    if (supabase) try {
      await supabase.from("envios").insert({
        destinatario_email: to,
        destinatario_nombre: nombre || "",
        asunto: asuntoPersonalizado,
        estado,
        error: error ? JSON.stringify(error) : null,
        proveedor: "resend",
      });
    } catch {
      // No fallar el envío si no se puede guardar historial
    }

    if (error) {
      const statusCode =
        error.message?.includes("rate") || error.name === "rate_limit_exceeded"
          ? 429
          : error.message?.includes("unauthorized") || error.name === "validation_error"
            ? 401
            : 500;

      return NextResponse.json(
        { error: error.message || "Error al enviar correo" },
        { status: statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
