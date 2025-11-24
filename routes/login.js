import express from "express";
import db from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const router = express.Router();

// Login de Voluntário ou ONG 
router.post("/", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) return res.status(400).json({ message: "Email e senha são obrigatórios" });

    try {
        
        let stmt = db.prepare(`SELECT * FROM Voluntario WHERE email = ?`);
        let usuario = stmt.get(email);
        let tipo = 'voluntario';
        
        if (!usuario) {
            stmt = db.prepare(`SELECT * FROM ONG WHERE email = ?`);
            usuario = stmt.get(email);
            tipo = 'ong';
        }

        if (!usuario) return res.status(401).json({ message: "Usuário não encontrado" });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ message: "Senha incorreta" });

        const payload = {
            id: tipo === "voluntario" ? usuario.id_voluntario : usuario.id_ong,
            tipo,
            email: usuario.email,
            nome: tipo === 'voluntario' ? usuario.nome : usuario.nome_fantasia
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });

        res.json({
            message: "Login realizado com sucesso",
            token,
            usuario: {
                id: payload.id,
                nome: payload.nome,
                email: payload.email,
                tipo: payload.tipo
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no login" });
    }
});

export default router;
