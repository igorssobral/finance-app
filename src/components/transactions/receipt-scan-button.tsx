"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extractReceiptDataAction } from "@/app/(dashboard)/transacoes/ai-actions";

interface ReceiptScanButtonProps {
  onExtracted: (data: { title: string | null; amount: number | null; date: string | null }) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove o prefixo "data:image/png;base64,"
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

/** Botão que abre o seletor de arquivo, envia a imagem para OCR via IA e preenche o formulário. */
export function ReceiptScanButton({ onExtracted }: ReceiptScanButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite selecionar o mesmo arquivo de novo
    if (!file) return;

    setIsScanning(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await extractReceiptDataAction(base64, file.type);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data.title && !result.data.amount) {
        toast.warning("Não consegui identificar os dados do comprovante");
        return;
      }
      onExtracted(result.data);
      toast.success("Dados extraídos do comprovante");
    } catch {
      toast.error("Erro ao processar a imagem");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isScanning}
        onClick={() => inputRef.current?.click()}
      >
        {isScanning ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
        Escanear comprovante
      </Button>
    </>
  );
}
