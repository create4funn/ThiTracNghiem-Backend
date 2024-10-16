const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// API lưu lịch sử làm bài
router.post('/save', historyController.saveHistory);

// API lấy lịch sử dựa trên exam_id
router.get('/exam/:exam_id', historyController.getHistoryByExam);

// API lấy lịch sử dựa trên user_id và exam_id
router.get('/:user_id/:exam_id', historyController.getHistoryByUserAndExam);


module.exports = router;
