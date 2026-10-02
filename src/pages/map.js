import { modules, topicById, route } from '../data/curriculum.js';
import { escapeHtml as esc } from '../utils/html.js';

export function renderMap(content, ui, state) {
  return `<article class="course-map"><header class="lesson__header"><span class="eyebrow">NEURAL NOTES / 01—08</span><h1 id="lesson-title" tabindex="-1">${esc(ui.mapTitle)}</h1><p class="lesson__lead">${esc(ui.mapLead)}</p><p class="callout callout--simple">${esc(ui.prerequisites)}</p></header><div class="course-map__modules">${modules
    .map(
      (module, i) =>
        `<section class="module-card"><span class="module-card__number">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(ui.modules[module.id][0])}</h2><p>${esc(ui.modules[module.id][1])}</p><ol>${module.topics
          .filter((id) => content[id])
          .map(
            (id) =>
              `<li><a href="${route(topicById[id])}">${esc(content[id].title)}${state.completed.includes(id) ? '<span aria-hidden="true"> ✓</span>' : ''}</a></li>`,
          )
          .join('')}</ol></div></section>`,
    )
    .join(
      '',
    )}</div><aside class="source-policy"><h2>${esc(ui.sources)}</h2><p>${esc(ui.scope)}</p><p class="addition">${esc(ui.addition)}</p><p>${esc(ui.addedScope)}</p></aside></article>`;
}
