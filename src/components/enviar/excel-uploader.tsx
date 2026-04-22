"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parsearExcel } from "@/lib/excel-parser";
import { mostrarErrorToast } from "@/components/layout/error-toast";
import type { Contacto, ErrorApp } from "@/lib/types";

interface Props {
  contactos: Contacto[];
  onContactosCargados: (contactos: Contacto[]) => void;
}

export function ExcelUploader({ contactos, onContactosCargados }: Props) {
  const [arrastrando, setArrastrando] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [columnas, setColumnas] = useState<{ nombre: string; email: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const procesarArchivo = useCallback(
    async (file: File) => {
      setCargando(true);
      setAdvertencias([]);
      try {
        const buffer = await file.arrayBuffer();
        const resultado = parsearExcel(buffer);

        // Si es un ErrorApp (tiene campo 'codigo')
        if ("codigo" in resultado) {
          mostrarErrorToast(resultado as ErrorApp);
          setCargando(false);
          return;
        }

        setNombreArchivo(file.name);
        setColumnas(resultado.columnasDetectadas);
        setAdvertencias(resultado.errores);
        onContactosCargados(resultado.contactos);
      } catch {
        mostrarErrorToast({
          codigo: "EXCEL_999",
          mensaje: "Error inesperado al procesar el archivo.",
          detalle_tecnico: "Error no capturado en procesarArchivo",
          timestamp: new Date().toISOString(),
        });
      }
      setCargando(false);
    },
    [onContactosCargados]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setArrastrando(false);
      const file = e.dataTransfer.files[0];
      if (file) procesarArchivo(file);
    },
    [procesarArchivo]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) procesarArchivo(file);
    },
    [procesarArchivo]
  );

  const limpiar = () => {
    onContactosCargados([]);
    setNombreArchivo("");
    setAdvertencias([]);
    setColumnas(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5" />
          Base de Usuarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contactos.length === 0 ? (
          <>
            {/* Drop Zone */}
            <motion.div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={handleDrop}
              animate={{
                scale: arrastrando ? 1.02 : 1,
                borderColor: arrastrando ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              className="relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {cargando ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">
                    Leyendo archivo...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      o haz clic para seleccionar (.xlsx, .xls, .csv)
                    </p>
                  </div>
                </>
              )}
            </motion.div>

            <p className="text-xs text-muted-foreground">
              El archivo debe tener columnas de &quot;email&quot; y opcionalmente
              &quot;nombre&quot;. Se procesa localmente, nunca se sube al servidor.
            </p>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Info del archivo */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{nombreArchivo}</span>
                  <Badge>{contactos.length} contactos</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiar}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Columnas detectadas */}
              {columnas && (
                <p className="text-xs text-muted-foreground">
                  Columnas detectadas: Email →{" "}
                  <code className="rounded bg-muted px-1">{columnas.email}</code>,
                  Nombre →{" "}
                  <code className="rounded bg-muted px-1">{columnas.nombre}</code>
                </p>
              )}

              {/* Advertencias */}
              {advertencias.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {advertencias.length} advertencia(s)
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {advertencias.slice(0, 5).map((adv, i) => (
                      <li key={i} className="text-xs text-yellow-700">
                        {adv}
                      </li>
                    ))}
                    {advertencias.length > 5 && (
                      <li className="text-xs text-yellow-600 font-medium">
                        ... y {advertencias.length - 5} más
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview tabla */}
              <div className="max-h-[250px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactos.slice(0, 10).map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground text-xs">
                          {c.fila}
                        </TableCell>
                        <TableCell>{c.nombre || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {c.email}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {contactos.length > 10 && (
                  <p className="p-2 text-center text-xs text-muted-foreground">
                    ... y {contactos.length - 10} contactos más
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
