import db from "../database/db.js";
import bcrypt from "bcrypt";

const email = "admin@apoia.com.br";
const senha = "Admin@2025";

try {
    // Verificar se admin já existe
    const existing = db.prepare("SELECT * FROM Admin WHERE email = ?").get(email);
    if (existing) {
        console.log("✓ Admin já existe no banco de dados");
        console.log(`  Email: ${existing.email}`);
        process.exit(0);
    }

    // Hash da senha
    const senhaHash = bcrypt.hashSync(senha, 10);

    // Inserir admin
    const stmt = db.prepare("INSERT INTO Admin (email, senha) VALUES (?, ?)");
    const result = stmt.run(email, senhaHash);

    console.log("✓ Conta admin criada com sucesso!");
    console.log(`\n  Email: ${email}`);
    console.log(`  Senha: ${senha}`);
    console.log(`\n    GUARDE ESSA SENHA COM SEGURANÇA!`);
} catch (err) {
    console.error("Erro ao criar admin:", err.message);
    process.exit(1);
}
