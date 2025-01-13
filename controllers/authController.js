// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { encrypt, decrypt } = require('../Utils/aesUtils.js');
const { validateInputs } = require('../Utils/validate');
const { v4: uuidv4 } = require('uuid'); 
const twilio = require('twilio');
// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.register = async (req, res) => {
    const { username, email, phone, password, role } = req.body;

    // Kiểm tra dữ liệu đầu vào có hợp lệ không
    if (!validateInputs({ username, email, phone, password, role })) {
        return res.status(400).json({ message: 'Invalid input. Potential SQL Injection detected.' });
    }

    try {
        const encryptedEmail = encrypt(email);
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findByEmail(encryptedEmail);
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mã hóa số điện thoại
        const encryptedPhone = encrypt(phone);

        // Tạo người dùng mới
        const userId = await User.createUser({
            username,
            email: encryptedEmail,
            phone: encryptedPhone,
            password: hashedPassword,
            role,
        });

        res.status(201).json({ message: 'Đăng ký thành công', userId });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào có hợp lệ không
    if (!validateInputs({ email, password })) {
        return res.status(400).json({ message: 'Invalid input. Potential SQL Injection detected.' });
    }

    try {
        const encryptedEmail = encrypt(email);
        const user = await User.findByEmail(encryptedEmail);
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
        console.log(err)
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
        if (result) {
            // Giải mã email và số điện thoại
            result.email = decrypt(result.email);
            result.phone = decrypt(result.phone);
        }
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
        const encryptedEmail = encrypt(email);
        const existingUser = await User.findByEmail(encryptedEmail);
        if (existingUser && existingUser.user_id !== parseInt(user_id)) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        const encryptedPhone = encrypt(phone);
        
        // Cập nhật thông tin người dùng
        await User.updateUser(user_id, username, encryptedEmail, encryptedPhone);

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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const encryptedEmail = encrypt(email);
        const user = await User.findByEmail(encryptedEmail);
        if (!user) {
            return res.status(404).json({ message: 'Số điện thoại không tồn tại trong hệ thống.' });
        }

        const phone = '+1' + decrypt(user.phone);
        console.log(phone)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expiresAt = new Date(Date.now() + 2 * 60000); // Expires in 2 minutes
        
        // Lưu OTP vào DB
        await User.saveOTP(user.user_id, otpCode, expiresAt);
        // Gửi OTP qua SMS
        // await twilioClient.messages.create({
        //     body: `Mã OTP của bạn là: ${otpCode}`,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phone,
        // });
        // twilioClient.verify.v2.services("VAf08ee4d3006f08b7c8141cbafff6df12")
        // .verifications
        // .create({to: phone, channel: 'sms'})
        // .then(verification_check => console.log(verification_check.status));

        await twilioClient.verify.v2
        .services("VAf08ee4d3006f08b7c8141cbafff6df12")
        .verifications.create({
        channel: "sms",
        customCode: otpCode,
        to: phone,
        });

        res.status(200).json({user_id: user.user_id});
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { user_id, otp_code } = req.body;

    try {
        // const encryptedEmail = encrypt(email);
        // const user = await User.findByEmail(encryptedEmail);

        // if (!user) {
        //     return res.status(404).json({ message: 'Số điện thoại không tồn tại trong hệ thống.' });
        // }

        const otpRequest = await User.findOTPByUserId(user_id);

        if (!otpRequest || otpRequest.otp_code !== otp_code || new Date() > new Date(otpRequest.expires_at)) {
            return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn.' });
        }

        // Xóa OTP sau khi xác minh thành công
        await User.deleteOTP(user_id);

        res.status(200).json({message: "Thành công"});
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { user_id, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(user_id, hashedPassword);

        res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};