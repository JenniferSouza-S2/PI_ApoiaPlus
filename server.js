import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Garantir migrações do banco 
import "./database/migrate_ensure_telefone.js";

// Rotas
import doacoesRoutes from "./routes/doacoes.js";
import voluntariosRoutes from "./routes/voluntarios.js";
import ongRoutes from "./routes/ongs.js";
import vagasRoutes from "./routes/vagas.js";
import inscricoesRoutes from "./routes/inscricoes.js";
import suporteRoutes from "./routes/suporte.js";
import loginRoutes from "./routes/login.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    try {
        const time = new Date().toISOString();
        let snippet = '';
        if (req.method === 'POST' || req.method === 'PUT') {
            try {
                const body = JSON.stringify(req.body);
                snippet = body.length > 200 ? body.slice(0, 200) + '...': body;
            } catch (e) {
                snippet = '[unserializable body]';
            }
        }
        console.log(`[${time}] ${req.method} ${req.path} ${snippet}`);
    } catch (e) {
        console.log('Logger error', e && e.message);
    }
    next();
});

// Resolver caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Detectar pasta do front-end entre alguns caminhos possíveis
const candidates = [
    path.join(__dirname, "../front-end"),
    path.join(__dirname, "../Projeto_Integrador/SiteApoia+"),
    path.join(__dirname, "Projeto_Integrador/SiteApoia+"),
    path.join(__dirname, "SiteApoia+")
];

let publicPath = candidates.find(p => fs.existsSync(p));
if (!publicPath) {
    // fallback para ../front-end 
    publicPath = path.join(__dirname, "../front-end");
}

// Servir arquivos estáticos do front-end 
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    // Rota principal — somente envia home.html se existir
    app.get("/", (req, res) => {
        const indexFile = path.join(publicPath, "home.html");
        if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
        return res.status(404).send("Arquivo de front-end não encontrado");
    });
} else {
    // Se nenhuma pasta existir, responder com mensagem simples na raiz
    app.get("/", (req, res) => {
        res.status(500).send("Front-end não encontrado no servidor. Verifique a configuração de pastas.");
    });
}

// Rotas da API
app.use("/doacoes", doacoesRoutes);
app.use("/voluntarios", voluntariosRoutes);
app.use("/ongs", ongRoutes);
app.use("/vagas", vagasRoutes);
app.use("/inscricoes", inscricoesRoutes);
app.use("/suporte", suporteRoutes);
app.use("/login", loginRoutes);

// Iniciar servidor
app.listen(port, () => {
    console.log(` Servidor rodando em http://localhost:${port}`);
    console.log(` Servindo arquivos de: ${publicPath}`);
});
