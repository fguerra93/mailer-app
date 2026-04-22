export interface Contacto {
  nombre: string;
  email: string;
  fila: number; // fila original del Excel para debugging
}

export interface EnvioRegistro {
  id: string;
  destinatario_email: string;
  destinatario_nombre: string;
  asunto: string;
  estado: "enviado" | "fallido" | "pendiente";
  error?: string;
  fecha: string;
  proveedor: "resend" | "brevo";
}

export interface ConfigProveedor {
  proveedor: "resend" | "brevo";
  api_key: string;
  desde_email: string;
  desde_nombre: string;
}

export interface MetricasDiarias {
  fecha: string;
  enviados: number;
  fallidos: number;
}

export interface RateLimit {
  proveedor: string;
  limite_diario: number;
  usados_hoy: number;
  limite_mensual: number;
  usados_mes: number;
}

export interface ErrorApp {
  codigo: string;
  mensaje: string;
  detalle_tecnico: string;
  timestamp: string;
}
