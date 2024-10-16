const Classroom = require('../models/classroomModel');
const User = require('../models/userModel');
const db = require('../config/db');
const { joinRequestNotiToTeacher } = require('../firebase');
const { joinRespondNotiStudent } = require('../firebase');
const { newAnnouncementNoti } = require('../firebase');

exports.createClassroom = async (req, res) => {
    const { class_name, grade, subject_name, class_img, teacher_id } = req.body; // Lấy dữ liệu từ body của request

    try {
        // Kiểm tra dữ liệu đầu vào
        if (!class_name || !grade || !subject_name || !class_img || !teacher_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin lớp học' });
        }

        // Gọi model để tạo lớp học mới
        const classroomId = await Classroom.createClassroom({ class_name, grade, subject_name, class_img, teacher_id });

        res.status(201).json({ message: 'Lớp học được tạo thành công', classroomId });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.updateClassroom = async (req, res) => {
    const { classroom_id, class_name, grade, subject_name } = req.body; // Lấy dữ liệu từ body của request

    try {
        // Kiểm tra dữ liệu đầu vào
        if (!classroom_id || !class_name || !grade || !subject_name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin cập nhật lớp học' });
        }

        // Gọi model để cập nhật lớp học
        const result = await Classroom.updateClassroom({ classroom_id, class_name, grade, subject_name });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lớp học không tồn tại' });
        }

        res.status(200).json({ message: 'Lớp học được cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


exports.getClassroomsByStudentId = async (req, res) => {
    const { student_id } = req.params; // Lấy student_id từ URL params

    try {
        // Gọi phương thức model để lấy danh sách lớp học
        const classrooms = await Classroom.getClassroomsByStudentId(student_id);

        // Trả về danh sách lớp học
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.getClassroomsByTeacherId = async (req, res) => {
    const { teacher_id } = req.params; // Lấy id từ URL params

    try {
        // Gọi phương thức model để lấy danh sách lớp học
        const classrooms = await Classroom.getClassroomsByTeacher(teacher_id);

        // Trả về danh sách lớp học
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.getAllClass = async (req, res) => {
    const { student_id } = req.params; // Lấy student_id từ URL params
    try {
        const classroom = await Classroom.getAllClass(student_id);
        res.status(200).json(classroom);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
}

exports.studentJoinRequest = async (req, res) => {
    const { classroom_id, student_id } = req.params;
    try {
        const classroom = await Classroom.studentJoinRequest(classroom_id, student_id);
        const [row] = await db.query(
            `SELECT teacher_id FROM classrooms WHERE classroom_id = ?`, [classroom_id]
        );
        const teacher_id = row[0].teacher_id; 
        const teacherFcmToken = await User.getFcmToken(teacher_id);

            // Gửi thông báo tới giáo viên nếu có token
            if (teacherFcmToken) {
                
                await joinRequestNotiToTeacher(teacherFcmToken);
            }
        res.status(201).json({ message: 'Gửi request thành công', classroom });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
}

//Lấy thông tin những user đã xin tham gia lớp
exports.getStudentRequest = async (req, res) => {
    const { classroom_id } = req.params;
    
    try {
        // Lấy thông tin học sinh đã xin tham gia lớp bằng một truy vấn JOIN
        const studentInfoList = await Classroom.getStudentRequest(classroom_id);
        
        // Nếu không có yêu cầu tham gia nào
        if (studentInfoList.length === 0) {
            return res.status(404).json({ message: 'Không có yêu cầu tham gia lớp' });
        }
        
        // Trả về danh sách thông tin học sinh
        res.status(200).json(studentInfoList);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }

};


exports.respondJoinRequest = async (req, res) => {
    const { classroom_id, student_id, response } = req.body;
    try {
        const classroom = await Classroom.respondJoinRequest(classroom_id, student_id, response);
        
        const studentFcmToken = await User.getFcmToken(student_id);
        if (studentFcmToken) {
            await joinRespondNotiStudent(studentFcmToken, response);
        }

        res.status(200).json(classroom);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
}


exports.getMember = async (req, res) => {
    const { classroom_id } = req.params;
    
    try {
        // Lấy thông tin học sinh đã xin tham gia lớp bằng một truy vấn JOIN
        const studentInfoList = await Classroom.getMemberClassroom(classroom_id);
        
        // Nếu không có yêu cầu tham gia nào
        if (studentInfoList.length === 0) {
            return res.status(404).json({ message: 'Không có thành viên' });
        }
        
        // Trả về danh sách thông tin học sinh
        res.status(200).json(studentInfoList);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


exports.createAnnouncement = async (req, res) => {
    const { classroom_id, text } = req.body;

    try {
        const result = await Classroom.createAnnouncement(classroom_id, text);
      

        // Lấy danh sách học sinh trong lớp
        const students = await Classroom.getAllStudentsInClassroom(classroom_id);

        // Gửi thông báo đến từng học sinh
        for (const student of students) {
            const studentFcmToken = await User.getFcmToken(student.student_id);
            if (studentFcmToken) {
                const message = `Bạn có một thông báo mới: ${text}`;
                await newAnnouncementNoti(studentFcmToken, message);
            }
        }

        // Trả về phản hồi thành công
        res.status(201).json({ message: 'Thông báo đã được tạo thành công', announcement_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};


exports.getAnnouncements = async (req, res) => {
    const { classroom_id } = req.params;

    try {
        const [result] = await Classroom.getAnnouncements(classroom_id);
        
        // Trả về phản hồi thành công
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.searchClassrooms = async (req, res) => {
    const { keyword } = req.params;

    try {
        // Gọi hàm tìm kiếm từ model với từ khóa người dùng nhập
        const classrooms = await Classroom.search(keyword);

        // Nếu không tìm thấy lớp nào
        if (classrooms.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phù hợp' });
        }

        // Trả về danh sách các lớp học phù hợp
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.filterClassrooms = async (req, res) => {
    const { subject_name, grade } = req.query; // Lấy dữ liệu lọc từ query string

    try {
        // Gọi model để lọc lớp học
        const classrooms = await Classroom.filterClassrooms({ subject_name, grade });

        // Trả về danh sách lớp học đã lọc
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};
