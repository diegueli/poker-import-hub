import { Scale, AlertOctagon, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSession, computeSessionStats } from "@/context/SessionContext";
import { formatCLP } from "@/lib/currency";

export default function TableBalanceWidget() {
  const { state } = useSession();
  const { players } = state;
  const { totalInvested, totalFinalChips, discrepancy, isBalanced } = computeSessionStats(players);

  if (players.length === 0) return null;

  const ratio = totalInvested > 0 ? Math.min(totalFinalChips / totalInvested, 1.5) : 0;
  const widthPct = `${Math.min(ratio * 100, 100)}%`;
  const overflow = totalFinalChips > totalInvested;

  return (
    <div
      className={`mx-4 mb-4 rounded-2xl border p-4 flex flex-col gap-3 ${
        isBalanced ? "emerald-glow emerald-border" : "crimson-glow crimson-border"
      }`}
    >
      <div className="flex items-center gap-2">
        {isBalanced ? (
          <Scale size={18} className="text-primary" />
        ) : (
          <AlertOctagon size={18} className="text-crimson-light" />
        )}
        <h3
          className={`text-xs font-extrabold tracking-[0.15em] ${
            isBalanced ? "text-primary" : "text-crimson-light"
          }`}
        >
          BALANCE DE MESA
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 glass border border-border rounded-md p-2 flex flex-col items-center">
          <span className="text-[10px] text-text-secondary font-semibold tracking-wider mb-0.5">
            Σ Entradas
          </span>
          <span className="text-xl font-extrabold text-text-primary tabular-nums">
            {formatCLP(totalInvested)}
          </span>
          <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
        </div>
        <div className="w-8 text-center">
          <span
            className={`text-3xl font-black ${
              isBalanced ? "text-primary" : "text-crimson-light"
            }`}
          >
            {isBalanced ? "=" : "≠"}
          </span>
        </div>
        <div className="flex-1 glass border border-border rounded-md p-2 flex flex-col items-center">
          <span className="text-[10px] text-text-secondary font-semibold tracking-wider mb-0.5">
            Σ Fichas Finales
          </span>
          <span className="text-xl font-extrabold text-text-primary tabular-nums">
            {formatCLP(totalFinalChips)}
          </span>
          <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
        </div>
      </div>

      {isBalanced ? (
        <div className="flex items-center justify-center gap-2 emerald-glow border emerald-border rounded-md p-2">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="text-xs font-bold text-primary">
            Mesa Cuadrada — Lista para liquidar
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 crimson-glow border crimson-border rounded-md p-2">
          <AlertTriangle size={16} className="text-crimson-light" />
          <span className="text-xs font-bold text-crimson-light">
            Descuadre: {formatCLP(Math.abs(discrepancy))} CLP
            {discrepancy > 0 ? " (faltan fichas)" : " (sobran fichas)"}
          </span>
        </div>
      )}

      {totalInvested > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-muted tracking-wider">
            Cobertura de fichas
          </span>
          <div className="relative h-1.5 glass rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isBalanced ? "bg-primary" : overflow ? "bg-warning" : "bg-crimson-light"
              }`}
              style={{ width: widthPct }}
            />
            <span className="absolute right-0 top-0 bottom-0 w-px bg-text-muted" />
          </div>
          <span
            className={`text-[10px] font-bold text-right ${
              isBalanced ? "text-primary" : "text-crimson-light"
            }`}
          >
            {Math.round(ratio * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
