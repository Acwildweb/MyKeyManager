#!/usr/bin/env node

/**
 * Script per la gestione automatica del versioning MyKeyManager
 * Utilizzo: 
 *   node scripts/version.js patch "Descrizione modifica"
 *   node scripts/version.js minor "Nuova funzionalità"
 *   node scripts/version.js major "Breaking change"
 */

const fs = require('fs');
const path = require('path');

// Percorso del file di versioning
const VERSION_FILE = path.join(__dirname, '../src/config/version.ts');

// Funzione per leggere la versione corrente
function getCurrentVersion() {
  try {
    const content = fs.readFileSync(VERSION_FILE, 'utf8');
    
    // Estrae i valori major, minor, patch usando regex
    const majorMatch = content.match(/major:\s*(\d+)/);
    const minorMatch = content.match(/minor:\s*(\d+)/);
    const patchMatch = content.match(/patch:\s*(\d+)/);
    
    if (!majorMatch || !minorMatch || !patchMatch) {
      throw new Error('Impossibile parsare la versione corrente');
    }
    
    return {
      major: parseInt(majorMatch[1]),
      minor: parseInt(minorMatch[1]),
      patch: parseInt(patchMatch[1])
    };
  } catch (error) {
    console.error('Errore nella lettura del file di versioning:', error.message);
    process.exit(1);
  }
}

// Funzione per incrementare la versione
function incrementVersion(currentVersion, type) {
  const newVersion = { ...currentVersion };
  
  switch (type) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
    default:
      newVersion.patch += 1;
      break;
  }
  
  return newVersion;
}

// Funzione per aggiornare il file di versioning
function updateVersionFile(newVersion, description, type) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const versionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;
    
    // Legge il contenuto corrente
    let content = fs.readFileSync(VERSION_FILE, 'utf8');
    
    // Aggiorna i valori
    content = content.replace(/major:\s*\d+/, `major: ${newVersion.major}`);
    content = content.replace(/minor:\s*\d+/, `minor: ${newVersion.minor}`);
    content = content.replace(/patch:\s*\d+/, `patch: ${newVersion.patch}`);
    
    // Aggiorna la data
    content = content.replace(/date:\s*'[^']*'/, `date: '${currentDate}'`);
    
    // Aggiunge al changelog
    const changelogEntry = `    'v${versionString} - ${description}',`;
    content = content.replace(
      /(changelog:\s*\[)\s*/,
      `$1\n${changelogEntry}\n    `
    );
    
    // Salva il file
    fs.writeFileSync(VERSION_FILE, content, 'utf8');
    
    console.log(`✅ Versione aggiornata a v${versionString}`);
    console.log(`📅 Data: ${currentDate}`);
    console.log(`📝 Descrizione: ${description}`);
    console.log(`🔄 Tipo: ${type}`);
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del file:', error.message);
    process.exit(1);
  }
}

// Funzione per mostrare la versione corrente
function showCurrentVersion() {
  const version = getCurrentVersion();
  console.log(`Versione corrente: v${version.major}.${version.minor}.${version.patch}`);
}

// Funzione per mostrare l'help
function showHelp() {
  console.log(`
🎯 MyKeyManager Version Manager

Utilizzo:
  node scripts/version.js <tipo> "<descrizione>"
  node scripts/version.js current
  node scripts/version.js help

Tipi di versioning:
  patch   - Incrementa la patch version (bug fix, piccole modifiche)
  minor   - Incrementa la minor version (nuove funzionalità)
  major   - Incrementa la major version (breaking changes)

Esempi:
  node scripts/version.js patch "Correzione bug nel login"
  node scripts/version.js minor "Aggiunta gestione loghi"
  node scripts/version.js major "Nuova architettura backend"
  node scripts/version.js current
  `);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    showHelp();
    return;
  }
  
  if (args[0] === 'current') {
    showCurrentVersion();
    return;
  }
  
  const type = args[0];
  const description = args[1];
  
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('❌ Tipo di versioning non valido. Usa: patch, minor, major');
    showHelp();
    process.exit(1);
  }
  
  if (!description) {
    console.error('❌ Descrizione obbligatoria');
    showHelp();
    process.exit(1);
  }
  
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, type);
  
  console.log(`🔄 Aggiornamento versione da v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch} a v${newVersion.major}.${newVersion.minor}.${newVersion.patch}`);
  
  updateVersionFile(newVersion, description, type);
  
  console.log(`\n✨ Versioning completato! Ricorda di ricompilare l'applicazione.`);
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  incrementVersion,
  updateVersionFile
};
