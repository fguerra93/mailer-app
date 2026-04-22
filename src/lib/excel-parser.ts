import * as XLSX from "xlsx";
import { Contacto } from "./types";
import { ERRORES } from "./errors";
import type { ErrorApp } from "./types";

interface ResultadoParseo {
  contactos: Contacto[];
  errores: string[];
  columnasDetectadas: { nombre: string; email: string };
}

const COLUMNAS_EMAIL = ["email", "correo", "e-mail", "mail", "correo electrónico", "correo electronico", "emailaddress"];
const COLUMNAS_NOMBRE = ["nombre", "name", "nombres", "nombre completo", "full name", "fullname", "razón social", "razon social"];

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function encontrarColumna(encabezados: string[], candidatos: string[]): string | null {
  for (const enc of encabezados) {
    const normalizado = normalizarTexto(enc);
    if (candidatos.some((c) => normalizarTexto(c) === normalizado)) {
      return enc;
    }
  }
  // Búsqueda parcial
  for (const enc of encabezados) {
    const normalizado = normalizarTexto(enc);
    if (candidatos.some((c) => normalizado.includes(normalizarTexto(c)))) {
      return enc;
    }
  }
  return null;
}

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parsearExcel(buffer: ArrayBuffer): ResultadoParseo | ErrorApp {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const primeraHoja = workbook.SheetNames[0];
    if (!primeraHoja) {
      return ERRORES.EXCEL_VACIO();
    }

    const hoja = workbook.Sheets[primeraHoja];
    const datos: Record<string, string>[] = XLSX.utils.sheet_to_json(hoja, { defval: "" });

    if (datos.length === 0) {
      return ERRORES.EXCEL_VACIO();
    }

    const encabezados = Object.keys(datos[0]);
    const colEmail = encontrarColumna(encabezados, COLUMNAS_EMAIL);
    const colNombre = encontrarColumna(encabezados, COLUMNAS_NOMBRE);

    if (!colEmail) {
      return ERRORES.EXCEL_FORMATO(
        `Columnas encontradas: [${encabezados.join(", ")}]. No se encontró ninguna columna de email. Nombres válidos: ${COLUMNAS_EMAIL.join(", ")}`
      );
    }

    const contactos: Contacto[] = [];
    const errores: string[] = [];

    datos.forEach((fila, idx) => {
      const email = String(fila[colEmail] || "").trim();
      const nombre = colNombre ? String(fila[colNombre] || "").trim() : "";

      if (!email) return; // fila vacía, saltar

      if (!esEmailValido(email)) {
        errores.push(`Fila ${idx + 2}: "${email}" no es un email válido`);
        return;
      }

      contactos.push({
        nombre,
        email,
        fila: idx + 2, // +2 porque: +1 por 0-index, +1 por encabezado
      });
    });

    if (contactos.length === 0) {
      return ERRORES.EXCEL_VACIO();
    }

    return {
      contactos,
      errores,
      columnasDetectadas: {
        nombre: colNombre || "(no detectada)",
        email: colEmail,
      },
    };
  } catch (e) {
    return ERRORES.EXCEL_LECTURA(
      e instanceof Error ? e.message : "Error desconocido al leer el archivo"
    );
  }
}
