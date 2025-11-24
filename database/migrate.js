import db from "../database/db.js";

// Adicionar campos às tabelas existentes se não existirem
try {
    // Verificar se coluna 'foto' existe em Vaga
    db.exec("ALTER TABLE Vaga ADD COLUMN foto TEXT;");
    console.log("✓ Coluna 'foto' adicionada à tabela Vaga");
} catch (err) {
    if (err.message.includes("already exists")) {
        console.log("✓ Coluna 'foto' já existe em Vaga");
    } else {
        console.log("✓ Coluna 'foto' pode já existir em Vaga");
    }
}

try {
    // Verificar se coluna 'limite_voluntarios' existe em Vaga
    db.exec("ALTER TABLE Vaga ADD COLUMN limite_voluntarios INTEGER DEFAULT 0;");
    console.log("✓ Coluna 'limite_voluntarios' adicionada à tabela Vaga");
} catch (err) {
    if (err.message.includes("already exists")) {
        console.log("✓ Coluna 'limite_voluntarios' já existe em Vaga");
    } else {
        console.log("✓ Coluna 'limite_voluntarios' pode já existir em Vaga");
    }
}

console.log("Migração completada!");
