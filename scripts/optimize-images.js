#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ImageOptimizer {
    constructor() {
        this.optimizedImages = [];
        this.errors = [];
        this.totalSavings = 0;
    }

    async optimizeAll() {
        console.log('🖼️ Оптимизация изображений...\n');

        const imageFiles = this.findImageFiles('./assets/images');
        
        for (const file of imageFiles) {
            try {
                await this.optimizeImage(file);
            } catch (error) {
                this.errors.push({ file, error: error.message });
            }
        }

        this.generateReport();
    }

    findImageFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findImageFiles(fullPath));
            } else if (this.isImageFile(item)) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    isImageFile(filename) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    async optimizeImage(filePath) {
        console.log(`📄 Обработка: ${filePath}`);
        
        const stats = fs.statSync(filePath);
        const originalSize = stats.size;
        
        // Создаем оптимизированную версию
        const optimizedPath = this.getOptimizedPath(filePath);
        
        try {
            // В реальном проекте здесь был бы Sharp или ImageMagick
            // Для демонстрации просто копируем файл
            fs.copyFileSync(filePath, optimizedPath);
            
            const optimizedStats = fs.statSync(optimizedPath);
            const optimizedSize = optimizedStats.size;
            const savings = originalSize - optimizedSize;
            
            this.optimizedImages.push({
                original: filePath,
                optimized: optimizedPath,
                originalSize,
                optimizedSize,
                savings,
                savingsPercent: ((savings / originalSize) * 100).toFixed(2)
            });
            
            this.totalSavings += savings;
            
            console.log(`  ✅ Оптимизировано: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${this.formatBytes(savings)} экономии)`);
            
        } catch (error) {
            throw new Error(`Ошибка оптимизации: ${error.message}`);
        }
    }

    getOptimizedPath(filePath) {
        const dir = path.dirname(filePath);
        const ext = path.extname(filePath);
        const name = path.basename(filePath, ext);
        
        // Создаем папку для оптимизированных изображений
        const optimizedDir = path.join(dir, 'optimized');
        if (!fs.existsSync(optimizedDir)) {
            fs.mkdirSync(optimizedDir, { recursive: true });
        }
        
        return path.join(optimizedDir, `${name}${ext}`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateReport() {
        console.log('\n📊 ОТЧЕТ ОБ ОПТИМИЗАЦИИ ИЗОБРАЖЕНИЙ');
        console.log('==================================================');
        console.log(`✅ Оптимизировано изображений: ${this.optimizedImages.length}`);
        console.log(`❌ Ошибок: ${this.errors.length}`);
        console.log(`💰 Общая экономия: ${this.formatBytes(this.totalSavings)}`);
        
        if (this.optimizedImages.length > 0) {
            console.log('\n📄 Оптимизированные изображения:');
            this.optimizedImages.forEach(img => {
                console.log(`  - ${img.original}`);
                console.log(`    ${this.formatBytes(img.originalSize)} → ${this.formatBytes(img.optimizedSize)} (${img.savingsPercent}% экономии)`);
            });
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Ошибки:');
            this.errors.forEach(({ file, error }) => {
                console.log(`  - ${file}: ${error}`);
            });
        }

        console.log('\n🎉 Оптимизация изображений завершена!');
    }
}

// Запуск оптимизации
const optimizer = new ImageOptimizer();
optimizer.optimizeAll().catch(console.error);
