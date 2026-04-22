"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/enviar/excel-uploader";
import { EmailEditor } from "@/components/enviar/email-editor";
import { EmailPreview } from "@/components/enviar/email-preview";
import { SendConfirmation } from "@/components/enviar/send-confirmation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  mostrarErrorToast,
  mostrarExitoToast,
} from "@/components/layout/error-toast";
import { ERRORES } from "@/lib/errors";
import type { Contacto } from "@/lib/types";

interface ResultadoEnvio {
  email: string;
  nombre: string;
  exito: boolean;
  error?: string;
}

export default function EnviarPage() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultados, setResultados] = useState<ResultadoEnvio[]>([]);
  const [envioCompleto, setEnvioCompleto] = useState(false);

  const puedeEnviar = contactos.length > 0 && asunto.trim() && cuerpo.trim();

  async function handleEnviar() {
    setEnviando(true);
    setProgreso(0);
    setResultados([]);
    setEnvioCompleto(false);

    const resultadosTemp: ResultadoEnvio[] = [];

    for (let i = 0; i < contactos.length; i++) {
      const contacto = contactos[i];

      try {
        const res = await fetch("/api/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: contacto.email,
            nombre: contacto.nombre,
            asunto: asunto,
            cuerpo: cuerpo,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          resultadosTemp.push({
            email: contacto.email,
            nombre: contacto.nombre,
            exito: false,
            error: data.error || "Error desconocido",
          });

          if (res.status === 429) {
            mostrarErrorToast(ERRORES.RATE_LIMIT("Resend", 100));
            break;
          }
          if (res.status === 401) {
            mostrarErrorToast(ERRORES.API_TOKEN_INVALIDO("Resend"));
            break;
          }
        } else {
          resultadosTemp.push({
            email: contacto.email,
            nombre: contacto.nombre,
            exito: true,
          });
        }
      } catch {
        resultadosTemp.push({
          email: contacto.email,
          nombre: contacto.nombre,
          exito: false,
          error: "Error de red",
        });
      }

      setProgreso(Math.round(((i + 1) / contactos.length) * 100));
      setResultados([...resultadosTemp]);
    }

    setEnviando(false);
    setDialogoAbierto(false);
    setEnvioCompleto(true);

    const exitosos = resultadosTemp.filter((r) => r.exito).length;
    const fallidos = resultadosTemp.filter((r) => !r.exito).length;

    if (fallidos === 0) {
      mostrarExitoToast(
        `${exitosos} correos enviados exitosamente`,
        "Todos los correos fueron entregados sin errores."
      );
    } else {
      mostrarExitoToast(
        `Envío completado: ${exitosos} exitosos, ${fallidos} fallidos`,
        "Revisa los detalles abajo para ver qué correos fallaron."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enviar Correos</h2>
        <p className="text-muted-foreground">
          Carga tu Excel, redacta el correo y envía a todos tus contactos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <ExcelUploader
            contactos={contactos}
            onContactosCargados={setContactos}
          />
          <EmailEditor
            asunto={asunto}
            cuerpo={cuerpo}
            onAsuntoChange={setAsunto}
            onCuerpoChange={setCuerpo}
          />
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <EmailPreview
            asunto={asunto}
            cuerpo={cuerpo}
            nombreEjemplo={contactos[0]?.nombre || "Juan Pérez"}
            emailEjemplo={contactos[0]?.email || "juan@ejemplo.com"}
            desdeNombre="Mi Empresa"
            desdeEmail="noreply@miempresa.com"
          />

          {/* Botón de envío */}
          <Button
            size="lg"
            className="w-full"
            disabled={!puedeEnviar || enviando}
            onClick={() => setDialogoAbierto(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            {contactos.length > 0
              ? `Enviar a ${contactos.length} contactos`
              : "Carga un Excel para comenzar"}
          </Button>

          {/* Progreso */}
          <AnimatePresence>
            {(enviando || envioCompleto) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {enviando && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enviando correos...</span>
                          <span className="font-mono">{progreso}%</span>
                        </div>
                        <Progress value={progreso} className="h-2" />
                      </div>
                    )}

                    {envioCompleto && (
                      <div className="text-center space-y-2">
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                        <p className="font-medium">Envío completado</p>
                      </div>
                    )}

                    {/* Resumen de resultados */}
                    {resultados.length > 0 && (
                      <div className="max-h-[200px] overflow-auto space-y-1">
                        {resultados.map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded px-2 py-1 text-sm"
                          >
                            {r.exito ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            )}
                            <span className="truncate">{r.email}</span>
                            {!r.exito && (
                              <Badge variant="destructive" className="text-[10px] ml-auto shrink-0">
                                {r.error}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SendConfirmation
        abierto={dialogoAbierto}
        onCerrar={() => setDialogoAbierto(false)}
        onConfirmar={handleEnviar}
        cantidadContactos={contactos.length}
        asunto={asunto}
        enviando={enviando}
      />
    </div>
  );
}
