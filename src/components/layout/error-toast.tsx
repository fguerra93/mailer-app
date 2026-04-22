"use client";

import { toast } from "sonner";
import type { ErrorApp } from "@/lib/types";

export function mostrarErrorToast(error: ErrorApp) {
  toast.error(error.mensaje, {
    duration: 10000,
    description: (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-muted-foreground">
          Si el problema persiste, toma un pantallazo de este error y envíalo para soporte.
        </p>
        <details className="rounded border bg-muted/50 p-2">
          <summary className="cursor-pointer text-xs font-mono font-semibold">
            Código: {error.codigo} — Ver detalles técnicos
          </summary>
          <pre className="mt-1 whitespace-pre-wrap text-[10px] font-mono text-muted-foreground">
            {error.detalle_tecnico}
            {"\n"}Timestamp: {error.timestamp}
          </pre>
        </details>
      </div>
    ),
  });
}

export function mostrarExitoToast(mensaje: string, descripcion?: string) {
  toast.success(mensaje, {
    description: descripcion,
    duration: 4000,
  });
}
