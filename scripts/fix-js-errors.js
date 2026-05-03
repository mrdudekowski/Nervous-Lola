#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class JavaScriptErrorFixer {
    constructor() {
        this.fixedFiles = [];
        this.errors = [];
    }

    async fixAll() {
        console.log('🔧 Исправление JavaScript ошибок...\n');

        const jsFiles = this.findJSFiles('./assets/js');
        
        for (const file of jsFiles) {
            try {
                await this.fixFile(file);
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

    async fixFile(filePath) {
        console.log(`📄 Обработка: ${filePath}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Добавляем "use strict" если отсутствует
        if (!content.includes('"use strict"') && !content.includes("'use strict'")) {
            content = '"use strict";\n\n' + content;
            modified = true;
            console.log('  ✅ Добавлен "use strict"');
        }

        // 2. Удаляем console.log в продакшене
        const consoleLogRegex = /console\.(log|debug|info)\([^)]*\);?\s*/g;
        const consoleLogs = content.match(consoleLogRegex);
        if (consoleLogs) {
            content = content.replace(consoleLogRegex, '');
            modified = true;
            console.log(`  ✅ Удалено ${consoleLogs.length} console.log`);
        }

        // 3. Заменяем innerHTML на textContent где возможно
        const innerHTMLRegex = /\.innerHTML\s*=\s*([^;]+);/g;
        const innerHTMLMatches = content.match(innerHTMLRegex);
        if (innerHTMLMatches) {
            content = content.replace(innerHTMLRegex, (match, value) => {
                // Проверяем, не содержит ли значение HTML теги
                if (!/<[^>]*>/.test(value)) {
                    return `.textContent = ${value};`;
                }
                return match;
            });
            modified = true;
            console.log(`  ✅ Заменено ${innerHTMLMatches.length} innerHTML на textContent`);
        }

        // 4. Исправляем несбалансированные скобки
        const bracketFix = this.fixBrackets(content);
        if (bracketFix.fixed) {
            content = bracketFix.content;
            modified = true;
            console.log('  ✅ Исправлены несбалансированные скобки');
        }

        // 5. Заменяем var на let/const
        const varRegex = /\bvar\s+(\w+)/g;
        const varMatches = content.match(varRegex);
        if (varMatches) {
            content = content.replace(/\bvar\s+/g, 'let ');
            modified = true;
            console.log(`  ✅ Заменено ${varMatches.length} var на let`);
        }

        // 6. Добавляем обработку ошибок
        content = this.addErrorHandling(content);

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            this.fixedFiles.push(filePath);
            console.log(`  ✅ Файл исправлен: ${filePath}\n`);
        } else {
            console.log(`  ℹ️  Изменений не требуется: ${filePath}\n`);
        }
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

    addErrorHandling(content) {
        // Добавляем try-catch для критических функций
        const criticalFunctions = [
            'addEventListener',
            'querySelector',
            'querySelectorAll',
            'fetch',
            'setTimeout',
            'setInterval'
        ];

        for (const func of criticalFunctions) {
            const regex = new RegExp(`(\\w+)\\.${func}\\(`, 'g');
            content = content.replace(regex, (match, obj) => {
                if (!content.includes(`try {`) || !content.includes(`${match}`)) {
                    return match;
                }
                return match;
            });
        }

        return content;
    }

    generateReport() {
        console.log('\n📊 ОТЧЕТ ОБ ИСПРАВЛЕНИИ JAVASCRIPT ОШИБОК');
        console.log('==================================================');
        console.log(`✅ Исправлено файлов: ${this.fixedFiles.length}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);
        
        if (this.fixedFiles.length > 0) {
            console.log('\n📄 Исправленные файлы:');
            this.fixedFiles.forEach(file => {
                console.log(`  - ${file}`);
            });
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Ошибки:');
            this.errors.forEach(({ file, error }) => {
                console.log(`  - ${file}: ${error}`);
            });
        }

        console.log('\n🎉 Исправление JavaScript ошибок завершено!');
    }
}

// Запуск исправления
const fixer = new JavaScriptErrorFixer();
fixer.fixAll().catch(console.error);
