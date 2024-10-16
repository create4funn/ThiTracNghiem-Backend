// controllers/subjectController.js
const Subject = require('../models/subjectModel');

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.getAllSubjects();
        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách môn học', error: err.message });
    }
};
