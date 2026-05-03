#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class HTMLValidator {
  constructor() {
    this.results = {
      files: [],
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      recommendations: []
    };
  }

  validateHTML() {
    console.log('🔍 HTML Validator запущен...');
    
    const htmlFiles = this.findHTMLFiles();
    
    for (const file of htmlFiles) {
      this.validateFile(file);
    }
    
    this.generateReport();
    return this.results;
  }

  findHTMLFiles() {
    const files = [];
    const rootDir = path.join(__dirname, '..');
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
          scanDirectory(itemPath);
        } else if (item.endsWith('.html')) {
          files.push(itemPath);
        }
      }
    };
    
    scanDirectory(rootDir);
    return files;
  }

  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fileAnalysis = {
        path: path.relative(process.cwd(), filePath),
        size: content.length,
        issues: [],
        structure: this.analyzeStructure(content),
        accessibility: this.analyzeAccessibility(content),
        seo: this.analyzeSEO(content),
        performance: this.analyzePerformance(content)
      };

      // Проверка базовой структуры HTML
      this.checkBasicStructure(content, fileAnalysis);
      
      // Проверка семантики
      this.checkSemantics(content, fileAnalysis);
      
      // Проверка доступности
      this.checkAccessibility(content, fileAnalysis);
      
      // Проверка SEO
      this.checkSEO(content, fileAnalysis);
      
      // Проверка производительности
      this.checkPerformance(content, fileAnalysis);

      this.results.files.push(fileAnalysis);
      this.results.totalIssues += fileAnalysis.issues.length;
      
    } catch (error) {
      this.results.files.push({
        path: path.relative(process.cwd(), filePath),
        issues: [{
          type: 'ERROR',
          message: `Ошибка чтения файла: ${error.message}`,
          severity: 'CRITICAL'
        }]
      });
      this.results.criticalIssues++;
    }
  }

  analyzeStructure(content) {
    return {
      hasDoctype: /<!doctype\s+html/i.test(content.trimStart().slice(0, 64)),
      hasHtml: content.includes('<html'),
      hasHead: content.includes('<head'),
      hasBody: content.includes('<body'),
      hasTitle: content.includes('<title'),
      hasMetaCharset: content.includes('charset'),
      hasViewport: content.includes('viewport')
    };
  }

  analyzeAccessibility(content) {
    return {
      hasAltAttributes: (content.match(/alt\s*=/g) || []).length,
      hasAriaLabels: (content.match(/aria-label/g) || []).length,
      hasAriaDescribedby: (content.match(/aria-describedby/g) || []).length,
      hasRoleAttributes: (content.match(/role\s*=/g) || []).length,
      hasSkipLinks: content.includes('skip'),
      hasHeadings: (content.match(/<h[1-6]/g) || []).length
    };
  }

  analyzeSEO(content) {
    return {
      hasMetaDescription: content.includes('name="description"'),
      hasMetaKeywords: content.includes('name="keywords"'),
      hasCanonical: content.includes('rel="canonical"'),
      hasOpenGraph: content.includes('property="og:'),
      hasTwitterCard: content.includes('name="twitter:'),
      hasStructuredData: content.includes('application/ld+json'),
      hasRobots: content.includes('name="robots"')
    };
  }

  analyzePerformance(content) {
    return {
      hasLazyLoading: content.includes('loading="lazy"'),
      hasPreload: content.includes('rel="preload"'),
      hasPrefetch: content.includes('rel="prefetch"'),
      hasAsyncScripts: (content.match(/async/g) || []).length,
      hasDeferScripts: (content.match(/defer/g) || []).length,
      imageCount: (content.match(/<img/g) || []).length,
      scriptCount: (content.match(/<script/g) || []).length,
      linkCount: (content.match(/<link/g) || []).length
    };
  }

  checkBasicStructure(content, fileAnalysis) {
    const structure = fileAnalysis.structure;
    
    if (!structure.hasDoctype) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует DOCTYPE',
        severity: 'CRITICAL'
      });
    }
    
    if (!structure.hasHtml) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует тег <html>',
        severity: 'CRITICAL'
      });
    }
    
    if (!structure.hasHead) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует тег <head>',
        severity: 'CRITICAL'
      });
    }
    
    if (!structure.hasBody) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует тег <body>',
        severity: 'CRITICAL'
      });
    }
    
    if (!structure.hasTitle) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует тег <title>',
        severity: 'HIGH'
      });
    }
    
    if (!structure.hasMetaCharset) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствует meta charset',
        severity: 'HIGH'
      });
    }
    
    if (!structure.hasViewport) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствует viewport meta tag',
        severity: 'MEDIUM'
      });
    }
  }

  checkSemantics(content, fileAnalysis) {
    // Проверка на семантические теги
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    const foundSemanticTags = semanticTags.filter(tag => content.includes(`<${tag}`));
    
    if (foundSemanticTags.length < 3) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Мало семантических тегов. Найдено: ${foundSemanticTags.join(', ')}`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на заголовки
    const headings = content.match(/<h[1-6][^>]*>/g) || [];
    if (headings.length === 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствуют заголовки (h1-h6)',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на h1
    const h1Count = (content.match(/<h1/g) || []).length;
    if (h1Count === 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствует заголовок h1',
        severity: 'MEDIUM'
      });
    } else if (h1Count > 1) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Множественные заголовки h1 (${h1Count})`,
        severity: 'MEDIUM'
      });
    }
  }

  checkAccessibility(content, fileAnalysis) {
    const accessibility = fileAnalysis.accessibility;
    
    // Проверка alt атрибутов
    const images = content.match(/<img[^>]*>/g) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
    
    if (imagesWithoutAlt.length > 0) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: `${imagesWithoutAlt.length} изображений без alt атрибутов`,
        severity: 'HIGH'
      });
    }
    
    // Проверка aria-labels
    if (accessibility.hasAriaLabels === 0 && images.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствуют aria-label атрибуты',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка заголовков
    if (accessibility.hasHeadings === 0) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Отсутствуют заголовки для структуры страницы',
        severity: 'HIGH'
      });
    }
  }

  checkSEO(content, fileAnalysis) {
    const seo = fileAnalysis.seo;
    
    if (!seo.hasMetaDescription) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствует meta description',
        severity: 'MEDIUM'
      });
    }
    
    if (!seo.hasCanonical) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствует canonical URL',
        severity: 'MEDIUM'
      });
    }
    
    if (!seo.hasOpenGraph) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствуют Open Graph мета-теги',
        severity: 'LOW'
      });
    }
    
    if (!seo.hasStructuredData) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствуют структурированные данные (JSON-LD)',
        severity: 'LOW'
      });
    }
  }

  checkPerformance(content, fileAnalysis) {
    const performance = fileAnalysis.performance;
    
    // Проверка lazy loading
    if (performance.imageCount > 0 && !performance.hasLazyLoading) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Изображения без lazy loading',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка количества скриптов
    if (performance.scriptCount > 5) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много скриптов (${performance.scriptCount}). Рассмотрите объединение`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка количества ссылок
    if (performance.linkCount > 10) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много внешних ссылок (${performance.linkCount})`,
        severity: 'LOW'
      });
    }
  }

  generateReport() {
    console.log('\n📊 HTML ВАЛИДАЦИЯ ЗАВЕРШЕНА');
    console.log('='.repeat(50));
    
    console.log(`📁 Файлов проверено: ${this.results.files.length}`);
    console.log(`⚠️ Всего проблем: ${this.results.totalIssues}`);
    console.log(`🔴 Критических: ${this.results.criticalIssues}`);
    console.log(`🟡 Предупреждений: ${this.results.warnings}`);
    
    if (this.results.totalIssues > 0) {
      console.log('\n🔍 ДЕТАЛИ ПРОБЛЕМ:');
      this.results.files.forEach(file => {
        if (file.issues.length > 0) {
          console.log(`\n📄 ${file.path}:`);
          file.issues.forEach(issue => {
            const icon = issue.severity === 'CRITICAL' ? '🔴' : 
                        issue.severity === 'HIGH' ? '🟠' : 
                        issue.severity === 'MEDIUM' ? '🟡' : '🟢';
            console.log(`  ${icon} ${issue.message}`);
          });
        }
      });
    }
    
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 РЕКОМЕНДАЦИИ:');
    
    const hasStructureIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.severity === 'CRITICAL')
    );
    
    if (hasStructureIssues) {
      console.log('🏗️ Исправьте критические проблемы структуры HTML');
    }
    
    const hasAccessibilityIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('alt') || issue.message.includes('aria'))
    );
    
    if (hasAccessibilityIssues) {
      console.log('♿ Улучшите доступность: добавьте alt атрибуты и aria-labels');
    }
    
    const hasSEOIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('meta') || issue.message.includes('canonical'))
    );
    
    if (hasSEOIssues) {
      console.log('🔍 Улучшите SEO: добавьте мета-теги и структурированные данные');
    }
  }
}

// Запуск валидации
if (require.main === module) {
  const validator = new HTMLValidator();
  validator.validateHTML();
}

module.exports = HTMLValidator;
