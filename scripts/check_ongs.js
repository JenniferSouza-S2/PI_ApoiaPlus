import db from "../database/db.js";

const ongs = db.prepare('SELECT id_ong, cnpj, nome_fantasia, email FROM ONG').all();
console.log('Total ONGs:', ongs.length);
console.log('ONGs:', JSON.stringify(ongs, null, 2));
