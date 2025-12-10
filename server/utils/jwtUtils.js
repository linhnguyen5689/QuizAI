const jwt = require('jsonwebtoken');

const generateJWTToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = { generateJWTToken }; 