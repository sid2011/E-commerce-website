const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_e_commerce_secret_key_2026';

module.exports = {
    generateToken: (payload, expiresIn = '1d') => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    },
    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return null;
        }
    }
};
