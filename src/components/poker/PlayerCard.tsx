import { useState, useRef, ChangeEvent } from "react";
import {
  Camera, Trash2, X, Plus, TrendingUp, TrendingDown,
  Coins, DollarSign, Check, LogOut, Undo2,
} from "lucide-react";
import { useSession, Player } from "@/context/SessionContext";
import { formatCLP, formatCLPSigned } from "@/lib/currency";

// ── SectionDivider ───────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[8px] font-bold tracking-[0.2em] text-text-muted uppercase">{label}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
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
          src={photo} alt={name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/30 flex items-center justify-center">
          <span className="text-base font-extrabold text-primary">{initials}</span>
        </div>
      )}
      {!disabled && (
        <span className="absolute bottom-0 right-0 bg-primary rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
          <Camera size={8} className="text-text-inverse" />
        </span>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}

// ── ConfirmChip ──────────────────────────────────────────────────────────────
function ConfirmChip({ confirmed, confirmedAt, onToggle, disabled }: {
  confirmed: boolean;
  confirmedAt: string | null;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const time = confirmedAt
    ? new Date(confirmedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg px-2 py-1.5 border w-[72px] shrink-0 justify-center text-[9px] font-bold whitespace-nowrap transition-all ${
        confirmed
          ? "teal-glow teal-border text-teal-light"
          : "crimson-glow crimson-border text-crimson-light"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {confirmed ? <Check size={13} /> : <DollarSign size={11} />}
      {time && <span>{time}</span>}
    </button>
  );
}

// ── AmountRow ────────────────────────────────────────────────────────────────
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
    <div className={`flex items-center gap-2 mx-2 my-0.5 px-2 py-1.5 rounded-xl ${glowing ? "crimson-glow border crimson-border" : ""}`}>
      <span className="text-xs text-text-secondary font-semibold w-14 shrink-0 whitespace-nowrap">{label}</span>
      <div className="flex-1 flex items-center glass-medium border border-white/[0.08] rounded-lg px-2">
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
          className="flex-1 bg-transparent text-sm text-text-primary font-semibold py-1.5 outline-none placeholder:text-text-muted disabled:text-text-secondary min-w-0"
        />
        <span className="text-[10px] text-text-muted ml-1">CLP</span>
      </div>
      <ConfirmChip confirmed={confirmed} confirmedAt={confirmedAt} onToggle={onToggleConfirm} disabled={disabled} />
      <button
        onClick={onRemove ?? undefined}
        disabled={!onRemove}
        className={`p-1 shrink-0 rounded-md transition-colors ${onRemove ? "text-text-muted hover:text-crimson-light hover:bg-crimson-light/10" : "invisible"}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── EarlyExitModal ───────────────────────────────────────────────────────────
function EarlyExitModal({ player, globalBuyIn, onConfirm, onCancel }: {
  player: Player;
  globalBuyIn: number;
  onConfirm: (finalChips: number) => void;
  onCancel: () => void;
}) {
  const [chips, setChips] = useState("");
  const [focused, setFocused] = useState(false);
  const parsed = parseInt(chips) || 0;
  const compras = globalBuyIn + player.rebuys.reduce((s, r) => s + r.amount, 0);
  const pnl = parsed - compras;
  const displayValue = focused
    ? chips
    : (parsed > 0 ? new Intl.NumberFormat("es-CL").format(parsed) : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-[0_12px_50px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full warning-glow border border-warning/40 flex items-center justify-center">
            <LogOut size={22} className="text-warning" />
          </div>
          <h3 className="text-lg font-extrabold text-text-primary">Salida anticipada</h3>
          <p className="text-sm text-text-secondary text-center leading-relaxed">
            <strong className="text-text-primary">{player.name || "Este jugador"}</strong> se retira.
            Ingresa sus fichas al salir.
          </p>
        </div>

        <div>
          <div className="text-[10px] text-text-secondary font-bold tracking-wider mb-1.5">FICHAS AL RETIRARSE</div>
          <div className="flex items-center glass-medium border border-white/10 rounded-xl px-3 py-2.5">
            <span className="text-lg text-text-secondary font-bold mr-1">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={(e) => setChips(e.target.value.replace(/[^0-9]/g, ""))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="0"
              autoFocus
              maxLength={9}
              className="flex-1 bg-transparent text-xl text-text-primary font-bold outline-none placeholder:text-text-muted"
            />
            <span className="text-xs text-text-muted">CLP</span>
          </div>
        </div>

        {parsed > 0 && compras > 0 && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            pnl >= 0 ? "teal-glow teal-border" : "crimson-glow crimson-border"
          }`}>
            {pnl >= 0
              ? <TrendingUp size={16} className="text-teal-light" />
              : <TrendingDown size={16} className="text-crimson-light" />}
            <span className={`text-sm font-bold ${pnl >= 0 ? "text-teal-light" : "text-crimson-light"}`}>
              Resultado: {formatCLPSigned(pnl)} CLP
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-text-secondary font-bold text-sm hover:glass-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(parsed)}
            disabled={parsed === 0}
            className={`flex-1 py-3 rounded-2xl font-extrabold text-sm transition ${
              parsed > 0
                ? "warning-glow border border-warning/50 text-warning"
                : "glass border border-white/10 text-text-muted cursor-not-allowed"
            }`}
          >
            Confirmar salida
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PlayerCard ───────────────────────────────────────────────────────────────
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
  const [exitModal, setExitModal] = useState(false);

  const exitedEarly = player.exitedEarly ?? false;
  const exitTime = player.exitedAt
    ? new Date(player.exitedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  const handleRemove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    dispatch({ type: "REMOVE_PLAYER", payload: player.id });
  };

  const handleConfirmExit = (finalChips: number) => {
    dispatch({ type: "SET_EARLY_EXIT", payload: { id: player.id, finalChips } });
    setExitModal(false);
  };

  // ── Payment rows (shared) ─────────────────────────────────────────────────
  const paymentRows = (
    <>
      {/* Buy-in */}
      <div className={`flex items-center gap-2 mx-2 my-0.5 px-2 py-1.5 rounded-xl ${
        hasBuyIn && !player.buyInConfirmed ? "crimson-glow border crimson-border" : ""
      }`}>
        <span className="text-xs text-text-secondary font-semibold w-14 shrink-0 whitespace-nowrap">Buy-in</span>
        <div className="flex-1 flex items-center glass-medium border border-white/[0.08] rounded-lg px-2">
          <span className="text-sm text-text-secondary font-bold mr-0.5">$</span>
          <span className="flex-1 text-sm text-text-primary font-semibold tabular-nums py-1.5">
            {hasBuyIn ? new Intl.NumberFormat("es-CL").format(globalBuyIn) : "—"}
          </span>
          <span className="text-[10px] text-text-muted ml-1">CLP</span>
        </div>
        <ConfirmChip
          confirmed={player.buyInConfirmed}
          confirmedAt={player.buyInConfirmedAt}
          onToggle={() => dispatch({ type: "TOGGLE_BUYIN_CONFIRMED", payload: player.id })}
          disabled={!hasBuyIn || isLocked || player.buyInConfirmed}
        />
        <div className="w-[22px] shrink-0" />
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
          onRemove={(!isLocked && !exitedEarly)
            ? () => dispatch({ type: "REMOVE_REBUY", payload: { playerId: player.id, rebuyId: r.id } })
            : null}
          disabled={isLocked || exitedEarly}
        />
      ))}
    </>
  );

  // ── EARLY EXIT card ──────────────────────────────────────────────────────
  if (exitedEarly) {
    return (
      <div className={`rounded-2xl mx-4 mb-3 overflow-hidden border ${
        hasUnconfirmed ? "crimson-border shadow-crimson-card" : "border-white/[0.09]"
      }`}>
        <div className="h-[3px] bg-warning/50" />

        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-warning/[0.08] to-transparent">
          <Avatar name={player.name} photo={player.photo} disabled onPhotoChange={() => {}} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-text-primary truncate">{player.name || "Jugador"}</p>
            {totalInvested > 0 && (
              <p className="text-[10px] text-text-secondary mt-0.5">Compras: {formatCLP(totalInvested)} CLP</p>
            )}
          </div>
          <div className="flex items-center gap-1 border border-warning/40 rounded-full px-2 py-1 warning-glow shrink-0">
            <LogOut size={9} className="text-warning" />
            <span className="text-[9px] font-bold text-warning">SALIÓ{exitTime ? ` ${exitTime}` : ""}</span>
          </div>
          {hasFinalChips && (
            <div className={`rounded-lg px-2 py-1 border shrink-0 ${
              pnl >= 0 ? "teal-glow teal-border" : "crimson-glow crimson-border"
            }`}>
              <span className={`text-xs font-extrabold ${pnl >= 0 ? "text-teal-light" : "text-crimson-light"}`}>
                {formatCLPSigned(pnl)}
              </span>
            </div>
          )}
          <button
            onClick={handleRemove}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${
              confirmDelete ? "text-crimson-light bg-crimson-light/10" : "text-text-muted hover:text-crimson-light"
            }`}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <SectionDivider label="Pagos" />
        {paymentRows}

        <SectionDivider label="Fichas Finales" />
        <div className="px-4 pb-3">
          <div className="flex items-center glass-strong border border-white/[0.08] rounded-xl px-3">
            <Coins size={15} className="text-warning mr-2 shrink-0" />
            <span className="flex-1 text-base text-text-primary font-bold tabular-nums py-2.5">
              {hasFinalChips ? new Intl.NumberFormat("es-CL").format(player.finalChips) : "0"}
            </span>
            <span className="text-[10px] text-text-muted">CLP</span>
          </div>

          {hasFinalChips && totalInvested > 0 && (
            <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border ${
              pnl >= 0 ? "teal-glow teal-border" : "crimson-glow crimson-border"
            }`}>
              {pnl >= 0
                ? <TrendingUp size={14} className="text-teal-light" />
                : <TrendingDown size={14} className="text-crimson-light" />}
              <span className={`text-xs font-bold ${pnl >= 0 ? "text-teal-light" : "text-crimson-light"}`}>
                Resultado: {formatCLPSigned(pnl)} CLP
              </span>
            </div>
          )}
        </div>

        {!isLocked && (
          <button
            onClick={() => dispatch({ type: "UNDO_EARLY_EXIT", payload: player.id })}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-text-muted font-semibold hover:text-text-secondary transition border-t border-white/[0.06]"
          >
            <Undo2 size={12} /> Deshacer salida
          </button>
        )}
      </div>
    );
  }

  // ── NORMAL card ──────────────────────────────────────────────────────────
  return (
    <>
      <div className={`rounded-2xl mx-4 mb-3 overflow-hidden border ${
        hasUnconfirmed ? "crimson-border shadow-crimson-card" : "border-white/[0.09]"
      }`}>
        {/* Accent stripe */}
        <div className={`h-[3px] ${hasUnconfirmed ? "bg-crimson-light/60" : "bg-primary/50"}`} />

        {/* Card header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/[0.07] to-transparent">
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
              className="w-full bg-transparent text-[15px] font-bold text-text-primary outline-none placeholder:text-text-muted disabled:cursor-default"
            />
            {totalInvested > 0 && (
              <p className="text-[10px] text-text-secondary mt-0.5">
                Compras: {formatCLP(totalInvested)} CLP
              </p>
            )}
          </div>
          {hasFinalChips && (
            <div className={`rounded-lg px-2 py-1 border shrink-0 ${
              pnl >= 0 ? "teal-glow teal-border" : "crimson-glow crimson-border"
            }`}>
              <span className={`text-xs font-extrabold ${pnl >= 0 ? "text-teal-light" : "text-crimson-light"}`}>
                {formatCLPSigned(pnl)}
              </span>
            </div>
          )}
          <button
            onClick={handleRemove}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${
              confirmDelete
                ? "text-crimson-light bg-crimson-light/10"
                : "text-text-muted hover:text-crimson-light hover:bg-crimson-light/10"
            }`}
            title={confirmDelete ? "Toca de nuevo para confirmar" : "Eliminar jugador"}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Payments */}
        <SectionDivider label="Pagos" />
        {paymentRows}

        {/* Actions */}
        {!isLocked && (
          <div className="flex items-center px-2 py-1.5 gap-1 border-t border-white/[0.05] mt-0.5">
            <button
              onClick={() => dispatch({ type: "ADD_REBUY", payload: player.id })}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs text-primary font-semibold hover:bg-primary/10 rounded-xl transition"
            >
              <Plus size={13} /> Agregar Rebuy
            </button>
            <div className="w-px h-4 bg-white/[0.08]" />
            <button
              onClick={() => setExitModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs text-warning font-semibold hover:bg-warning/10 rounded-xl transition"
            >
              <LogOut size={13} /> Salida anticipada
            </button>
          </div>
        )}

        {/* Final chips */}
        <SectionDivider label="Fichas Finales" />
        <div className="px-4 pb-3">
          <div className="flex items-center glass-strong border border-white/[0.08] rounded-xl px-3">
            <Coins size={15} className="text-warning mr-2 shrink-0" />
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
              className="flex-1 bg-transparent text-base text-text-primary font-bold py-2.5 outline-none placeholder:text-text-muted min-w-0"
            />
            <span className="text-[10px] text-text-muted ml-1">CLP</span>
          </div>

          {hasFinalChips && totalInvested > 0 && (
            <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border ${
              pnl >= 0 ? "teal-glow teal-border" : "crimson-glow crimson-border"
            }`}>
              {pnl >= 0
                ? <TrendingUp size={14} className="text-teal-light" />
                : <TrendingDown size={14} className="text-crimson-light" />}
              <span className={`text-xs font-bold ${pnl >= 0 ? "text-teal-light" : "text-crimson-light"}`}>
                Resultado: {formatCLPSigned(pnl)} CLP
              </span>
            </div>
          )}
        </div>
      </div>

      {exitModal && (
        <EarlyExitModal
          player={player}
          globalBuyIn={globalBuyIn}
          onConfirm={handleConfirmExit}
          onCancel={() => setExitModal(false)}
        />
      )}
    </>
  );
}
