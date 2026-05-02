import { forwardRef } from "react";
import { BadgeCheck } from "lucide-react";
import { Player } from "@/context/SessionContext";
import { formatCLP, formatCLPSigned } from "@/lib/currency";

const RANKS = [
  { medal: "🥇", className: "text-gold" },
  { medal: "🥈", className: "text-silver" },
  { medal: "🥉", className: "text-bronze" },
];

function getRank(idx: number) {
  return RANKS[idx] || { medal: `${idx + 1}°`, className: "text-text-secondary" };
}

type InfographicProps = {
  players: Player[];
  sessionDate: string;
  globalBuyIn?: number;
};

const Infographic = forwardRef<HTMLDivElement, InfographicProps>(
  function Infographic({ players, sessionDate, globalBuyIn = 0 }, ref) {
    const date = sessionDate
      ? new Date(sessionDate).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : new Date().toLocaleDateString("es-CL");

    const totalRebuys = players.reduce(
      (sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0),
      0
    );
    const totalPot = globalBuyIn * players.length + totalRebuys;

    const sorted = [...players].sort((a, b) => {
      const pnlA = a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
      const pnlB = b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
      return pnlB - pnlA;
    });

    const winner = sorted[0];
    const winnerPnl = winner
      ? winner.finalChips - (globalBuyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0))
      : 0;

    return (
      <div
        ref={ref}
        className="bg-background rounded-2xl overflow-hidden border border-border w-[360px]"
      >
        <div className="h-1 bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎰</span>
            <div>
              <h3 className="text-[13px] font-black text-text-primary tracking-[0.15em]">
                RESUMEN DE SESIÓN
              </h3>
              <p className="text-[11px] font-medium text-text-secondary tracking-wider">
                Poker Night
              </p>
            </div>
          </div>
          <div className="bg-foreground/[0.06] rounded-md px-2.5 py-1 border border-border">
            <span className="text-[11px] font-semibold text-text-secondary">📅 {date}</span>
          </div>
        </div>

        {/* POT TOTAL */}
        <div className="emerald-glow border emerald-border mx-3.5 rounded-xl py-3 mb-3 flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-text-secondary font-bold tracking-[0.15em]">
            💰 POT TOTAL
          </span>
          <span className="text-[30px] font-black text-primary leading-none tabular-nums">
            {formatCLP(totalPot)}
          </span>
          <span className="text-[10px] text-text-secondary tracking-widest">
            CLP · {players.length} jugadores
          </span>
          {globalBuyIn > 0 && (
            <span className="text-[10px] text-text-muted mt-0.5">
              Buy-in: {formatCLP(globalBuyIn)} por jugador
            </span>
          )}
        </div>

        {/* Players */}
        <div className="px-3.5 flex flex-col gap-2">
          {sorted.map((p, idx) => {
            const rebuysTotal = p.rebuys.reduce((s, r) => s + r.amount, 0);
            const compras = globalBuyIn + rebuysTotal;
            const pnl = p.finalChips - compras;
            const isWin = pnl >= 0;
            const { medal, className } = getRank(idx);
            const initials = p.name
              ? p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
              : "?";

            return (
              <div
                key={p.id}
                className={`rounded-xl border p-2.5 ${
                  isWin ? "emerald-glow emerald-border" : "crimson-glow crimson-border"
                }`}
              >
                {/* Name row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-extrabold shrink-0 ${className}`}>{medal}</span>
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isWin ? "border-primary" : "border-crimson-light"
                    }`}
                  >
                    <span
                      className={`text-xs font-extrabold ${
                        isWin ? "text-primary" : "text-crimson-light"
                      }`}
                    >
                      {initials}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-text-primary truncate flex-1">
                    {p.name || "Jugador"}
                  </p>
                  <span className={`text-[11px] font-extrabold tabular-nums shrink-0 ${isWin ? "text-primary" : "text-crimson-light"}`}>
                    {formatCLPSigned(pnl)}
                  </span>
                </div>

                {/* Stats: Compras / Total fichas / Utilidad */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="flex flex-col items-center glass border border-border rounded-md px-1 py-1.5">
                    <span className="text-[8px] text-text-muted tracking-wider mb-0.5 font-semibold">
                      COMPRAS
                    </span>
                    <span className="text-[11px] font-extrabold text-text-primary tabular-nums">
                      {formatCLP(compras)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center glass border border-border rounded-md px-1 py-1.5">
                    <span className="text-[8px] text-text-muted tracking-wider mb-0.5 font-semibold">
                      TOTAL FICHAS
                    </span>
                    <span className="text-[11px] font-extrabold text-text-primary tabular-nums">
                      {formatCLP(p.finalChips)}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center rounded-md px-1 py-1.5 ${
                      isWin
                        ? "bg-primary/20 border border-primary/40"
                        : "bg-crimson-light/20 border border-crimson-light/40"
                    }`}
                  >
                    <span
                      className={`text-[8px] tracking-wider mb-0.5 font-bold ${
                        isWin ? "text-primary" : "text-crimson-light"
                      }`}
                    >
                      UTILIDAD
                    </span>
                    <span
                      className={`text-[11px] font-extrabold tabular-nums ${
                        isWin ? "text-primary" : "text-crimson-light"
                      }`}
                    >
                      {formatCLPSigned(pnl)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-border mx-3.5 my-3" />

        {/* Winner banner */}
        {players.length > 1 && winnerPnl > 0 && (
          <div className="mx-3.5 mb-3 emerald-glow border emerald-border rounded-md py-2 px-3 text-center">
            <span className="text-[12px] font-bold text-primary">
              🏆 {winner.name} gana {formatCLP(winnerPnl)} CLP esta noche
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 mb-3">
          <BadgeCheck size={14} className="text-primary" />
          <span className="text-[11px] text-primary font-semibold">
            Mesa Cuadrada Correctamente
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 pb-3.5 text-text-muted">
          <span className="text-base">♠</span>
          <span className="text-[11px] font-bold tracking-[0.2em]">POKER ADMIN</span>
          <span className="text-base">♠</span>
        </div>
      </div>
    );
  }
);

export default Infographic;
