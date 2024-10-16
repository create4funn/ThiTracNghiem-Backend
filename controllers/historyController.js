const History = require('../models/historyModel');

exports.saveHistory = async (req, res) => {
    const { username, proportion, score, time, exam_id, user_id } = req.body;

    try {
        // Lưu lịch sử làm bài vào database
        const historyId = await History.saveHistory({
            username,
            proportion,
            score,
            time,
            exam_id,
            user_id
        });

        res.status(201).json({ message: 'Lịch sử làm bài đã được lưu', historyId });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
        console.error('Error saving history:', err.message);
    }
};

// Lấy lịch sử thi dựa trên user_id và exam_id
exports.getHistoryByUserAndExam = async (req, res) => {
    const { user_id, exam_id } = req.params;
    
    try {
        const history = await History.getHistoryByUserAndExam(user_id, exam_id);
        if (history.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch sử thi' });
        }
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

// Lấy lịch sử thi dựa trên exam_id
exports.getHistoryByExam = async (req, res) => {
    const { exam_id } = req.params;
    
    try {
        const history = await History.getHistoryByExam(exam_id);
        if (history.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch sử thi' });
        }
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};