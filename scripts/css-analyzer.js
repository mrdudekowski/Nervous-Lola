#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cssTree = require('css-tree');

class CSSAnalyzer {
  constructor() {
    this.results = {
      files: [],
      totalRules: 0,
      totalSelectors: 0,
      totalProperties: 0,
      issues: [],
      recommendations: []
    };
  }

  analyzeCSS() {
    console.log('🔍 CSS Analyzer запущен...');
    
    const cssDir = path.join(__dirname, '../assets/css');
    this.analyzeDirectory(cssDir);
    
    this.generateReport();
    return this.results;
  }

  analyzeDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.analyzeDirectory(filePath);
      } else if (file.endsWith('.css')) {
        this.analyzeFile(filePath);
      }
    }
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ast = cssTree.parse(content);
      
      const fileAnalysis = {
        path: path.relative(process.cwd(), filePath),
        size: content.length,
        rules: 0,
        selectors: 0,
        properties: 0,
        issues: [],
        variables: [],
        mediaQueries: []
      };

      cssTree.walk(ast, (node) => {
        if (node.type === 'Rule') {
          fileAnalysis.rules++;
          this.results.totalRules++;
          
          if (node.prelude) {
            cssTree.walk(node.prelude, (selector) => {
              if (selector.type === 'Selector') {
                fileAnalysis.selectors++;
                this.results.totalSelectors++;
                this.analyzeSelector(selector, fileAnalysis);
              }
            });
          }
          
          if (node.block) {
            cssTree.walk(node.block, (declaration) => {
              if (declaration.type === 'Declaration') {
                fileAnalysis.properties++;
                this.results.totalProperties++;
                this.analyzeProperty(declaration, fileAnalysis);
              }
            });
          }
        }
        
        if (node.type === 'CustomProperty') {
          fileAnalysis.variables.push(node.name);
        }
        
        if (node.type === 'Atrule' && node.name === 'media') {
          fileAnalysis.mediaQueries.push(node.prelude);
        }
      });

      this.results.files.push(fileAnalysis);
      
    } catch (error) {
      this.results.issues.push({
        type: 'ERROR',
        file: path.relative(process.cwd(), filePath),
        message: `Ошибка парсинга: ${error.message}`,
        severity: 'HIGH'
      });
    }
  }

  analyzeSelector(selector, fileAnalysis) {
    const selectorText = cssTree.generate(selector);
    
    // Проверка на избыточную специфичность
    if (this.calculateSpecificity(selector) > 3) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        selector: selectorText,
        message: 'Высокая специфичность селектора',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на ID селекторы
    if (selectorText.includes('#')) {
      fileAnalysis.issues.push({
        type: 'ERROR',
        selector: selectorText,
        message: 'Использование ID селекторов запрещено',
        severity: 'HIGH'
      });
    }
  }

  analyzeProperty(declaration, fileAnalysis) {
    const property = declaration.property;
    const value = cssTree.generate(declaration.value);
    
    // Проверка на hex цвета
    if (value.includes('#')) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        property: property,
        value: value,
        message: 'Использование hex цветов. Рекомендуется использовать CSS переменные',
        severity: 'MEDIUM'
      });
    }
    
    // Проверка на !important
    if (declaration.important) {
      fileAnalysis.issues.push({
        type: 'WARNING',
        property: property,
        value: value,
        message: 'Использование !important не рекомендуется',
        severity: 'MEDIUM'
      });
    }
  }

  calculateSpecificity(selector) {
    let specificity = 0;
    
    cssTree.walk(selector, (node) => {
      if (node.type === 'IdSelector') {
        specificity += 100;
      } else if (node.type === 'ClassSelector' || node.type === 'AttributeSelector') {
        specificity += 10;
      } else if (node.type === 'TypeSelector') {
        specificity += 1;
      }
    });
    
    return specificity;
  }

  generateReport() {
    console.log('\n📊 CSS АНАЛИЗ ЗАВЕРШЕН');
    console.log('='.repeat(50));
    
    console.log(`📁 Файлов проанализировано: ${this.results.files.length}`);
    console.log(`📝 Правил CSS: ${this.results.totalRules}`);
    console.log(`🎯 Селекторов: ${this.results.totalSelectors}`);
    console.log(`⚙️ Свойств: ${this.results.totalProperties}`);
    
    const totalIssues = this.results.files.reduce((sum, file) => sum + file.issues.length, 0);
    console.log(`⚠️ Проблем найдено: ${totalIssues}`);
    
    if (totalIssues > 0) {
      console.log('\n🔍 ДЕТАЛИ ПРОБЛЕМ:');
      this.results.files.forEach(file => {
        if (file.issues.length > 0) {
          console.log(`\n📄 ${file.path}:`);
          file.issues.forEach(issue => {
            const icon = issue.severity === 'HIGH' ? '🔴' : '🟡';
            console.log(`  ${icon} ${issue.message}`);
            if (issue.selector) console.log(`     Селектор: ${issue.selector}`);
            if (issue.property) console.log(`     Свойство: ${issue.property}`);
          });
        }
      });
    }
    
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 РЕКОМЕНДАЦИИ:');
    
    const hasHexColors = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('hex цветов'))
    );
    
    if (hasHexColors) {
      console.log('🎨 Замените hex цвета на CSS переменные для лучшей поддержки тем');
    }
    
    const hasImportant = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('!important'))
    );
    
    if (hasImportant) {
      console.log('⚡ Уберите !important и используйте более специфичные селекторы');
    }
    
    const hasIdSelectors = this.results.files.some(file => 
      file.issues.some(issue => issue.message.includes('ID селекторов'))
    );
    
    if (hasIdSelectors) {
      console.log('🆔 Замените ID селекторы на классы для лучшей переиспользуемости');
    }
  }
}

// Запуск анализа
if (require.main === module) {
  const analyzer = new CSSAnalyzer();
  analyzer.analyzeCSS();
}

module.exports = CSSAnalyzer;
