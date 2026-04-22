"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface MetricaProps {
  enviadosHoy: number;
  enviadosMes: number;
  fallidosHoy: number;
  tasaExito: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MetricsCards({
  enviadosHoy,
  enviadosMes,
  fallidosHoy,
  tasaExito,
}: MetricaProps) {
  const tarjetas = [
    {
      titulo: "Enviados Hoy",
      valor: enviadosHoy,
      icono: Send,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      titulo: "Enviados Este Mes",
      valor: enviadosMes,
      icono: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      titulo: "Fallidos Hoy",
      valor: fallidosHoy,
      icono: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      titulo: "Tasa de Éxito",
      valor: `${tasaExito}%`,
      icono: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {tarjetas.map((t) => (
        <motion.div key={t.titulo} variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.titulo}
              </CardTitle>
              <div className={`rounded-lg p-2 ${t.bg}`}>
                <t.icono className={`h-4 w-4 ${t.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{t.valor}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
