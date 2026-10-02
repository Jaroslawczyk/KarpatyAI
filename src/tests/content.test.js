import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import crypto from 'node:crypto';
import katex from 'katex';
import ru from '../content/ru.js';
import en from '../content/en.js';
import uiRu from '../i18n/ru.js';
import uiEn from '../i18n/en.js';
import { examples } from '../content/examples.js';
import { topics, modules, toSeconds } from '../data/curriculum.js';
import sources from '../data/sources.json';

function keys(value, prefix = '') {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const current = `${prefix}.${key}`;
      return child && typeof child === 'object' ? [current, ...keys(child, current)] : [current];
    })
    .sort();
}
describe('Curriculum and bilingual completeness', () => {
  it('contains exactly 8 modules and 32 unique topics', () => {
    expect(modules).toHaveLength(8);
    expect(topics).toHaveLength(32);
    expect(new Set(topics.map((t) => t.id)).size).toBe(32);
    expect(Object.keys(ru).sort()).toEqual(topics.map((t) => t.id).sort());
    expect(Object.keys(examples).sort()).toEqual(Object.keys(ru).sort());
  });
  it('has complete UI and content translations with matching structure', () => {
    expect(keys(uiRu)).toEqual(keys(uiEn));
    expect(keys(ru)).toEqual(keys(en));
  });
  for (const topic of topics) {
    it(`${topic.id}: has teaching blocks, a valid quiz, formula, and source range`, () => {
      for (const content of [ru, en]) {
        const lesson = content[topic.id];
        for (const field of [
          'title',
          'lead',
          'technical',
          'symbols',
          'why',
          'details',
          'summary',
        ]) {
          expect(lesson[field].length, field).toBeGreaterThan(15);
        }
        expect(lesson.concepts.length).toBeGreaterThanOrEqual(3);
        expect(lesson.mistakes.length).toBeGreaterThanOrEqual(2);
        expect(lesson.codeNotes.length).toBeGreaterThanOrEqual(2);
        for (const field of ['goal', 'prepare', 'reason', 'result', 'check', 'hint', 'solution'])
          expect(lesson.practice[field].length, field).toBeGreaterThan(10);
        expect(lesson.practice.steps).toHaveLength(3);
        const quiz = examples[topic.id].quiz;
        if (quiz.type !== 'number') {
          const answers = Array.isArray(quiz.answer) ? quiz.answer : [quiz.answer];
          for (const answer of answers) expect(lesson.quiz.options[answer]).toBeTruthy();
          if (quiz.type === 'order') expect(new Set(answers).size).toBe(lesson.quiz.options.length);
          if (quiz.type === 'match') expect(answers.length).toBe(lesson.quiz.items.length);
        }
      }
      expect(() =>
        katex.renderToString(examples[topic.id].formula, { throwOnError: true, strict: 'error' }),
      ).not.toThrow();
      expect(examples[topic.id].code.length).toBeGreaterThan(80);
      expect(sources[topic.file].chapters.some((c) => c.time === topic.start)).toBe(true);
      if (topic.end) expect(toSeconds(topic.end)).toBeGreaterThan(toSeconds(topic.start));
    });
  }
  it('maps every original chapter to one primary lesson, in order', () => {
    for (const module of modules) {
      for (const chapter of sources[module.file].chapters) {
        const covering = topics.filter(
          (t) =>
            t.module === module.id &&
            toSeconds(t.start) <= chapter.seconds &&
            (!t.end || chapter.seconds < toSeconds(t.end)),
        );
        expect(covering).toHaveLength(1);
      }
    }
  });
  it('preserves the supplied sources and timestamp order', () => {
    for (const source of sources) {
      const raw = fs.readFileSync(`sources/${source.file}`);
      expect(crypto.createHash('sha256').update(raw).digest('hex')).toBe(source.sha256);
      const entries = source.chapters.flatMap((c) => c.entries);
      for (let i = 1; i < entries.length; i++)
        expect(toSeconds(entries[i].time)).toBeGreaterThanOrEqual(toSeconds(entries[i - 1].time));
    }
  });
});
