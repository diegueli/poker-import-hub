import { Lock, Unlock, CheckCircle2, BadgeCheck, Spade, RefreshCw } from "lucide-react";
import { useSession, computeSessionStats, SessionStateName } from "@/context/SessionContext";
import { formatCLP } from "@/lib/currency";

const STATE_LABELS: Record<SessionStateName, string> = {
  OPEN: "Mesa Abierta",
  LOCKED: "Contando Fichas",
  SETTLED: "Liquidada",
};
const STATE_COLOR: Record<SessionStateName, string> = {
  OPEN: "text-primary border-primary",
  LOCKED: "text-warning border-warning",
  SETTLED: "text-blue-400 border-blue-400",
};
const STATE_DOT: Record<SessionStateName, string> = {
  OPEN: "bg-primary",
  LOCKED: "bg-warning",
  SETTLED: "bg-blue-400",
};

export default function DataIntegrityHeader() {
  const { state, dispatch } = useSession();
  const { sessionState, players, sessionDate } = state;
  const { confirmedPot, unconfirmedDebt } = computeSessionStats(state);

  const date = new Date(sessionDate).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="bg-surface border-b border-border px-4 pt-5 pb-3 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Spade className="text-primary" size={20} />
          <h1 className="text-lg font-extrabold tracking-[0.15em] text-text-primary">
            POKER ADMIN
          </h1>
        </div>
        <div className={`flex items-center gap-1.5 border rounded-full px-2 py-0.5 ${STATE_COLOR[sessionState]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATE_DOT[sessionState]}`} />
          <span className="text-[10px] font-bold tracking-wider">
            {STATE_LABELS[sessionState]}
          </span>
        </div>
      </div>

      <p className="text-xs text-text-muted mb-3">{date}</p>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 emerald-glow border emerald-border rounded-md p-2 flex flex-col items-center">
          <span className="text-[9px] font-bold text-text-secondary tracking-widest mb-0.5">
            POT CONFIRMADO
          </span>
          <span className="text-lg font-extrabold text-primary tabular-nums">
            {formatCLP(confirmedPot)}
          </span>
          <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
        </div>

        <RefreshCw
          size={22}
          className={unconfirmedDebt > 0 ? "text-crimson-light animate-spin-slow" : "text-text-muted"}
        />

        <div
          className={`flex-1 border rounded-md p-2 flex flex-col items-center ${
            unconfirmedDebt > 0 ? "crimson-glow crimson-border" : "glass border-border"
          }`}
        >
          <span className="text-[9px] font-bold text-text-secondary tracking-widest mb-0.5">
            DEUDA PENDIENTE
          </span>
          <span
            className={`text-lg font-extrabold tabular-nums ${
              unconfirmedDebt > 0 ? "text-crimson-light" : "text-text-muted"
            }`}
          >
            {formatCLP(unconfirmedDebt)}
          </span>
          <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
        </div>
      </div>

      {sessionState === "OPEN" && (
        <button
          onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "LOCKED" })}
          className="w-full flex items-center justify-center gap-1.5 border border-border rounded-full py-1.5 px-3 text-warning text-sm font-semibold hover:bg-warning/10 transition"
        >
          <Lock size={14} /> Bloquear para contar fichas
        </button>
      )}

      {sessionState === "LOCKED" && (
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "OPEN" })}
            className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-full py-1.5 px-3 text-text-secondary text-sm font-semibold hover:glass-medium transition"
          >
            <Unlock size={14} /> Re-abrir mesa
          </button>
          <button
            onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "SETTLED" })}
            className="flex-1 flex items-center justify-center gap-1.5 emerald-border border rounded-full py-1.5 px-3 text-primary text-sm font-semibold hover:emerald-glow transition"
          >
            <CheckCircle2 size={14} /> Liquidar sesión
          </button>
        </div>
      )}

      {sessionState === "SETTLED" && (
        <div className="flex items-center justify-center gap-1.5 emerald-glow border emerald-border rounded-full py-1.5 text-primary text-sm font-semibold">
          <BadgeCheck size={14} /> Sesión liquidada
        </div>
      )}
    </header>
  );
}
