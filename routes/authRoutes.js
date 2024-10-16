// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/updateFcmToken/:user_id/:fcmToken', authController.updateFcmToken);
router.get('/getUser/:user_id', authController.getUser);
router.put('/updateProfile/:user_id', authController.updateProfile);
router.put('/changePassword/:user_id', authController.changePassword);

module.exports = router;
