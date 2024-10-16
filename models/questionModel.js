const db = require('../config/db');

class Question {
    //thêm câu hỏi mới
    static async createQuestion(exam_id, question_text) {
        const [result] = await db.query(
            'INSERT INTO questions (exam_id, question_text) VALUES (?, ?)',
            [exam_id, question_text]
        );
        return result.insertId; // Trả về id của câu hỏi vừa tạo
    }
    
    static async deleteQuestionsByExamId(exam_id) {
        await db.query(
            'DELETE FROM questions WHERE exam_id = ?',
            [exam_id]
        );
    }
    
    // Lấy danh sách câu hỏi và câu trả lời dựa trên exam_id
    static async getQuestionsByExamId(exam_id) {
        // Câu truy vấn để lấy danh sách câu hỏi và câu trả lời
        const [questions] = await db.query(`
            SELECT 
                q.question_id, 
                q.question_text, 
                a.answer_id, 
                a.answer_text, 
                a.is_correct
            FROM questions q
            LEFT JOIN answers a ON q.question_id = a.question_id
            WHERE q.exam_id = ?
        `, [exam_id]);

        // Xử lý kết quả trả về
        const result = [];
        const questionMap = {};

        questions.forEach(row => {
            if (!questionMap[row.question_id]) {
                questionMap[row.question_id] = {
                    question_id: row.question_id,
                    question_text: row.question_text,
                    answers: []
                };
                result.push(questionMap[row.question_id]);
            }

            questionMap[row.question_id].answers.push({
                answer_id: row.answer_id,
                answer_text: row.answer_text,
                is_correct: row.is_correct
            });
        });

        return result;
    }
}

module.exports = Question;
