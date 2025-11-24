import express from "express";
import db from "../database/db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Listar vagas com contagem de inscritos
router.get("/", (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                v.id_vaga,
                v.titulo,
                v.descricao,
                v.foto,
                v.limite_voluntarios,
                COUNT(i.id_inscricao) as inscritos_count,
                v.status,
                v.id_ong,
                COALESCE(o.nome_fantasia, 'ONG Desconhecida') as nome_ong
            FROM Vaga v
            LEFT JOIN Inscricao i ON v.id_vaga = i.id_vaga
            LEFT JOIN ONG o ON v.id_ong = o.id_ong
            GROUP BY v.id_vaga
            ORDER BY v.id_vaga DESC
        `);
        res.json(stmt.all());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar vagas" });
    }
});

// Criar nova vaga
router.post("/", auth, (req, res) => {
    const { titulo, descricao, foto, limite_voluntarios } = req.body;

    if (!titulo || !limite_voluntarios) {
        return res.status(400).json({ message: "Título e limite de voluntários são obrigatórios." });
    }

    // apenas ONGs podem criar vagas
    if (!req.user || req.user.tipo !== 'ong') {
        return res.status(403).json({ message: 'Apenas ONGs podem criar vagas.' });
    }

    const id_ong = req.user.id;

    try {
        const stmt = db.prepare(`
            INSERT INTO Vaga (id_ong, titulo, descricao, foto, limite_voluntarios, status)
            VALUES (?, ?, ?, ?, ?, 'aberta')
        `);
        const result = stmt.run(id_ong, titulo, descricao, foto || null, limite_voluntarios);

        res.json({
            message: "Vaga criada com sucesso!",
            vaga: {
                id_vaga: result.lastInsertRowid,
                titulo,
                descricao,
                foto,
                limite_voluntarios,
                inscritos_count: 0,
                status: 'aberta',
                id_ong
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar vaga: " + err.message });
    }
});

// Deletar vaga
router.delete("/:id", auth, (req, res) => {
    const { id } = req.params;

    if (!req.user || req.user.tipo !== 'ong') {
        return res.status(403).json({ message: 'Operação não permitida. Apenas ONGs autenticadas podem deletar vagas.' });
    }

    try {
        const vaga = db.prepare("SELECT id_ong FROM Vaga WHERE id_vaga = ?").get(id);
        if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada' });

        if (String(vaga.id_ong) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Operação não permitida. Apenas a ONG proprietária pode deletar esta vaga.' });
        }

        db.prepare("DELETE FROM Inscricao WHERE id_vaga = ?").run(id);
        db.prepare("DELETE FROM Vaga WHERE id_vaga = ?").run(id);

        res.json({ message: "Vaga deletada com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao deletar vaga: " + err.message });
    }
});

// Editar vaga
router.put("/:id", auth, (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, foto, limite_voluntarios } = req.body;
    
    if (!titulo || !limite_voluntarios) {
        return res.status(400).json({ message: "Título e limite de voluntários são obrigatórios." });
    }

    if (!req.user || req.user.tipo !== 'ong') {
        return res.status(403).json({ message: 'Operação não permitida. Apenas ONGs autenticadas podem editar vagas.' });
    }

    try {
        const vaga = db.prepare("SELECT id_ong FROM Vaga WHERE id_vaga = ?").get(id);
        if (!vaga) return res.status(404).json({ message: 'Vaga não encontrada' });

        if (String(vaga.id_ong) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Operação não permitida. Apenas a ONG proprietária pode editar esta vaga.' });
        }

        const stmt = db.prepare(`
            UPDATE Vaga 
            SET titulo = ?, descricao = ?, foto = ?, limite_voluntarios = ?
            WHERE id_vaga = ?
        `);
        stmt.run(titulo, descricao, foto || null, limite_voluntarios, id);

        res.json({
            message: "Vaga atualizada com sucesso!",
            vaga: {
                id_vaga: id,
                titulo,
                descricao,
                foto,
                limite_voluntarios
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao editar vaga: " + err.message });
    }
});

// Listar vagas abertas de uma ONG com detalhes
router.get("/ong/:id_ong/abertas", (req, res) => {
    const { id_ong } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT 
                v.id_vaga,
                v.titulo,
                v.descricao,
                v.data_inicio,
                v.status,
                COUNT(i.id_inscricao) as inscritos_count,
                o.nome_fantasia as aberto_por
            FROM Vaga v
            LEFT JOIN Inscricao i ON v.id_vaga = i.id_vaga
            JOIN ONG o ON v.id_ong = o.id_ong
            WHERE v.id_ong = ? AND v.status = 'aberta'
            GROUP BY v.id_vaga
            ORDER BY v.data_inicio DESC
        `);
        res.json(stmt.all(id_ong));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar vagas abertas da ONG" });
    }
});

export default router;

