const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);        
        const userQuery = 'SELECT id, full_name, user_email FROM users WHERE id = $1';
        const result = await pool.query(userQuery, [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Account not found' });
        }

        req.user = result.rows[0];
        next();
    } catch (err) {
        console.error('[Auth Error]:', err.message);
        res.status(401).json({ message: 'Session expired or invalid' });
    }
};

module.exports = authMiddleware;