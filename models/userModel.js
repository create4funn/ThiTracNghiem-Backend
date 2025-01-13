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
        const [rows] = await db.query('SELECT user_id, username, email, phone FROM users WHERE user_id = ?', [id]);
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

    static async updateUser(user_id, username, email, phone) {
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


    static async saveOTP(user_id, otp_code, expires_at) {
        const [result] = await db.query(
            'INSERT INTO otp_requests (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
            [user_id, otp_code, expires_at]
        );
        return result.insertId;
    }
    
    static async findOTPByUserId(user_id) {
        const [rows] = await db.query(
            'SELECT * FROM otp_requests WHERE user_id = ? ORDER BY expires_at DESC LIMIT 1',
            [user_id]
        );
        return rows[0];
    }
    
    static async deleteOTP(user_id) {
        await db.query('DELETE FROM otp_requests WHERE user_id = ?', [user_id]);
    }
    
    
}

module.exports = User;
