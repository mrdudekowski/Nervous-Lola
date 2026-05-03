#!/usr/bin/env node

/**
 * Hex Color Migration Script
 * Migrates hex colors to CSS variables for better maintainability
 * 
 * Usage: node scripts/migrate-hex-colors.js [file-path]
 * If no file path provided, processes all CSS files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class HexColorMigrator {
  constructor() {
    this.colorMap = {
      '#D4AF37': 'var(--color-gold)',
      '#E6C866': 'var(--color-gold-light)',
      '#B8941F': 'var(--color-gold-dark)',
      '#000': 'var(--color-black)',
      '#fff': 'var(--color-white)',
      '#666': 'var(--color-gray-light)',
      '#1a1a1a': 'var(--color-gray-dark)',
      '#2d2d2d': 'var(--color-gray-medium)',
      '#f8f9fa': 'var(--bg-light)',
      '#007bff': 'var(--color-primary)',
      '#28a745': 'var(--color-success)',
      '#dc3545': 'var(--color-danger)',
      '#ffc107': 'var(--color-warning)',
      '#17a2b8': 'var(--color-info)'
    };
    
    this.stats = {
      filesProcessed: 0,
      totalChanges: 0,
      filesChanged: 0
    };
  }

  /**
   * Process a single CSS file
   * @param {string} filePath - Path to CSS file
   * @returns {number} Number of changes made
   */
  async migrateFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let changes = 0;
      const originalContent = content;
      
      // Process each color mapping
      for (const [hex, variable] of Object.entries(this.colorMap)) {
        const regex = new RegExp(hex.replace('#', '\\#'), 'g');
        const matches = content.match(regex);
        
        if (matches) {
          content = content.replace(regex, variable);
          changes += matches.length;
        }
      }
      
      // Write file if changes were made
      if (changes > 0) {
        fs.writeFileSync(filePath, content);
        this.stats.filesChanged++;
        this.stats.totalChanges += changes;
        console.log(`✅ ${filePath}: ${changes} hex colors migrated`);
      } else {
        console.log(`⚪ ${filePath}: No hex colors found`);
      }
      
      this.stats.filesProcessed++;
      return changes;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return 0;
    }
  }

  /**
   * Process all CSS files in the project
   */
  async migrateAllFiles() {
    const cssFiles = glob.sync('assets/css/**/*.css');
    
    console.log(`🔍 Found ${cssFiles.length} CSS files to process...\n`);
    
    for (const file of cssFiles) {
      await this.migrateFile(file);
    }
    
    this.printSummary();
  }

  /**
   * Ensure CSS variables are defined in variables.css
   */
  ensureVariablesDefined() {
    const variablesPath = 'assets/css/variables.css';
    
    if (!fs.existsSync(variablesPath)) {
      console.log('⚠️  variables.css not found. Creating with color definitions...');
      this.createVariablesFile(variablesPath);
    } else {
      this.updateVariablesFile(variablesPath);
    }
  }

  /**
   * Create variables.css file with color definitions
   */
  createVariablesFile(filePath) {
    const variablesContent = `/* ========================================
   CSS VARIABLES - COLOR SYSTEM
   ======================================== */

:root {
  /* Primary Colors */
  --color-gold: #D4AF37;
  --color-gold-light: #E6C866;
  --color-gold-dark: #B8941F;
  
  /* Neutral Colors */
  --color-black: #000;
  --color-white: #fff;
  --color-gray-light: #666;
  --color-gray-dark: #1a1a1a;
  --color-gray-medium: #2d2d2d;
  
  /* Background Colors */
  --bg-light: #f8f9fa;
  --bg-dark: #1a1a1a;
  
  /* Semantic Colors */
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
}
`;

    fs.writeFileSync(filePath, variablesContent);
    console.log(`✅ Created ${filePath} with color variables`);
  }

  /**
   * Update existing variables.css file
   */
  updateVariablesFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check if color variables already exist
    const hasColorVariables = content.includes('--color-gold');
    
    if (!hasColorVariables) {
      const colorVariables = `
  /* Primary Colors */
  --color-gold: #D4AF37;
  --color-gold-light: #E6C866;
  --color-gold-dark: #B8941F;
  
  /* Neutral Colors */
  --color-black: #000;
  --color-white: #fff;
  --color-gray-light: #666;
  --color-gray-dark: #1a1a1a;
  --color-gray-medium: #2d2d2d;
  
  /* Background Colors */
  --bg-light: #f8f9fa;
  --bg-dark: #1a1a1a;
  
  /* Semantic Colors */
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;`;

      // Insert after :root {
      content = content.replace(/:root\s*{/, `:root {${colorVariables}`);
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath} with color variables`);
    } else {
      console.log(`⚪ ${filePath} already contains color variables`);
    }
  }

  /**
   * Print migration summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 HEX COLOR MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files changed: ${this.stats.filesChanged}`);
    console.log(`Total changes: ${this.stats.totalChanges}`);
    console.log('='.repeat(50));
    
    if (this.stats.totalChanges > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('💡 Next steps:');
      console.log('   1. Run: npm run lint:css');
      console.log('   2. Test visually: python -m http.server 8000');
      console.log('   3. Commit changes: git add . && git commit -m "Migrate hex colors to CSS variables"');
    } else {
      console.log('\n⚪ No hex colors found to migrate.');
    }
  }

  /**
   * Validate migration results
   */
  validateMigration() {
    console.log('\n🔍 Validating migration results...');
    
    const cssFiles = glob.sync('assets/css/**/*.css');
    let remainingHexColors = 0;
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const hexMatches = content.match(/#[0-9A-Fa-f]{3,6}/g);
      
      if (hexMatches) {
        remainingHexColors += hexMatches.length;
        console.log(`⚠️  ${file}: ${hexMatches.length} hex colors remaining`);
        hexMatches.forEach(hex => console.log(`    - ${hex}`));
      }
    }
    
    if (remainingHexColors === 0) {
      console.log('✅ All hex colors successfully migrated!');
    } else {
      console.log(`⚠️  ${remainingHexColors} hex colors still need migration`);
    }
  }
}

// Main execution
async function main() {
  const migrator = new HexColorMigrator();
  
  // Ensure variables are defined
  migrator.ensureVariablesDefined();
  
  // Get file path from command line arguments
  const filePath = process.argv[2];
  
  if (filePath) {
    // Process single file
    if (fs.existsSync(filePath)) {
      await migrator.migrateFile(filePath);
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  } else {
    // Process all CSS files
    await migrator.migrateAllFiles();
  }
  
  // Validate results
  migrator.validateMigration();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

module.exports = HexColorMigrator;
