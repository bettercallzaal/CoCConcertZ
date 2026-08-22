export interface VoteDoc {
  data(): { choice?: string };
}

export interface VoteSnap {
  forEach(fn: (doc: VoteDoc) => void): void;
}

export function tally(votesSnap: VoteSnap): { a: number; b: number } {
  let a = 0;
  let b = 0;
  votesSnap.forEach((v) => {
    const choice = v.data().choice;
    if (choice === "a") a += 1;
    else if (choice === "b") b += 1;
  });
  return { a, b };
}
