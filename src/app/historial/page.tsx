"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { mostrarErrorToast } from "@/components/layout/error-toast";
import { ERRORES } from "@/lib/errors";
import type { EnvioRegistro } from "@/lib/types";

export default function HistorialPage() {
  const [cargando, setCargando] = useState(true);
  const [envios, setEnvios] = useState<EnvioRegistro[]>([]);

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("envios")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(100);

      if (error) throw error;

      setEnvios(
        (data || []).map((e) => ({
          id: e.id,
          destinatario_email: e.destinatario_email,
          destinatario_nombre: e.destinatario_nombre || "",
          asunto: e.asunto,
          estado: e.estado,
          error: e.error,
          fecha: e.fecha,
          proveedor: e.proveedor || "resend",
        }))
      );
    } catch (err) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        mostrarErrorToast(
          ERRORES.SUPABASE_ERROR(
            err instanceof Error ? err.message : "Error desconocido"
          )
        );
      }
    }
    setCargando(false);
  }

  const iconoEstado = {
    enviado: <CheckCircle className="h-4 w-4 text-green-500" />,
    fallido: <XCircle className="h-4 w-4 text-red-500" />,
    pendiente: <Clock className="h-4 w-4 text-yellow-500" />,
  };

  const badgeVariant = {
    enviado: "default" as const,
    fallido: "destructive" as const,
    pendiente: "secondary" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historial de Envíos</h2>
          <p className="text-muted-foreground">
            Registro de todos los correos enviados.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={cargarHistorial}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Últimos 100 envíos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : envios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aún no hay envíos
              </p>
              <p className="text-sm text-muted-foreground">
                Cuando envíes tu primer correo, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Estado</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead className="hidden md:table-cell">Asunto</TableHead>
                    <TableHead className="hidden sm:table-cell">Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {envios.map((envio) => (
                    <TableRow key={envio.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {iconoEstado[envio.estado]}
                          <Badge variant={badgeVariant[envio.estado]} className="text-xs hidden sm:inline-flex">
                            {envio.estado}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {envio.destinatario_nombre || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {envio.destinatario_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm">
                        {envio.asunto}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">
                          {envio.proveedor}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(envio.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
