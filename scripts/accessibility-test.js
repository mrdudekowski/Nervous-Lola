#!/usr/bin/env node
/**
 * Проверка разметки главной страницы через html-validate (a11y-правила в составе preset).
 */
const path = require('path');
const { HtmlValidate } = require('html-validate');

const ROOT = path.join(__dirname, '..');
const TARGET = path.resolve(ROOT, 'index.html');

async function main() {
  const validator = new HtmlValidate();
  const report = await validator.validateFile(TARGET);

  let errors = 0;
  let warnings = 0;

  for (const file of report.results) {
    const rel = path.relative(ROOT, path.resolve(ROOT, file.filePath));
    for (const msg of file.messages) {
      const line = `[${rel}:${msg.line}:${msg.column}] ${msg.ruleId} (${msg.severity}): ${msg.message}`;
      if (msg.severity === 2) {
        console.error(line);
        errors += 1;
      } else {
        console.warn(line);
        warnings += 1;
      }
    }
  }

  console.log(`html-validate: valid=${report.valid}, errors=${errors}, warnings=${warnings}`);
  process.exit(report.valid ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
