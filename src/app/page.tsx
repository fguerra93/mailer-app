"use client";

import { useEffect, useState } from "react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RateLimitCard } from "@/components/dashboard/rate-limit-card";
import { EnviosChart } from "@/components/dashboard/envios-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { mostrarErrorToast } from "@/components/layout/error-toast";
import { ERRORES } from "@/lib/errors";
import type { MetricasDiarias, RateLimit } from "@/lib/types";

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [enviadosHoy, setEnviadosHoy] = useState(0);
  const [enviadosMes, setEnviadosMes] = useState(0);
  const [fallidosHoy, setFallidosHoy] = useState(0);
  const [tasaExito, setTasaExito] = useState(100);
  const [chartData, setChartData] = useState<MetricasDiarias[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimit>({
    proveedor: "Resend",
    limite_diario: 100,
    usados_hoy: 0,
    limite_mensual: 3000,
    usados_mes: 0,
  });

  useEffect(() => {
    cargarMetricas();
  }, []);

  async function cargarMetricas() {
    setCargando(true);
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const inicioMes = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Envíos de hoy
      const { data: hoyData, error: e1 } = await supabase
        .from("envios")
        .select("estado")
        .gte("fecha", hoy);

      if (e1) throw e1;

      const envHoy = (hoyData || []).filter((e) => e.estado === "enviado").length;
      const falHoy = (hoyData || []).filter((e) => e.estado === "fallido").length;
      setEnviadosHoy(envHoy);
      setFallidosHoy(falHoy);

      // Envíos del mes
      const { data: mesData, error: e2 } = await supabase
        .from("envios")
        .select("estado")
        .gte("fecha", inicioMes);

      if (e2) throw e2;

      const envMes = (mesData || []).filter((e) => e.estado === "enviado").length;
      setEnviadosMes(envMes);

      // Tasa de éxito
      const total = (hoyData || []).length;
      setTasaExito(total > 0 ? Math.round((envHoy / total) * 100) : 100);

      // Rate limit
      setRateLimit((prev) => ({
        ...prev,
        usados_hoy: envHoy,
        usados_mes: envMes,
      }));

      // Gráfica últimos 7 días
      const { data: semanaData, error: e3 } = await supabase
        .from("envios")
        .select("fecha, estado")
        .gte("fecha", hace7Dias);

      if (e3) throw e3;

      const agrupado: Record<string, { enviados: number; fallidos: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
        agrupado[key] = { enviados: 0, fallidos: 0 };
      }

      (semanaData || []).forEach((envio) => {
        const d = new Date(envio.fecha);
        const key = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
        if (agrupado[key]) {
          if (envio.estado === "enviado") agrupado[key].enviados++;
          else if (envio.estado === "fallido") agrupado[key].fallidos++;
        }
      });

      setChartData(
        Object.entries(agrupado).map(([fecha, v]) => ({
          fecha,
          enviados: v.enviados,
          fallidos: v.fallidos,
        }))
      );
    } catch (err) {
      // Si Supabase no está configurado, mostrar datos vacíos
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setChartData([
          { fecha: "16 abr", enviados: 0, fallidos: 0 },
          { fecha: "17 abr", enviados: 0, fallidos: 0 },
          { fecha: "18 abr", enviados: 0, fallidos: 0 },
          { fecha: "19 abr", enviados: 0, fallidos: 0 },
          { fecha: "20 abr", enviados: 0, fallidos: 0 },
          { fecha: "21 abr", enviados: 0, fallidos: 0 },
          { fecha: "22 abr", enviados: 0, fallidos: 0 },
        ]);
      } else {
        mostrarErrorToast(
          ERRORES.SUPABASE_ERROR(
            err instanceof Error ? err.message : "Error desconocido"
          )
        );
      }
    }
    setCargando(false);
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[350px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen de tu actividad de envío de correos.
        </p>
      </div>

      <MetricsCards
        enviadosHoy={enviadosHoy}
        enviadosMes={enviadosMes}
        fallidosHoy={fallidosHoy}
        tasaExito={tasaExito}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnviosChart datos={chartData} />
        </div>
        <RateLimitCard rateLimit={rateLimit} />
      </div>
    </div>
  );
}
