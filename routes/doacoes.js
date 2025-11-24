import express from "express";
import db from "../database/db.js";

const router = express.Router();

// Listar doações
router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Doacao ORDER BY data_doacao DESC");
    res.json(stmt.all());
});

// Criar doação
router.post("/", (req, res) => {
    const { id_ong, valor, tipo_pagamento, nome_doador, email_doador, periodicidade } = req.body;
    if (valor < 5) return res.status(400).send("Valor mínimo da doação é R$5");

    const stmt = db.prepare(`
        INSERT INTO Doacao (id_ong, valor, tipo_pagamento, nome_doador, email_doador, periodicidade)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id_ong, valor, tipo_pagamento, nome_doador, email_doador, periodicidade || "única");
    res.send("Doação registrada com sucesso!");
});

export default router;
