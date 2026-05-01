import { forwardRef } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
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

const Infographic = forwardRef<HTMLDivElement, { players: Player[]; sessionDate: string }>(
  function Infographic({ players, sessionDate }, ref) {
    const date = sessionDate
      ? new Date(sessionDate).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : new Date().toLocaleDateString("es-CL");

    const totalPot = players.reduce(
      (sum, p) => sum + p.buyIn + p.rebuys.reduce((s, r) => s + r.amount, 0),
      0
    );

    const sorted = [...players].sort((a, b) => {
      const pnlA = a.finalChips - (a.buyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
      const pnlB = b.finalChips - (b.buyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
      return pnlB - pnlA;
    });

    const winner = sorted[0];
    const winnerPnl = winner
      ? winner.finalChips - (winner.buyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0))
      : 0;

    return (
      <div
        ref={ref}
        className="bg-background rounded-2xl overflow-hidden border border-border w-[360px]"
      >
        <div className="h-1 bg-primary" />

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

        <div className="emerald-glow border emerald-border mx-3.5 rounded-xl py-3.5 mb-3.5 flex flex-col items-center">
          <span className="text-[10px] text-text-secondary font-bold tracking-[0.15em] mb-1">
            💰 POT TOTAL
          </span>
          <span className="text-[30px] font-black text-primary leading-none tabular-nums">
            {formatCLP(totalPot)}
          </span>
          <span className="text-[10px] text-text-secondary mt-1 tracking-widest">
            CLP · {players.length} jugadores
          </span>
        </div>

        <div className="h-px bg-border mx-3.5 mb-3" />

        <div className="px-3.5 flex flex-col gap-2">
          {sorted.map((p, idx) => {
            const rebuysTotal = p.rebuys.reduce((s, r) => s + r.amount, 0);
            const invested = p.buyIn + rebuysTotal;
            const pnl = p.finalChips - invested;
            const isWin = pnl >= 0;
            const { medal, className } = getRank(idx);
            const initials = p.name
              ? p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
              : "?";

            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-xl border p-2 ${
                  isWin ? "emerald-glow emerald-border" : "crimson-glow crimson-border"
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-base font-extrabold ${className}`}>{medal}</span>
                  <div
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
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
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-text-primary truncate">
                    {p.name || "Jugador"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-text-muted tracking-wider">Invirtió</span>
                      <span className="text-[10px] font-bold text-text-secondary tabular-nums">
                        {formatCLP(invested)}
                      </span>
                    </div>
                    <ArrowRight size={12} className="text-text-muted" />
                    <div className="flex flex-col">
                      <span className="text-[8px] text-text-muted tracking-wider">Retira</span>
                      <span className="text-[10px] font-bold text-text-secondary tabular-nums">
                        {formatCLP(p.finalChips)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-col items-center px-2 py-1 rounded-md ${
                    isWin ? "bg-primary/20" : "bg-crimson-light/20"
                  }`}
                >
                  <span className="text-xs">{isWin ? "✅" : "❌"}</span>
                  <span
                    className={`text-[12px] font-extrabold tabular-nums ${
                      isWin ? "text-primary" : "text-crimson-light"
                    }`}
                  >
                    {formatCLPSigned(pnl)}
                  </span>
                  <span className="text-[8px] text-text-muted">CLP</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-border mx-3.5 my-3" />

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
