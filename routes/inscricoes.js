import express from "express";
import db from "../database/db.js";

const router = express.Router();

// Listar todas as inscrições
router.get("/", (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM Inscricao");
        res.json(stmt.all());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar inscrições" });
    }
});

// Listar inscritos de uma vaga específica
router.get("/vaga/:id_vaga", (req, res) => {
    const { id_vaga } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT 
                i.id_inscricao,
                i.id_voluntario,
                i.data_inscricao,
                i.status,
                i.telefone,
                v.nome,
                v.email
            FROM Inscricao i
            JOIN Voluntario v ON i.id_voluntario = v.id_voluntario
            WHERE i.id_vaga = ?
            ORDER BY i.data_inscricao DESC
        `);
        res.json(stmt.all(id_vaga));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar inscritos" });
    }
});

// Criar inscrição
router.post("/", (req, res) => {
    const { id_voluntario, id_vaga, telefone } = req.body;
    
    if (!id_voluntario || !id_vaga) {
        return res.status(400).json({ message: "ID do voluntário e da vaga são obrigatórios" });
    }

    if (!telefone || String(telefone).trim() === "") {
        return res.status(400).json({ message: "Telefone é obrigatório" });
    }

    const telefoneLimpo = String(telefone).replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        return res.status(400).json({ message: "Telefone inválido. Use DDD + número (10 ou 11 dígitos)." });
    }

    try {
        // Verificar se já está inscrito
        const existing = db.prepare("SELECT * FROM Inscricao WHERE id_voluntario = ? AND id_vaga = ?").get(id_voluntario, id_vaga);
        if (existing) {
            return res.status(409).json({ message: "Você já está inscrito nesta vaga!" });
        }

        const stmt = db.prepare(`
            INSERT INTO Inscricao (id_voluntario, id_vaga, telefone, status)
            VALUES (?, ?, ?, 'pendente')
        `);
        const result = stmt.run(id_voluntario, id_vaga, telefone);
        
        res.json({
            message: "Inscrição realizada com sucesso!",
            id_inscricao: result.lastInsertRowid
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao realizar inscrição: " + err.message });
    }
});

// Cancelar inscrição
router.delete("/:id_voluntario/:id_vaga", (req, res) => {
    const { id_voluntario, id_vaga } = req.params;

    try {
        const stmt = db.prepare("DELETE FROM Inscricao WHERE id_voluntario = ? AND id_vaga = ?");
        const result = stmt.run(id_voluntario, id_vaga);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Inscrição não encontrada" });
        }

        res.json({ message: "Inscrição cancelada com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao cancelar inscrição: " + err.message });
    }
});

// Listar todos os inscritos de uma ONG 
router.get("/ong/:id_ong", (req, res) => {
    const { id_ong } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT 
                i.id_inscricao,
                i.id_voluntario,
                i.data_inscricao,
                i.status,
                i.telefone,
                v.nome,
                v.email,
                vag.id_vaga,
                vag.titulo as vaga_titulo,
                vag.data_inicio,
                vag.data_fim
            FROM Inscricao i
            JOIN Voluntario v ON i.id_voluntario = v.id_voluntario
            JOIN Vaga vag ON i.id_vaga = vag.id_vaga
            WHERE vag.id_ong = ?
            ORDER BY i.data_inscricao DESC
        `);
        res.json(stmt.all(id_ong));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar inscritos da ONG" });
    }
});

export default router;
