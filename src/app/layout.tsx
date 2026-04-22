import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MailerApp — Envío Masivo de Correos",
  description:
    "Herramienta personal para enviar correos masivos desde archivos Excel. Gratis, sencilla y profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background">
        <TooltipProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl p-6 pt-20 md:p-8 md:pt-8">
              {children}
            </div>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "font-sans",
            }}
            richColors
            closeButton
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
