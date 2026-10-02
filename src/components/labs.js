import { escapeHtml as esc } from '../utils/html.js';
import {
  softmax,
  smoothCounts,
  causalWeights,
  createBpe,
  bpeStep,
  decodeBpe,
} from '../utils/math.js';

const ranges = {
  derivative: [-2, 3, 0.1, 2],
  bigram: [0, 5, 0.1, 0],
  embedding: [0, 3, 1, 1],
  activation: [0.1, 4, 0.1, 1],
  gradient: [-5, 5, 0.1, 0],
  tree: [0, 3, 1, 3],
  attention: [0, 3, 1, 2],
};

export function labMarkup(kind, ui, state) {
  const text = ui.labs[kind];
  const range = ranges[kind];
  const saved = state.labState[kind];
  const value =
    range && Number.isFinite(Number(saved))
      ? Math.max(range[0], Math.min(range[1], Number(saved)))
      : range?.[3];
  return `<div class="lab" data-lab="${kind}">
    <div class="lab__heading"><span class="eyebrow">${esc(ui.lab)} / ${String(Object.keys(ui.labs).indexOf(kind) + 1).padStart(2, '0')}</span><h3>${esc(text.title)}</h3><p>${esc(text.description)}</p></div>
    ${kind === 'bpe' ? `<label class="lab__label" for="lab-text">${esc(text.control)}</label><textarea id="lab-text" class="lab__text" maxlength="240" spellcheck="false">${esc(saved?.text ?? 'banana banana')}</textarea><div class="lab__actions"><button class="button button--primary" type="button" data-merge>${esc(text.merge)}</button><button class="button" type="button" data-reset>${esc(text.reset)}</button></div>` : `<label class="lab__label" for="lab-range">${esc(text.control)} <output id="lab-control-value" for="lab-range">${value}</output></label><input id="lab-range" type="range" min="${range[0]}" max="${range[1]}" step="${range[2]}" value="${value}" />`}
    <div class="lab__visual" id="lab-visual"></div><div class="lab__readout" aria-live="polite" aria-atomic="true" id="lab-readout"></div><p class="lab__note">${esc(text.note)}</p>
  </div>`;
}

function plot(series, xmin, xmax, ymin, ymax, label, point) {
  const mapX = (x) => 20 + ((x - xmin) / (xmax - xmin)) * 560;
  const mapY = (y) => 230 - ((y - ymin) / (ymax - ymin)) * 210;
  const lines = series
    .map((fn, i) => {
      const points = Array.from({ length: 121 }, (_, j) => {
        const x = xmin + (j / 120) * (xmax - xmin);
        return `${mapX(x).toFixed(2)},${mapY(fn(x)).toFixed(2)}`;
      }).join(' ');
      return `<polyline class="plot__line ${i ? 'plot__line--secondary' : ''}" points="${points}" />`;
    })
    .join('');
  return `<div class="plot"><div class="plot__scale"><span>${ymax}</span><span>${ymin}</span></div><svg viewBox="0 0 600 250" role="img" aria-label="${esc(label)}"><defs><clipPath id="plot-clip"><rect x="20" y="20" width="560" height="210"/></clipPath></defs>${[0, 1, 2, 3, 4].map((i) => `<path class="plot__grid" d="M20 ${20 + i * 52.5}H580"/>`).join('')}<path class="plot__axis" d="M20 ${mapY(0)}H580 M${mapX(0)} 20V230"/><g clip-path="url(#plot-clip)">${lines}</g>${point ? `<circle class="plot__point" cx="${mapX(point[0])}" cy="${mapY(point[1])}" r="7"/>` : ''}</svg></div><div class="plot__ticks"><span>${xmin}</span><span>x</span><span>${xmax}</span></div>`;
}
function probabilityBars(values, gradients) {
  return `<div class="bars">${values.map((p, i) => `<div class="bars__item"><div class="bars__track"><div class="bars__fill" style="height:${p * 100}%"></div></div><strong>${['A', 'B', 'C'][i]}</strong><span>p = ${p.toFixed(3)}</span>${gradients ? `<span>∂L/∂z = ${gradients[i].toFixed(3)}</span>` : ''}</div>`).join('')}</div>`;
}

export function mountLab(kind, ui, state, save) {
  const root = document.querySelector('[data-lab]');
  if (!root) return;
  const visual = root.querySelector('#lab-visual');
  const readout = root.querySelector('#lab-readout');
  const text = ui.labs[kind];
  const metric = (label, value) => `<span>${esc(label)}</span><strong>${esc(value)}</strong>`;
  if (kind === 'bpe') {
    const input = root.querySelector('textarea');
    const merge = root.querySelector('[data-merge]');
    let bpe = createBpe(input.value);
    const restoredSteps = Math.min(100, Math.max(0, Number(state.labState.bpe?.steps) || 0));
    for (let i = 0; i < restoredSteps; i++) {
      const next = bpeStep(bpe);
      if (!next) break;
      bpe = next;
    }
    const update = () => {
      visual.innerHTML = `<div class="tokens">${bpe.ids.map((id) => `<span class="tokens__token ${id > 255 ? 'tokens__token--merged' : ''}" title="${bpe.vocab[id].join(', ')}">${id}</span>`).join('') || esc(text.empty)}</div>${bpe.history.length ? `<details class="lab__history"><summary>${esc(text.history)} (${bpe.history.length})</summary><ol>${bpe.history.map((merge) => `<li>[${merge.pair.join(', ')}] → ${merge.id}</li>`).join('')}</ol></details>` : ''}<div class="lab__decoded"><span>${esc(text.roundtrip)}</span><code>${esc(decodeBpe(bpe))}</code></div>`;
      readout.innerHTML =
        metric(
          text.value,
          `${bpe.ids.length} / ${new TextEncoder().encode(input.value).length} bytes`,
        ) + (bpeStep(bpe) ? '' : `<span>${esc(text.finished)}</span>`);
      merge.disabled = !bpeStep(bpe);
      state.labState.bpe = { text: input.value, steps: bpe.history.length };
      save();
    };
    input.addEventListener('input', () => {
      bpe = createBpe(input.value);
      update();
    });
    merge.addEventListener('click', () => {
      bpe = bpeStep(bpe) || bpe;
      update();
    });
    root.querySelector('[data-reset]').addEventListener('click', () => {
      bpe = createBpe(input.value);
      update();
    });
    update();
    return;
  }
  const slider = root.querySelector('input');
  const update = () => {
    const v = Number(slider.value);
    root.querySelector('output').textContent = v;
    state.labState[kind] = v;
    if (kind === 'derivative') {
      const f = (x) => 3 * x * x - 4 * x + 5;
      const slope = 6 * v - 4;
      visual.innerHTML = plot([f, (x) => f(v) + slope * (x - v)], -2, 3, 0, 26, text.title, [
        v,
        f(v),
      ]);
      readout.innerHTML =
        metric(text.value, f(v).toFixed(2)) + metric(text.slope, slope.toFixed(2));
    } else if (kind === 'bigram') {
      const probs = smoothCounts([0, 3, 1], v);
      visual.innerHTML = probabilityBars(probs);
      readout.innerHTML = metric(text.value, probs.reduce((a, b) => a + b, 0).toFixed(3));
    } else if (kind === 'embedding') {
      const rows = [
        [0, 0],
        [0.2, -0.4],
        [0.7, 0.1],
        [-0.2, 0.8],
      ];
      visual.innerHTML = `<div class="embedding"><div class="embedding__table">${rows.map((row, i) => `<div class="embedding__row ${i === v ? 'embedding__row--active' : ''}"><span>${i} · ${['.', 'a', 'b', 'c'][i]}</span><code>[${row.join(', ')}]</code></div>`).join('')}</div><div class="embedding__flow"><code>[0, ${v}, 2]</code><span>↓ C[X]</span><code>[[0, 0], [${rows[v].join(', ')}], [0.7, 0.1]]</code><span>↓ reshape</span><code>[0, 0, ${rows[v].join(', ')}, 0.7, 0.1]</code></div></div>`;
      readout.innerHTML = metric(text.value, `[${rows[v].join(', ')}]`);
    } else if (kind === 'activation') {
      const f = (x) => Math.tanh(v * x);
      const saturated =
        Array.from({ length: 61 }, (_, i) => f(-3 + i / 10)).filter((y) => Math.abs(y) > 0.99)
          .length / 61;
      visual.innerHTML = plot([f, (x) => 1 - f(x) ** 2], -3, 3, -1.1, 1.1, text.title);
      readout.innerHTML = metric(text.value, `${(saturated * 100).toFixed(1)}%`);
    } else if (kind === 'gradient') {
      const p = softmax([0, v, 0]);
      const g = p.map((value, i) => value - (i === 1 ? 1 : 0));
      visual.innerHTML = probabilityBars(p, g);
      readout.innerHTML =
        metric(text.value, (-Math.log(p[1])).toFixed(4)) +
        metric('Σ ∂L/∂z', g.reduce((a, b) => a + b, 0).toFixed(4));
    } else if (kind === 'tree') {
      visual.innerHTML = `<div class="tree">${Array.from({ length: v + 1 }, (_, level) => `<div class="tree__level" style="--nodes:${8 / 2 ** level}">${Array.from({ length: 8 / 2 ** level }, (_, i) => `<div class="tree__node">${2 ** level === 1 ? i : `${i * 2 ** level}–${(i + 1) * 2 ** level - 1}`}</div>`).join('')}</div>`).join('')}</div>`;
      readout.innerHTML = metric(text.value, `${2 ** v} / 8`);
    } else if (kind === 'attention') {
      const scores = [0.2, 1, -0.3, 0.7];
      const weights = Array.from({ length: 4 }, (_, row) => causalWeights(scores, row));
      visual.innerHTML = `<div class="attention" role="table" aria-label="${esc(text.title)}"><div class="attention__row" role="row"><span role="columnheader">Q / K</span>${scores.map((_, i) => `<span role="columnheader">${i}</span>`).join('')}</div>${weights.map((row, i) => `<div class="attention__row ${i === v ? 'attention__row--active' : ''}" role="row"><span role="rowheader">${i}</span>${row.map((p, j) => `<span role="cell" class="attention__cell ${j > i ? 'attention__cell--masked' : ''}" style="--weight:${p}">${p.toFixed(2)}</span>`).join('')}</div>`).join('')}</div>`;
      readout.innerHTML = metric(text.value, weights[v].reduce((a, b) => a + b, 0).toFixed(3));
    }
    save();
  };
  slider.addEventListener('input', update);
  update();
}
