import express from "express";
import db from "../database/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Listar todos voluntários
router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT id_voluntario, nome, email, telefone, data_nascimento, estado, cidade FROM Voluntario");
    res.json(stmt.all());
});

// Cadastro de voluntário
router.post("/", async (req, res) => {
    const { nome, email, senha, telefone, data_nascimento, estado, cidade, habilidades, interesses, disponibilidade } = req.body;
    try {
        // Verifica se já existe voluntário com esse e-mail
        const existe = db.prepare("SELECT 1 FROM Voluntario WHERE email = ?").get(email);
        if (existe) {
            return res.status(409).json({ message: "Já existe uma conta com este e-mail." });
        }
        const hashedSenha = await bcrypt.hash(senha, 10);
        const stmt = db.prepare(`
            INSERT INTO Voluntario
            (nome, email, senha, telefone, data_nascimento, estado, cidade, habilidades, interesses, disponibilidade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(nome, email, hashedSenha, telefone, data_nascimento, estado, cidade, habilidades, interesses, disponibilidade);
        res.json({ message: "Voluntário cadastrado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao cadastrar voluntário" });
    }
});

// Atualizar perfil do voluntário
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, senhaAtual, senhaNova } = req.body;

    try {
        console.log(`PUT /voluntarios/${id} body keys: ${Object.keys(req.body).join(', ')}`);
        const voluntario = db.prepare("SELECT * FROM Voluntario WHERE id_voluntario = ?").get(id);
        console.log('DB lookup for Voluntario id:', id, 'result:', !!voluntario);
        if (!voluntario) {
            return res.status(404).json({ message: "Voluntário não encontrado." });
        }

        // Se vai alterar senha, verifica a senha atual
        if (senhaNova) {
            if (!senhaAtual) {
                return res.status(400).json({ message: "Senha atual é obrigatória para alterar a senha." });
            }
            const senhaValida = await bcrypt.compare(senhaAtual, voluntario.senha);
            if (!senhaValida) {
                return res.status(401).json({ message: "Senha atual incorreta." });
            }
            const hashedNovaSenha = await bcrypt.hash(senhaNova, 10);
            db.prepare("UPDATE Voluntario SET nome = ?, senha = ? WHERE id_voluntario = ?")
                .run(nome || voluntario.nome, hashedNovaSenha, id);
        } else {
            db.prepare("UPDATE Voluntario SET nome = ? WHERE id_voluntario = ?")
                .run(nome || voluntario.nome, id);
        }

        res.json({ message: "Perfil atualizado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
});

export default router;
