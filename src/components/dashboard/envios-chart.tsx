"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MetricasDiarias } from "@/lib/types";

interface Props {
  datos: MetricasDiarias[];
}

export function EnviosChart({ datos }: Props) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Envíos de los últimos 7 días
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {datos.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Aún no hay datos de envío. ¡Envía tu primer correo!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="fecha"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="enviados"
                  name="Enviados"
                  fill="hsl(142, 71%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="fallidos"
                  name="Fallidos"
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
