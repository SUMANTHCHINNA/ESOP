const jwt = require('jsonwebtoken');

const generateToken = async (id, email) => {
    const token = jwt.sign(
        { id, email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    return token;
}

module.exports = {
    generateToken
}