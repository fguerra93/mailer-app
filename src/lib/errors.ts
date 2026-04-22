import { ErrorApp } from "./types";

export function crearError(
  codigo: string,
  mensaje: string,
  detalleTecnico: string
): ErrorApp {
  return {
    codigo,
    mensaje,
    detalle_tecnico: detalleTecnico,
    timestamp: new Date().toISOString(),
  };
}

export const ERRORES = {
  EXCEL_FORMATO: (detalle: string) =>
    crearError(
      "EXCEL_001",
      "El archivo Excel no tiene el formato esperado. Asegúrate de que tenga columnas de 'nombre' y 'email'.",
      detalle
    ),
  EXCEL_VACIO: () =>
    crearError(
      "EXCEL_002",
      "El archivo Excel está vacío o no contiene filas con datos válidos.",
      "No se encontraron filas con emails válidos después del encabezado."
    ),
  EXCEL_LECTURA: (detalle: string) =>
    crearError(
      "EXCEL_003",
      "No se pudo leer el archivo. Verifica que sea un archivo Excel válido (.xlsx o .xls).",
      detalle
    ),
  API_TOKEN_INVALIDO: (proveedor: string) =>
    crearError(
      "AUTH_001",
      `El API Token de ${proveedor} es inválido o ha expirado. Ve a Configuración para actualizarlo.`,
      `HTTP 401/403 al intentar autenticar con ${proveedor} API.`
    ),
  API_TOKEN_FALTANTE: () =>
    crearError(
      "AUTH_002",
      "No hay un API Token configurado. Ve a Configuración y agrega tu token antes de enviar correos.",
      "No se encontró registro en tabla 'configuracion' de Supabase."
    ),
  RATE_LIMIT: (proveedor: string, limite: number) =>
    crearError(
      "LIMIT_001",
      `Has alcanzado el límite diario de ${limite} correos en ${proveedor}. Intenta mañana o cambia de proveedor.`,
      `HTTP 429 Too Many Requests - ${proveedor} daily limit reached.`
    ),
  ENVIO_FALLIDO: (email: string, detalle: string) =>
    crearError(
      "SEND_001",
      `No se pudo enviar el correo a ${email}. Revisa que la dirección sea válida.`,
      detalle
    ),
  SUPABASE_ERROR: (detalle: string) =>
    crearError(
      "DB_001",
      "Error al conectar con la base de datos. Verifica tu conexión a internet.",
      detalle
    ),
  RED_ERROR: () =>
    crearError(
      "NET_001",
      "Sin conexión a internet. Verifica tu red e intenta de nuevo.",
      "Network request failed - navigator.onLine may be false or DNS resolution failed."
    ),
} as const;
