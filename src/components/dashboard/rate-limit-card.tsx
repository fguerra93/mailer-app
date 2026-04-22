"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";
import type { RateLimit } from "@/lib/types";

interface Props {
  rateLimit: RateLimit;
}

export function RateLimitCard({ rateLimit }: Props) {
  const porcentajeDiario =
    rateLimit.limite_diario > 0
      ? Math.round((rateLimit.usados_hoy / rateLimit.limite_diario) * 100)
      : 0;
  const porcentajeMensual =
    rateLimit.limite_mensual > 0
      ? Math.round((rateLimit.usados_mes / rateLimit.limite_mensual) * 100)
      : 0;

  const restantesDiarios = rateLimit.limite_diario - rateLimit.usados_hoy;
  const restantesMensuales = rateLimit.limite_mensual - rateLimit.usados_mes;

  const estadoDiario =
    porcentajeDiario >= 90
      ? "destructive"
      : porcentajeDiario >= 70
        ? "secondary"
        : "default";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Cupo de {rateLimit.proveedor}
        </CardTitle>
        <Gauge className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Diario */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hoy</span>
            <Badge variant={estadoDiario}>
              Te quedan {Math.max(0, restantesDiarios)}
            </Badge>
          </div>
          <Progress value={porcentajeDiario} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {rateLimit.usados_hoy} / {rateLimit.limite_diario} diarios usados
          </p>
        </div>

        {/* Mensual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Este mes</span>
            <Badge variant={porcentajeMensual >= 90 ? "destructive" : "default"}>
              Te quedan {Math.max(0, restantesMensuales)}
            </Badge>
          </div>
          <Progress value={porcentajeMensual} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {rateLimit.usados_mes} / {rateLimit.limite_mensual} mensuales usados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
