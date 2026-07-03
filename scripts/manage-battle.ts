/**
 * Show-night battle control for the homepage BattleVote widget.
 *
 * Usage:
 *   npx tsx scripts/manage-battle.ts create "English vs Spanish" "Team English" "Team Spanish"
 *   npx tsx scripts/manage-battle.ts close            # closes the live battle, tallies winner
 *   npx tsx scripts/manage-battle.ts status           # shows live battle + vote counts
 *
 * Only one battle is live at a time - `create` closes any existing live battle first.
 */
import { adminDb } from "./lib/admin-init";

const db = adminDb();

async function closeLive(report = true) {
  const snap = await db.collection("battles").where("status", "==", "live").get();
  for (const d of snap.docs) {
    const votes = await d.ref.collection("votes").get();
    let a = 0;
    let b = 0;
    votes.forEach((v) => {
      if (v.data().choice === "a") a += 1;
      else if (v.data().choice === "b") b += 1;
    });
    const winner = a === b ? null : a > b ? "a" : "b";
    await d.ref.set(
      { status: "closed", winner, finalVotesA: a, finalVotesB: b, closedAt: new Date() },
      { merge: true }
    );
    if (report) {
      const data = d.data();
      const winnerName = winner === "a" ? data.sideA : winner === "b" ? data.sideB : "TIE";
      console.log(`Closed "${data.title}": ${data.sideA} ${a} - ${b} ${data.sideB} -> ${winnerName}`);
    }
  }
  if (snap.empty && report) console.log("No live battle to close.");
}

async function main() {
  const [cmd, title, sideA, sideB] = process.argv.slice(2);

  if (cmd === "create") {
    if (!title || !sideA || !sideB) {
      console.error('Usage: manage-battle.ts create "<title>" "<side A>" "<side B>"');
      process.exit(1);
    }
    await closeLive(false);
    const ref = await db.collection("battles").add({
      title,
      sideA,
      sideB,
      status: "live",
      winner: null,
      createdAt: new Date(),
    });
    console.log(`LIVE: "${title}" (${sideA} vs ${sideB}) id=${ref.id}`);
    return;
  }

  if (cmd === "close") {
    await closeLive();
    return;
  }

  if (cmd === "status") {
    const snap = await db.collection("battles").where("status", "==", "live").get();
    if (snap.empty) {
      console.log("No live battle.");
      return;
    }
    for (const d of snap.docs) {
      const votes = await d.ref.collection("votes").get();
      let a = 0;
      let b = 0;
      votes.forEach((v) => {
        if (v.data().choice === "a") a += 1;
        else if (v.data().choice === "b") b += 1;
      });
      const data = d.data();
      console.log(`LIVE "${data.title}": ${data.sideA} ${a} - ${b} ${data.sideB} (${a + b} votes)`);
    }
    return;
  }

  console.error("Usage: manage-battle.ts <create|close|status> ...");
  process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
