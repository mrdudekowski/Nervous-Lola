#!/usr/bin/env node
/**
 * Перекодирование видео ассетов в H.264 MP4 со сжатием.
 * Паттерн как в Vkrainosti: `ffmpeg-static` + spawnSync (без ffmpeg в PATH).
 *
 * По умолчанию: assets/videos/athmovid.MOV → assets/videos/athmovid.mp4
 *
 *   node scripts/encode-assets-video-to-mp4.cjs
 *   node scripts/encode-assets-video-to-mp4.cjs --dry-run
 *   node scripts/encode-assets-video-to-mp4.cjs --input path/to/in.mov --output path/to/out.mp4 --crf 23 --max-width 1280
 */
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegPath = require('ffmpeg-static');
if (!ffmpegPath) {
  console.error('ffmpeg-static: бинарник не найден. Выполните npm install.');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');

function parseArg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1 || !process.argv[i + 1]) {
    return def;
  }
  return process.argv[i + 1];
}

const dryRun = process.argv.includes('--dry-run');
const inputRel = parseArg('--input', path.join('assets', 'videos', 'athmovid.MOV'));
const outputRel = parseArg('--output', path.join('assets', 'videos', 'athmovid.mp4'));
const crf = parseArg('--crf', '23');
const maxWidth = parseArg('--max-width', '1280');

const inputPath = path.isAbsolute(inputRel) ? inputRel : path.join(repoRoot, inputRel);
const outputPath = path.isAbsolute(outputRel) ? outputRel : path.join(repoRoot, outputRel);

if (!fs.existsSync(inputPath)) {
  console.error('Входной файл не найден:', inputPath);
  process.exit(1);
}

const scaleFilter = `scale='min(${maxWidth},iw)':-2`;

const args = [
  '-y',
  '-i',
  inputPath,
  '-vf',
  scaleFilter,
  '-c:v',
  'libx264',
  '-crf',
  String(crf),
  '-preset',
  'medium',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  '-an',
  outputPath
];

if (dryRun) {
  console.log('[dry-run]', ffmpegPath, args.join(' '));
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log('Кодирование:', path.relative(repoRoot, inputPath), '→', path.relative(repoRoot, outputPath));
const r = spawnSync(ffmpegPath, args, { stdio: 'inherit', cwd: repoRoot });
if (r.error) {
  console.error(r.error);
  process.exit(1);
}
if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

const inSize = fs.statSync(inputPath).size;
const outSize = fs.statSync(outputPath).size;
console.log(
  'Готово.',
  Math.round(inSize / 1024 / 1024),
  'MiB →',
  (outSize / 1024 / 1024).toFixed(2),
  'MiB'
);
