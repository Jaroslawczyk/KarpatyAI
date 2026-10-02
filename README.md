# Neural Notes

A bilingual, interactive, static textbook based on the eight supplied transcripts of Andrej Karpathy’s **Neural Networks: Zero to Hero** course. It follows the lecture order, from scalar differentiation to GPT and tokenization.

[Русская версия](README.ru.md) · [Complete course and source map](docs/COURSE_MAP.md) · [Validation report](docs/VALIDATION.md)

## Run locally

Requirements: **Node.js 24** and npm. No API keys, backend, model downloads, or Python are needed for the website.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build:

```sh
npm run build
npm run preview
```

Serve `dist/` over HTTP(S); opening `index.html` directly with `file://` is not supported. All runtime scripts, styles, math fonts, content, and transcripts are bundled locally. Core functionality makes no external API/CDN requests.

## Learning experience

32 lessons, four per lecture:

1. **Micrograd** — derivatives, computation graphs, automatic backward, training.
2. **Bigram language modeling** — counts, sampling/broadcasting, NLL/smoothing, neural formulation.
3. **MLP** — context windows, embeddings, stable optimization, evaluation splits.
4. **Activations and BatchNorm** — initialization, saturation, normalization, diagnostics.
5. **Manual backprop** — tensor derivatives, variance correction, cross-entropy and BatchNorm backward.
6. **WaveNet-inspired hierarchy** — modules, pairwise grouping, normalization axes, experiments.
7. **GPT** — next-token targets, causal attention, Transformer blocks, generation and pretraining boundaries.
8. **Tokenization** — Unicode/UTF-8, BPE training, encode/decode, special tokens and vocabulary design.

Each lesson includes an intuitive and technical explanation, a formula with symbol definitions, runnable Python snippets, commentary, common mistakes, optional details, takeaways, a knowledge check, and an eight-part guided exercise with hidden hint and solution.

Eight browser laboratories cover a derivative and tangent, bigram smoothing, embedding lookup, tanh saturation, cross-entropy gradients, hierarchical grouping, causal attention, and byte-level BPE. They are small educational simulations, not trained language models. Python examples run outside the website; examples importing `torch` require PyTorch.

## Source and editorial policy

- `sources/0.txt` is the supplied course overview; advertisements and catalog controls are excluded from lessons.
- `sources/1.txt` through `sources/8.txt` are retained source transcripts. SHA-256 checksums and chapter ranges appear in `docs/COURSE_MAP.md`.
- `src/data/curriculum.js` defines the sequence and exact timestamp ranges. `relatedChapters` records deliberate cross-references outside a lesson’s primary range.
- `src/data/sources.json` is generated from all transcript captions. It loads lazily when a reader expands the original-transcript section. Original English captions remain in English and are clearly labeled; all instructional prose and UI are fully translated.
- Lesson prose is a **paraphrase**, not a quotation attributed to Karpathy. Transcription artifacts such as “bathroom” for BatchNorm are corrected in the educational prose without altering the originals.
- Added formulas/notation, compact numerical examples and Python snippets, eight visual laboratories, 32 checks, guided exercises, and explanatory asides are explicitly labeled **Additional explanation** next to the material. The mathematical ideas are grounded in the lectures; the presentation and exercises are authored for this site.
- The WaveNet section is a hierarchy inspired by WaveNet, not the complete original architecture. RNN/LSTM/GRU are future directions mentioned in the sources, not invented extra lectures. RLHF, prompt compression, and multimodal tokenization are overviews, not implementations. Product/version discussions preserve the recording’s historical context.

To regenerate captions from the retained sources:

```sh
node scripts/ingest-sources.mjs
npm run docs:map
```

The ingest command can also take an input directory: `node scripts/ingest-sources.mjs /path/to/transcripts`. It expects files `0.txt`–`8.txt` and prints a chronological inspection digest. Review and translate content manually; regeneration does not rewrite lessons.

## Architecture

```text
├── index.html
├── package.json / package-lock.json
├── vite.config.js
├── eslint.config.js / .prettierrc.json
├── playwright.config.js
├── .github/workflows/pages.yml
├── public/
│   ├── favicon.svg
│   └── licenses/
├── sources/                    # Original supplied files 0–8
├── scripts/
│   ├── ingest-sources.mjs       # Parse timestamps and preserve source hashes
│   ├── course-map.mjs           # Generate detailed source/course map
│   ├── check-examples.mjs       # Execute the displayed Python examples
│   └── serve-dist.mjs           # Test-only static server at /course/
├── src/
│   ├── main.js                 # App shell, hash navigation, lifecycle
│   ├── components/
│   │   ├── labs.js              # Responsive SVG/HTML educational labs
│   │   └── quiz.js              # Five reusable check types
│   ├── pages/                  # Lesson renderer and course map
│   ├── content/
│   │   ├── ru/                 # Eight Russian content modules
│   │   ├── en/                 # Eight English content modules
│   │   ├── ru.js / en.js        # Language entry points
│   │   └── examples.js          # Shared code, TeX, quiz answer specifications
│   ├── i18n/                   # Separate RU/EN interface and laboratory text
│   ├── data/                   # Curriculum, source ranges, parsed captions
│   ├── styles/                 # Tokens, layout, content, laboratories (BEM)
│   ├── utils/                  # HTML escaping, math/BPE, resilient storage
│   └── tests/                  # Vitest and Playwright
└── docs/                       # Course map, validation, preview screenshots
```

There is no framework runtime. Rendering is split into the application shell, two page renderers, quiz and laboratory components, content, and pure utilities. Hash links such as `#/gpt/attention` require no server-side rewrite and survive a reload under a repository subdirectory. Local state uses one versioned key, `neural-notes:v1`, storing language, theme, completed topics, submitted answers, and lab values. Blocked/corrupt storage falls back to in-memory operation. Progress is explicitly controlled by the learner and is not automatically awarded for a quiz submission.

## Extend content

### Add a topic

1. Add a stable topic ID and source timestamp to the relevant module in `src/data/curriculum.js`.
2. Add matching records in `src/content/ru/<module>.js` and `src/content/en/<module>.js`; copy the existing schema. Define every teaching/practice field and translate all text.
3. Add the shared `formula`, `code`, and quiz specification in `src/content/examples.js`.
4. Add any cross-chapter references to `relatedChapters`. Keep source claims distinguishable from authored additions.
5. Update the fixed curriculum totals in the shell, tests, and documentation if the course length changes; the current release intentionally targets 8×4 lessons.
6. Run `npm run docs:map`, formatting, and checks.

### Add a knowledge check

Set `quiz.type` to one of:

- `choice`: a single correct option index.
- `fix`: the same accessible radio UI, with code-repair wording.
- `number`: a numeric answer and explicit tolerance; decimal commas are accepted.
- `order`: an array of option indices in the required order, entered through keyboard-friendly selects.
- `match`: option indices corresponding to localized `items`.

Question text, options, feedback explanation, and matching items live in the RU/EN lesson records. Answers live in `examples.js` and are shared between languages. A wrong answer never automatically completes a lesson. Add an independent expected-result test for new mathematical logic.

### Add a formula, chart, or diagram

- Put TeX in an example’s `formula` using `String.raw`. KaTeX renders accessible HTML + MathML. Define **every** symbol in both `symbols` texts. Formula wrappers are keyboard-focusable and scroll horizontally on narrow screens.
- Charts use native SVG with a responsive `viewBox`, clipped plot geometry, readable HTML scales, and textual numerical results. Add pure calculations to `src/utils/math.js` and presentation to `src/components/labs.js`.
- Diagrams use responsive HTML for hierarchy and attention, with ARIA table semantics where appropriate. Add labels and descriptions to both `src/i18n/` files.
- Keep authored numerical examples visibly marked as additional. Check units, axes, softmax sums, tensor shapes, and boundary cases.

Chart.js, Plotly, and Mermaid are intentionally unnecessary for these small interactions; they would add weight without improving the requested diagrams.

## Themes, accessibility, and responsive layout

`src/styles/tokens.css` defines **dark**, **light**, and **Light Coffee** through CSS custom properties. Components use these tokens instead of duplicating color values. `data-theme` on `<html>` applies themes immediately, and the preference is restored before rendering.

BEM styles are split by responsibility. The sidebar becomes a disclosure menu on narrow screens and is inert while closed. Native controls, visible focus rings, a skip link, native details, status announcements, reduced-motion support, local scroll containers for code/formulas, and responsive labs support keyboard and mobile use. The only fixed elements are the top bar and sidebar; the reading area remains in normal flow.

## Dependencies

Runtime:

- **KaTeX** — local mathematical rendering and bundled math fonts.
- **highlight.js** — core + Python grammar only, for code readability.

Development:

- **Vite** — development server and relative-path static production output.
- **Vitest** — content parity, source integrity, numerical invariants, and storage tests.
- **Playwright** — Chromium interaction and responsive production tests.
- **ESLint**, **@eslint/js**, **globals** — JavaScript linting.
- **Prettier** — consistent formatting.

Exact versions are pinned by `package-lock.json`. Runtime library notices are retained in `public/licenses/`. No remote fonts, UI framework, chart framework, analytics, or secret credentials are required.

## Validation

```sh
npx playwright install chromium
npm run format:check
npm run check
```

`check` runs lint, unit tests, a production build, and end-to-end tests. The tests deliberately serve the production build at `/course/`, exercise all 32 lessons in both languages, answer all checks, inspect widths 320/375/768/1024/1440/1920/2560, test themes/storage/accordions/copy/keyboard/labs, and verify source loading without outside network requests. Failure traces are stored in `test-results/`; the HTML report is in `playwright-report/`.

The optional Python check requires Python 3 and PyTorch in your chosen environment:

```sh
python -m pip install torch
npm run test:examples
# Or specify an isolated Python executable:
npm run test:examples -- /path/to/venv/bin/python
```

Python is only a verification/learning dependency; it is never part of the static site runtime. The check executes all displayed examples, verifies known printed results, and runs embedded assertions. See `docs/VALIDATION.md` for the actual checked environment and results.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this project, excluding ignored folders. Include `package-lock.json`, original `sources/`, and generated `src/data/sources.json`.
2. Use branch **main** (or edit the workflow’s branch filter).
3. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. Push to `main` or run **Check and deploy to GitHub Pages** manually under Actions.
5. The workflow installs dependencies and Chromium, checks formatting/lint/tests, builds, uploads `dist/`, and deploys only after successful validation.

The site URL will be `https://<account>.github.io/<repository>/`. `base: './'` and hash navigation support arbitrary repository names without hard-coded hostnames. Pull requests run validation but do not deploy. A custom domain also works without changing asset paths. The project is prepared for publication; this delivery does not create a GitHub repository or publish to your account automatically.
