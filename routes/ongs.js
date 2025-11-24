import express from "express";
import db from "../database/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Rota de debug temporária para listar todas as ONGs 
router.get('/debug/all', (req, res) => {
    try {
        const rows = db.prepare('SELECT id_ong, nome_fantasia, cnpj, email FROM ONG').all();
        res.json(rows);
    } catch (err) {
        console.error('Debug /ongs/debug/all error', err);
        res.status(500).json({ message: 'Erro ao ler ONGs' });
    }
});

// Debug: buscar ONG por id 
router.get('/debug/id/:id', (req, res) => {
    try {
        const { id } = req.params;
        const row = db.prepare('SELECT id_ong, nome_fantasia, cnpj, email FROM ONG WHERE id_ong = ?').get(id);
        if (!row) return res.status(404).json({ message: 'ONG não encontrada' });
        return res.json(row);
    } catch (err) {
        console.error('Debug /ongs/debug/id error', err);
        res.status(500).json({ message: 'Erro ao consultar ONG' });
    }
});

// Listar todas as ONGs
router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT id_ong, nome_fantasia, cnpj, email, telefone, estado, cidade FROM ONG");
    res.json(stmt.all());
});

// Cadastro de ONG
router.post("/", async (req, res) => {
    const { cnpj, email, senha, nome } = req.body;
    
    // Validar campos obrigatórios
    if (!cnpj || !email || !senha || !nome) {
        return res.status(400).json({ message: "CNPJ, email, senha e nome são obrigatórios." });
    }

    try {
        // Verifica se já existe ONG com esse CNPJ
        const existeCnpj = db.prepare("SELECT nome_fantasia FROM ONG WHERE cnpj = ?").get(cnpj);
        if (existeCnpj) {
            return res.status(409).json({ message: `Esta ONG (${existeCnpj.nome_fantasia}) já foi cadastrada. Faça login ou utilize outro CNPJ.` });
        }

        // Verifica se já existe ONG com esse e-mail
        const existeEmail = db.prepare("SELECT 1 FROM ONG WHERE email = ?").get(email);
        if (existeEmail) {
            return res.status(409).json({ message: "Já existe uma conta com este e-mail." });
        }

        const hashedSenha = await bcrypt.hash(senha, 10);
        const stmt = db.prepare(`
            INSERT INTO ONG (nome_fantasia, cnpj, email, senha)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(nome, cnpj, email, hashedSenha);
        
        res.json({ 
            message: "ONG cadastrada com sucesso!",
            usuario: {
                id: stmt.lastInsertRowid,
                nome: nome,
                email: email,
                tipo: "ong"
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao cadastrar ONG: " + err.message });
    }
});

// Atualizar perfil da ONG
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, senhaAtual, senhaNova, email } = req.body;

    try {
        console.log(`PUT /ongs/${id} body keys: ${Object.keys(req.body).join(', ')}`);
        const ong = db.prepare("SELECT * FROM ONG WHERE id_ong = ?").get(id);
        console.log('DB lookup for ONG id:', id, 'result:', !!ong);
        if (!ong) {
            return res.status(404).json({ message: "ONG não encontrada." });
        }

        // Verifica email informado corresponde ao cadastro
        if (!email || email.trim().toLowerCase() !== (ong.email || '').toLowerCase()) {
            return res.status(401).json({ message: 'Email não corresponde ao cadastro.' });
        }

        // Se vai alterar senha, verifica a senha atual
        if (senhaNova) {
            if (!senhaAtual) {
                return res.status(400).json({ message: "Senha atual é obrigatória para alterar a senha." });
            }
            const senhaValida = await bcrypt.compare(senhaAtual, ong.senha);
            if (!senhaValida) {
                return res.status(401).json({ message: "Senha atual incorreta." });
            }
            const hashedNovaSenha = await bcrypt.hash(senhaNova, 10);
            db.prepare("UPDATE ONG SET nome_fantasia = ?, senha = ? WHERE id_ong = ?")
                .run(nome || ong.nome_fantasia, hashedNovaSenha, id);
        } else {
            db.prepare("UPDATE ONG SET nome_fantasia = ? WHERE id_ong = ?")
                .run(nome || ong.nome_fantasia, id);
        }

        res.json({ message: "Perfil atualizado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
});

export default router;

