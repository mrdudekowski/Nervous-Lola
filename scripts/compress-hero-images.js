#!/usr/bin/env node
/**
 * Сжимает hero-изображения в assets/images (PNG → меньший PNG, max 1400px по длинной стороне).
 * Требует devDependency sharp.
 */
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Установите sharp: npm install sharp --save-dev');
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');
const FILES = ['composition.png', 'icecoffee.png'];

async function compressOne(filename) {
  const inputPath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Пропуск (нет файла): ${filename}`);
    return;
  }
  const before = fs.statSync(inputPath).size;
  const tmpPath = `${inputPath}.tmp`;
  await sharp(inputPath)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: 'inside',
      withoutEnlargement: true
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmpPath);
  fs.renameSync(tmpPath, inputPath);
  const after = fs.statSync(inputPath).size;
  console.log(`${filename}: ${before} → ${after} bytes (${((1 - after / before) * 100).toFixed(1)}% меньше)`);
}

async function main() {
  for (const f of FILES) {
    await compressOne(f);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
