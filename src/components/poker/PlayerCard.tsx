import { useState, useRef, ChangeEvent } from "react";
import { Camera, Trash2, X, Plus, TrendingUp, TrendingDown, Coins, DollarSign, Check } from "lucide-react";
import { useSession, Player } from "@/context/SessionContext";
import { formatCLP, formatCLPSigned } from "@/lib/currency";

function Avatar({ name, photo, onPhotoChange, disabled }: {
  name: string;
  photo: string | null;
  onPhotoChange: (dataUrl: string) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && fileRef.current?.click()}
      className="relative shrink-0"
      disabled={disabled}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-11 h-11 rounded-full object-cover border-2 border-primary"
        />
      ) : (
        <div className="w-11 h-11 rounded-full glass-medium border-2 border-border flex items-center justify-center">
          <span className="text-base font-extrabold text-primary tracking-wider">{initials}</span>
        </div>
      )}
      <span className="absolute bottom-0 right-0 bg-primary rounded-full w-3.5 h-3.5 flex items-center justify-center">
        <Camera size={8} className="text-text-inverse" />
      </span>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}

function ConfirmCheckbox({ confirmed, confirmedAt, onToggle, disabled }: {
  confirmed: boolean;
  confirmedAt: string | null;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const time = confirmedAt
    ? new Date(confirmedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
    : null;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-md px-2 py-1.5 border min-w-[32px] justify-center text-[9px] font-bold ${
        confirmed
          ? "bg-primary border-primary text-text-inverse"
          : "crimson-glow crimson-border text-crimson-light"
      }`}
    >
      {confirmed ? <Check size={14} /> : <DollarSign size={12} />}
      {time && <span>{time}</span>}
    </button>
  );
}

function AmountRow({
  label, value, confirmed, confirmedAt,
  onChangeAmount, onToggleConfirm, onRemove, disabled,
}: {
  label: string;
  value: number;
  confirmed: boolean;
  confirmedAt: string | null;
  onChangeAmount: (v: number) => void;
  onToggleConfirm: () => void;
  onRemove?: (() => void) | null;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value > 0;
  const glowing = hasValue && !confirmed;
  const displayValue = focused
    ? (value > 0 ? value.toString() : "")
    : (value > 0 ? new Intl.NumberFormat("es-CL").format(value) : "");

  return (
    <div
      className={`flex items-center gap-2 mx-1 my-0.5 px-3 py-2 rounded-md ${
        glowing ? "crimson-glow border crimson-border" : ""
      }`}
    >
      <span className="text-xs text-text-secondary font-semibold w-14">{label}</span>
      <div className="flex-1 flex items-center glass-medium border border-border rounded-md px-2">
        <span className="text-sm text-text-secondary font-bold mr-0.5">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => onChangeAmount(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          disabled={disabled}
          maxLength={9}
          className="flex-1 bg-transparent text-base text-text-primary font-semibold py-1 outline-none placeholder:text-text-muted disabled:text-text-secondary min-w-0"
        />
        <span className="text-[10px] text-text-muted ml-1">CLP</span>
      </div>
      <ConfirmCheckbox
        confirmed={confirmed}
        confirmedAt={confirmedAt}
        onToggle={onToggleConfirm}
        disabled={disabled}
      />
      {onRemove && (
        <button onClick={onRemove} className="p-1 text-text-muted hover:text-text-primary">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function PlayerCard({ player }: { player: Player }) {
  const { dispatch, state } = useSession();
  const isLocked = state.sessionState !== "OPEN";
  const globalBuyIn = state.globalBuyIn;

  const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
  const totalInvested = globalBuyIn + rebuysTotal;
  const pnl = player.finalChips - totalInvested;
  const hasFinalChips = player.finalChips > 0;
  const hasBuyIn = globalBuyIn > 0;
  const hasUnconfirmed =
    (hasBuyIn && !player.buyInConfirmed) ||
    player.rebuys.some((r) => r.amount > 0 && !r.confirmed);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [chipsFocused, setChipsFocused] = useState(false);

  const handleRemove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    dispatch({ type: "REMOVE_PLAYER", payload: player.id });
  };

  return (
    <div
      className={`glass border rounded-2xl mx-4 mb-3 overflow-hidden ${
        hasUnconfirmed ? "crimson-border shadow-crimson-card" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <Avatar
          name={player.name}
          photo={player.photo}
          disabled={isLocked}
          onPhotoChange={(dataUrl) =>
            dispatch({ type: "UPDATE_PLAYER", payload: { id: player.id, field: "photo", value: dataUrl } })
          }
        />
        <div className="flex-1 min-w-0">
          <input
            value={player.name}
            disabled={isLocked}
            onChange={(e) =>
              dispatch({ type: "UPDATE_PLAYER", payload: { id: player.id, field: "name", value: e.target.value } })
            }
            placeholder="Nombre del jugador"
            className="w-full bg-transparent text-base font-bold text-text-primary outline-none placeholder:text-text-muted"
          />
          {totalInvested > 0 && (
            <p className="text-[10px] text-text-secondary mt-0.5">
              Compras: {formatCLP(totalInvested)} CLP
            </p>
          )}
        </div>
        {hasFinalChips && (
          <div
            className={`rounded-md px-2 py-0.5 border ${
              pnl >= 0 ? "emerald-glow emerald-border" : "crimson-glow crimson-border"
            }`}
          >
            <span
              className={`text-xs font-extrabold ${
                pnl >= 0 ? "text-primary" : "text-crimson-light"
              }`}
            >
              {formatCLPSigned(pnl)}
            </span>
          </div>
        )}
        <button
          onClick={handleRemove}
          className={`p-1 ${confirmDelete ? "text-crimson-light" : "text-text-muted"} hover:text-crimson-light`}
          title={confirmDelete ? "Confirmar" : "Eliminar"}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="h-px bg-border mx-3" />

      {/* Buy-in (read-only, global) */}
      <div
        className={`flex items-center gap-2 mx-1 my-0.5 px-3 py-2 rounded-md ${
          hasBuyIn && !player.buyInConfirmed ? "crimson-glow border crimson-border" : ""
        }`}
      >
        <span className="text-xs text-text-secondary font-semibold w-14">Buy-in</span>
        <div className="flex-1 flex items-center glass-medium border border-border rounded-md px-2 py-1">
          <span className="text-sm text-text-secondary font-bold mr-0.5">$</span>
          <span className="flex-1 text-base text-text-primary font-bold tabular-nums">
            {hasBuyIn ? new Intl.NumberFormat("es-CL").format(globalBuyIn) : "—"}
          </span>
          <span className="text-[10px] text-text-muted">CLP</span>
        </div>
        <ConfirmCheckbox
          confirmed={player.buyInConfirmed}
          confirmedAt={player.buyInConfirmedAt}
          onToggle={() => dispatch({ type: "TOGGLE_BUYIN_CONFIRMED", payload: player.id })}
          disabled={!hasBuyIn || isLocked}
        />
        {!isLocked && <div className="w-[22px]" />}
      </div>

      {/* Rebuys */}
      {player.rebuys.map((r, idx) => (
        <AmountRow
          key={r.id}
          label={`Rebuy ${idx + 1}`}
          value={r.amount}
          confirmed={r.confirmed}
          confirmedAt={r.confirmedAt}
          onChangeAmount={(v) =>
            dispatch({ type: "UPDATE_REBUY", payload: { playerId: player.id, rebuyId: r.id, amount: v } })
          }
          onToggleConfirm={() =>
            dispatch({ type: "TOGGLE_REBUY_CONFIRMED", payload: { playerId: player.id, rebuyId: r.id } })
          }
          onRemove={
            !isLocked
              ? () => dispatch({ type: "REMOVE_REBUY", payload: { playerId: player.id, rebuyId: r.id } })
              : null
          }
          disabled={isLocked}
        />
      ))}

      {!isLocked && (
        <button
          onClick={() => dispatch({ type: "ADD_REBUY", payload: player.id })}
          className="flex items-center gap-1 px-4 py-2 text-xs text-primary font-semibold hover:opacity-80"
        >
          <Plus size={15} /> Agregar Rebuy
        </button>
      )}

      <div className="h-px bg-border mx-3" />

      {/* Final chips */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Coins size={18} className="text-warning" />
        <span className="text-xs font-bold text-warning w-24">Fichas Finales</span>
        <div className="flex-1 flex items-center glass-strong border border-border rounded-md px-2">
          <span className="text-sm text-text-secondary font-bold mr-0.5">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={
              chipsFocused
                ? (player.finalChips > 0 ? player.finalChips.toString() : "")
                : (player.finalChips > 0 ? new Intl.NumberFormat("es-CL").format(player.finalChips) : "")
            }
            onChange={(e) =>
              dispatch({
                type: "UPDATE_PLAYER",
                payload: {
                  id: player.id,
                  field: "finalChips",
                  value: parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0,
                },
              })
            }
            onFocus={() => setChipsFocused(true)}
            onBlur={() => setChipsFocused(false)}
            placeholder="0"
            maxLength={9}
            className="flex-1 bg-transparent text-base text-text-primary font-semibold py-1 outline-none placeholder:text-text-muted min-w-0"
          />
          <span className="text-[10px] text-text-muted ml-1">CLP</span>
        </div>
      </div>

      {/* Net result */}
      {hasFinalChips && totalInvested > 0 && (
        <div
          className={`flex items-center gap-2 mx-3 mb-3 px-3 py-2 rounded-md border ${
            pnl >= 0 ? "emerald-glow emerald-border" : "crimson-glow crimson-border"
          }`}
        >
          {pnl >= 0 ? (
            <TrendingUp size={16} className="text-primary" />
          ) : (
            <TrendingDown size={16} className="text-crimson-light" />
          )}
          <span
            className={`text-sm font-bold ${pnl >= 0 ? "text-primary" : "text-crimson-light"}`}
          >
            Resultado Neto: {formatCLPSigned(pnl)} CLP
          </span>
        </div>
      )}
    </div>
  );
}
