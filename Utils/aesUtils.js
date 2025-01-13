const crypto = require('crypto');
require('dotenv').config();

const key = process.env.AES_KEY;
const algorithm = 'aes-128-ecb';

exports.encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, key, null);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

exports.decrypt = (encryptedText) => {
    const decipher = crypto.createDecipheriv(algorithm, key, null);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
