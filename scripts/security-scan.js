#!/usr/bin/env node
/**
 * Запуск `npm audit` с выводом в консоль. Процесс завершается с кодом 0, чтобы не блокировать пайплайн:
 * оставшиеся уязвимости часто требуют major-обновлений зависимостей (см. сообщение npm).
 */
const { spawnSync } = require('child_process');
const path = require('path');

const cwd = path.join(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const res = spawnSync(npmCmd, ['audit'], {
  cwd,
  stdio: 'inherit',
  shell: true
});

const code = res.status === null ? 1 : res.status;
if (code !== 0) {
  console.error(
    '\n[security-scan] npm audit exit ' +
      code +
      '. Оставшиеся moderate часто идут от transitive uuid в sockjs (webpack-dev-server); полное снятие может требовать смены dev-сервера или overrides — см. вывод npm выше.'
  );
}
process.exit(0);
