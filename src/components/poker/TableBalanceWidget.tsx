import { Scale, AlertOctagon, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSession, computeSessionStats } from "@/context/SessionContext";
import { formatCLP } from "@/lib/currency";

export default function TableBalanceWidget() {
  const { state } = useSession();
  const { players } = state;
  const { totalInvested, totalFinalChips, discrepancy, isBalanced } = computeSessionStats(state);

  if (players.length === 0) return null;

  const ratio = totalInvested > 0 ? Math.min(totalFinalChips / totalInvested, 1.5) : 0;
  const widthPct = `${Math.min(ratio * 100, 100)}%`;
  const overflow = totalFinalChips > totalInvested;

  return (
    <div className={`mx-4 mb-4 rounded-2xl border overflow-hidden ${
      isBalanced ? "teal-glow teal-border" : "crimson-glow crimson-border"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${
        isBalanced ? "border-teal/20 bg-teal/[0.06]" : "border-crimson-light/20 bg-crimson-light/[0.06]"
      }`}>
        {isBalanced
          ? <Scale size={15} className="text-teal-light" />
          : <AlertOctagon size={15} className="text-crimson-light" />}
        <h3 className={`text-[10px] font-extrabold tracking-[0.18em] uppercase ${
          isBalanced ? "text-teal-light" : "text-crimson-light"
        }`}>
          Balance de Mesa
        </h3>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1 glass border border-white/[0.07] rounded-xl p-3 flex flex-col items-center">
            <span className="text-[9px] text-text-secondary font-semibold tracking-wider mb-1">Σ Entradas</span>
            <span className="text-xl font-extrabold text-text-primary tabular-nums">{formatCLP(totalInvested)}</span>
            <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
          </div>

          <span className={`text-3xl font-black leading-none ${
            isBalanced ? "text-teal-light" : "text-crimson-light"
          }`}>
            {isBalanced ? "=" : "≠"}
          </span>

          <div className="flex-1 glass border border-white/[0.07] rounded-xl p-3 flex flex-col items-center">
            <span className="text-[9px] text-text-secondary font-semibold tracking-wider mb-1">Σ Fichas</span>
            <span className="text-xl font-extrabold text-text-primary tabular-nums">{formatCLP(totalFinalChips)}</span>
            <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
          </div>
        </div>

        {/* Status banner */}
        {isBalanced ? (
          <div className="flex items-center justify-center gap-2 teal-glow border teal-border rounded-xl p-2.5">
            <CheckCircle2 size={15} className="text-teal-light" />
            <span className="text-xs font-bold text-teal-light">Mesa Cuadrada — Lista para liquidar</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 crimson-glow border crimson-border rounded-xl p-2.5">
            <AlertTriangle size={15} className="text-crimson-light" />
            <span className="text-xs font-bold text-crimson-light">
              Descuadre: {formatCLP(Math.abs(discrepancy))} CLP
              {discrepancy > 0 ? " · faltan fichas" : " · sobran fichas"}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {totalInvested > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-text-muted tracking-wider">Cobertura de fichas</span>
              <span className={`text-[10px] font-bold ${
                isBalanced ? "text-teal-light" : "text-crimson-light"
              }`}>
                {Math.round(ratio * 100)}%
              </span>
            </div>
            <div className="relative h-1.5 glass border-0 rounded-full overflow-hidden bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all ${
                  isBalanced ? "bg-teal" : overflow ? "bg-warning" : "bg-crimson-light"
                }`}
                style={{ width: widthPct }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
