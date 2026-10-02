import { escapeHtml as esc } from '../utils/html.js';
import { checkAnswer } from '../utils/math.js';

export function quizMarkup(id, quiz, text, ui, saved) {
  let inputs;
  if (quiz.type === 'number')
    inputs = `<label class="quiz__label" for="answer">${esc(ui.answer)}</label><input class="quiz__input" id="answer" name="answer" inputmode="decimal" autocomplete="off" value="${esc(typeof saved === 'string' ? saved : '')}" />`;
  else if (quiz.type === 'order' || quiz.type === 'match') {
    inputs = quiz.answer
      .map(
        (_, i) =>
          `<label class="quiz__pair">${quiz.type === 'order' ? `${esc(ui.position)} ${i + 1}` : esc(text.items[i])}<select name="answer-${i}" required><option value="">${esc(ui.choose)}</option>${text.options.map((option, index) => `<option value="${index}" ${Array.isArray(saved) && String(saved[i]) === String(index) ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label>`,
      )
      .join('');
  } else
    inputs = text.options
      .map(
        (option, i) =>
          `<label class="quiz__option"><input type="radio" name="answer" value="${i}" ${String(saved) === String(i) ? 'checked' : ''} /><span class="quiz__letter">${String.fromCharCode(65 + i)}</span><span>${esc(option)}</span></label>`,
      )
      .join('');
  return `<form class="quiz" data-quiz="${id}"><fieldset><legend>${esc(text.prompt)}</legend><div class="quiz__inputs">${inputs}</div></fieldset><button class="button button--primary" type="submit">${esc(ui.check)}</button><div class="quiz__feedback" role="status" aria-live="polite"></div></form>`;
}
export function mountQuiz(id, quiz, text, ui, state, save) {
  const form = document.querySelector('[data-quiz]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const answer = Array.isArray(quiz.answer)
      ? quiz.answer.map((_, i) => data.get(`answer-${i}`))
      : data.get('answer');
    const missing = Array.isArray(answer)
      ? answer.some((value) => value === '' || value === null)
      : answer === null || answer.trim() === '';
    const feedback = form.querySelector('.quiz__feedback');
    if (missing) {
      feedback.textContent = ui.unanswered;
      return;
    }
    const correct = checkAnswer(quiz, answer);
    state.answers[id] = answer;
    save();
    feedback.classList.toggle('quiz__feedback--correct', correct);
    feedback.textContent = `${correct ? ui.correct : ui.incorrect} ${correct ? text.explanation : ''}`;
  });
}
