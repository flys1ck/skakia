/**
 * Returns a random number generator that yields the same numbers in [0, 1) for the same text, so anything drawn from it
 * looks the same on every launch without being stored. Uses mulberry32 seeded with a 31-based string hash.
 */
export function createSeededRandom(text: string): () => number {
  let state = 7;
  for (let i = 0; i < text.length; i++) state = (Math.imul(state, 31) + text.charCodeAt(i)) | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
