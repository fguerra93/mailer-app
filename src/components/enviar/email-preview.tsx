"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface Props {
  asunto: string;
  cuerpo: string;
  nombreEjemplo: string;
  emailEjemplo: string;
  desdeNombre: string;
  desdeEmail: string;
}

export function EmailPreview({
  asunto,
  cuerpo,
  nombreEjemplo,
  emailEjemplo,
  desdeNombre,
  desdeEmail,
}: Props) {
  const cuerpoRenderizado = cuerpo.replace(/\{\{nombre\}\}/g, nombreEjemplo || "Usuario");
  const asuntoRenderizado = asunto.replace(/\{\{nombre\}\}/g, nombreEjemplo || "Usuario");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5" />
          Previsualización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {/* Email header */}
          <div className="border-b bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground w-10">De:</span>
              <span>
                {desdeNombre || "Tu Nombre"} &lt;{desdeEmail || "tu@email.com"}&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground w-10">Para:</span>
              <span>
                {nombreEjemplo || "Destinatario"} &lt;{emailEjemplo || "dest@email.com"}&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground w-10">Asunto:</span>
              <span className="font-semibold">
                {asuntoRenderizado || "(sin asunto)"}
              </span>
            </div>
          </div>

          {/* Email body */}
          <div className="p-6 min-h-[200px]">
            {cuerpoRenderizado ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {cuerpoRenderizado}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Escribe el cuerpo del correo para ver la previsualización aquí...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
