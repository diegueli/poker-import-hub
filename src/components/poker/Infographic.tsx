import { forwardRef } from "react";
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

type MetricCellProps = {
  label: string;
  value: string;
  variant?: "default" | "win" | "loss";
};

function MetricCell({ label, value, variant = "default" }: MetricCellProps) {
  const wrap =
    variant === "win"
      ? "bg-primary/10 border-primary/30"
      : variant === "loss"
      ? "bg-crimson-light/10 border-crimson-light/30"
      : "bg-foreground/[0.03] border-border";
  const valueColor =
    variant === "win"
      ? "text-primary"
      : variant === "loss"
      ? "text-crimson-light"
      : variant === "default"
      ? "text-text-primary"
      : "text-text-primary";

  return (
    <div className={`flex-1 rounded-lg border px-1.5 py-1 text-center ${wrap}`}>
      <p className="text-[8px] font-bold text-text-secondary tracking-wider mb-0.5">
        {label}
      </p>
      <p className={`text-[12px] font-extrabold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}

type PlayerRowProps = { player: Player; rank: number; globalBuyIn: number };

function PlayerRow({ player, rank, globalBuyIn }: PlayerRowProps) {
  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const compras = globalBuyIn + rebuysTotal;
  const totalFichas = player.finalChips;
  const utilidad = totalFichas - compras;
  const isWin = utilidad >= 0;
  const { medal, className } = getRank(rank);
  const initials = player.name
    ? player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      className={`mb-2 rounded-[10px] overflow-hidden border ${
        isWin
          ? "border-primary/30 bg-primary/[0.13]"
          : "border-crimson-light/30 bg-crimson-light/[0.13]"
      }`}
    >
      <div className="flex items-center gap-2 px-2 pt-2 pb-1">
        <span className={`text-sm min-w-[20px] text-center ${className}`}>{medal}</span>
        <div
          className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-[1.5px] bg-foreground/[0.06] ${
            isWin ? "border-primary" : "border-crimson-light"
          }`}
        >
          {player.photo ? (
            <img src={player.photo} alt="" className="w-7 h-7 object-cover" />
          ) : (
            <span
              className={`text-[10px] font-black ${
                isWin ? "text-primary" : "text-crimson-light"
              }`}
            >
              {initials}
            </span>
          )}
        </div>
        <span className="text-[12px] font-extrabold text-text-primary flex-1 truncate">
          {player.name || "Jugador"}
        </span>
        <span className="text-base">{isWin ? "✅" : "❌"}</span>
      </div>

      <div className="flex gap-1 px-2 pb-2">
        <MetricCell label="COMPRAS" value={formatCLP(compras)} />
        <MetricCell label="TOTAL FICHAS" value={formatCLP(totalFichas)} />
        <MetricCell
          label="UTILIDAD"
          value={formatCLPSigned(utilidad)}
          variant={isWin ? "win" : "loss"}
        />
      </div>
    </div>
  );
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
      const ua =
        a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
      const ub =
        b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
      return ub - ua;
    });

    const winner = sorted[0];
    const winnerUtil = winner
      ? winner.finalChips -
        (globalBuyIn + winner.rebuys.reduce((s, r) => s + r.amount, 0))
      : 0;

    return (
      <div
        ref={ref}
        className="w-[340px] bg-background rounded-[18px] overflow-hidden border border-border"
      >
        {/* Top bar */}
        <div className="h-1 bg-primary" />

        {/* Header */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-3 border-b border-border">
          <span className="text-[28px] leading-none">🎰</span>
          <div className="flex-1">
            <p className="text-[14px] font-black text-text-primary tracking-[0.12em]">
              RESUMEN DE SESIÓN
            </p>
            <p className="text-[11px] text-text-secondary font-medium mt-0.5">
              Poker Night · {date}
            </p>
          </div>
          <div className="emerald-glow border emerald-border rounded-[10px] px-2.5 py-1.5 text-center">
            <p className="text-[8px] text-text-secondary font-bold tracking-wider">
              POT TOTAL
            </p>
            <p className="text-[14px] font-black text-primary mt-0.5 tabular-nums">
              {formatCLP(totalPot)}
            </p>
            <p className="text-[8px] text-text-muted tracking-wide">
              {players.length} jugadores
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="px-3 pt-2.5 pb-1">
          {sorted.map((p, i) => (
            <PlayerRow key={p.id} player={p} rank={i} globalBuyIn={globalBuyIn} />
          ))}
        </div>

        {/* Winner banner */}
        {players.length > 1 && winnerUtil > 0 && (
          <div className="mx-3 mb-2.5 rounded-lg py-2 px-3 text-center bg-gold/10 border border-gold/30">
            <span className="text-[12px] font-bold text-gold">
              🏆 {winner.name} gana {formatCLP(winnerUtil)} CLP esta noche
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-[11px] text-primary font-bold">
            ✔ Mesa Cuadrada Correctamente
          </span>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 pb-3 text-text-muted">
          <span className="text-[10px]">♠</span>
          <span className="text-[9px] font-extrabold tracking-[0.25em]">
            POKER ADMIN
          </span>
          <span className="text-[10px]">♠</span>
        </div>
      </div>
    );
  }
);

export default Infographic;
