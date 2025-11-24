import express from "express";
import db from "../database/db.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Variável global para armazenar o transporter
let transporter = null;

// Função para inicializar o transporter com credenciais válidas
async function initializeTransporter() {
    if (transporter) return transporter;

    try {
        // Se houver variáveis de ambiente, usar elas (Gmail ou outro provedor)
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true' || false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log('📧 Email configurado com credenciais personalizadas');
        } else {
            // Gerar conta de teste Ethereal automáticamente
            console.log('📧 Gerando conta Ethereal de teste...');
            const testAccount = await nodemailer.createTestAccount();
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            console.log('   Conta Ethereal criada:');
            console.log(`   Email: ${testAccount.user}`);
            console.log(`   Senha: ${testAccount.pass}`);
            console.log('   URL: https://ethereal.email');
        }
        
        return transporter;
    } catch (err) {
        console.error(' Erro ao inicializar email:', err.message);
        throw err;
    }
}

// Listar mensagens de suporte
router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT * FROM MensagemSuporte ORDER BY DataAbertura DESC");
    res.json(stmt.all());
});

// Criar mensagem de suporte e enviar email
router.post("/", async (req, res) => {
    const { VoluntarioID, OrganizacaoID, Assunto, Mensagem, EmailUsuario } = req.body;
    
    if (!Assunto || !Mensagem) {
        return res.status(400).json({ message: "Assunto e mensagem são obrigatórios." });
    }

    try {
        // Inicializar transporter se não estiver pronto
        const mail = await initializeTransporter();

        // Salvar no banco de dados
        const stmt = db.prepare(`
            INSERT INTO MensagemSuporte (VoluntarioID, OrganizacaoID, Assunto, Mensagem)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(VoluntarioID || null, OrganizacaoID || null, Assunto, Mensagem);

        // Enviar email para o administrador
        const mailOptions = {
            from: '"Apoia+ Suporte" <suporte@apoia.com.br>',
            to: process.env.EMAIL_USER || 'udmygzpv632kumyd@ethereal.email',
            subject: `[Ticket de Suporte] ${Assunto}`,
            html: `
                <h2 style="color: #ff47a3;">Novo Ticket de Suporte</h2>
                <p><strong>Assunto:</strong> ${Assunto}</p>
                <p><strong>Email do Usuário:</strong> <a href="mailto:${EmailUsuario}">${EmailUsuario || 'Não informado'}</a></p>
                <hr>
                <h3>Mensagem:</h3>
                <p>${Mensagem.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small style="color: #999;">Este é um ticket automático do sistema Apoia+ - ${new Date().toLocaleString('pt-BR')}</small></p>
            `
        };

        const info = await mail.sendMail(mailOptions);

        // Se usar Ethereal, gerar URL de preview
        let previewUrl = null;
        if (info.messageId && info.messageId.includes('@ethereal')) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(` Email enviado! Preview: ${previewUrl}`);
        }

        res.json({ 
            message: "Ticket enviado com sucesso! Em breve entraremos em contato.",
            previewUrl: previewUrl
        });
    } catch (err) {
        console.error(' Erro ao enviar email:', err);
        res.status(500).json({ message: "Erro ao enviar ticket: " + err.message });
    }
});

export default router;
