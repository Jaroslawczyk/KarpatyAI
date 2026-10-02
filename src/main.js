import 'katex/dist/katex.min.css';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/content.css';
import './styles/labs.css';
import ru from './i18n/ru.js';
import en from './i18n/en.js';
import contentRu from './content/ru.js';
import contentEn from './content/en.js';
import {
  modules,
  topics,
  topicById,
  route,
  toSeconds,
  relatedChapters,
} from './data/curriculum.js';
import { examples } from './content/examples.js';
import { readState, saveState } from './utils/storage.js';
import { escapeHtml as esc } from './utils/html.js';
import { renderLesson } from './pages/lesson.js';
import { renderMap } from './pages/map.js';
import { mountLab } from './components/labs.js';
import { mountQuiz } from './components/quiz.js';

const state = readState();
state.completed = [...new Set(state.completed.filter((id) => topicById[id]))];
const save = () => saveState(state);
let observer;
let activeTopic;
let sourcesPromise;

function currentRoute() {
  const parts = location.hash.slice(1).split('/').filter(Boolean);
  if (parts[0] === 'map') return null;
  const topic = topicById[parts[1]];
  return topic && topic.module === parts[0] ? topic : topics[0];
}
function render({ focus = false, preserve = false } = {}) {
  const oldY = window.scrollY;
  const opened = preserve
    ? [...document.querySelectorAll('details[open][data-detail]')].map((el) => el.dataset.detail)
    : [];
  observer?.disconnect();
  const ui = state.lang === 'ru' ? ru : en;
  const content = state.lang === 'ru' ? contentRu : contentEn;
  const topic = currentRoute();
  activeTopic = topic;
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.theme = state.theme;
  document.title = `${topic && content[topic.id] ? content[topic.id].title : ui.mapTitle} · Neural Notes`;
  document.querySelector('meta[name="description"]').content = ui.mapLead;
  const percent = Math.round((state.completed.length / topics.length) * 100);
  document.getElementById('app').innerHTML =
    `<a class="skip-link" href="#main">${esc(ui.skip)}</a><header class="topbar"><a class="brand" href="#/map" aria-label="Neural Notes — ${esc(ui.map)}"><span class="brand__mark" aria-hidden="true">N<span>·</span></span><span>NEURAL<span class="brand__light">NOTES</span><small>${esc(ui.brand)}</small></span></a><div class="topbar__controls"><button class="menu-toggle button" type="button" aria-controls="sidebar" aria-expanded="false">☰ <span>${esc(ui.menu)}</span></button><div class="language" role="group" aria-label="${esc(ui.language)}"><button type="button" data-lang="ru" aria-pressed="${state.lang === 'ru'}">RU</button><button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button></div><label class="theme-control"><span class="sr-only">${esc(ui.theme)}</span><span aria-hidden="true">◐</span><select id="theme-select" aria-label="${esc(ui.theme)}">${Object.entries(
      ui.themes,
    )
      .map(
        ([id, label]) =>
          `<option value="${id}" ${state.theme === id ? 'selected' : ''}>${esc(label)}</option>`,
      )
      .join('')}</select></label></div></header>
    <div class="sidebar-backdrop" hidden></div><aside class="sidebar" id="sidebar"><div class="sidebar__intro"><span class="eyebrow">${esc(ui.course)}</span><a class="sidebar__map ${topic ? '' : 'sidebar__map--active'}" href="#/map">${esc(ui.map)}</a></div><nav class="course-nav" aria-label="${esc(ui.menu)}">${modules
      .map(
        (module, index) =>
          `<details class="course-nav__module" ${topic?.module === module.id ? 'open' : ''}><summary><span class="course-nav__number">${String(index + 1).padStart(2, '0')}</span><span>${esc(ui.modules[module.id][0])}</span><span class="course-nav__chevron" aria-hidden="true">⌄</span></summary><ol>${module.topics
            .filter((id) => content[id])
            .map(
              (id) =>
                `<li><a class="course-nav__link ${id === topic?.id ? 'course-nav__link--active' : ''}" href="${route(topicById[id])}" ${id === topic?.id ? 'aria-current="page"' : ''}><span class="course-nav__dot ${state.completed.includes(id) ? 'course-nav__dot--done' : ''}" aria-hidden="true">${state.completed.includes(id) ? '✓' : ''}</span>${esc(content[id].title)}</a></li>`,
            )
            .join('')}</ol></details>`,
      )
      .join(
        '',
      )}</nav><div class="progress"><div><span>${esc(ui.progress)}</span><strong>${percent}%</strong></div><progress value="${state.completed.length}" max="32" aria-label="${esc(ui.progress)}"></progress><small>${state.completed.length} / 32 ${esc(ui.completed)}</small></div></aside>
    <main class="main ${topic ? '' : 'main--map'}" id="main" tabindex="-1">${topic && content[topic.id] ? renderLesson(topic, content, ui, state) : renderMap(content, ui, state)}</main><footer class="footer">${esc(ui.sourceScope)}</footer><div class="sr-only" id="announcement" role="status" aria-live="polite"></div>`;
  document.querySelectorAll('[data-lang]').forEach((button) =>
    button.addEventListener('click', () => {
      if (button.dataset.lang === state.lang) return;
      state.lang = button.dataset.lang;
      save();
      render({ preserve: true });
      document.querySelector(`[data-lang="${state.lang}"]`).focus({ preventScroll: true });
    }),
  );
  document.getElementById('theme-select').addEventListener('change', (event) => {
    state.theme = event.target.value;
    document.documentElement.dataset.theme = state.theme;
    save();
  });
  const menuButton = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const toggleMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    document.getElementById('sidebar').inert = matchMedia('(max-width: 900px)').matches && !open;
  };
  toggleMenu(false);
  menuButton.addEventListener('click', () =>
    toggleMenu(!document.body.classList.contains('menu-open')),
  );
  backdrop.addEventListener('click', () => {
    toggleMenu(false);
    menuButton.focus();
  });
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('main').focus();
  });
  document.querySelectorAll('[data-scroll]').forEach((link) =>
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(link.dataset.scroll);
      target?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
      target?.focus({ preventScroll: true });
    }),
  );
  if (topic && content[topic.id]) {
    mountLab(topic.lab, ui, state, save);
    mountQuiz(topic.id, examples[topic.id].quiz, content[topic.id].quiz, ui, state, save);
    document.querySelector('[data-complete]').addEventListener('click', () => {
      state.completed = state.completed.includes(topic.id)
        ? state.completed.filter((id) => id !== topic.id)
        : [...state.completed, topic.id];
      save();
      render({ preserve: true });
      document.querySelector('[data-complete]').focus({ preventScroll: true });
    });
    document.querySelector('[data-copy]').addEventListener('click', async (event) => {
      try {
        await navigator.clipboard.writeText(examples[topic.id].code);
        event.target.textContent = ui.copied;
      } catch {
        document.getElementById('announcement').textContent = ui.copyFailed;
        event.target.textContent = ui.copyFailed;
      }
    });
    document.getElementById('source-details').addEventListener('toggle', async (event) => {
      if (!event.target.open || event.target.dataset.loaded) return;
      const container = event.target.querySelector('#source-content');
      try {
        sourcesPromise ||= import('./data/sources.json').then((result) => result.default);
        const sources = await sourcesPromise;
        const chapters = sources[topic.file].chapters.filter(
          (chapter) =>
            (chapter.seconds >= toSeconds(topic.start) &&
              (!topic.end || chapter.seconds < toSeconds(topic.end))) ||
            relatedChapters[topic.id]?.includes(chapter.time),
        );
        container.innerHTML = `<p>${esc(ui.sourceCoverage)}</p>${chapters.map((chapter) => `<details class="source-chapter"><summary><time>${esc(chapter.time)}</time> ${esc(chapter.title)}</summary>${chapter.entries.map((entry) => `<p><time>${esc(entry.time)}</time> ${esc(entry.text)}</p>`).join('')}</details>`).join('')}`;
        event.target.dataset.loaded = 'true';
      } catch {
        container.textContent = `${ui.source}: sources/${topic.file}.txt`;
      }
    });
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        document
          .querySelectorAll('.page-nav a')
          .forEach((link) =>
            link.classList.toggle('page-nav__active', link.dataset.scroll === visible[0].target.id),
          );
      },
      { rootMargin: '-100px 0px -55% 0px' },
    );
    document.querySelectorAll('.lesson h2[id]').forEach((heading) => observer.observe(heading));
  }
  opened.forEach((id) => {
    const el = document.querySelector(`[data-detail="${id}"]`);
    if (el) el.open = true;
  });
  if (preserve) window.scrollTo({ top: oldY, behavior: 'instant' });
  else {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (focus) document.getElementById('lesson-title')?.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', () => render({ focus: true }));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
    document.body.classList.remove('menu-open');
    document.querySelector('.sidebar-backdrop').hidden = true;
    const button = document.querySelector('.menu-toggle');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
    document.getElementById('sidebar').inert = matchMedia('(max-width: 900px)').matches;
  }
});
matchMedia('(max-width: 900px)').addEventListener('change', (event) => {
  document.getElementById('sidebar').inert =
    event.matches && !document.body.classList.contains('menu-open');
});
// Leave one listener per app, rather than adding listeners on every language switch.
// Один обработчик на приложение: переключение языка не накапливает слушатели.
window.addEventListener('storage', (event) => {
  if (event.key !== 'neural-notes:v1') return;
  const updated = readState();
  Object.assign(state, updated);
  state.completed = [...new Set(state.completed.filter((id) => topicById[id]))];
  render({ preserve: true });
});
render();
export { activeTopic };
