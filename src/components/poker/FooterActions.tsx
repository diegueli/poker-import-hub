import { useState } from "react";
import { RefreshCw, MessageCircle, AlertTriangle } from "lucide-react";
import { useSession, computeSessionStats } from "@/context/SessionContext";
import InfographicModal from "./InfographicModal";
import { toast } from "sonner";

function ResetConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass border crimson-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-4 shadow-crimson-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-crimson-light/10 border crimson-border flex items-center justify-center">
          <AlertTriangle size={24} className="text-crimson-light" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-extrabold text-text-primary mb-1">¿Resetear mesa?</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Se borrarán todos los jugadores, pagos y configuración. Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-border text-text-secondary font-bold text-sm hover:glass-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl crimson-glow crimson-border text-crimson-light font-extrabold text-sm transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FooterActions() {
  const { state, resetSession } = useSession();
  const { players, sessionDate, globalBuyIn } = state;
  const { isBalanced } = computeSessionStats(state);
  const [modal, setModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);

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

  const handleConfirmReset = () => {
    resetSession();
    setResetModal(false);
    toast.success("Mesa reseteada");
  };

  return (
    <>
      <div className="border-t border-border bg-surface px-4 py-3 flex gap-2 sticky bottom-0">
        <button
          onClick={() => setResetModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border text-crimson-light hover:crimson-glow font-bold text-sm transition"
        >
          <RefreshCw size={18} />
          Resetear
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

      {resetModal && (
        <ResetConfirmModal
          onConfirm={handleConfirmReset}
          onCancel={() => setResetModal(false)}
        />
      )}

      <InfographicModal
        open={modal}
        onClose={() => setModal(false)}
        players={players}
        sessionDate={sessionDate}
        globalBuyIn={globalBuyIn}
      />
    </>
  );
}
