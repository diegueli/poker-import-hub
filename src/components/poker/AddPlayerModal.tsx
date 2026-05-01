import { useState, useEffect, useRef } from "react";
import { UserPlus, X } from "lucide-react";
import { useSession } from "@/context/SessionContext";

export default function AddPlayerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dispatch } = useSession();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setName("");
  }, [open]);

  if (!open) return null;

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({ type: "ADD_PLAYER", payload: { name: name.trim(), photo: null } });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/75"
      />
      <div className="relative w-full max-w-md bg-surface border-t border-border rounded-t-3xl p-6 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
        <div className="self-center w-10 h-1 rounded-full bg-border mb-2" />

        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={22} className="text-primary" />
          <h2 className="flex-1 text-lg font-extrabold text-text-primary">
            Agregar Jugador
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={22} />
          </button>
        </div>

        <label className="text-xs font-semibold text-text-secondary tracking-wider">
          Nombre del jugador
        </label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Ej: Alex, Juan, María..."
          maxLength={30}
          className="glass border border-border rounded-md px-4 py-3 text-base text-text-primary font-semibold outline-none focus:border-primary placeholder:text-text-muted"
        />

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 font-extrabold transition ${
            name.trim()
              ? "bg-primary text-text-inverse hover:opacity-90"
              : "glass border border-border text-text-muted cursor-not-allowed"
          }`}
        >
          <UserPlus size={18} />
          Agregar a la mesa
        </button>

        <p className="text-[10px] text-text-muted text-center pb-2">
          💡 Podrás agregar la foto del jugador tocando el avatar en la tarjeta.
        </p>
      </div>
    </div>
  );
}
