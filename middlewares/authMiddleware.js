// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Bạn cần đăng nhập để truy cập tài nguyên này' });
    }

    // Loại bỏ từ khóa "Bearer " khỏi token (nếu có)
    const actualToken = token.split(' ')[1];

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ' });
        }

        req.user = user; // Lưu thông tin user vào request để sử dụng trong các middleware/controller sau
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
