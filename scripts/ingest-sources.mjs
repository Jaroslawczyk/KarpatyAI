import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const input = process.argv[2] || 'sources';
fs.mkdirSync('sources', { recursive: true });
fs.mkdirSync('src/data', { recursive: true });
const lectures = [];
const isTime = (line) => /^\d+:\d+(?::\d+)?$/.test(line);
const seconds = (time) => time.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
for (let file = 0; file <= 8; file++) {
  const raw = fs.readFileSync(path.join(input, `${file}.txt`), 'utf8');
  fs.writeFileSync(`sources/${file}.txt`, raw);
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const chapters = [];
  let chapter;
  for (let i = 0; i < lines.length; i++) {
    if (!isTime(lines[i])) continue;
    // A heading occurs between the preceding caption and its next timestamp.
    // Заголовок расположен между предыдущей репликой и следующим таймкодом.
    if (i === 1 || !isTime(lines[i - 2] || '')) {
      chapter = { title: lines[i - 1], time: lines[i], seconds: seconds(lines[i]), entries: [] };
      chapters.push(chapter);
    }
    if (chapter && lines[i + 1]) chapter.entries.push({ time: lines[i], text: lines[i + 1] });
  }
  lectures.push({
    file: `${file}.txt`,
    sha256: crypto.createHash('sha256').update(raw).digest('hex'),
    bytes: Buffer.byteLength(raw),
    chapters,
  });
}
fs.writeFileSync('src/data/sources.json', JSON.stringify(lectures, null, 2) + '\n');
// Read every caption and produce a chronological, bounded inspection digest.
// Обрабатываем все реплики и создаём последовательную выборку для анализа.
for (const lecture of lectures.slice(1)) {
  console.log(`\n=== ${lecture.file} ===`);
  for (const chapter of lecture.chapters) {
    const captions = chapter.entries;
    const mid = Math.floor(captions.length / 2);
    console.log(`\n${chapter.time} ${chapter.title} (${captions.length} captions)`);
    console.log(
      captions
        .slice(0, 3)
        .map((e) => e.text)
        .join(' '),
    );
    if (captions.length > 8)
      console.log(
        captions
          .slice(mid, mid + 2)
          .map((e) => e.text)
          .join(' '),
      );
    console.log(
      captions
        .slice(-2)
        .map((e) => e.text)
        .join(' '),
    );
  }
}
