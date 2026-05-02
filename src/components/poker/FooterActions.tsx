import { useState } from "react";
import { RefreshCw, MessageCircle } from "lucide-react";
import { useSession, computeSessionStats } from "@/context/SessionContext";
import InfographicModal from "./InfographicModal";
import { toast } from "sonner";

export default function FooterActions() {
  const { state, resetSession } = useSession();
  const { players, sessionDate, globalBuyIn, utilidad } = state;
  const { isBalanced } = computeSessionStats(state);
  const [modal, setModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const hasPlayers = players.length > 0;
  const canShare = isBalanced && hasPlayers;

  const handleShare = () => {
    if (!canShare) {
      toast.warning(
        !hasPlayers
          ? "Agrega jugadores antes de generar el resumen."
          : "La suma de fichas finales debe igualar el pot total."
      );
      return;
    }
    setModal(true);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      toast("¿Resetear mesa? Toca otra vez para confirmar.", {
        action: { label: "Cancelar", onClick: () => setConfirmReset(false) },
      });
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    resetSession();
    setConfirmReset(false);
    toast.success("Mesa reseteada");
  };

  return (
    <>
      <div className="border-t border-border bg-surface px-4 py-3 flex gap-2 sticky bottom-0">
        <button
          onClick={handleReset}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border ${
            confirmReset
              ? "crimson-glow crimson-border text-crimson-light"
              : "border-border text-crimson-light hover:crimson-glow"
          } font-bold text-sm transition`}
        >
          <RefreshCw size={18} />
          {confirmReset ? "Confirmar" : "Resetear"}
        </button>

        <button
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-extrabold transition ${
            canShare
              ? "bg-whatsapp text-text-inverse hover:opacity-90 shadow-[0_4px_20px_hsl(var(--whatsapp)/0.4)]"
              : "glass border border-border text-text-muted cursor-not-allowed"
          }`}
        >
          <MessageCircle size={20} />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base">Generar Resumen</span>
            <span className="text-[10px] opacity-80 font-semibold">
              {canShare ? "Compartir por WhatsApp" : "Cuadra la mesa primero"}
            </span>
          </div>
        </button>
      </div>

      <InfographicModal
        open={modal}
        onClose={() => setModal(false)}
        players={players}
        sessionDate={sessionDate}
        globalBuyIn={globalBuyIn}
        utilidad={utilidad}
      />
    </>
  );
}
