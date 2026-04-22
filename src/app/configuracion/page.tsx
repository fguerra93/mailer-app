"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Key,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  mostrarErrorToast,
  mostrarExitoToast,
} from "@/components/layout/error-toast";
import { ERRORES } from "@/lib/errors";

export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarKey, setMostrarKey] = useState(false);

  const [proveedor, setProveedor] = useState<"resend" | "brevo">("resend");
  const [apiKey, setApiKey] = useState("");
  const [desdeEmail, setDesdeEmail] = useState("");
  const [desdeNombre, setDesdeNombre] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    cargarConfig();
  }, []);

  async function cargarConfig() {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .order("actualizado_en", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfigId(data.id);
        setProveedor(data.proveedor || "resend");
        setApiKey(data.api_key || "");
        setDesdeEmail(data.desde_email || "");
        setDesdeNombre(data.desde_nombre || "");
      }
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

  async function guardarConfig() {
    if (!apiKey.trim() || !desdeEmail.trim()) {
      mostrarErrorToast({
        codigo: "CFG_001",
        mensaje: "El API Key y el Email de remitente son obligatorios.",
        detalle_tecnico: "Validación de formulario: campos apiKey o desdeEmail vacíos.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        proveedor,
        api_key: apiKey,
        desde_email: desdeEmail,
        desde_nombre: desdeNombre,
        actualizado_en: new Date().toISOString(),
      };

      if (configId) {
        const { error } = await supabase
          .from("configuracion")
          .update(payload)
          .eq("id", configId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("configuracion")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data) setConfigId(data.id);
      }

      mostrarExitoToast(
        "Configuración guardada",
        "Tu API Token y datos de remitente se actualizaron correctamente."
      );
    } catch (err) {
      mostrarErrorToast(
        ERRORES.SUPABASE_ERROR(
          err instanceof Error ? err.message : "Error desconocido"
        )
      );
    }
    setGuardando(false);
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground">
          Administra tu proveedor de correo y credenciales.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            Proveedor de Correo
          </CardTitle>
          <CardDescription>
            Configura la API Key de tu proveedor y los datos del remitente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector proveedor */}
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <div className="flex gap-3">
              <Button
                variant={proveedor === "resend" ? "default" : "outline"}
                size="sm"
                onClick={() => setProveedor("resend")}
              >
                Resend
                {proveedor === "resend" && (
                  <CheckCircle className="ml-2 h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant={proveedor === "brevo" ? "default" : "outline"}
                size="sm"
                onClick={() => setProveedor("brevo")}
              >
                Brevo
                {proveedor === "brevo" && (
                  <CheckCircle className="ml-2 h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {proveedor === "resend"
                ? "Resend: 3,000 correos/mes gratis (límite 100/día)."
                : "Brevo: 300 correos/día gratis."}
            </p>
          </div>

          <Separator />

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={mostrarKey ? "text" : "password"}
                placeholder={
                  proveedor === "resend"
                    ? "re_xxxxxxxxxxxxxxxxxxxx"
                    : "xkeysib-xxxxxxxxxxxx"
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setMostrarKey(!mostrarKey)}
              >
                {mostrarKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu API Key se guarda de forma segura en la base de datos. Nunca se
              comparte ni se expone en el frontend.
            </p>
          </div>

          <Separator />

          {/* Datos remitente */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="desdeEmail">Email del remitente</Label>
              <Input
                id="desdeEmail"
                type="email"
                placeholder="noreply@tudominio.com"
                value={desdeEmail}
                onChange={(e) => setDesdeEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desdeNombre">Nombre del remitente</Label>
              <Input
                id="desdeNombre"
                placeholder="Mi Empresa"
                value={desdeNombre}
                onChange={(e) => setDesdeNombre(e.target.value)}
              />
            </div>
          </div>

          {/* Guardar */}
          <Button onClick={guardarConfig} disabled={guardando} className="w-full sm:w-auto">
            {guardando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info de límites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Referencia de Límites Gratuitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge>Resend</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>100 correos / día</li>
                <li>3,000 correos / mes</li>
                <li>1 dominio personalizado</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Brevo</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>300 correos / día</li>
                <li>~9,000 correos / mes</li>
                <li>Sin dominio personalizado requerido</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
