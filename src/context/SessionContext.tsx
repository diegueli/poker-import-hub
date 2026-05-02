import { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from "react";
import { generateId } from "@/lib/id";

const STORAGE_KEY = "@pcua_session";

export type Rebuy = {
  id: string;
  amount: number;
  confirmed: boolean;
  confirmedAt: string | null;
};

export type Player = {
  id: string;
  name: string;
  photo: string | null;
  buyInConfirmed: boolean;
  buyInConfirmedAt: string | null;
  rebuys: Rebuy[];
  finalChips: number;
};

export type SessionStateName = "OPEN" | "LOCKED" | "SETTLED";

export type State = {
  sessionState: SessionStateName;
  sessionDate: string;
  globalBuyIn: number;
  utilidad: number;
  players: Player[];
};

type Action =
  | { type: "LOAD_STATE"; payload: Partial<State> }
  | { type: "RESET_SESSION" }
  | { type: "SET_SESSION_STATE"; payload: SessionStateName }
  | { type: "SET_GLOBAL_BUYIN"; payload: number }
  | { type: "SET_UTILIDAD"; payload: number }
  | { type: "ADD_PLAYER"; payload: { name: string; photo: string | null } }
  | { type: "REMOVE_PLAYER"; payload: string }
  | { type: "UPDATE_PLAYER"; payload: { id: string; field: keyof Player; value: Player[keyof Player] } }
  | { type: "TOGGLE_BUYIN_CONFIRMED"; payload: string }
  | { type: "ADD_REBUY"; payload: string }
  | { type: "REMOVE_REBUY"; payload: { playerId: string; rebuyId: string } }
  | { type: "UPDATE_REBUY"; payload: { playerId: string; rebuyId: string; amount: number } }
  | { type: "TOGGLE_REBUY_CONFIRMED"; payload: { playerId: string; rebuyId: string } };

function makePlayer(name = "", photo: string | null = null): Player {
  return {
    id: generateId(),
    name,
    photo,
    buyInConfirmed: false,
    buyInConfirmedAt: null,
    rebuys: [],
    finalChips: 0,
  };
}

function makeRebuy(): Rebuy {
  return { id: generateId(), amount: 0, confirmed: false, confirmedAt: null };
}

const initialState: State = {
  sessionState: "OPEN",
  sessionDate: new Date().toISOString(),
  globalBuyIn: 0,
  utilidad: 0,
  players: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...initialState, ...action.payload };
    case "RESET_SESSION":
      return { ...initialState, sessionDate: new Date().toISOString() };
    case "SET_SESSION_STATE":
      return { ...state, sessionState: action.payload };
    case "SET_GLOBAL_BUYIN":
      return { ...state, globalBuyIn: action.payload };
    case "SET_UTILIDAD":
      return { ...state, utilidad: action.payload };
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, makePlayer(action.payload.name, action.payload.photo)] };
    case "REMOVE_PLAYER":
      return { ...state, players: state.players.filter((p) => p.id !== action.payload) };
    case "UPDATE_PLAYER": {
      const { id, field, value } = action.payload;
      return {
        ...state,
        players: state.players.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      };
    }
    case "TOGGLE_BUYIN_CONFIRMED": {
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== action.payload) return p;
          const was = p.buyInConfirmed;
          return { ...p, buyInConfirmed: !was, buyInConfirmedAt: was ? null : now };
        }),
      };
    }
    case "ADD_REBUY":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.payload ? { ...p, rebuys: [...p.rebuys, makeRebuy()] } : p
        ),
      };
    case "REMOVE_REBUY": {
      const { playerId, rebuyId } = action.payload;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id !== playerId ? p : { ...p, rebuys: p.rebuys.filter((r) => r.id !== rebuyId) }
        ),
      };
    }
    case "UPDATE_REBUY": {
      const { playerId, rebuyId, amount } = action.payload;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id !== playerId
            ? p
            : { ...p, rebuys: p.rebuys.map((r) => (r.id === rebuyId ? { ...r, amount } : r)) }
        ),
      };
    }
    case "TOGGLE_REBUY_CONFIRMED": {
      const { playerId, rebuyId } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            rebuys: p.rebuys.map((r) => {
              if (r.id !== rebuyId) return r;
              const was = r.confirmed;
              return { ...r, confirmed: !was, confirmedAt: was ? null : now };
            }),
          };
        }),
      };
    }
    default:
      return state;
  }
}

export function computeSessionStats(state: State) {
  const { players, globalBuyIn = 0, utilidad = 0 } = state;

  let confirmedPot = 0;
  let unconfirmedDebt = 0;
  let totalFinalChips = 0;

  players.forEach((p) => {
    if (globalBuyIn > 0) {
      if (p.buyInConfirmed) confirmedPot += globalBuyIn;
      else unconfirmedDebt += globalBuyIn;
    }
    p.rebuys.forEach((r) => {
      if (r.confirmed) confirmedPot += r.amount;
      else if (r.amount > 0) unconfirmedDebt += r.amount;
    });
    totalFinalChips += p.finalChips;
  });

  const totalRebuys = players.reduce(
    (sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0),
    0
  );
  const totalInvested = globalBuyIn * players.length + totalRebuys;
  const discrepancy = totalInvested - totalFinalChips;
  const isBalanced = players.length > 0 && discrepancy === 0;
  const depositoCaja = Math.max(0, totalInvested - utilidad);

  return {
    confirmedPot,
    unconfirmedDebt,
    totalInvested,
    totalFinalChips,
    discrepancy,
    isBalanced,
    depositoCaja,
  };
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  resetSession: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "LOAD_STATE", payload: JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  const resetSession = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    dispatch({ type: "RESET_SESSION" });
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
