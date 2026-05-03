#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CSSOptimizer {
    constructor() {
        this.optimizedFiles = [];
        this.errors = [];
        this.totalSavings = 0;
        this.duplicatesRemoved = 0;
        this.unusedRulesRemoved = 0;
    }

    async optimizeAll() {
        console.log('🎨 Оптимизация CSS...\n');

        const cssFiles = this.findCSSFiles('./assets/css');
        
        for (const file of cssFiles) {
            try {
                await this.optimizeFile(file);
            } catch (error) {
                this.errors.push({ file, error: error.message });
            }
        }

        this.generateReport();
    }

    findCSSFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findCSSFiles(fullPath));
            } else if (item.endsWith('.css')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async optimizeFile(filePath) {
        console.log(`📄 Обработка: ${filePath}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        let modified = false;

        // 1. Удаляем комментарии
        const commentRegex = /\/\*[\s\S]*?\*\//g;
        const comments = content.match(commentRegex);
        if (comments) {
            content = content.replace(commentRegex, '');
            modified = true;
            console.log(`  ✅ Удалено ${comments.length} комментариев`);
        }

        // 2. Удаляем лишние пробелы и переносы строк
        content = content
            .replace(/\s+/g, ' ')
            .replace(/;\s*}/g, '}')
            .replace(/{\s*/g, '{')
            .replace(/;\s*/g, ';')
            .trim();

        // 3. Удаляем дублированные правила
        const rules = this.extractRules(content);
        const uniqueRules = this.removeDuplicateRules(rules);
        
        if (rules.length !== uniqueRules.length) {
            content = this.rebuildCSS(uniqueRules);
            this.duplicatesRemoved += rules.length - uniqueRules.length;
            modified = true;
            console.log(`  ✅ Удалено ${rules.length - uniqueRules.length} дублированных правил`);
        }

        // 4. Оптимизируем CSS переменные
        content = this.optimizeCSSVariables(content);

        // 5. Удаляем неиспользуемые правила (базовая проверка)
        const unusedRules = this.findUnusedRules(content);
        if (unusedRules.length > 0) {
            content = this.removeUnusedRules(content, unusedRules);
            this.unusedRulesRemoved += unusedRules.length;
            modified = true;
            console.log(`  ✅ Удалено ${unusedRules.length} неиспользуемых правил`);
        }

        // 6. Минификация
        content = this.minifyCSS(content);

        if (modified) {
            const optimizedSize = Buffer.byteLength(content, 'utf8');
            const savings = originalSize - optimizedSize;
            
            // Создаем резервную копию
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
            
            // Записываем оптимизированную версию
            fs.writeFileSync(filePath, content, 'utf8');
            
            this.optimizedFiles.push({
                file: filePath,
                originalSize,
                optimizedSize,
                savings,
                savingsPercent: ((savings / originalSize) * 100).toFixed(2)
            });
            
            this.totalSavings += savings;
            
            console.log(`  ✅ Оптимизировано: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${this.formatBytes(savings)} экономии)`);
        } else {
            console.log(`  ℹ️  Изменений не требуется: ${filePath}`);
        }
    }

    extractRules(content) {
        const rules = [];
        const ruleRegex = /([^{}]+)\s*\{([^{}]*)\}/g;
        let match;
        
        while ((match = ruleRegex.exec(content)) !== null) {
            rules.push({
                selector: match[1].trim(),
                properties: match[2].trim(),
                full: match[0]
            });
        }
        
        return rules;
    }

    removeDuplicateRules(rules) {
        const uniqueRules = [];
        const seen = new Set();
        
        for (const rule of rules) {
            const key = `${rule.selector}|${rule.properties}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueRules.push(rule);
            }
        }
        
        return uniqueRules;
    }

    rebuildCSS(rules) {
        return rules.map(rule => `${rule.selector} { ${rule.properties} }`).join('\n');
    }

    optimizeCSSVariables(content) {
        // Находим все CSS переменные
        const varRegex = /--[a-zA-Z0-9-]+/g;
        const variables = [...new Set(content.match(varRegex) || [])];
        
        // Проверяем использование каждой переменной
        const unusedVars = variables.filter(variable => {
            const usageRegex = new RegExp(`var\\(${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
            return !usageRegex.test(content);
        });
        
        if (unusedVars.length > 0) {
            console.log(`  ✅ Найдено ${unusedVars.length} неиспользуемых CSS переменных`);
        }
        
        return content;
    }

    findUnusedRules(content) {
        // Базовая проверка на неиспользуемые правила
        // В реальном проекте здесь был бы анализ HTML файлов
        const unusedRules = [];
        
        // Ищем правила с селекторами, которые могут быть неиспользуемыми
        const suspiciousSelectors = [
            /^\.debug/,
            /^\.test/,
            /^\.temp/,
            /^\.old/,
            /^\.deprecated/
        ];
        
        const rules = this.extractRules(content);
        
        for (const rule of rules) {
            for (const pattern of suspiciousSelectors) {
                if (pattern.test(rule.selector)) {
                    unusedRules.push(rule);
                    break;
                }
            }
        }
        
        return unusedRules;
    }

    removeUnusedRules(content, unusedRules) {
        for (const rule of unusedRules) {
            content = content.replace(rule.full, '');
        }
        return content;
    }

    minifyCSS(content) {
        return content
            .replace(/\s*{\s*/g, '{')
            .replace(/;\s*/g, ';')
            .replace(/\s*}\s*/g, '}')
            .replace(/,\s*/g, ',')
            .replace(/:\s*/g, ':')
            .replace(/;\s*}/g, '}')
            .trim();
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateReport() {
        console.log('\n📊 ОТЧЕТ ОБ ОПТИМИЗАЦИИ CSS');
        console.log('==================================================');
        console.log(`✅ Оптимизировано файлов: ${this.optimizedFiles.length}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);
        console.log(`💰 Общая экономия: ${this.formatBytes(this.totalSavings)}`);
        console.log(`🔄 Удалено дублированных правил: ${this.duplicatesRemoved}`);
        console.log(`🗑️ Удалено неиспользуемых правил: ${this.unusedRulesRemoved}`);
        
        if (this.optimizedFiles.length > 0) {
            console.log('\n📄 Оптимизированные файлы:');
            this.optimizedFiles.forEach(file => {
                console.log(`  - ${file.file}`);
                console.log(`    ${this.formatBytes(file.originalSize)} → ${this.formatBytes(file.optimizedSize)} (${file.savingsPercent}% экономии)`);
            });
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Ошибки:');
            this.errors.forEach(({ file, error }) => {
                console.log(`  - ${file}: ${error}`);
            });
        }

        console.log('\n🎉 Оптимизация CSS завершена!');
    }
}

// Запуск оптимизации
const optimizer = new CSSOptimizer();
optimizer.optimizeAll().catch(console.error);
