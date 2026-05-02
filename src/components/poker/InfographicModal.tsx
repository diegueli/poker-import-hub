import { useRef, useState } from "react";
import { X, Image as ImageIcon, Check, Loader2, MessageCircle } from "lucide-react";
import html2canvas from "html2canvas";
import { Player } from "@/context/SessionContext";
import Infographic from "./Infographic";
import { generateSummaryMessage, openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function InfographicModal({
  open,
  onClose,
  players,
  sessionDate,
  globalBuyIn,
  utilidad,
}: {
  open: boolean;
  onClose: () => void;
  players: Player[];
  sessionDate: string;
  globalBuyIn: number;
  utilidad: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleDownload = async () => {
    if (!ref.current) return;
    setSaving(true);
    setSaved(false);
    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#0A0A0A",
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `poker-resumen-${new Date()
        .toLocaleDateString("es-CL")
        .replace(/\//g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      setSaved(true);
      toast.success("Imagen descargada", {
        description: "Compártela por WhatsApp desde tu carpeta de descargas.",
      });
    } catch {
      toast.error("No se pudo guardar la imagen.");
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = generateSummaryMessage(players, sessionDate, globalBuyIn);
    openWhatsApp(msg);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="w-9 flex items-center justify-center text-text-secondary hover:text-text-primary">
          <X size={22} />
        </button>
        <h2 className="text-base font-extrabold text-text-primary tracking-wide">
          Resumen de Partida
        </h2>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-5 pb-4 px-4">
        <p className="text-sm text-text-secondary text-center mb-4 px-6 leading-relaxed">
          Descarga la imagen y compártela por WhatsApp desde tu galería, o envía el resumen como texto.
        </p>
        <div className="shadow-emerald rounded-2xl">
          <Infographic
            ref={ref}
            players={players}
            sessionDate={sessionDate}
            globalBuyIn={globalBuyIn}
            utilidad={utilidad}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-3 pb-6 border-t border-border bg-background">
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-whatsapp text-text-inverse font-extrabold shadow-[0_4px_20px_hsl(var(--whatsapp)/0.4)]"
        >
          <MessageCircle size={20} />
          Enviar texto por WhatsApp
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-border text-text-secondary font-bold"
          >
            Cerrar
          </button>
          <button
            onClick={handleDownload}
            disabled={saving}
            className={`flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-text-inverse font-extrabold shadow-emerald ${
              saving ? "opacity-70" : ""
            }`}
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : saved ? (
              <Check size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
            {saving ? "Guardando…" : saved ? "Listo" : "Descargar imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}
