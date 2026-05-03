#!/usr/bin/env node

/**
 * Скрипт для извлечения критического CSS
 * Анализирует HTML файлы и извлекает CSS, необходимый для рендеринга above-the-fold контента
 */

const fs = require('fs');
const path = require('path');

class CriticalCSSExtractor {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.cssDir = path.join(this.projectRoot, 'assets', 'css');
    this.outputFile = path.join(this.cssDir, 'critical.css');
    this.nonCriticalFile = path.join(this.cssDir, 'non-critical.css');
  }

  /**
   * Основной метод извлечения критического CSS
   */
  async extract() {
    console.log('🔍 Извлечение критического CSS...');
    
    try {
      // Определяем критические селекторы
      const criticalSelectors = this.getCriticalSelectors();
      
      // Читаем все CSS файлы
      const cssFiles = this.getCSSFiles();
      const allCSS = this.readCSSFiles(cssFiles);
      
      // Извлекаем критические стили
      const criticalCSS = this.extractCriticalStyles(allCSS, criticalSelectors);
      const nonCriticalCSS = this.extractNonCriticalStyles(allCSS, criticalSelectors);
      
      // Записываем файлы
      this.writeCriticalCSS(criticalCSS);
      this.writeNonCriticalCSS(nonCriticalCSS);
      
      // Генерируем отчет
      this.generateReport(criticalCSS, nonCriticalCSS);
      
      console.log('✅ Критический CSS успешно извлечен!');
      
    } catch (error) {
      console.error('❌ Ошибка при извлечении критического CSS:', error.message);
      process.exit(1);
    }
  }

  /**
   * Определяет критические селекторы для above-the-fold контента
   */
  getCriticalSelectors() {
    return [
      // HTML элементы
      'html', 'body', '*', '::before', '::after',
      
      // Навигация (всегда видна)
      '.navbar', '.navbar-container', '.navbar-brand', '.navbar-nav', 
      '.nav-link', '.logo-icon', '.logo-text', '.logo-primary', '.logo-secondary',
      
      // Hero секция (above-the-fold)
      '.hero', '.hero-content', '.hero-title', '.hero-subtitle', '.hero-cta',
      '.hero-controls', '.hero-arrow', '.hero-play-pause',
      
      // Aurora фон (всегда виден)
      '.aurora-container', '.aurora-fallback',
      
      // Базовые утилиты
      '.container', '.flex', '.flex-center', '.flex-column', '.text-center',
      '.relative', '.absolute', '.fixed', '.hidden', '.sr-only',
      
      // Критические кнопки
      '.btn', '.btn-primary', '.btn-secondary',
      
      // Критические типографические стили
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em',
      
      // Критические анимации
      '@keyframes aurora-pulse', '@keyframes fade-in', '@keyframes slide-in-up',
      '.fade-in', '.slide-in-up',
      
      // Критические медиа-запросы
      '@media (max-width: 768px)', '@media (max-width: 480px)',
      '@media (prefers-reduced-motion: reduce)', '@media (prefers-contrast: more)',
      
      // CSS переменные
      ':root'
    ];
  }

  /**
   * Получает список всех CSS файлов
   */
  getCSSFiles() {
    const cssFiles = [];
    
    // Основные CSS файлы
    const mainFiles = [
      'main.css',
      'variables.css',
      'animations.css',
      'breakpoints.css'
    ];
    
    // ITCSS файлы
    const itcssFiles = [
      'itcss/1-settings/_variables.css',
      'itcss/2-tools/_mixins.css',
      'itcss/3-generic/_reset.css',
      'itcss/4-elements/_typography.css',
      'itcss/5-objects/_layout.css',
      'itcss/6-components/_buttons.css',
      'itcss/7-utilities/_utilities.css'
    ];
    
    // Компоненты
    const componentFiles = [
      'components/navigation.css',
      'components/carousel.css',
      'components/menu.css',
      'components/footer.css',
      'components/maps.css'
    ];
    
    // Проверяем существование файлов
    [...mainFiles, ...itcssFiles, ...componentFiles].forEach(file => {
      const filePath = path.join(this.cssDir, file);
      if (fs.existsSync(filePath)) {
        cssFiles.push(filePath);
      }
    });
    
    return cssFiles;
  }

  /**
   * Читает содержимое CSS файлов
   */
  readCSSFiles(cssFiles) {
    let allCSS = '';
    
    cssFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        allCSS += `\n/* === ${path.relative(this.cssDir, file)} === */\n`;
        allCSS += content;
        allCSS += '\n';
      } catch (error) {
        console.warn(`⚠️  Не удалось прочитать файл: ${file}`);
      }
    });
    
    return allCSS;
  }

  /**
   * Извлекает критические стили
   */
  extractCriticalStyles(css, criticalSelectors) {
    const lines = css.split('\n');
    const criticalLines = [];
    let inCriticalBlock = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Проверяем, является ли строка критическим селектором
      if (this.isCriticalSelector(line, criticalSelectors)) {
        inCriticalBlock = true;
        braceCount = 0;
        criticalLines.push(lines[i]);
        continue;
      }
      
      // Если мы в критическом блоке, добавляем строки
      if (inCriticalBlock) {
        criticalLines.push(lines[i]);
        
        // Подсчитываем фигурные скобки
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        // Если блок закрыт, выходим из режима
        if (braceCount <= 0) {
          inCriticalBlock = false;
        }
      }
    }
    
    return criticalLines.join('\n');
  }

  /**
   * Извлекает некритические стили
   */
  extractNonCriticalStyles(css, criticalSelectors) {
    const lines = css.split('\n');
    const nonCriticalLines = [];
    let inCriticalBlock = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Проверяем, является ли строка критическим селектором
      if (this.isCriticalSelector(line, criticalSelectors)) {
        inCriticalBlock = true;
        braceCount = 0;
        continue;
      }
      
      // Если мы в критическом блоке, пропускаем строки
      if (inCriticalBlock) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount <= 0) {
          inCriticalBlock = false;
        }
        continue;
      }
      
      // Добавляем некритические строки
      nonCriticalLines.push(lines[i]);
    }
    
    return nonCriticalLines.join('\n');
  }

  /**
   * Проверяет, является ли строка критическим селектором
   */
  isCriticalSelector(line, criticalSelectors) {
    // Убираем комментарии и лишние пробелы
    const cleanLine = line.replace(/\/\*.*?\*\//g, '').trim();
    
    // Проверяем медиа-запросы
    if (cleanLine.startsWith('@media')) {
      return criticalSelectors.some(selector => 
        cleanLine.includes(selector.replace('@media ', ''))
      );
    }
    
    // Проверяем keyframes
    if (cleanLine.startsWith('@keyframes')) {
      const keyframeName = cleanLine.replace('@keyframes ', '').split(' ')[0];
      return criticalSelectors.includes(`@keyframes ${keyframeName}`);
    }
    
    // Проверяем :root
    if (cleanLine.startsWith(':root')) {
      return true;
    }
    
    // Проверяем обычные селекторы
    const selector = cleanLine.split('{')[0].trim();
    return criticalSelectors.some(critical => {
      if (critical.startsWith('.')) {
        return selector.includes(critical);
      }
      return selector === critical;
    });
  }

  /**
   * Записывает критический CSS
   */
  writeCriticalCSS(criticalCSS) {
    const header = `/* ========================================
   КРИТИЧЕСКИЙ CSS - НЕРВНАЯ ЛОЛА
   Автоматически сгенерирован: ${new Date().toISOString()}
   ======================================== */

`;
    
    fs.writeFileSync(this.outputFile, header + criticalCSS);
    console.log(`📝 Критический CSS записан в: ${path.relative(this.projectRoot, this.outputFile)}`);
  }

  /**
   * Записывает некритический CSS
   */
  writeNonCriticalCSS(nonCriticalCSS) {
    const header = `/* ========================================
   НЕКРИТИЧЕСКИЙ CSS - НЕРВНАЯ ЛОЛА
   Автоматически сгенерирован: ${new Date().toISOString()}
   ======================================== */

`;
    
    fs.writeFileSync(this.nonCriticalFile, header + nonCriticalCSS);
    console.log(`📝 Некритический CSS записан в: ${path.relative(this.projectRoot, this.nonCriticalFile)}`);
  }

  /**
   * Генерирует отчет о размерах CSS
   */
  generateReport(criticalCSS, nonCriticalCSS) {
    const criticalSize = Buffer.byteLength(criticalCSS, 'utf8');
    const nonCriticalSize = Buffer.byteLength(nonCriticalCSS, 'utf8');
    const totalSize = criticalSize + nonCriticalSize;
    const criticalPercentage = ((criticalSize / totalSize) * 100).toFixed(1);
    
    console.log('\n📊 ОТЧЕТ О КРИТИЧЕСКОМ CSS:');
    console.log('=====================================');
    console.log(`📦 Критический CSS: ${this.formatBytes(criticalSize)} (${criticalPercentage}%)`);
    console.log(`📦 Некритический CSS: ${this.formatBytes(nonCriticalSize)} (${(100 - criticalPercentage).toFixed(1)}%)`);
    console.log(`📦 Общий размер: ${this.formatBytes(totalSize)}`);
    console.log('=====================================');
    
    // Сохраняем отчет
    const report = {
      timestamp: new Date().toISOString(),
      critical: {
        size: criticalSize,
        percentage: parseFloat(criticalPercentage)
      },
      nonCritical: {
        size: nonCriticalSize,
        percentage: parseFloat((100 - criticalPercentage).toFixed(1))
      },
      total: {
        size: totalSize
      }
    };
    
    const reportFile = path.join(this.projectRoot, 'critical-css-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📋 Отчет сохранен в: ${path.relative(this.projectRoot, reportFile)}`);
  }

  /**
   * Форматирует размер в байтах
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Запуск скрипта
if (require.main === module) {
  const extractor = new CriticalCSSExtractor();
  extractor.extract();
}

module.exports = CriticalCSSExtractor;
