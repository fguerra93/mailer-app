"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  cantidadContactos: number;
  asunto: string;
  enviando: boolean;
}

export function SendConfirmation({
  abierto,
  onCerrar,
  onConfirmar,
  cantidadContactos,
  asunto,
  enviando,
}: Props) {
  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirmar Envío
          </DialogTitle>
          <DialogDescription>
            Estás a punto de enviar correos. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Destinatarios:</span>
            <span className="font-bold">{cantidadContactos} personas</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Asunto:</span>
            <span className="font-medium truncate max-w-[200px]">{asunto}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Sí, enviar {cantidadContactos} correos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
