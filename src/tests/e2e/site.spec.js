import { test, expect } from '@playwright/test';
import { topics, route } from '../../data/curriculum.js';
import { examples } from '../../content/examples.js';
import ru from '../../content/ru.js';
import en from '../../content/en.js';

const visit = (page, topic) => page.goto(`./${route(topic)}`);

for (const lang of ['ru', 'en']) {
  test(`all 32 lessons and knowledge checks work in ${lang}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    await page.locator(`[data-lang="${lang}"]`).click();
    for (const topic of topics) {
      await visit(page, topic);
      await expect(page.locator('h1')).toHaveText((lang === 'ru' ? ru : en)[topic.id].title);
      await expect(page.locator('.katex')).toHaveCount(1);
      await expect(page.locator('.katex-error')).toHaveCount(0);
      await expect(page.locator('[data-quiz]')).toBeVisible();
      const quiz = examples[topic.id].quiz;
      if (Array.isArray(quiz.answer)) {
        for (let i = 0; i < quiz.answer.length; i++)
          await page.locator(`[name="answer-${i}"]`).selectOption(String(quiz.answer[i]));
      } else if (quiz.type === 'number') await page.locator('#answer').fill(String(quiz.answer));
      else await page.locator(`[name="answer"][value="${quiz.answer}"]`).check();
      await page.locator('.quiz button[type=submit]').click();
      await expect(page.locator('.quiz__feedback')).toHaveClass(/correct/);
      await page.locator('[data-detail="hint"] summary').click();
      await expect(page.locator('[data-detail="hint"]')).toHaveAttribute('open', '');
      await page.locator('[data-detail="solution"] summary').click();
      await expect(page.locator('[data-detail="solution"] p')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 375, 768, 1024, 1440, 1920, 2560]) {
  test(`all lessons fit ${width}px in both languages`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    for (const lang of ['ru', 'en']) {
      await page.locator(`[data-lang="${lang}"]`).click();
      for (const topic of topics) {
        await visit(page, topic);
        await expect(page.locator('h1')).toHaveText((lang === 'ru' ? ru : en)[topic.id].title);
        const layout = await page.evaluate(() => {
          const bad = [
            ...document.querySelectorAll(
              '.lab, .lab__visual, .formula, .code, .quiz, .completion, .lesson-nav',
            ),
          ]
            .filter((el) => {
              const box = el.getBoundingClientRect();
              return box.right > innerWidth + 1 || box.left < -1;
            })
            .map((el) => el.className);
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, bad };
        });
        expect(layout, `${lang}/${topic.id}/${width}`).toEqual({ overflow: false, bad: [] });
      }
      await page.goto('./#/map');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  });
}

test('language, all themes, answers, progress and disclosure state persist', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-lang="en"]').click();
  await page.locator('[data-detail="deeper"] summary').click();
  await page.locator('[data-lang="ru"]').click();
  await expect(page.locator('[data-detail="deeper"]')).toHaveAttribute('open', '');
  await page.locator('[data-lang="en"]').click();
  for (const theme of ['dark', 'light', 'coffee']) {
    await page.locator('#theme-select').selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  }
  await page.locator('#answer').fill('8');
  await page.locator('.quiz button').click();
  await page.locator('[data-complete]').click();
  await page.reload();
  await expect(page.locator('#answer')).toHaveValue('8');
  await expect(page.locator('[data-complete]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('progress')).toHaveAttribute('value', '1');
  await page.locator('[data-complete]').click();
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
});

test('laboratories update correct numbers and preserve BPE Unicode round-trips', async ({
  page,
}) => {
  await page.goto('./');
  await page.locator('[data-lang="en"]').click();
  await page.locator('#lab-range').fill('1');
  await expect(page.locator('#lab-readout')).toContainText('4.00');
  await expect(page.locator('#lab-readout')).toContainText('2.00');
  await page.goto('./#/bigram/counts');
  await page.locator('#lab-range').fill('1');
  await expect(page.locator('.bars')).toContainText('0.143');
  await page.goto('./#/backprop/crossentropy-grad');
  await page.locator('#lab-range').fill('0');
  await expect(page.locator('#lab-readout')).toContainText('1.0986');
  await page.goto('./#/gpt/attention');
  await page.locator('#lab-range').fill('0');
  await expect(page.locator('.attention__row--active')).toContainText('1.00');
  await page.goto('./#/tokenizer/bpe');
  const text = '猫 é 猫 é <script>bad()</script>';
  await page.locator('#lab-text').fill(text);
  await page.locator('[data-merge]').click();
  await expect(page.locator('.lab__decoded code')).toHaveText(text);
  await expect(page.locator('.tokens__token--merged').first()).toBeVisible();
  await page.locator('[data-lang="ru"]').click();
  await expect(page.locator('#lab-text')).toHaveValue(text);
  await expect(page.locator('.tokens__token--merged').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.lab__decoded code')).toHaveText(text);
  await page.locator('[data-reset]').click();
  await expect(page.locator('.tokens__token--merged')).toHaveCount(0);
});

test('wrong answers provide feedback and never mark completion', async ({ page }) => {
  await page.goto('./');
  await page.locator('#answer').fill('9');
  await page.locator('.quiz button').click();
  await expect(page.locator('.quiz__feedback')).toContainText('Пока не сходится');
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  await page.locator('#answer').fill('8');
  await page.locator('.quiz button').click();
  await expect(page.locator('.quiz__feedback')).toHaveClass(/correct/);
});

test('keyboard navigation, focus, mobile menu and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(await page.locator('#sidebar').evaluate((el) => el.inert)).toBe(true);
  await page.locator('.menu-toggle').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.locator('#sidebar').evaluate((el) => el.inert)).toBe(false);
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  expect(await page.locator('#sidebar').evaluate((el) => el.inert)).toBe(true);
  await page.locator('#lab-range').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lab-range')).toHaveValue('2.1');
  await page.locator('[data-detail="deeper"] summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-detail="deeper"]')).toHaveAttribute('open', '');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
});

test('sources load lazily, static assets stay inside the repository subpath', async ({ page }) => {
  const failures = [],
    urls = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  page.on('request', (request) => urls.push(request.url()));
  await page.goto('./#/gpt/attention');
  await expect(page.locator('h1')).toContainText('Self-attention');
  expect(urls.some((url) => /sources-/.test(url))).toBe(false);
  await page.locator('#source-details summary').click();
  await expect(page.locator('#source-content')).toContainText('42:18');
  await page.locator('.source-chapter summary').first().click();
  await expect(page.locator('.source-chapter[open] p').first()).toBeVisible();
  expect(urls.every((url) => url.startsWith('http://127.0.0.1:4173/course/'))).toBe(true);
  expect(failures).toEqual([]);
  await page.reload();
  await expect(page.locator('h1')).toContainText('Self-attention');
});

test('copy copies exact Python source', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.locator('[data-copy]').click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  // Windows clipboard normalizes newlines to CRLF without changing Python code.
  // Буфер Windows меняет переводы строк на CRLF, сохраняя сам код Python.
  expect(copied.replace(/\r\n/g, '\n')).toBe(examples.derivatives.code);
});

test('storage failure and corrupted preferences do not break learning', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('neural-notes:v1', '{broken'));
  await page.goto('./');
  await expect(page.locator('h1')).toBeVisible();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('disabled');
      },
    });
  });
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('three themes remain readable at mobile width and text at 200%', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('./');
  for (const theme of ['dark', 'light', 'coffee']) {
    await page.locator('#theme-select').selectOption(theme);
    await expect(page.locator('.katex')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    document.body.style.zoom = '2';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
