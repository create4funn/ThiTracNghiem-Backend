const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');


router.post('/create', classroomController.createClassroom);
router.post('/update', classroomController.updateClassroom);
router.post('/join/:classroom_id/:student_id', classroomController.studentJoinRequest);
router.post('/respond', classroomController.respondJoinRequest);
router.post('/createAnnouncement', classroomController.createAnnouncement);


router.get('/getAll/:student_id', classroomController.getAllClass);
router.get('/student/:student_id', classroomController.getClassroomsByStudentId);
router.get('/teacher/:teacher_id', classroomController.getClassroomsByTeacherId);
router.get('/getJoinRequest/:classroom_id', classroomController.getStudentRequest);
router.get('/getMember/:classroom_id', classroomController.getMember);
router.get('/getAnnouncements/:classroom_id', classroomController.getAnnouncements);
router.get('/search/:keyword', classroomController.searchClassrooms);
router.get('/filter', classroomController.filterClassrooms);

module.exports = router;
