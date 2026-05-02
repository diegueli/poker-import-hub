import { Player } from "@/context/SessionContext";
import { formatCLP, formatCLPSigned } from "@/lib/currency";

export function generateSummaryMessage(
  players: Player[],
  sessionDate: string,
  globalBuyIn: number
): string {
  const date = sessionDate
    ? new Date(sessionDate).toLocaleDateString("es-CL")
    : new Date().toLocaleDateString("es-CL");

  const totalRebuys = players.reduce(
    (sum, p) => sum + p.rebuys.reduce((s, r) => s + r.amount, 0),
    0
  );
  const totalPot = globalBuyIn * players.length + totalRebuys;

  let msg = `🎰 *Resumen de Sesión — Poker Night* 🎰\n\n`;
  msg += `📅 Fecha: ${date}\n`;
  msg += `💰 Pot Total: ${formatCLP(totalPot)} CLP\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const sorted = [...players].sort((a, b) => {
    const pnlA = a.finalChips - (globalBuyIn + a.rebuys.reduce((s, r) => s + r.amount, 0));
    const pnlB = b.finalChips - (globalBuyIn + b.rebuys.reduce((s, r) => s + r.amount, 0));
    return pnlB - pnlA;
  });

  const winners = sorted.filter((p) => {
    const invested = globalBuyIn + p.rebuys.reduce((s, r) => s + r.amount, 0);
    return p.finalChips - invested > 0;
  });

  sorted.forEach((player) => {
    const rebuysTotal = player.rebuys.reduce((s, r) => s + r.amount, 0);
    const invested = globalBuyIn + rebuysTotal;
    const pnl = player.finalChips - invested;
    const isWinner = pnl >= 0;

    msg += `👤 *${player.name}*\n`;
    msg += `  📥 Invirtió: ${formatCLP(invested)} CLP\n`;
    if (player.rebuys.length > 0) {
      msg += `     _(Buy-in: ${formatCLP(globalBuyIn)} + Rebuys: ${formatCLP(rebuysTotal)})_\n`;
    }
    msg += `  📤 Retira: ${formatCLP(player.finalChips)} CLP\n`;
    msg += `  ${isWinner ? "✅" : "❌"} *Resultado: ${formatCLPSigned(pnl)} CLP*\n`;

    if (!isWinner && winners.length > 0) {
      msg += `  💸 _Paga a ${winners[0].name}_\n`;
    }
    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔄 *Mesa Cuadrada Correctamente* ✔️\n`;
  msg += `_Generado por Poker Admin App_`;

  return msg;
}

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
}
