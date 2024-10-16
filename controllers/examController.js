const Exam = require('../models/examModel');
const Question = require('../models/questionModel');
const Answer = require('../models/answerModel');
const Classroom = require('../models/classroomModel');
const User = require('../models/userModel');
const { newExamNoti } = require('../firebase');

exports.createExamClassroom = async (req, res) => {
    const { exam_name, class_id, subject_id, duration, numOfQues, pdf, questions } = req.body;

    try {
        // Tạo bài kiểm tra mới
        const exam_id = await Exam.createExam({ exam_name, class_id, subject_id, duration, numOfQues, pdf });

        // Lặp qua từng câu hỏi
        for (const question of questions) {
            // Tạo câu hỏi
            const question_id = await Question.createQuestion(exam_id, question.question_text);

            // Lặp qua các câu trả lời của mỗi câu hỏi
            for (const answer of question.answers) {
                await Answer.createAnswer(question_id, answer.answer_text, answer.is_correct);
            }
        }

        // Lấy danh sách học sinh trong lớp
        const students = await Classroom.getAllStudentsInClassroom(class_id);

        // Gửi thông báo đến từng học sinh
        for (const student of students) {
            const studentFcmToken = await User.getFcmToken(student.student_id);
            if (studentFcmToken) {
                await newExamNoti(studentFcmToken);
            }
        }
        res.status(201).json({ message: 'Tạo bài kiểm tra thành công', exam_id });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.deleteExamClassroom = async (req, res) => {
    const { exam_id } = req.params; 

    try {
        // Xóa các câu trả lời
        await Answer.deleteAnswersByExamId(exam_id);

        // Xóa các câu hỏi
        await Question.deleteQuestionsByExamId(exam_id);

        // Xóa bài kiểm tra
        await Exam.deleteExam(exam_id);

        res.status(200).json({ message: 'Xóa bài kiểm tra thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


exports.getExamsBySubject = async (req, res) => {
    const { subject_id } = req.params;
    
    try {
        const exams = await Exam.getExamsBySubject(subject_id);
        res.status(200).json(exams);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.getExamsByClass = async (req, res) => {
    const { class_id } = req.params;

    try {
        const exams = await Exam.getExamsByClass(class_id);
        res.status(200).json(exams);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.getAllExamsByClass = async (req, res) => {
    const { class_id } = req.params;

    try {
        const exams = await Exam.getAllExamsByClass(class_id);
        res.status(200).json(exams);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


// Ẩn hoặc bỏ ẩn bài kiểm tra
exports.updateExamVisibility = async (req, res) => {
    const { exam_id, status } = req.params;

    try {
        
        // Cập nhật trạng thái của bài kiểm tra
        await Exam.updateExamStatus(exam_id, status);

        const message = status === 0 ? 'Bài kiểm tra đã được ẩn' : 'Bài kiểm tra đã được bỏ ẩn';
        res.status(200).json({ message });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


exports.updateExamClassroom = async (req, res) => {
    const { exam_id } = req.params;
    const { exam_name, duration, numOfQues, pdf, questions } = req.body;

    try {
        // Cập nhật thông tin bài kiểm tra
        await Exam.updateExam(exam_id, exam_name, duration, numOfQues, pdf);

        // Xóa câu hỏi và câu trả lời cũ của bài kiểm tra
        await Answer.deleteAnswersByExamId(exam_id);
        await Question.deleteQuestionsByExamId(exam_id);

        // Thêm lại các câu hỏi và câu trả lời mới
        for (const question of questions) {
            const question_id = await Question.createQuestion(exam_id, question.question_text);
            for (const answer of question.answers) {
                await Answer.createAnswer(question_id, answer.answer_text, answer.is_correct);
            }
        }

        res.status(200).json({ message: 'Cập nhật bài kiểm tra thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};
