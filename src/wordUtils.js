import sowpods from "pf-sowpods";
/**
 *
 * @param {string} word
 * @returns {string} uppercase word without spaces or symbols
 */
export function sanitizeWord(word) {
  return word.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

/**
 *
 * @param {string} word
 * @returns {boolean} isWord
 */
export function validateWord(word) {
  return sowpods.verify(sanitizeWord(word));
}

export function scoreWord(target, guess) {
  const max = Math.max(target.length, guess.length);
  const EXACT = "POSITION";
  const PARTIAL = "COLOR";
  const NO_MATCH = "NO_MATCH";
  let remainingA = new Map();
  let colors = new Array(guess.length);
  let t = Array.from(target);
  let g = Array.from(guess);
  for (let i = 0; i < max; i++) {
    if (t[i] === g[i]) {
      t[i] = "";
      g[i] = "";
      colors[i] = EXACT;
    } else {
      target[i] &&
        remainingA.set(target[i], (remainingA.get(target[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < g.length; i++) {
    const char = g[i];
    const numInTarget = remainingA.get(char);
    if (char) {
      if (numInTarget && numInTarget > 0) {
        colors[i] = PARTIAL;
        remainingA.set(char, numInTarget - 1);
      } else {
        colors[i] = NO_MATCH;
      }
    }
  }
  return colors;
}
