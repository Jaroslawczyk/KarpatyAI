import { describe, expect, it } from 'vitest';
import {
  softmax,
  smoothCounts,
  causalWeights,
  createBpe,
  bpeStep,
  decodeBpe,
  mergePair,
  checkAnswer,
} from '../utils/math.js';
import { examples } from '../content/examples.js';

describe('Probabilities and gradients', () => {
  it('normalizes huge logits stably and is shift invariant', () => {
    const p = softmax([1000, 1001, 999]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 14);
    p.forEach((v, i) => expect(v).toBeCloseTo(softmax([0, 1, -1])[i], 14));
  });
  it('uses all pseudocounts in the denominator', () => {
    expect(smoothCounts([0, 3, 1], 0)).toEqual([0, 0.75, 0.25]);
    expect(smoothCounts([0, 3, 1], 1)).toEqual([1 / 7, 4 / 7, 2 / 7]);
  });
  it('causal rows sum to one and never attend to the future', () => {
    for (let row = 0; row < 4; row++) {
      const weights = causalWeights([0.2, 1, -0.3, 0.7], row);
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 14);
      expect(weights.slice(row + 1).every((w) => w === 0)).toBe(true);
    }
  });
  it('cross-entropy gradient agrees with independent finite differences', () => {
    const logits = [0.3, -0.7, 1.1];
    const gradient = softmax(logits).map((p, i) => p - (i === 1 ? 1 : 0));
    const h = 1e-5;
    logits.forEach((_, i) => {
      const plus = [...logits],
        minus = [...logits];
      plus[i] += h;
      minus[i] -= h;
      const numeric = (-Math.log(softmax(plus)[1]) + Math.log(softmax(minus)[1])) / (2 * h);
      expect(gradient[i]).toBeCloseTo(numeric, 8);
    });
    expect(gradient.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 14);
  });
  for (const correction of [0, 1]) {
    it(`BatchNorm closed form agrees with finite differences, correction=${correction}`, () => {
      const x = [1, 2, 4],
        g = [1, -1, 2],
        gamma = 1.7,
        eps = 1e-5;
      const normalized = (values) => {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - correction);
        const r = 1 / Math.sqrt(variance + eps);
        return { r, xhat: values.map((v) => (v - mean) * r) };
      };
      const { r, xhat } = normalized(x);
      const gmean = g.reduce((a, b) => a + b, 0) / x.length;
      const product = g.reduce((sum, value, i) => sum + value * xhat[i], 0);
      const dx = g.map(
        (value, i) => gamma * r * (value - gmean - (xhat[i] * product) / (x.length - correction)),
      );
      const loss = (values) =>
        normalized(values).xhat.reduce((sum, value, i) => sum + gamma * value * g[i], 0);
      const h = 1e-5;
      x.forEach((_, i) => {
        const plus = [...x],
          minus = [...x];
        plus[i] += h;
        minus[i] -= h;
        expect(dx[i]).toBeCloseTo((loss(plus) - loss(minus)) / (2 * h), 8);
      });
    });
  }
});

describe('Educational byte BPE', () => {
  for (const text of [
    '',
    'a',
    'aaa',
    'banana banana',
    'Привет, 猫 👋',
    '<script>alert(1)</script>',
    'é e\u0301',
  ]) {
    it(`round-trips all bytes: ${JSON.stringify(text)}`, () => {
      let state = createBpe(text);
      expect(decodeBpe(state)).toBe(text);
      for (let step = 0; step < 50; step++) {
        const next = bpeStep(state);
        if (!next) break;
        expect(next.ids.length).toBeLessThan(state.ids.length);
        expect(next.vocab.length).toBe(state.vocab.length + 1);
        state = next;
        expect(decodeBpe(state)).toBe(text);
      }
    });
  }
  it('handles overlapping pairs without consuming a token twice', () => {
    expect(mergePair([97, 97, 97], [97, 97], 256)).toEqual([256, 97]);
  });
  it('selects the first encountered pair on a frequency tie', () => {
    const next = bpeStep(createBpe('banana'));
    expect(next.ids).toEqual([98, 256, 256, 97]);
    expect(next.history[0].pair).toEqual([97, 110]);
  });
});
describe('Knowledge checks', () => {
  for (const [id, example] of Object.entries(examples)) {
    it(`${id}: accepts the intended answer and rejects an empty or wrong one`, () => {
      const answer = Array.isArray(example.quiz.answer)
        ? example.quiz.answer.map(String)
        : String(example.quiz.answer);
      expect(checkAnswer(example.quiz, answer)).toBe(true);
      expect(checkAnswer(example.quiz, '')).toBe(false);
      const wrong = Array.isArray(answer) ? answer.map(() => '99') : '999';
      expect(checkAnswer(example.quiz, wrong)).toBe(false);
    });
  }
  it('accepts a decimal comma and rejects non-finite numeric input', () => {
    expect(checkAnswer(examples.likelihood.quiz, '0,693')).toBe(true);
    expect(checkAnswer(examples.likelihood.quiz, 'Infinity')).toBe(false);
    expect(checkAnswer(examples.likelihood.quiz, '   ')).toBe(false);
  });
});
