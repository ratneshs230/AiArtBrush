#!/usr/bin/env node

/**
 * ART-loop Setup Verification Script
 * 
 * This script verifies that the development environment is properly configured
 * and all dependencies are available for running ART-loop.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 ART-loop Setup Verification\n');

const checks = [];

// Check Node.js version
function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      checks.push({ name: 'Node.js version', status: '✅', details: version });
    } else {
      checks.push({ name: 'Node.js version', status: '❌', details: `${version} (requires 18+)` });
    }
  } catch (error) {
    checks.push({ name: 'Node.js version', status: '❌', details: 'Not found' });
  }
}

// Check npm version
function checkNpmVersion() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 9) {
      checks.push({ name: 'npm version', status: '✅', details: version });
    } else {
      checks.push({ name: 'npm version', status: '❌', details: `${version} (requires 9+)` });
    }
  } catch (error) {
    checks.push({ name: 'npm version', status: '❌', details: 'Not found' });
  }
}

// Check if dependencies are installed
function checkDependencies() {
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '../node_modules'));
  const backendDepsExist = fs.existsSync(path.join(__dirname, '../backend/node_modules'));
  const frontendDepsExist = fs.existsSync(path.join(__dirname, '../frontend/node_modules'));
  const sharedDepsExist = fs.existsSync(path.join(__dirname, '../shared/node_modules'));
  
  if (nodeModulesExists && backendDepsExist && frontendDepsExist && sharedDepsExist) {
    checks.push({ name: 'Dependencies installed', status: '✅', details: 'All packages' });
  } else {
    checks.push({ name: 'Dependencies installed', status: '❌', details: 'Run: npm install' });
  }
}

// Check environment files
function checkEnvironmentFiles() {
  const backendEnvExample = fs.existsSync(path.join(__dirname, '../backend/.env.example'));
  const frontendEnvExample = fs.existsSync(path.join(__dirname, '../frontend/.env.local.example'));
  
  if (backendEnvExample && frontendEnvExample) {
    checks.push({ name: 'Environment templates', status: '✅', details: 'Present' });
  } else {
    checks.push({ name: 'Environment templates', status: '❌', details: 'Missing templates' });
  }
  
  const backendEnv = fs.existsSync(path.join(__dirname, '../backend/.env'));
  const frontendEnv = fs.existsSync(path.join(__dirname, '../frontend/.env.local'));
  
  if (backendEnv && frontendEnv) {
    checks.push({ name: 'Environment files', status: '✅', details: 'Configured' });
  } else {
    checks.push({ name: 'Environment files', status: '⚠️', details: 'Copy from .example files' });
  }
}

// Check TypeScript compilation
function checkTypeScript() {
  try {
    execSync('npx tsc --version', { encoding: 'utf8', stdio: 'pipe' });
    checks.push({ name: 'TypeScript', status: '✅', details: 'Available' });
  } catch (error) {
    checks.push({ name: 'TypeScript', status: '❌', details: 'Not found' });
  }
}

// Check Redis availability
function checkRedis() {
  try {
    execSync('redis-cli ping', { encoding: 'utf8', stdio: 'pipe' });
    checks.push({ name: 'Redis connection', status: '✅', details: 'Connected' });
  } catch (error) {
    checks.push({ name: 'Redis connection', status: '⚠️', details: 'Not running (start Redis)' });
  }
}

// Check Git repository
function checkGitRepository() {
  try {
    const isGitRepo = fs.existsSync(path.join(__dirname, '../.git'));
    if (isGitRepo) {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      checks.push({ name: 'Git repository', status: '✅', details: `Branch: ${branch}` });
    } else {
      checks.push({ name: 'Git repository', status: '❌', details: 'Not initialized' });
    }
  } catch (error) {
    checks.push({ name: 'Git repository', status: '❌', details: 'Git not found' });
  }
}

// Run all checks
function runChecks() {
  checkNodeVersion();
  checkNpmVersion();
  checkDependencies();
  checkEnvironmentFiles();
  checkTypeScript();
  checkRedis();
  checkGitRepository();
}

// Display results
function displayResults() {
  console.log('📋 Setup Status:\n');
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name.padEnd(25)} ${check.details}`);
  });
  
  const passed = checks.filter(c => c.status === '✅').length;
  const warnings = checks.filter(c => c.status === '⚠️').length;
  const failed = checks.filter(c => c.status === '❌').length;
  
  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passed}`);
  if (warnings > 0) console.log(`⚠️ Warnings: ${warnings}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  console.log('\n🚀 Next Steps:');
  
  if (failed > 0) {
    console.log('❌ Fix the failed checks before proceeding');
  } else if (warnings > 0) {
    console.log('⚠️ Address warnings for optimal development experience');
    console.log('💡 You can still run the application with warnings');
  } else {
    console.log('✅ Environment is ready!');
    console.log('🎨 Start development with: npm run dev');
  }
  
  console.log('\n📚 Documentation: ./documentation/06-development-setup.md');
}

// Main execution
try {
  runChecks();
  displayResults();
} catch (error) {
  console.error('❌ Setup verification failed:', error.message);
  process.exit(1);
}