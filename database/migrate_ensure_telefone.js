import db from './db.js';

function ensureTelefoneColumn() {
  try {
    const cols = db.prepare("PRAGMA table_info('Inscricao')").all();
    const hasTelefone = cols.some(c => c.name === 'telefone');
    if (!hasTelefone) {
      db.exec("ALTER TABLE Inscricao ADD COLUMN telefone TEXT");
      console.log("Migration: coluna 'telefone' adicionada em Inscricao");
    } else {
      console.log("Migration: coluna 'telefone' já existe em Inscricao");
    }
  } catch (err) {
    console.error('Migration error while ensuring telefone column:', err.message || err);
  }
}

ensureTelefoneColumn();
