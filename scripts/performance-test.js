#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.results = {
      files: [],
      totalSize: 0,
      totalImages: 0,
      totalScripts: 0,
      totalStylesheets: 0,
      issues: [],
      recommendations: []
    };
  }

  testPerformance() {
    console.log('🔍 Performance Tester запущен...');
    
    const htmlFiles = this.findHTMLFiles();
    
    for (const file of htmlFiles) {
      this.analyzeFile(file);
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
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(itemPath);
        } else if (item.endsWith('.html')) {
          files.push(itemPath);
        }
      }
    };
    
    scanDirectory(rootDir);
    return files;
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const fileAnalysis = {
        path: path.relative(process.cwd(), filePath),
        size: content.length,
        issues: [],
        resources: this.analyzeResources(content),
        performance: this.analyzePerformanceMetrics(content)
      };

      // Анализ ресурсов
      this.checkResourceOptimization(content, fileAnalysis);
      
      // Анализ производительности
      this.checkPerformanceIssues(content, fileAnalysis);
      
      // Анализ изображений
      this.checkImageOptimization(content, fileAnalysis);
      
      // Анализ скриптов
      this.checkScriptOptimization(content, fileAnalysis);
      
      // Анализ стилей
      this.checkStyleOptimization(content, fileAnalysis);

      this.results.files.push(fileAnalysis);
      this.results.totalSize += fileAnalysis.size;
      this.results.totalImages += fileAnalysis.resources.images.length;
      this.results.totalScripts += fileAnalysis.resources.scripts.length;
      this.results.totalStylesheets += fileAnalysis.resources.stylesheets.length;
      
    } catch (error) {
      this.results.files.push({
        path: path.relative(process.cwd(), filePath),
        issues: [{
          type: 'ERROR',
          message: `Ошибка чтения файла: ${error.message}`,
          severity: 'CRITICAL'
        }]
      });
    }
  }

  analyzeResources(content) {
    return {
      images: this.extractImages(content),
      scripts: this.extractScripts(content),
      stylesheets: this.extractStylesheets(content),
      fonts: this.extractFonts(content),
      videos: this.extractVideos(content)
    };
  }

  analyzePerformanceMetrics(content) {
    return {
      hasLazyLoading: content.includes('loading="lazy"'),
      hasPreload: content.includes('rel="preload"'),
      hasPrefetch: content.includes('rel="prefetch"'),
      hasAsyncScripts: (content.match(/async/g) || []).length,
      hasDeferScripts: (content.match(/defer/g) || []).length,
      hasCriticalCSS: content.includes('critical'),
      hasResourceHints: content.includes('dns-prefetch') || content.includes('preconnect'),
      hasCompression: content.includes('gzip') || content.includes('br'),
      hasCDN: content.includes('cdn') || content.includes('cloudflare'),
      hasMinification: content.includes('.min.')
    };
  }

  extractImages(content) {
    const images = [];
    const imgMatches = content.match(/<img[^>]*>/g) || [];
    
    imgMatches.forEach(img => {
      const srcMatch = img.match(/src\s*=\s*['"]([^'"]+)['"]/);
      const altMatch = img.match(/alt\s*=\s*['"]([^'"]*)['"]/);
      const loadingMatch = img.match(/loading\s*=\s*['"]([^'"]+)['"]/);
      
      if (srcMatch) {
        images.push({
          src: srcMatch[1],
          alt: altMatch ? altMatch[1] : '',
          hasLazyLoading: loadingMatch && loadingMatch[1] === 'lazy',
          hasAlt: !!altMatch
        });
      }
    });
    
    return images;
  }

  extractScripts(content) {
    const scripts = [];
    const scriptMatches = content.match(/<script[^>]*>/g) || [];
    
    scriptMatches.forEach(script => {
      const srcMatch = script.match(/src\s*=\s*['"]([^'"]+)['"]/);
      const asyncMatch = script.match(/async/);
      const deferMatch = script.match(/defer/);
      
      if (srcMatch) {
        scripts.push({
          src: srcMatch[1],
          isAsync: !!asyncMatch,
          isDefer: !!deferMatch,
          isExternal: srcMatch[1].startsWith('http')
        });
      }
    });
    
    return scripts;
  }

  extractStylesheets(content) {
    const stylesheets = [];
    const linkMatches = content.match(/<link[^>]*rel\s*=\s*['"]stylesheet['"][^>]*>/g) || [];
    
    linkMatches.forEach(link => {
      const hrefMatch = link.match(/href\s*=\s*['"]([^'"]+)['"]/);
      const preloadMatch = link.match(/rel\s*=\s*['"]preload['"]/);
      
      if (hrefMatch) {
        stylesheets.push({
          href: hrefMatch[1],
          isPreloaded: !!preloadMatch,
          isExternal: hrefMatch[1].startsWith('http')
        });
      }
    });
    
    return stylesheets;
  }

  extractFonts(content) {
    const fonts = [];
    const fontMatches = content.match(/<link[^>]*rel\s*=\s*['"]font['"][^>]*>/g) || [];
    
    fontMatches.forEach(font => {
      const hrefMatch = font.match(/href\s*=\s*['"]([^'"]+)['"]/);
      if (hrefMatch) {
        fonts.push({
          href: hrefMatch[1],
          isExternal: hrefMatch[1].startsWith('http')
        });
      }
    });
    
    return fonts;
  }

  extractVideos(content) {
    const videos = [];
    const videoMatches = content.match(/<video[^>]*>/g) || [];
    
    videoMatches.forEach(video => {
      const srcMatch = video.match(/src\s*=\s*['"]([^'"]+)['"]/);
      const posterMatch = video.match(/poster\s*=\s*['"]([^'"]+)['"]/);
      const preloadMatch = video.match(/preload\s*=\s*['"]([^'"]+)['"]/);
      
      if (srcMatch) {
        videos.push({
          src: srcMatch[1],
          poster: posterMatch ? posterMatch[1] : '',
          preload: preloadMatch ? preloadMatch[1] : 'metadata'
        });
      }
    });
    
    return videos;
  }

  checkResourceOptimization(content, fileAnalysis) {
    const resources = fileAnalysis.resources;
    
    // Проверка количества ресурсов
    if (resources.images.length > 20) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много изображений (${resources.images.length}). Рассмотрите оптимизацию`,
        severity: 'MEDIUM'
      });
    }
    
    if (resources.scripts.length > 10) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много скриптов (${resources.scripts.length}). Рассмотрите объединение`,
        severity: 'MEDIUM'
      });
    }
    
    if (resources.stylesheets.length > 5) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много стилей (${resources.stylesheets.length}). Рассмотрите объединение`,
        severity: 'MEDIUM'
      });
    }
  }

  checkPerformanceIssues(content, fileAnalysis) {
    const performance = fileAnalysis.performance;
    
    // Проверка lazy loading
    if (fileAnalysis.resources.images.length > 0 && !performance.hasLazyLoading) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Изображения без lazy loading',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка preload
    if (!performance.hasPreload && fileAnalysis.resources.stylesheets.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствует preload для критических ресурсов',
        severity: 'LOW'
      });
    }
    
    // Проверка async/defer
    const blockingScripts = fileAnalysis.resources.scripts.filter(script => 
      !script.isAsync && !script.isDefer && script.isExternal
    );
    
    if (blockingScripts.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${blockingScripts.length} блокирующих внешних скриптов`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка resource hints
    if (!performance.hasResourceHints && fileAnalysis.resources.scripts.some(s => s.isExternal)) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Отсутствуют resource hints для внешних ресурсов',
        severity: 'LOW'
      });
    }
  }

  checkImageOptimization(content, fileAnalysis) {
    const images = fileAnalysis.resources.images;
    
    // Проверка alt атрибутов
    const imagesWithoutAlt = images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${imagesWithoutAlt.length} изображений без alt атрибутов`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка lazy loading
    const imagesWithoutLazy = images.filter(img => !img.hasLazyLoading);
    if (imagesWithoutLazy.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${imagesWithoutLazy.length} изображений без lazy loading`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка форматов изображений
    const nonOptimizedImages = images.filter(img => 
      !img.src.includes('.webp') && !img.src.includes('.avif')
    );
    
    if (nonOptimizedImages.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${nonOptimizedImages.length} изображений не в современных форматах`,
        severity: 'LOW'
      });
    }
  }

  checkScriptOptimization(content, fileAnalysis) {
    const scripts = fileAnalysis.resources.scripts;
    
    // Проверка внешних скриптов
    const externalScripts = scripts.filter(script => script.isExternal);
    if (externalScripts.length > 5) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много внешних скриптов (${externalScripts.length})`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка блокирующих скриптов
    const blockingScripts = scripts.filter(script => 
      !script.isAsync && !script.isDefer
    );
    
    if (blockingScripts.length > 3) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${blockingScripts.length} блокирующих скриптов`,
        severity: 'MEDIUM'
      });
    }
  }

  checkStyleOptimization(content, fileAnalysis) {
    const stylesheets = fileAnalysis.resources.stylesheets;
    
    // Проверка внешних стилей
    const externalStyles = stylesheets.filter(style => style.isExternal);
    if (externalStyles.length > 3) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много внешних стилей (${externalStyles.length})`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка preload для стилей
    const nonPreloadedStyles = stylesheets.filter(style => !style.isPreloaded);
    if (nonPreloadedStyles.length > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `${nonPreloadedStyles.length} стилей без preload`,
        severity: 'LOW'
      });
    }
  }

  generateReport() {
    console.log('\n📊 PERFORMANCE TEST ЗАВЕРШЕН');
    console.log('='.repeat(50));
    
    console.log(`📁 Файлов проанализировано: ${this.results.files.length}`);
    console.log(`📝 Общий размер HTML: ${(this.results.totalSize / 1024).toFixed(2)} KB`);
    console.log(`🖼️ Изображений: ${this.results.totalImages}`);
    console.log(`📜 Скриптов: ${this.results.totalScripts}`);
    console.log(`🎨 Стилей: ${this.results.totalStylesheets}`);
    
    const totalIssues = this.results.files.reduce((sum, file) => sum + file.issues.length, 0);
    console.log(`⚠️ Проблем найдено: ${totalIssues}`);
    
    if (totalIssues > 0) {
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
    console.log('\n💡 РЕКОМЕНДАЦИИ ПО ПРОИЗВОДИТЕЛЬНОСТИ:');
    
    const hasImageIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('изображений'))
    );
    
    if (hasImageIssues) {
      console.log('🖼️ Оптимизируйте изображения: используйте WebP/AVIF и lazy loading');
    }
    
    const hasScriptIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('скриптов'))
    );
    
    if (hasScriptIssues) {
      console.log('📜 Оптимизируйте скрипты: используйте async/defer и объединяйте файлы');
    }
    
    const hasStyleIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('стилей'))
    );
    
    if (hasStyleIssues) {
      console.log('🎨 Оптимизируйте стили: используйте preload и объединяйте файлы');
    }
    
    console.log('🚀 Общие рекомендации:');
    console.log('   • Используйте CDN для статических ресурсов');
    console.log('   • Включите сжатие (gzip/brotli)');
    console.log('   • Минифицируйте CSS и JS');
    console.log('   • Используйте resource hints (dns-prefetch, preconnect)');
    console.log('   • Оптимизируйте критические ресурсы');
  }
}

// Запуск тестирования
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.testPerformance();
}

module.exports = PerformanceTester;
