// models/userModel.js
const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async createUser(user) {
        const { username, email, phone, password, role } = user;
        const [result] = await db.query(
            'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, phone, password, role]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT user_id, username, email, phone, password FROM users WHERE user_id = ?', [id]);
        return rows[0];
    }

    static async updateFcmToken(user_id, fcm_token) {
        await db.query(`
            UPDATE users SET fcm_token = ? WHERE user_id = ?
        `, [fcm_token, user_id]);
    }

    static async getFcmToken(user_id) {
        const [rows] = await db.query('SELECT fcm_token FROM users WHERE user_id = ?', [user_id]);
        
        return rows[0].fcm_token;
    }

    static async updateUser(user_id, user) {
        const { username, email, phone } = user;
        const [result] = await db.query(
            'UPDATE users SET username = ?, email = ?, phone = ? WHERE user_id = ?',
            [username, email, phone, user_id]
        );
        return result;
    }
    
    static async updatePassword(user_id, newPassword) {
        const [result] = await db.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [newPassword, user_id]
        );
        return result;
    }
    
}

module.exports = User;
