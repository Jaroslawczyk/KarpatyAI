export function softmax(values) {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((value) => value / sum);
}
export function smoothCounts(counts, alpha) {
  const total = counts.reduce((a, b) => a + b, 0) + alpha * counts.length;
  return counts.map((count) => (count + alpha) / total);
}
export function causalWeights(scores, row) {
  return [...softmax(scores.slice(0, row + 1)), ...Array(scores.length - row - 1).fill(0)];
}
export function checkAnswer(quiz, answer) {
  if (quiz.type === 'number') {
    if (typeof answer !== 'string' || answer.trim() === '') return false;
    const normalized = answer.trim().replace(',', '.');
    const value = Number(normalized);
    return Number.isFinite(value) && Math.abs(value - quiz.answer) <= quiz.tolerance;
  }
  if (Array.isArray(quiz.answer))
    return (
      Array.isArray(answer) &&
      answer.length === quiz.answer.length &&
      answer.every((value, i) => Number(value) === quiz.answer[i] && value !== '')
    );
  return answer !== '' && answer !== null && Number(answer) === quiz.answer;
}

export function createBpe(text) {
  const ids = [...new TextEncoder().encode(text)];
  return { ids, vocab: Array.from({ length: 256 }, (_, i) => [i]), history: [] };
}
export function mergePair(ids, pair, newId) {
  const result = [];
  for (let i = 0; i < ids.length;) {
    if (ids[i] === pair[0] && ids[i + 1] === pair[1]) {
      result.push(newId);
      i += 2;
    } else {
      result.push(ids[i]);
      i++;
    }
  }
  return result;
}
export function bpeStep(state) {
  const counts = new Map();
  for (let i = 0; i + 1 < state.ids.length; i++) {
    const key = `${state.ids[i]},${state.ids[i + 1]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const best = [...counts].sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 2) return null;
  const pair = best[0].split(',').map(Number);
  const newId = state.vocab.length;
  return {
    ids: mergePair(state.ids, pair, newId),
    vocab: [...state.vocab, [...state.vocab[pair[0]], ...state.vocab[pair[1]]]],
    history: [...state.history, { pair, id: newId, count: best[1] }],
  };
}
export function decodeBpe(state) {
  // Decode once after joining all bytes: a token can end within a UTF-8 character.
  // Декодируем после объединения байтов: токен может заканчиваться внутри символа UTF-8.
  return new TextDecoder('utf-8', { fatal: true }).decode(
    new Uint8Array(state.ids.flatMap((id) => state.vocab[id])),
  );
}
