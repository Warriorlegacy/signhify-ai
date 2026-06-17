import { describe, it, expect } from "vitest";
import { computeEmbedding, cosineSimilarity } from "../embeddings";

describe("Embeddings", () => {
  it("should produce a vector of correct dimension", () => {
    const result = computeEmbedding("hello world", 128);
    expect(result.vector).toHaveLength(128);
    expect(result.dimension).toBe(128);
  });

  it("should produce normalized vectors", () => {
    const result = computeEmbedding("test");
    const mag = Math.sqrt(result.vector.reduce((s, v) => s + v * v, 0));
    expect(mag).toBeCloseTo(1, 5);
  });

  it("similar texts should have higher similarity", () => {
    const a = computeEmbedding("machine learning");
    const b = computeEmbedding("deep learning");
    const c = computeEmbedding("quantum physics");
    const simAB = cosineSimilarity(a.vector, b.vector);
    const simAC = cosineSimilarity(a.vector, c.vector);
    expect(simAB).toBeGreaterThan(simAC);
  });

  it("identical texts should have similarity ~1", () => {
    const a = computeEmbedding("the same text");
    const b = computeEmbedding("the same text");
    expect(cosineSimilarity(a.vector, b.vector)).toBeCloseTo(1, 5);
  });

  it("different dimension vectors return 0", () => {
    expect(cosineSimilarity([1, 0], [1, 0, 0])).toBe(0);
  });
});
