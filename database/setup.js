import db from "./db.js";

// Criação das tabelas principais do Apoia
db.exec(`
CREATE TABLE IF NOT EXISTS Voluntario (
    id_voluntario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    data_nascimento TEXT,
    estado TEXT,
    cidade TEXT,
    habilidades TEXT,
    interesses TEXT,
    disponibilidade TEXT,
    data_cadastro TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ONG (
    id_ong INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    descricao TEXT,
    estado TEXT,
    cidade TEXT,
    endereco TEXT,
    data_cadastro TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Doacao (
    id_doacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ong INTEGER NOT NULL,
    valor REAL NOT NULL CHECK (valor >= 5),
    tipo_pagamento TEXT,
    data_doacao TEXT DEFAULT (datetime('now')),
    nome_doador TEXT,
    email_doador TEXT,
    periodicidade TEXT DEFAULT 'única',
    FOREIGN KEY(id_ong) REFERENCES ONG(id_ong)
);

CREATE TABLE IF NOT EXISTS Vaga (
    id_vaga INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ong INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    requisitos TEXT,
    data_inicio TEXT,
    data_fim TEXT,
    status TEXT DEFAULT 'aberta',
    FOREIGN KEY(id_ong) REFERENCES ONG(id_ong)
);

CREATE TABLE IF NOT EXISTS Inscricao (
    id_inscricao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_voluntario INTEGER NOT NULL,
    id_vaga INTEGER NOT NULL,
    data_inscricao TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'pendente',
    telefone TEXT,
    FOREIGN KEY(id_voluntario) REFERENCES Voluntario(id_voluntario),
    FOREIGN KEY(id_vaga) REFERENCES Vaga(id_vaga)
);

CREATE TABLE IF NOT EXISTS Relatorio (
    id_relatorio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ong INTEGER NOT NULL,
    total_vagas INTEGER,
    total_inscricoes INTEGER,
    total_doacoes REAL,
    gerado_em TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(id_ong) REFERENCES ONG(id_ong)
);

CREATE TABLE IF NOT EXISTS MensagemSuporte (
    SuporteID INTEGER PRIMARY KEY AUTOINCREMENT,
    VoluntarioID INTEGER,
    OrganizacaoID INTEGER,
    Assunto TEXT NOT NULL,
    Mensagem TEXT NOT NULL,
    DataAbertura TEXT DEFAULT (datetime('now')),
    Status TEXT DEFAULT 'Aberto',
    RespostaSuporte TEXT,
    DataResposta TEXT,
    FOREIGN KEY(VoluntarioID) REFERENCES Voluntario(id_voluntario),
    FOREIGN KEY(OrganizacaoID) REFERENCES ONG(id_ong)
);

CREATE TABLE IF NOT EXISTS Admin (
    id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    data_criacao TEXT DEFAULT (datetime('now'))
);
`);

console.log("Todas as tabelas criadas com sucesso!");
