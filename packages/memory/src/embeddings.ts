export interface EmbeddingResult {
  vector: number[];
  dimension: number;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function normalize(vec: number[]): number[] {
  const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return mag === 0 ? vec : vec.map((v) => v / mag);
}

export function computeEmbedding(
  text: string,
  dimensions = 128,
): EmbeddingResult {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(dimensions).fill(0);

  for (const word of words) {
    const hash = simpleHash(word);
    for (let i = 0; i < dimensions; i++) {
      vector[i] += Math.sin(hash * (i + 1));
    }
  }

  return { vector: normalize(vector), dimension: dimensions };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
