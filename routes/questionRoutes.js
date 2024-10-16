const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Định tuyến để lấy danh sách câu hỏi theo exam_id
router.get('/:exam_id', questionController.getQuestionsByExamId);

module.exports = router;
