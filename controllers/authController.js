// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { username, email, phone, password, role } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const userId = await User.createUser({
            username,
            email,
            phone,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'Đăng ký thành công', userId });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }

        // Tạo JWT
        const token = jwt.sign(
            { userId: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Đăng nhập thành công', token });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.updateFcmToken = async (req, res) => {
    const { user_id, fcmToken } = req.params;
    try {
        const update = await User.updateFcmToken(user_id, fcmToken);
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi', error: err.message });
    }
};

exports.getUser = async (req, res) => {
    const { user_id} = req.params;
    try {
        const result = await User.findById(user_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi', error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { user_id } = req.params; 
    const { username, email, phone } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại chưa (ngoại trừ user hiện tại)
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.user_id !== parseInt(user_id)) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Cập nhật thông tin người dùng
        await User.updateUser(user_id, { username, email, phone });

        res.status(200).json({ message: 'Cập nhật thông tin thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    const { user_id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        // Tìm người dùng theo user_id
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        await User.updatePassword(user_id, hashedNewPassword);

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};
