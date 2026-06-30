import { Lock, Unlock, CheckCircle2, BadgeCheck, Spade, RefreshCw } from "lucide-react";
import { useSession, computeSessionStats, SessionStateName } from "@/context/SessionContext";
import { formatCLP } from "@/lib/currency";

const STATE_LABELS: Record<SessionStateName, string> = {
  OPEN: "Mesa Abierta",
  LOCKED: "Contando Fichas",
  SETTLED: "Liquidada",
};
const STATE_STYLE: Record<SessionStateName, { dot: string; badge: string }> = {
  OPEN:    { dot: "bg-teal",    badge: "text-teal-light border-teal/40" },
  LOCKED:  { dot: "bg-warning", badge: "text-warning border-warning/40" },
  SETTLED: { dot: "bg-primary", badge: "text-primary border-primary/40" },
};

export default function DataIntegrityHeader() {
  const { state, dispatch } = useSession();
  const { sessionState, players, sessionDate } = state;
  const { confirmedPot, unconfirmedDebt } = computeSessionStats(state);
  const style = STATE_STYLE[sessionState];

  const date = new Date(sessionDate).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-white/[0.07]">
      {/* Top gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        {/* Brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-glow border gold-border flex items-center justify-center">
              <Spade size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-[0.12em] text-text-primary leading-none">
                POKER ADMIN
              </h1>
              <p className="text-[10px] text-text-muted mt-0.5">{date}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className="text-[10px] font-bold tracking-wider">{STATE_LABELS[sessionState]}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Confirmed pot */}
          <div className="teal-glow border teal-border rounded-xl p-3 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-text-secondary tracking-widest uppercase">
              Pot Confirmado
            </span>
            <span className="text-2xl font-extrabold text-teal-light tabular-nums leading-none">
              {formatCLP(confirmedPot)}
            </span>
            <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
          </div>

          {/* Unconfirmed debt */}
          <div className={`border rounded-xl p-3 flex flex-col gap-0.5 ${
            unconfirmedDebt > 0 ? "crimson-glow crimson-border" : "glass border-white/[0.07]"
          }`}>
            <div className="flex items-center gap-1">
              {unconfirmedDebt > 0 && (
                <RefreshCw size={10} className="text-crimson-light animate-spin" style={{ animationDuration: "2s" }} />
              )}
              <span className="text-[9px] font-bold text-text-secondary tracking-widest uppercase">
                Deuda Pendiente
              </span>
            </div>
            <span className={`text-2xl font-extrabold tabular-nums leading-none ${
              unconfirmedDebt > 0 ? "text-crimson-light" : "text-text-muted"
            }`}>
              {formatCLP(unconfirmedDebt)}
            </span>
            <span className="text-[9px] text-text-muted tracking-widest">CLP</span>
          </div>
        </div>

        {/* Session actions */}
        {sessionState === "OPEN" && (
          <button
            onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "LOCKED" })}
            className="w-full flex items-center justify-center gap-2 warning-glow border border-warning/40 rounded-xl py-2.5 text-warning text-sm font-bold hover:border-warning/60 transition"
          >
            <Lock size={14} /> Bloquear para contar fichas
          </button>
        )}

        {sessionState === "LOCKED" && (
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "OPEN" })}
              className="flex-1 flex items-center justify-center gap-1.5 glass border border-white/10 rounded-xl py-2.5 text-text-secondary text-sm font-semibold hover:border-white/20 transition"
            >
              <Unlock size={14} /> Re-abrir
            </button>
            <button
              onClick={() => dispatch({ type: "SET_SESSION_STATE", payload: "SETTLED" })}
              className="flex-1 flex items-center justify-center gap-1.5 gold-glow border gold-border rounded-xl py-2.5 text-primary text-sm font-bold hover:border-primary/60 transition"
            >
              <CheckCircle2 size={14} /> Liquidar sesión
            </button>
          </div>
        )}

        {sessionState === "SETTLED" && (
          <div className="flex items-center justify-center gap-2 gold-glow border gold-border rounded-xl py-2.5 text-primary text-sm font-bold">
            <BadgeCheck size={16} /> Sesión Liquidada
          </div>
        )}
      </div>
    </header>
  );
}
