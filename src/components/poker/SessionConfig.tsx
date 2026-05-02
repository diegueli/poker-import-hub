import { useEffect, useState } from "react";
import { Lock, Coins, Table } from "lucide-react";
import { useSession } from "@/context/SessionContext";

function AmountField({
  label,
  Icon,
  iconColor,
  value,
  onCommit,
  disabled,
}: {
  label: string;
  Icon: typeof Coins;
  iconColor: string;
  value: number;
  onCommit: (v: number) => void;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState(value > 0 ? value.toString() : "");

  useEffect(() => {
    setRaw(value > 0 ? value.toString() : "");
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Icon size={14} className={iconColor} />
        <span className={`text-[10px] font-bold tracking-wider ${iconColor}`}>{label}</span>
      </div>
      <div className="flex items-center glass-medium border border-border rounded-md px-2 py-1.5">
        <span className="text-base text-text-secondary font-bold">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => onCommit(parseInt(raw) || 0)}
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
  const { globalBuyIn, sessionState } = state;
  const isLocked = sessionState !== "OPEN";

  return (
    <div className="mx-4 mb-3 glass border emerald-border rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Table size={16} className="text-primary" />
        <h3 className="flex-1 text-[11px] font-extrabold text-primary tracking-[0.15em]">
          CONFIGURACIÓN DE MESA
        </h3>
        {isLocked && (
          <span className="flex items-center gap-1 warning-glow border border-warning rounded-full px-2 py-0.5">
            <Lock size={10} className="text-warning" />
            <span className="text-[9px] font-bold text-warning">Bloqueada</span>
          </span>
        )}
      </div>

      <AmountField
        label="Buy-in (igual para todos)"
        Icon={Coins}
        iconColor="text-primary"
        value={globalBuyIn}
        onCommit={(v) => dispatch({ type: "SET_GLOBAL_BUYIN", payload: v })}
        disabled={isLocked}
      />

      {globalBuyIn > 0 && (
        <p className="text-[11px] text-text-muted text-center">
          Cada jugador paga {new Intl.NumberFormat("es-CL").format(globalBuyIn)} CLP al ingresar
        </p>
      )}
    </div>
  );
}
