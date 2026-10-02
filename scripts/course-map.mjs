import fs from 'node:fs';
import { modules, topics } from '../src/data/curriculum.js';
import ru from '../src/content/ru.js';
import en from '../src/content/en.js';
import sources from '../src/data/sources.json' with { type: 'json' };

fs.mkdirSync('docs', { recursive: true });
let output = '# Course map / Карта курса\n\n';
output +=
  'The supplied transcripts determine the order. Main text is an editorial adaptation, not an attributed quotation. Original captions remain available in the lesson source accordions.\n\n';
output +=
  'Порядок определяется приложенными расшифровками. Основной текст — редакционный пересказ, а не цитаты автора. Исходные субтитры доступны в раскрывающихся блоках уроков.\n\n';
for (const module of modules) {
  output += `## ${module.file}. ${module.id} — ${module.file}.txt\n\n`;
  for (const id of module.topics) {
    const topic = topics.find((value) => value.id === id);
    output += `### ${ru[id].title} / ${en[id].title}\n\n`;
    output += `- Route: \`#/${module.id}/${id}\`\n- Source: \`${module.file}.txt\`, ${topic.start}–${topic.end || 'end / конец'}\n`;
    output += `- Concepts / Понятия: ${ru[id].concepts.join('; ')} / ${en[id].concepts.join('; ')}\n`;
    output += `- Practice / Практика: ${ru[id].practice.goal} / ${en[id].practice.goal}\n\n`;
  }
  output += '### Original chapters / Главы оригинала\n\n';
  for (const chapter of sources[module.file].chapters)
    output += `- ${chapter.time} — ${chapter.title}\n`;
  output += '\n';
}
output += '## Source integrity / Целостность источников\n\n';
for (const source of sources)
  output += `- \`${source.file}\`: ${source.bytes} bytes; SHA-256 \`${source.sha256}\`\n`;
fs.writeFileSync('docs/COURSE_MAP.md', output);
