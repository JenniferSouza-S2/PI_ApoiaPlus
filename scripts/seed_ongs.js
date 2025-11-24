import db from "../database/db.js";
import bcrypt from "bcrypt";

async function seedONGs() {
    const ongs = [
        {
            cnpj: "34.028.316/0001-86",
            nome_fantasia: "Greenpeace Brasil",
            razao_social: "Fundação Greenpeace",
            email: "contato@greenpeace.org.br",
            telefone: "(11) 3848-2555",
            endereco: "São Paulo, SP"
        },
        {
            cnpj: "61.414.843/0001-02",
            nome_fantasia: "Santa Marcelina Cultura",
            razao_social: "Instituto Santa Marcelina",
            email: "contato@santamarcelia.org.br",
            telefone: "(11) 2871-7600",
            endereco: "São Paulo, SP"
        },
        {
            cnpj: "08.154.903/0001-22",
            nome_fantasia: "Agência Ambiental Pick-upau",
            razao_social: "Agência Ambiental Pick-upau",
            email: "contato@pickupau.org.br",
            telefone: "(11) 98765-4321",
            endereco: "São Paulo, SP"
        },
        {
            cnpj: "13.317.986/0001-95",
            nome_fantasia: "Educa Mais São Paulo",
            razao_social: "Educa Mais São Paulo",
            email: "contato@educamais.org.br",
            telefone: "(11) 3456-7890",
            endereco: "São Paulo, SP"
        }
    ];

    const senhaHash = await bcrypt.hash("senha123", 10);

    try {
        for (const ong of ongs) {
           
            const existing = db.prepare("SELECT * FROM ONG WHERE cnpj = ?").get(ong.cnpj);
            if (existing) {
                console.log(`ONG ${ong.nome_fantasia} já existe.`);
                continue;
            }

            db.prepare(`
                INSERT INTO ONG (cnpj, nome_fantasia, razao_social, email, telefone, endereco, senha)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(ong.cnpj, ong.nome_fantasia, ong.razao_social, ong.email, ong.telefone, ong.endereco, senhaHash);

            console.log(`✓ ONG ${ong.nome_fantasia} inserida com sucesso.`);
        }

        const allOngs = db.prepare("SELECT id_ong, cnpj, nome_fantasia, email FROM ONG").all();
        console.log("\nTotal de ONGs no banco:", allOngs.length);
        console.log(JSON.stringify(allOngs, null, 2));
    } catch (err) {
        console.error("Erro ao inserir ONGs:", err.message);
    }
}

seedONGs();
