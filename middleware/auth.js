import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default function auth(req, res, next) {
    const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Formato de token inválido' });

    const token = parts[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
}
