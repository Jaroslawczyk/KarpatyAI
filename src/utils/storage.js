const key = 'neural-notes:v1';
export function readState(storage) {
  const initial = { lang: 'ru', theme: 'dark', completed: [], answers: {}, labState: {} };
  try {
    storage ||= globalThis.localStorage;
    const value = JSON.parse(storage.getItem(key));
    if (!value || typeof value !== 'object') return initial;
    return {
      ...initial,
      lang: ['ru', 'en'].includes(value.lang) ? value.lang : initial.lang,
      theme: ['dark', 'light', 'coffee'].includes(value.theme) ? value.theme : initial.theme,
      completed: Array.isArray(value.completed)
        ? value.completed.filter((id) => typeof id === 'string')
        : [],
      answers:
        value.answers && typeof value.answers === 'object' && !Array.isArray(value.answers)
          ? value.answers
          : {},
      labState:
        value.labState && typeof value.labState === 'object' && !Array.isArray(value.labState)
          ? value.labState
          : {},
    };
  } catch {
    return initial;
  }
}
export function saveState(state, storage) {
  try {
    (storage || globalThis.localStorage).setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
