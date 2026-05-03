#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class JSAnalyzer {
  constructor() {
    this.results = {
      files: [],
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      performance: {
        totalSize: 0,
        totalFunctions: 0,
        totalVariables: 0
      }
    };
  }

  analyzeJS() {
    console.log('🔍 JavaScript Analyzer запущен...');
    
    const jsFiles = this.findJSFiles();
    
    for (const file of jsFiles) {
      this.analyzeFile(file);
    }
    
    this.generateReport();
    return this.results;
  }

  findJSFiles() {
    const files = [];
    const rootDir = path.join(__dirname, '..');
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(itemPath);
        } else if (item.endsWith('.js')) {
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
        lines: content.split('\n').length,
        issues: [],
        functions: [],
        variables: [],
        imports: [],
        exports: [],
        performance: this.analyzePerformance(content),
        security: this.analyzeSecurity(content),
        bestPractices: this.analyzeBestPractices(content)
      };

      // Анализ синтаксиса и структуры
      this.analyzeSyntax(content, fileAnalysis);
      
      // Анализ функций
      this.analyzeFunctions(content, fileAnalysis);
      
      // Анализ переменных
      this.analyzeVariables(content, fileAnalysis);
      
      // Анализ импортов/экспортов
      this.analyzeImportsExports(content, fileAnalysis);
      
      // Анализ производительности
      this.checkPerformance(content, fileAnalysis);
      
      // Анализ безопасности
      this.checkSecurity(content, fileAnalysis);
      
      // Анализ лучших практик
      this.checkBestPractices(content, fileAnalysis);

      this.results.files.push(fileAnalysis);
      this.results.totalIssues += fileAnalysis.issues.length;
      this.results.performance.totalSize += fileAnalysis.size;
      this.results.performance.totalFunctions += fileAnalysis.functions.length;
      this.results.performance.totalVariables += fileAnalysis.variables.length;
      
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

  analyzePerformance(content) {
    return {
      hasAsyncAwait: content.includes('async') && content.includes('await'),
      hasPromises: content.includes('Promise'),
      hasSetTimeout: content.includes('setTimeout'),
      hasSetInterval: content.includes('setInterval'),
      hasEventListeners: (content.match(/addEventListener/g) || []).length,
      hasQuerySelector: (content.match(/querySelector/g) || []).length,
      hasGetElementById: (content.match(/getElementById/g) || []).length,
      hasConsoleLog: (content.match(/console\.log/g) || []).length
    };
  }

  analyzeSecurity(content) {
    return {
      hasEval: content.includes('eval('),
      hasInnerHTML: content.includes('innerHTML'),
      hasDocumentWrite: content.includes('document.write'),
      hasSetTimeout: content.includes('setTimeout'),
      hasSetInterval: content.includes('setInterval'),
      hasGlobalVariables: this.findGlobalVariables(content),
      hasUnsafeDOM: this.findUnsafeDOM(content)
    };
  }

  analyzeBestPractices(content) {
    return {
      hasStrictMode: content.includes('"use strict"'),
      hasVarDeclarations: (content.match(/\bvar\s+/g) || []).length,
      hasLetDeclarations: (content.match(/\blet\s+/g) || []).length,
      hasConstDeclarations: (content.match(/\bconst\s+/g) || []).length,
      hasFunctionDeclarations: (content.match(/function\s+\w+/g) || []).length,
      hasArrowFunctions: (content.match(/=>/g) || []).length,
      hasTemplateLiterals: (content.match(/`[^`]*`/g) || []).length,
      hasDestructuring: content.includes('{') && content.includes('}') && content.includes('='),
      hasSpreadOperator: content.includes('...'),
      hasOptionalChaining: content.includes('?.')
    };
  }

  analyzeSyntax(content, fileAnalysis) {
    // Проверка на синтаксические ошибки
    try {
      // Простая проверка на незакрытые скобки
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        fileAnalysis.issues.push({
          type: 'ERROR',
          message: `Несбалансированные фигурные скобки: открыто ${openBraces}, закрыто ${closeBraces}`,
          severity: 'CRITICAL'
        });
      }
      
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        fileAnalysis.issues.push({
          type: 'ERROR',
          message: `Несбалансированные круглые скобки: открыто ${openParens}, закрыто ${closeParens}`,
          severity: 'CRITICAL'
        });
      }
      
    } catch (error) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: `Синтаксическая ошибка: ${error.message}`,
        severity: 'CRITICAL'
      });
    }
  }

  analyzeFunctions(content, fileAnalysis) {
    // Поиск объявлений функций
    const functionMatches = content.match(/function\s+(\w+)\s*\(/g) || [];
    const arrowFunctionMatches = content.match(/(\w+)\s*=>/g) || [];
    const methodMatches = content.match(/(\w+)\s*:\s*function/g) || [];
    
    functionMatches.forEach(match => {
      const name = match.match(/function\s+(\w+)/)[1];
      fileAnalysis.functions.push({
        name: name,
        type: 'function',
        line: this.getLineNumber(content, match)
      });
    });
    
    arrowFunctionMatches.forEach(match => {
      const name = match.match(/(\w+)\s*=>/)[1];
      fileAnalysis.functions.push({
        name: name,
        type: 'arrow',
        line: this.getLineNumber(content, match)
      });
    });
    
    methodMatches.forEach(match => {
      const name = match.match(/(\w+)\s*:/)[1];
      fileAnalysis.functions.push({
        name: name,
        type: 'method',
        line: this.getLineNumber(content, match)
      });
    });
  }

  analyzeVariables(content, fileAnalysis) {
    // Поиск объявлений переменных
    const varMatches = content.match(/\bvar\s+(\w+)/g) || [];
    const letMatches = content.match(/\blet\s+(\w+)/g) || [];
    const constMatches = content.match(/\bconst\s+(\w+)/g) || [];
    
    varMatches.forEach(match => {
      const name = match.match(/\bvar\s+(\w+)/)[1];
      fileAnalysis.variables.push({
        name: name,
        type: 'var',
        line: this.getLineNumber(content, match)
      });
    });
    
    letMatches.forEach(match => {
      const name = match.match(/\blet\s+(\w+)/)[1];
      fileAnalysis.variables.push({
        name: name,
        type: 'let',
        line: this.getLineNumber(content, match)
      });
    });
    
    constMatches.forEach(match => {
      const name = match.match(/\bconst\s+(\w+)/)[1];
      fileAnalysis.variables.push({
        name: name,
        type: 'const',
        line: this.getLineNumber(content, match)
      });
    });
  }

  analyzeImportsExports(content, fileAnalysis) {
    // Поиск импортов
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    importMatches.forEach(match => {
      const module = match.match(/from\s+['"]([^'"]+)['"]/)[1];
      fileAnalysis.imports.push({
        module: module,
        line: this.getLineNumber(content, match)
      });
    });
    
    // Поиск экспортов
    const exportMatches = content.match(/export\s+(default\s+)?(function|const|let|var|class)/g) || [];
    exportMatches.forEach(match => {
      fileAnalysis.exports.push({
        type: match.includes('default') ? 'default' : 'named',
        line: this.getLineNumber(content, match)
      });
    });
  }

  checkPerformance(content, fileAnalysis) {
    const performance = fileAnalysis.performance;
    
    // Проверка на console.log в продакшене
    if (performance.hasConsoleLog) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Найдены console.log. Удалите их в продакшене',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на частые DOM запросы
    if (performance.hasQuerySelector > 10) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Много DOM запросов (${performance.hasQuerySelector}). Кэшируйте элементы`,
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на таймеры
    if (performance.hasSetInterval) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Использование setInterval может влиять на производительность',
        severity: 'LOW'
      });
    }
  }

  checkSecurity(content, fileAnalysis) {
    const security = fileAnalysis.security;
    
    // Проверка на eval
    if (security.hasEval) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        message: 'Использование eval() небезопасно',
        severity: 'CRITICAL'
      });
    }
    
    // Проверка на innerHTML
    if (security.hasInnerHTML) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Использование innerHTML может быть небезопасно. Используйте textContent',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на document.write
    if (security.hasDocumentWrite) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'document.write() устарел и может влиять на производительность',
        severity: 'MEDIUM'
      });
    }
  }

  checkBestPractices(content, fileAnalysis) {
    const bestPractices = fileAnalysis.bestPractices;
    
    // Проверка на strict mode
    if (!bestPractices.hasStrictMode) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Рекомендуется использовать "use strict"',
        severity: 'LOW'
      });
    }
    
    // Проверка на var
    if (bestPractices.hasVarDeclarations > 0) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: `Использование var (${bestPractices.hasVarDeclarations}). Предпочитайте let/const`,
        severity: 'LOW'
      });
    }
    
    // Проверка на современные возможности
    if (!bestPractices.hasTemplateLiterals && content.includes('"') && content.includes('+')) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        message: 'Рассмотрите использование template literals вместо конкатенации строк',
        severity: 'LOW'
      });
    }
  }

  findGlobalVariables(content) {
    // Простой поиск глобальных переменных
    const globalMatches = content.match(/window\.(\w+)/g) || [];
    return globalMatches.map(match => match.replace('window.', ''));
  }

  findUnsafeDOM(content) {
    // Поиск потенциально небезопасных DOM операций
    const unsafePatterns = [
      'innerHTML',
      'outerHTML',
      'document.write',
      'eval(',
      'Function('
    ];
    
    return unsafePatterns.filter(pattern => content.includes(pattern));
  }

  getLineNumber(content, match) {
    const lines = content.substring(0, content.indexOf(match)).split('\n');
    return lines.length;
  }

  generateReport() {
    console.log('\n📊 JAVASCRIPT АНАЛИЗ ЗАВЕРШЕН');
    console.log('='.repeat(50));
    
    console.log(`📁 Файлов проанализировано: ${this.results.files.length}`);
    console.log(`📝 Общий размер: ${(this.results.performance.totalSize / 1024).toFixed(2)} KB`);
    console.log(`🔧 Функций: ${this.results.performance.totalFunctions}`);
    console.log(`📦 Переменных: ${this.results.performance.totalVariables}`);
    console.log(`⚠️ Проблем найдено: ${this.results.totalIssues}`);
    
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
    
    const hasSecurityIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('eval') || issue.message.includes('innerHTML'))
    );
    
    if (hasSecurityIssues) {
      console.log('🔒 Исправьте проблемы безопасности: избегайте eval() и небезопасных DOM операций');
    }
    
    const hasPerformanceIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('console.log') || issue.message.includes('DOM запросов'))
    );
    
    if (hasPerformanceIssues) {
      console.log('⚡ Оптимизируйте производительность: удалите console.log и кэшируйте DOM элементы');
    }
    
    const hasBestPracticeIssues = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('var') || issue.message.includes('template literals'))
    );
    
    if (hasBestPracticeIssues) {
      console.log('📚 Следуйте лучшим практикам: используйте let/const и современные возможности ES6+');
    }
  }
}

// Запуск анализа
if (require.main === module) {
  const analyzer = new JSAnalyzer();
  analyzer.analyzeJS();
}

module.exports = JSAnalyzer;
