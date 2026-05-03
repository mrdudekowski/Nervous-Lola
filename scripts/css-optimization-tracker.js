#!/usr/bin/env node

/**
 * CSS Optimization Progress Tracker
 * Tracks progress of CSS optimization phases and generates reports
 * 
 * Usage: node scripts/css-optimization-tracker.js [phase]
 * Phases: foundation, structure, optimization, advanced, all
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSOptimizationTracker {
  constructor() {
    this.phases = {
      foundation: {
        name: 'Foundation Improvements',
        description: 'Safe, non-breaking changes',
        tasks: [
          { name: 'Hex colors migrated', target: 32, current: 0 },
          { name: 'Comments standardized', target: 7, current: 0 },
          { name: 'Font quotes fixed', target: 1, current: 0 }
        ]
      },
      structure: {
        name: 'Structure Improvements',
        description: 'Low-risk architectural changes',
        tasks: [
          { name: 'High-specificity selectors reduced', target: 421, current: 0 },
          { name: 'BEM methodology implemented', target: 5, current: 0 },
          { name: 'CSS files reorganized', target: 7, current: 0 }
        ]
      },
      optimization: {
        name: 'Optimization Improvements',
        description: 'Medium-risk performance improvements',
        tasks: [
          { name: 'Animations consolidated', target: 8, current: 0 },
          { name: 'Media queries optimized', target: 15, current: 0 },
          { name: 'CSS variables expanded', target: 50, current: 0 }
        ]
      },
      advanced: {
        name: 'Advanced Optimizations',
        description: 'High-risk architectural improvements',
        tasks: [
          { name: 'ITCSS architecture', target: 100, current: 0 },
          { name: 'Critical CSS extracted', target: 100, current: 0 },
          { name: 'Performance optimized', target: 100, current: 0 }
        ]
      }
    };
    
    this.metrics = {
      totalFiles: 0,
      totalRules: 0,
      totalSelectors: 0,
      totalProperties: 0,
      hexColors: 0,
      highSpecificitySelectors: 0,
      duplicateRules: 0,
      unusedRules: 0
    };
  }

  /**
   * Analyze current CSS state
   */
  analyzeCurrentState() {
    console.log('🔍 Analyzing current CSS state...\n');
    
    const cssFiles = glob.sync('assets/css/**/*.css');
    this.metrics.totalFiles = cssFiles.length;
    
    let totalRules = 0;
    let totalSelectors = 0;
    let totalProperties = 0;
    let hexColors = 0;
    let highSpecificitySelectors = 0;
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Count rules
      const ruleMatches = content.match(/\{[^{}]*\}/g);
      if (ruleMatches) totalRules += ruleMatches.length;
      
      // Count selectors
      const selectorMatches = content.match(/[^{}]+(?=\s*\{)/g);
      if (selectorMatches) totalSelectors += selectorMatches.length;
      
      // Count properties
      const propertyMatches = content.match(/[a-zA-Z-]+:\s*[^;]+;/g);
      if (propertyMatches) totalProperties += propertyMatches.length;
      
      // Count hex colors
      const hexMatches = content.match(/#[0-9A-Fa-f]{3,6}/g);
      if (hexMatches) hexColors += hexMatches.length;
      
      // Count high-specificity selectors
      if (selectorMatches) {
        for (const selector of selectorMatches) {
          const specificity = this.calculateSpecificity(selector.trim());
          if (specificity > 20) highSpecificitySelectors++;
        }
      }
    }
    
    this.metrics.totalRules = totalRules;
    this.metrics.totalSelectors = totalSelectors;
    this.metrics.totalProperties = totalProperties;
    this.metrics.hexColors = hexColors;
    this.metrics.highSpecificitySelectors = highSpecificitySelectors;
    
    // Update phase progress based on current state
    this.updatePhaseProgress();
  }

  /**
   * Calculate selector specificity
   */
  calculateSpecificity(selector) {
    const cleanSelector = selector.replace(/::?[a-zA-Z-]+/g, '');
    const ids = (cleanSelector.match(/#[a-zA-Z-]+/g) || []).length;
    const classes = (cleanSelector.match(/\.[a-zA-Z-]+/g) || []).length;
    const elements = (cleanSelector.match(/^[a-zA-Z]+|(?<=\s)[a-zA-Z]+/g) || []).length;
    
    return ids * 100 + classes * 10 + elements;
  }

  /**
   * Update phase progress based on current analysis
   */
  updatePhaseProgress() {
    // Foundation phase
    this.phases.foundation.tasks[0].current = Math.max(0, 32 - this.metrics.hexColors);
    this.phases.foundation.tasks[1].current = this.metrics.totalFiles; // Assume all files have comments
    this.phases.foundation.tasks[2].current = 1; // Assume font quotes are fixed
    
    // Structure phase
    this.phases.structure.tasks[0].current = Math.max(0, 421 - this.metrics.highSpecificitySelectors);
    this.phases.structure.tasks[1].current = 0; // BEM implementation status
    this.phases.structure.tasks[2].current = 0; // File reorganization status
    
    // Optimization phase
    this.phases.optimization.tasks[0].current = 0; // Animation consolidation
    this.phases.optimization.tasks[1].current = 0; // Media query optimization
    this.phases.optimization.tasks[2].current = 0; // CSS variables expansion
    
    // Advanced phase
    this.phases.advanced.tasks[0].current = 0; // ITCSS architecture
    this.phases.advanced.tasks[1].current = 0; // Critical CSS extraction
    this.phases.advanced.tasks[2].current = 0; // Performance optimization
  }

  /**
   * Generate progress report for a specific phase
   */
  generatePhaseReport(phaseName) {
    const phase = this.phases[phaseName];
    if (!phase) {
      console.error(`❌ Unknown phase: ${phaseName}`);
      return;
    }
    
    console.log(`\n📊 ${phase.name.toUpperCase()} PROGRESS REPORT`);
    console.log('='.repeat(60));
    console.log(`Description: ${phase.description}\n`);
    
    let totalProgress = 0;
    let totalTarget = 0;
    
    phase.tasks.forEach((task, index) => {
      const progress = Math.min(100, (task.current / task.target) * 100);
      const progressBar = this.createProgressBar(progress);
      const status = progress === 100 ? '✅' : progress > 50 ? '🟡' : '🔴';
      
      console.log(`${status} ${task.name}`);
      console.log(`   Progress: ${progressBar} ${progress.toFixed(1)}% (${task.current}/${task.target})`);
      console.log('');
      
      totalProgress += task.current;
      totalTarget += task.target;
    });
    
    const overallProgress = (totalProgress / totalTarget) * 100;
    const overallBar = this.createProgressBar(overallProgress);
    
    console.log('📈 OVERALL PHASE PROGRESS:');
    console.log(`${overallBar} ${overallProgress.toFixed(1)}% (${totalProgress}/${totalTarget})`);
    
    if (overallProgress === 100) {
      console.log('\n🎉 Phase completed successfully!');
    } else if (overallProgress > 50) {
      console.log('\n🟡 Phase in progress - good momentum!');
    } else {
      console.log('\n🔴 Phase needs attention - consider starting here.');
    }
  }

  /**
   * Generate overall project report
   */
  generateOverallReport() {
    console.log('\n📊 CSS OPTIMIZATION OVERALL REPORT');
    console.log('='.repeat(60));
    
    // Current metrics
    console.log('📈 CURRENT METRICS:');
    console.log(`   Files: ${this.metrics.totalFiles}`);
    console.log(`   Rules: ${this.metrics.totalRules}`);
    console.log(`   Selectors: ${this.metrics.totalSelectors}`);
    console.log(`   Properties: ${this.metrics.totalProperties}`);
    console.log(`   Hex Colors: ${this.metrics.hexColors}`);
    console.log(`   High-Specificity Selectors: ${this.metrics.highSpecificitySelectors}`);
    
    // Phase progress
    console.log('\n📋 PHASE PROGRESS:');
    Object.entries(this.phases).forEach(([phaseName, phase]) => {
      const totalProgress = phase.tasks.reduce((sum, task) => sum + task.current, 0);
      const totalTarget = phase.tasks.reduce((sum, task) => sum + task.target, 0);
      const progress = (totalProgress / totalTarget) * 100;
      const bar = this.createProgressBar(progress);
      const status = progress === 100 ? '✅' : progress > 50 ? '🟡' : '🔴';
      
      console.log(`${status} ${phase.name}: ${bar} ${progress.toFixed(1)}%`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    this.generateRecommendations();
  }

  /**
   * Generate recommendations based on current state
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.hexColors > 0) {
      recommendations.push('🎨 Start with hex color migration (Foundation phase)');
    }
    
    if (this.metrics.highSpecificitySelectors > 100) {
      recommendations.push('🔧 Focus on selector specificity reduction (Structure phase)');
    }
    
    if (this.metrics.totalFiles > 5) {
      recommendations.push('📁 Consider CSS file reorganization (Structure phase)');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🎉 Great job! Consider advanced optimizations (Advanced phase)');
    }
    
    recommendations.forEach(rec => console.log(`   ${rec}`));
  }

  /**
   * Create progress bar
   */
  createProgressBar(progress, length = 20) {
    const filled = Math.round((progress / 100) * length);
    const empty = length - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Generate next steps
   */
  generateNextSteps(phaseName) {
    console.log('\n🚀 NEXT STEPS:');
    
    switch (phaseName) {
      case 'foundation':
        console.log('   1. Run: node scripts/migrate-hex-colors.js');
        console.log('   2. Run: npm run lint:css:fix');
        console.log('   3. Test: python -m http.server 8000');
        break;
        
      case 'structure':
        console.log('   1. Run: node scripts/reduce-specificity.js');
        console.log('   2. Run: node scripts/reduce-specificity.js --docs');
        console.log('   3. Reorganize CSS files into components/');
        break;
        
      case 'optimization':
        console.log('   1. Consolidate similar animations');
        console.log('   2. Standardize media queries');
        console.log('   3. Expand CSS variables system');
        break;
        
      case 'advanced':
        console.log('   1. Implement ITCSS architecture');
        console.log('   2. Extract critical CSS');
        console.log('   3. Set up performance monitoring');
        break;
        
      default:
        console.log('   1. Choose a phase to focus on');
        console.log('   2. Run: node scripts/css-optimization-tracker.js [phase]');
        console.log('   3. Follow the recommended next steps');
    }
  }

  /**
   * Save progress to file
   */
  saveProgress() {
    const progressData = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      phases: this.phases
    };
    
    fs.writeFileSync('css-optimization-progress.json', JSON.stringify(progressData, null, 2));
    console.log('💾 Progress saved to css-optimization-progress.json');
  }

  /**
   * Load progress from file
   */
  loadProgress() {
    if (fs.existsSync('css-optimization-progress.json')) {
      const progressData = JSON.parse(fs.readFileSync('css-optimization-progress.json', 'utf8'));
      this.metrics = progressData.metrics;
      this.phases = progressData.phases;
      console.log('📂 Progress loaded from css-optimization-progress.json');
    }
  }
}

// Main execution
async function main() {
  const tracker = new CSSOptimizationTracker();
  
  // Load previous progress if available
  tracker.loadProgress();
  
  // Analyze current state
  tracker.analyzeCurrentState();
  
  // Get phase from command line arguments
  const phase = process.argv[2];
  
  if (phase && phase !== 'all') {
    // Generate report for specific phase
    tracker.generatePhaseReport(phase);
    tracker.generateNextSteps(phase);
  } else {
    // Generate overall report
    tracker.generateOverallReport();
  }
  
  // Save progress
  tracker.saveProgress();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Progress tracking failed:', error);
    process.exit(1);
  });
}

module.exports = CSSOptimizationTracker;
