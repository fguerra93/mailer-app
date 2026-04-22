"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Send,
  History,
  Settings,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navegacion = [
  { nombre: "Dashboard", href: "/", icono: LayoutDashboard },
  { nombre: "Enviar Correos", href: "/enviar", icono: Send },
  { nombre: "Historial", href: "/historial", icono: History },
  { nombre: "Configuración", href: "/configuracion", icono: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setAbierto(true)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-xl bg-primary p-2.5 text-primary-foreground shadow-lg shadow-primary/25"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay móvil */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setAbierto(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r bg-card/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 md:static",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-[72px] items-center gap-3 border-b px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none tracking-tight">MailerApp</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Envío masivo de correos</p>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="ml-auto md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3 mt-2">
          {navegacion.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAbierto(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  activo
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icono className="h-[18px] w-[18px]" />
                {item.nombre}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-xl bg-accent/60 px-3 py-2.5 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Plan Gratuito
            </p>
            <p className="text-xs font-semibold text-foreground">
              $0 / mes
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
