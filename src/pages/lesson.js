import katex from 'katex';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import { examples } from '../content/examples.js';
import { escapeHtml as esc, list } from '../utils/html.js';
import { topics, route } from '../data/curriculum.js';
import { labMarkup } from '../components/labs.js';
import { quizMarkup } from '../components/quiz.js';

hljs.registerLanguage('python', python);
const addition = (ui) =>
  `<p class="addition"><span aria-hidden="true">＋</span>${esc(ui.addition)}</p>`;
const heading = (id, title, number) =>
  `<div class="section-heading"><span>${number}</span><h2 id="${id}" tabindex="-1">${esc(title)}</h2></div>`;

export function renderLesson(topic, content, ui, state) {
  const lesson = content[topic.id];
  const example = examples[topic.id];
  const p = lesson.practice;
  const flatIndex = topics.findIndex((item) => item.id === topic.id);
  const before = topics[flatIndex - 1];
  const after = topics[flatIndex + 1];
  const done = state.completed.includes(topic.id);
  const formula = katex.renderToString(example.formula, {
    displayMode: true,
    throwOnError: true,
    output: 'htmlAndMathml',
    strict: 'error',
  });
  const readTime = Math.max(5, Math.ceil(JSON.stringify(lesson).length / 1500));
  return `<article class="lesson">
    <nav class="breadcrumbs" aria-label="${esc(ui.course)}"><a href="#/map">${esc(ui.map)}</a><span>/</span><span>${esc(ui.modules[topic.module][0])}</span></nav>
    <header class="lesson__header"><div class="lesson__meta"><span class="eyebrow">${esc(ui.module)} ${String(topic.moduleIndex + 1).padStart(2, '0')} / 08</span><span>${esc(ui.lesson)} ${topic.index + 1} · ${readTime} ${esc(ui.minutes)}</span></div><h1 id="lesson-title" tabindex="-1">${esc(lesson.title)}</h1><p class="lesson__lead">${esc(lesson.lead)}</p><div class="concepts">${lesson.concepts.map((concept) => `<span>${esc(concept)}</span>`).join('')}</div><p class="lesson__source">${esc(ui.adapted)}<br /><a href="#sources" data-scroll="sources">${topic.file}.txt · ${topic.start}${topic.end ? `–${topic.end}` : '+'}</a></p></header>
    <section class="lesson__section">${heading('technical', ui.technical, '01')}<p>${esc(lesson.technical)}</p>${addition(ui)}<div class="formula" tabindex="0" role="region" aria-label="${esc(ui.formula)}">${formula}</div><p class="formula__legend">${esc(lesson.symbols)}</p><aside class="callout"><span class="callout__icon" aria-hidden="true">↳</span><div><h3>${esc(ui.why)}</h3><p>${esc(lesson.why)}</p></div></aside></section>
    <section class="lesson__section">${heading('lab', ui.lab, '02')}${addition(ui)}${labMarkup(topic.lab, ui, state)}</section>
    <section class="lesson__section">${heading('code', ui.code, '03')}${addition(ui)}<div class="code"><div class="code__toolbar"><span>Python</span><button class="code__copy" type="button" data-copy>${esc(ui.copy)}</button></div><pre tabindex="0" aria-label="Python"><code class="hljs language-python">${hljs.highlight(example.code, { language: 'python' }).value}</code></pre></div><p class="caption">${esc(ui.codeRuntime)}</p><ol class="code-notes">${list(lesson.codeNotes)}</ol></section>
    <section class="lesson__section"><h2 id="mistakes" tabindex="-1">${esc(ui.mistakes)}</h2><ul class="mistakes">${list(lesson.mistakes)}</ul><details class="accordion" data-detail="deeper"><summary>${esc(ui.more)}</summary><div>${addition(ui)}<p>${esc(lesson.details)}</p></div></details><div class="takeaway"><span class="eyebrow">${esc(ui.summary)}</span><p>${esc(lesson.summary)}</p></div></section>
    <section class="lesson__section">${heading('quiz', ui.quiz, '04')}${addition(ui)}${quizMarkup(topic.id, example.quiz, lesson.quiz, ui, state.answers[topic.id])}</section>
    <section class="lesson__section">${heading('practice', ui.practice, '05')}${addition(ui)}<div class="practice">${[
      ['goal', p.goal],
      ['prepare', p.prepare],
    ]
      .map(
        ([key, value], i) =>
          `<div class="practice__step"><span>${i + 1}</span><div><h3>${esc(ui[key])}</h3><p>${esc(value)}</p></div></div>`,
      )
      .join(
        '',
      )}<div class="practice__step"><span>3</span><div><h3>${esc(ui.steps)}</h3><ol>${list(p.steps)}</ol></div></div>${[
      ['reason', p.reason],
      ['result', p.result],
      ['selfCheck', p.check],
    ]
      .map(
        ([key, value], i) =>
          `<div class="practice__step"><span>${i + 4}</span><div><h3>${esc(ui[key])}</h3><p>${esc(value)}</p></div></div>`,
      )
      .join(
        '',
      )}<details class="accordion" data-detail="hint"><summary>7 · ${esc(ui.hint)}</summary><p>${esc(p.hint)}</p></details><details class="accordion" data-detail="solution"><summary>8 · ${esc(ui.solution)}</summary><p>${esc(p.solution)}</p></details></div></section>
    <section class="lesson__section lesson__section--sources"><h2 id="sources" tabindex="-1">${esc(ui.sources)}</h2><p>${esc(ui.sourceNote)}</p><details class="accordion" id="source-details"><summary>${esc(ui.original)} · ${topic.file}.txt · ${topic.start}</summary><div id="source-content"></div></details></section>
    <div class="completion"><div><span class="eyebrow">${esc(ui.lesson)} ${flatIndex + 1} / 32</span><p>${esc(ui.footer)}</p></div><button class="button button--primary" data-complete type="button" aria-pressed="${done}">${done ? '✓ ' + esc(ui.undo) : esc(ui.done)}</button></div>
    <nav class="lesson-nav" aria-label="${esc(ui.course)}">${before && content[before.id] ? `<a href="${route(before)}"><span>${esc(ui.previous)}</span><strong>${esc(content[before.id].title)}</strong></a>` : '<span></span>'}${after && content[after.id] ? `<a href="${route(after)}"><span>${esc(ui.next)}</span><strong>${esc(content[after.id].title)}</strong></a>` : `<a href="#/map"><span>${esc(ui.finish)}</span></a>`}</nav>
  </article><aside class="page-nav"><span class="eyebrow">${esc(ui.contents)}</span><nav>${['technical', 'lab', 'code', 'quiz', 'practice', 'sources'].map((id) => `<a href="#${id}" data-scroll="${id}">${esc(ui[id])}</a>`).join('')}</nav><div class="page-nav__note"><span>∇</span><p>${esc(ui.modules[topic.module][1])}</p></div></aside>`;
}
