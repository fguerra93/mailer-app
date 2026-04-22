"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

interface Props {
  asunto: string;
  cuerpo: string;
  onAsuntoChange: (v: string) => void;
  onCuerpoChange: (v: string) => void;
}

export function EmailEditor({
  asunto,
  cuerpo,
  onAsuntoChange,
  onCuerpoChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pencil className="h-5 w-5" />
          Redactar Correo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asunto">Asunto</Label>
          <Input
            id="asunto"
            placeholder="Ej: Tu recibo de pago de Enero 2026"
            value={asunto}
            onChange={(e) => onAsuntoChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cuerpo">Cuerpo del correo</Label>
            <Badge variant="secondary" className="text-xs">
              Usa {"{{nombre}}"} para personalizar
            </Badge>
          </div>
          <Textarea
            id="cuerpo"
            placeholder={`Hola {{nombre}},\n\nTe compartimos tu recibo de pago correspondiente al mes de Enero 2026.\n\nSaludos cordiales.`}
            value={cuerpo}
            onChange={(e) => onCuerpoChange(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Usa <code className="rounded bg-muted px-1">{"{{nombre}}"}</code> para
          insertar automáticamente el nombre de cada destinatario.
        </p>
      </CardContent>
    </Card>
  );
}
