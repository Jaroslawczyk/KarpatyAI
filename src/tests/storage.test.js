import { describe, it, expect } from 'vitest';
import { readState, saveState } from '../utils/storage.js';

describe('Local preferences and progress', () => {
  it('round-trips languages, themes, answers, progress, and laboratory state', () => {
    let data;
    const storage = {
      getItem: () => data,
      setItem: (_, value) => {
        data = value;
      },
    };
    for (const lang of ['ru', 'en'])
      for (const theme of ['dark', 'light', 'coffee']) {
        const state = {
          lang,
          theme,
          completed: ['derivatives'],
          answers: { derivatives: '8' },
          labState: { derivative: 2 },
        };
        expect(saveState(state, storage)).toBe(true);
        expect(readState(storage)).toEqual(state);
      }
  });
  it('recovers from corrupt storage and validates persisted types', () => {
    expect(readState({ getItem: () => '{broken' }).lang).toBe('ru');
    expect(
      readState({
        getItem: () =>
          JSON.stringify({
            lang: 'xx',
            theme: 'neon',
            completed: [2, 'graph'],
            answers: [],
            labState: null,
          }),
      }),
    ).toEqual({ lang: 'ru', theme: 'dark', completed: ['graph'], answers: {}, labState: {} });
  });
  it('continues when reading or writing storage is blocked', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(readState(storage).theme).toBe('dark');
    expect(saveState({}, storage)).toBe(false);
  });
});
