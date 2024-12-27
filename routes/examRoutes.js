const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// Tạo bài kiểm tra trong lớp học
router.post('/create', examController.createExamClassroom);

// Lấy danh sách bài thi theo subject_id
router.get('/subject/:subject_id', examController.getExamsBySubject);

// Lấy danh sách bài thi theo class_id
router.get('/class1/:class_id', examController.getExamsByClass);

router.get('/class2/:class_id', examController.getAllExamsByClass);

// Xóa bài kiểm tra
router.delete('/delete/:exam_id/:class_id', examController.deleteExamClassroom);

// Cập nhật trạng thái bài kiểm tra (ẩn hoặc bỏ ẩn)
router.put('/visibility/:exam_id/:status', examController.updateExamVisibility);

router.put('/update/:exam_id', examController.updateExamClassroom);

module.exports = router;
