const db = require('../config/db');

class Exam {
    static async createExam({ exam_name, class_id, subject_id, duration, numOfQues, pdf }) {
        const [result] = await db.query(
            'INSERT INTO exams (exam_name, class_id, subject_id, duration, numOfQues, pdf, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [exam_name, class_id, subject_id, duration, numOfQues, pdf, 1]
        );

        await db.query(
            'UPDATE classrooms SET numOfTest = numOfTest + 1 WHERE classroom_id = ?',
            [class_id]
        );
        return result.insertId; 
    }

    // Xóa bài kiểm tra
    static async deleteExam(exam_id, class_id) {
        await db.query(
            'DELETE FROM exams WHERE exam_id = ?',
            [exam_id]
        );

        await db.query(
            'UPDATE classrooms SET numOfTest = numOfTest - 1 WHERE classroom_id = ?',
            [class_id]
        );
    }


    static async getExamsBySubject(subject_id) {
        const [rows] = await db.query(
            'SELECT exam_id, exam_name, duration, numOfQues FROM exams WHERE subject_id = ?',
            [subject_id]
        );
        return rows;
    }

    static async getExamsByClass(class_id) {
        const [rows] = await db.query(
            'SELECT exam_id, exam_name, duration, numOfQues, pdf FROM exams WHERE class_id = ? and status = ?',
            [class_id, 1]
        );
        return rows;
    }

    static async getAllExamsByClass(class_id) {
        const [rows] = await db.query(
            'SELECT exam_id, exam_name, duration, numOfQues, pdf, status FROM exams WHERE class_id = ?',
            [class_id]
        );
        return rows;
    }


    // Cập nhật trạng thái bài kiểm tra (ẩn/bỏ ẩn)
    static async updateExamStatus(exam_id, status) {
        await db.query(
            'UPDATE exams SET status = ? WHERE exam_id = ?',
            [status, exam_id]
        );
    }

    // Phương thức để cập nhật bài kiểm tra
    static async updateExam(exam_id, exam_name, duration, numOfQues, pdf) {
        await db.query(
            'UPDATE exams SET exam_name = ?, duration = ?, numOfQues = ?, pdf = ? WHERE exam_id = ?',
            [exam_name, duration, numOfQues, pdf, exam_id]
        );
    }
}

module.exports = Exam;
