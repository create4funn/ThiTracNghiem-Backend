const db = require('../config/db');

class Answer {
    // Thêm câu trả lời cho câu hỏi
    static async createAnswer(question_id, answer_text, is_correct) {
        await db.query(
            'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
            [question_id, answer_text, is_correct]
        );
    }

    static async deleteAnswersByExamId(exam_id) {
        await db.query(
            'DELETE FROM answers WHERE question_id IN (SELECT question_id FROM questions WHERE exam_id = ?)',
            [exam_id]
        );
    }
}

module.exports = Answer;
