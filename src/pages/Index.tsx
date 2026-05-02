import { useState } from "react";
import { UserPlus, Spade } from "lucide-react";
import { SessionProvider, useSession } from "@/context/SessionContext";
import DataIntegrityHeader from "@/components/poker/DataIntegrityHeader";
import SessionConfig from "@/components/poker/SessionConfig";
import PlayerCard from "@/components/poker/PlayerCard";
import TableBalanceWidget from "@/components/poker/TableBalanceWidget";
import FooterActions from "@/components/poker/FooterActions";
import AddPlayerModal from "@/components/poker/AddPlayerModal";

function HomeScreen() {
  const { state } = useSession();
  const { players, sessionState } = state;
  const [modal, setModal] = useState(false);
  const isLocked = sessionState !== "OPEN";

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-2xl mx-auto">
      <DataIntegrityHeader />

      <main className="flex-1 overflow-y-auto pt-3">
        <SessionConfig />
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-20 gap-3">
            <Spade size={64} className="text-text-muted" />
            <h2 className="text-xl font-extrabold text-text-primary">Mesa vacía</h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Agrega los jugadores para comenzar a registrar la sesión de poker.
            </p>
            <button
              onClick={() => setModal(true)}
              className="mt-3 flex items-center gap-2 bg-primary text-text-inverse rounded-2xl px-5 py-3 font-extrabold shadow-emerald"
            >
              <UserPlus size={20} />
              Agregar primer jugador
            </button>
          </div>
        ) : (
          <>
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}

            {!isLocked && (
              <button
                onClick={() => setModal(true)}
                className="mx-4 mb-3 w-[calc(100%-2rem)] flex items-center justify-center gap-2 py-3 emerald-glow border emerald-border border-dashed rounded-2xl text-primary font-semibold text-sm hover:opacity-90 transition"
              >
                <UserPlus size={18} />
                Agregar jugador
              </button>
            )}

            <TableBalanceWidget />
          </>
        )}

        <div className="h-4" />
      </main>

      <FooterActions />
      <AddPlayerModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

const Index = () => (
  <SessionProvider>
    <HomeScreen />
  </SessionProvider>
);

export default Index;
