const db = require('../config/db');

class Subject {
    static async getAllSubjects() {
        const [rows] = await db.query('SELECT subject_id, subject_name, subject_img FROM subjects');
        return rows;
    }
}

module.exports = Subject;
