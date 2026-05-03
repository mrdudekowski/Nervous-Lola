#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class JavaScriptOptimizer {
    constructor() {
        this.optimizedFiles = [];
        this.errors = [];
        this.totalSavings = 0;
        this.consoleLogsRemoved = 0;
        this.unusedCodeRemoved = 0;
    }

    async optimizeAll() {
        console.log('⚡ Оптимизация JavaScript...\n');

        const jsFiles = this.findJSFiles('./assets/js');
        
        for (const file of jsFiles) {
            try {
                await this.optimizeFile(file);
            } catch (error) {
                this.errors.push({ file, error: error.message });
            }
        }

        this.generateReport();
    }

    findJSFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findJSFiles(fullPath));
            } else if (item.endsWith('.js')) {
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

        // 1. Удаляем console.log в продакшене
        const consoleLogRegex = /console\.(log|debug|info|warn|error)\([^)]*\);?\s*/g;
        const consoleLogs = content.match(consoleLogRegex);
        if (consoleLogs) {
            content = content.replace(consoleLogRegex, '');
            this.consoleLogsRemoved += consoleLogs.length;
            modified = true;
            console.log(`  ✅ Удалено ${consoleLogs.length} console.log`);
        }

        // 2. Удаляем комментарии
        const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
        const comments = content.match(commentRegex);
        if (comments) {
            content = content.replace(commentRegex, '');
            modified = true;
            console.log(`  ✅ Удалено ${comments.length} комментариев`);
        }

        // 3. Заменяем var на let/const
        const varRegex = /\bvar\s+(\w+)/g;
        const varMatches = content.match(varRegex);
        if (varMatches) {
            content = content.replace(/\bvar\s+/g, 'let ');
            modified = true;
            console.log(`  ✅ Заменено ${varMatches.length} var на let`);
        }

        // 4. Удаляем неиспользуемые функции
        const unusedFunctions = this.findUnusedFunctions(content);
        if (unusedFunctions.length > 0) {
            content = this.removeUnusedFunctions(content, unusedFunctions);
            this.unusedCodeRemoved += unusedFunctions.length;
            modified = true;
            console.log(`  ✅ Удалено ${unusedFunctions.length} неиспользуемых функций`);
        }

        // 5. Оптимизируем импорты
        content = this.optimizeImports(content);

        // 6. Минификация (базовая)
        content = this.minifyJS(content);

        // 7. Исправляем несбалансированные скобки
        const bracketFix = this.fixBrackets(content);
        if (bracketFix.fixed) {
            content = bracketFix.content;
            modified = true;
            console.log('  ✅ Исправлены несбалансированные скобки');
        }

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

    findUnusedFunctions(content) {
        const functions = [];
        const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1];
            const functionCallRegex = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
            const calls = content.match(functionCallRegex);
            
            if (!calls || calls.length <= 1) {
                functions.push({
                    name: functionName,
                    full: match[0]
                });
            }
        }
        
        return functions;
    }

    removeUnusedFunctions(content, unusedFunctions) {
        for (const func of unusedFunctions) {
            // Находим и удаляем всю функцию
            const functionRegex = new RegExp(`function\\s+${func.name}\\s*\\([^)]*\\)\\s*\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}`, 'g');
            content = content.replace(functionRegex, '');
        }
        
        return content;
    }

    optimizeImports(content) {
        // Удаляем неиспользуемые импорты
        const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?\s*/g;
        const imports = content.match(importRegex) || [];
        
        for (const importStatement of imports) {
            // Извлекаем импортируемые имена
            const importMatch = importStatement.match(/import\s+.*?from/);
            if (importMatch) {
                const importPart = importMatch[0];
                const importedNames = this.extractImportedNames(importPart);
                
                // Проверяем использование каждого импорта
                const unusedImports = importedNames.filter(name => {
                    const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
                    const matches = content.match(usageRegex);
                    return !matches || matches.length <= 1;
                });
                
                if (unusedImports.length > 0) {
                    console.log(`  ✅ Найдено ${unusedImports.length} неиспользуемых импортов`);
                }
            }
        }
        
        return content;
    }

    extractImportedNames(importPart) {
        const names = [];
        
        // Обрабатываем различные форматы импорта
        if (importPart.includes('{')) {
            const curlyMatch = importPart.match(/\{([^}]+)\}/);
            if (curlyMatch) {
                const imports = curlyMatch[1].split(',').map(imp => imp.trim().split(' as ')[0]);
                names.push(...imports);
            }
        } else if (importPart.includes('import ')) {
            const defaultMatch = importPart.match(/import\s+(\w+)/);
            if (defaultMatch) {
                names.push(defaultMatch[1]);
            }
        }
        
        return names;
    }

    minifyJS(content) {
        return content
            .replace(/\s+/g, ' ')
            .replace(/;\s*/g, ';')
            .replace(/{\s*/g, '{')
            .replace(/\s*}/g, '}')
            .replace(/,\s*/g, ',')
            .replace(/:\s*/g, ':')
            .trim();
    }

    fixBrackets(content) {
        let openCount = 0;
        let closeCount = 0;
        
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '(') openCount++;
            if (content[i] === ')') closeCount++;
        }

        if (openCount > closeCount) {
            const missing = openCount - closeCount;
            content += ')'.repeat(missing);
            return { fixed: true, content };
        }

        return { fixed: false, content };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateReport() {
        console.log('\n📊 ОТЧЕТ ОБ ОПТИМИЗАЦИИ JAVASCRIPT');
        console.log('==================================================');
        console.log(`✅ Оптимизировано файлов: ${this.optimizedFiles.length}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);
        console.log(`💰 Общая экономия: ${this.formatBytes(this.totalSavings)}`);
        console.log(`🗑️ Удалено console.log: ${this.consoleLogsRemoved}`);
        console.log(`🗑️ Удалено неиспользуемого кода: ${this.unusedCodeRemoved}`);
        
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

        console.log('\n🎉 Оптимизация JavaScript завершена!');
    }
}

// Запуск оптимизации
const optimizer = new JavaScriptOptimizer();
optimizer.optimizeAll().catch(console.error);
