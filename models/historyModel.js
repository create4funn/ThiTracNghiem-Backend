const db = require('../config/db');

class History {
    static async saveHistory({ username, proportion, score, time, exam_id, user_id }) {
        const [result] = await db.query(`
            INSERT INTO history (username, proportion, score, time, exam_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [username, proportion, score, time, exam_id, user_id]);
        return result.insertId;
    }

    // get lịch sử dựa trên user_id và exam_id
    static async getHistoryByUserAndExam(user_id, exam_id) {
        const [rows] = await db.query(`
            SELECT username, proportion, score, time FROM history WHERE user_id = ? AND exam_id = ?
        `, [user_id, exam_id]);
        return rows;
    }

    // get lịch sử dựa trên exam_id
    static async getHistoryByExam(exam_id) {
        const [rows] = await db.query(`
            SELECT username, proportion, score, time FROM history WHERE exam_id = ?
        `, [exam_id]);
        return rows;
    }
}

module.exports = History;
