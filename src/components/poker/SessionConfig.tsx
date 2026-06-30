import { useEffect, useState } from "react";
import { Lock, Coins, Table2 } from "lucide-react";
import { useSession } from "@/context/SessionContext";

function AmountField({
  label, Icon, value, onCommit, disabled,
}: {
  label: string;
  Icon: typeof Coins;
  value: number;
  onCommit: (v: number) => void;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState(value > 0 ? value.toString() : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setRaw(value > 0 ? value.toString() : "");
  }, [value]);

  const parsed = parseInt(raw) || 0;
  const displayValue = focused
    ? raw
    : (parsed > 0 ? new Intl.NumberFormat("es-CL").format(parsed) : "");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-primary" />
        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">{label}</span>
      </div>
      <div className={`flex items-center border rounded-xl px-3 py-2.5 transition-colors ${
        disabled
          ? "glass border-white/[0.07] opacity-70"
          : "glass-medium border-primary/30 focus-within:border-primary/60"
      }`}>
        <span className="text-base text-text-secondary font-bold mr-1">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => {
            if (disabled) return;
            const newRaw = e.target.value.replace(/[^0-9]/g, "");
            setRaw(newRaw);
            onCommit(parseInt(newRaw) || 0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          maxLength={9}
          disabled={disabled}
          className="flex-1 bg-transparent text-base text-text-primary font-bold py-0.5 px-1 outline-none placeholder:text-text-muted disabled:text-text-secondary min-w-0"
        />
        <span className="text-[10px] text-text-muted tracking-wider">CLP</span>
      </div>
    </div>
  );
}

export default function SessionConfig() {
  const { state, dispatch } = useSession();
  const { globalBuyIn, sessionState, players } = state;
  const isLocked = sessionState !== "OPEN";
  const hasConfirmedBuyIn = players.some((p) => p.buyInConfirmed);
  const buyInDisabled = isLocked || hasConfirmedBuyIn;

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/[0.09] to-transparent border-b border-primary/15">
        <Table2 size={15} className="text-primary" />
        <h3 className="flex-1 text-[10px] font-extrabold text-primary tracking-[0.18em] uppercase">
          Configuración de Mesa
        </h3>
        {isLocked && (
          <span className="flex items-center gap-1 warning-glow border border-warning/40 rounded-full px-2 py-0.5">
            <Lock size={9} className="text-warning" />
            <span className="text-[9px] font-bold text-warning">Bloqueada</span>
          </span>
        )}
        {!isLocked && hasConfirmedBuyIn && (
          <span className="flex items-center gap-1 gold-glow border gold-border rounded-full px-2 py-0.5">
            <Lock size={9} className="text-primary" />
            <span className="text-[9px] font-bold text-primary">Fijado</span>
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        <AmountField
          label="Buy-in (igual para todos)"
          Icon={Coins}
          value={globalBuyIn}
          onCommit={(v) => dispatch({ type: "SET_GLOBAL_BUYIN", payload: v })}
          disabled={buyInDisabled}
        />
        {globalBuyIn > 0 && (
          <p className="text-[11px] text-text-muted text-center mt-2">
            Cada jugador paga{" "}
            <span className="text-primary font-bold">
              {new Intl.NumberFormat("es-CL").format(globalBuyIn)} CLP
            </span>{" "}
            al ingresar
          </p>
        )}
      </div>
    </div>
  );
}
