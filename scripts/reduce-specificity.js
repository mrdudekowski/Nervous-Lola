#!/usr/bin/env node

/**
 * CSS Selector Specificity Reduction Script
 * Reduces high-specificity selectors using BEM methodology and simplification
 * 
 * Usage: node scripts/reduce-specificity.js [file-path]
 * If no file path provided, processes all CSS files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class SpecificityReducer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      selectorsProcessed: 0,
      selectorsReduced: 0,
      filesChanged: 0
    };
    
    // BEM component mapping
    this.componentMap = {
      'navbar': 'navbar',
      'hero': 'hero',
      'footer': 'footer',
      'menu': 'menu',
      'maps': 'maps',
      'carousel': 'carousel',
      'gallery': 'gallery',
      'video': 'video',
      'about': 'about',
      'cafe': 'cafe'
    };
  }

  /**
   * Calculate selector specificity
   * @param {string} selector - CSS selector
   * @returns {number} Specificity score
   */
  calculateSpecificity(selector) {
    // Remove pseudo-elements and pseudo-classes for basic calculation
    const cleanSelector = selector.replace(/::?[a-zA-Z-]+/g, '');
    
    // Count IDs, classes, and elements
    const ids = (cleanSelector.match(/#[a-zA-Z-]+/g) || []).length;
    const classes = (cleanSelector.match(/\.[a-zA-Z-]+/g) || []).length;
    const elements = (cleanSelector.match(/^[a-zA-Z]+|(?<=\s)[a-zA-Z]+/g) || []).length;
    
    // Weight: IDs=100, Classes=10, Elements=1
    return ids * 100 + classes * 10 + elements;
  }

  /**
   * Check if selector can be converted to BEM
   * @param {string} selector - CSS selector
   * @returns {boolean} Can convert to BEM
   */
  canConvertToBEM(selector) {
    // Simple BEM conversion rules
    const parts = selector.split(' ');
    
    // Must have 2-3 parts for BEM conversion
    if (parts.length < 2 || parts.length > 3) {
      return false;
    }
    
    // Check if first part is a component
    const firstPart = parts[0].replace('.', '');
    return Object.keys(this.componentMap).some(component => 
      firstPart.includes(component)
    );
  }

  /**
   * Convert selector to BEM methodology
   * @param {string} selector - Original selector
   * @returns {string} BEM selector
   */
  convertToBEM(selector) {
    const parts = selector.split(' ');
    
    if (parts.length === 2) {
      const [parent, child] = parts;
      const parentName = parent.replace('.', '');
      const childName = child.replace('.', '');
      
      // Convert to BEM element
      return `.${parentName}__${childName}`;
    }
    
    if (parts.length === 3) {
      const [parent, child, modifier] = parts;
      const parentName = parent.replace('.', '');
      const childName = child.replace('.', '');
      const modifierName = modifier.replace('.', '');
      
      // Convert to BEM element with modifier
      return `.${parentName}__${childName}--${modifierName}`;
    }
    
    return selector;
  }

  /**
   * Simplify complex selector
   * @param {string} selector - Original selector
   * @returns {string} Simplified selector
   */
  simplifySelector(selector) {
    const parts = selector.split(' ');
    
    // If too many parts, take the most specific one
    if (parts.length > 4) {
      // Find the most specific part (usually the last one)
      return parts[parts.length - 1];
    }
    
    // Remove redundant nesting
    if (parts.length > 2) {
      // Keep parent and child, remove middle parts
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }
    
    return selector;
  }

  /**
   * Process CSS content and reduce specificity
   * @param {string} content - CSS content
   * @returns {Object} Processed content and statistics
   */
  processCSSContent(content) {
    let processedContent = content;
    let changes = 0;
    
    // Find all CSS rules
    const ruleRegex = /([^{}]+)\s*\{[^{}]*\}/g;
    const rules = [];
    let match;
    
    while ((match = ruleRegex.exec(content)) !== null) {
      rules.push({
        fullMatch: match[0],
        selector: match[1].trim(),
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Process each rule
    for (const rule of rules) {
      const specificity = this.calculateSpecificity(rule.selector);
      
      // Only process high-specificity selectors (> 20)
      if (specificity > 20) {
        let newSelector = rule.selector;
        
        // Try BEM conversion first
        if (this.canConvertToBEM(rule.selector)) {
          newSelector = this.convertToBEM(rule.selector);
        } else {
          // Fall back to simplification
          newSelector = this.simplifySelector(rule.selector);
        }
        
        // Only replace if selector actually changed
        if (newSelector !== rule.selector) {
          const newRule = rule.fullMatch.replace(rule.selector, newSelector);
          processedContent = processedContent.replace(rule.fullMatch, newRule);
          changes++;
          
          console.log(`  🔄 ${rule.selector} → ${newSelector} (specificity: ${specificity})`);
        }
        
        this.stats.selectorsProcessed++;
      }
    }
    
    return {
      content: processedContent,
      changes: changes
    };
  }

  /**
   * Process a single CSS file
   * @param {string} filePath - Path to CSS file
   * @returns {number} Number of changes made
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.processCSSContent(content);
      
      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content);
        this.stats.filesChanged++;
        this.stats.selectorsReduced += result.changes;
        console.log(`✅ ${filePath}: ${result.changes} selectors optimized`);
      } else {
        console.log(`⚪ ${filePath}: No high-specificity selectors found`);
      }
      
      this.stats.filesProcessed++;
      return result.changes;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return 0;
    }
  }

  /**
   * Process all CSS files in the project
   */
  async processAllFiles() {
    const cssFiles = glob.sync('assets/css/**/*.css');
    
    console.log(`🔍 Found ${cssFiles.length} CSS files to process...\n`);
    
    for (const file of cssFiles) {
      console.log(`📄 Processing ${file}...`);
      await this.processFile(file);
      console.log('');
    }
    
    this.printSummary();
  }

  /**
   * Generate specificity report
   */
  generateSpecificityReport() {
    console.log('\n📊 SPECIFICITY ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    const cssFiles = glob.sync('assets/css/**/*.css');
    const allSelectors = [];
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const ruleRegex = /([^{}]+)\s*\{[^{}]*\}/g;
      let match;
      
      while ((match = ruleRegex.exec(content)) !== null) {
        const selector = match[1].trim();
        const specificity = this.calculateSpecificity(selector);
        
        allSelectors.push({
          file: file,
          selector: selector,
          specificity: specificity
        });
      }
    }
    
    // Sort by specificity (highest first)
    allSelectors.sort((a, b) => b.specificity - a.specificity);
    
    // Show top 20 highest specificity selectors
    console.log('🔝 TOP 20 HIGHEST SPECIFICITY SELECTORS:');
    console.log('-'.repeat(60));
    
    allSelectors.slice(0, 20).forEach((item, index) => {
      const status = item.specificity > 20 ? '🔴' : item.specificity > 10 ? '🟡' : '🟢';
      console.log(`${status} ${item.specificity.toString().padStart(3)} | ${item.selector.padEnd(40)} | ${item.file}`);
    });
    
    // Statistics
    const highSpecificity = allSelectors.filter(s => s.specificity > 20).length;
    const mediumSpecificity = allSelectors.filter(s => s.specificity > 10 && s.specificity <= 20).length;
    const lowSpecificity = allSelectors.filter(s => s.specificity <= 10).length;
    
    console.log('\n📈 SPECIFICITY DISTRIBUTION:');
    console.log(`🔴 High (>20): ${highSpecificity} selectors`);
    console.log(`🟡 Medium (10-20): ${mediumSpecificity} selectors`);
    console.log(`🟢 Low (≤10): ${lowSpecificity} selectors`);
    console.log(`📊 Total: ${allSelectors.length} selectors`);
  }

  /**
   * Print processing summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 SPECIFICITY REDUCTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Selectors processed: ${this.stats.selectorsProcessed}`);
    console.log(`Selectors reduced: ${this.stats.selectorsReduced}`);
    console.log(`Files changed: ${this.stats.filesChanged}`);
    console.log('='.repeat(50));
    
    if (this.stats.selectorsReduced > 0) {
      console.log('\n🎉 Specificity reduction completed successfully!');
      console.log('💡 Next steps:');
      console.log('   1. Run: npm run lint:css');
      console.log('   2. Test visually: python -m http.server 8000');
      console.log('   3. Run specificity report: node scripts/reduce-specificity.js --report');
    } else {
      console.log('\n⚪ No high-specificity selectors found to optimize.');
    }
  }

  /**
   * Create BEM documentation
   */
  createBEMDocumentation() {
    const bemDoc = `# BEM Methodology Implementation

## Overview
This project uses BEM (Block Element Modifier) methodology for CSS class naming.

## Naming Convention
- **Block**: Standalone component (e.g., \`navbar\`, \`hero\`, \`footer\`)
- **Element**: Part of a block (e.g., \`navbar__brand\`, \`hero__title\`)
- **Modifier**: Variation of a block or element (e.g., \`navbar--scrolled\`, \`hero__title--large\`)

## Examples

### Navigation Component
\`\`\`css
/* Block */
.navbar { }

/* Element */
.navbar__brand { }
.navbar__nav { }
.navbar__link { }

/* Modifier */
.navbar--scrolled { }
.navbar__link--active { }
\`\`\`

### Hero Component
\`\`\`css
/* Block */
.hero { }

/* Element */
.hero__content { }
.hero__title { }
.hero__cta { }

/* Modifier */
.hero--fullscreen { }
.hero__title--large { }
\`\`\`

## Benefits
- Lower specificity
- Better maintainability
- Clear component structure
- Easier to understand and modify
`;

    fs.writeFileSync('BEM_METHODOLOGY.md', bemDoc);
    console.log('✅ Created BEM_METHODOLOGY.md documentation');
  }
}

// Main execution
async function main() {
  const reducer = new SpecificityReducer();
  
  // Check for report flag
  if (process.argv.includes('--report')) {
    reducer.generateSpecificityReport();
    return;
  }
  
  // Check for documentation flag
  if (process.argv.includes('--docs')) {
    reducer.createBEMDocumentation();
    return;
  }
  
  // Get file path from command line arguments
  const filePath = process.argv[2];
  
  if (filePath) {
    // Process single file
    if (fs.existsSync(filePath)) {
      await reducer.processFile(filePath);
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  } else {
    // Process all CSS files
    await reducer.processAllFiles();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Specificity reduction failed:', error);
    process.exit(1);
  });
}

module.exports = SpecificityReducer;
