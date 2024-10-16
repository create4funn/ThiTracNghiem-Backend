const Question = require('../models/questionModel');

exports.getQuestionsByExamId = async (req, res) => {
    const { exam_id } = req.params; // Lấy exam_id từ URL params

    try {
        // Gọi phương thức model để lấy câu hỏi và câu trả lời
        const questions = await Question.getQuestionsByExamId(exam_id);

        // Trả về danh sách câu hỏi và câu trả lời
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};
