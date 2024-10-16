const db = require('../config/db');
const User = require('./userModel');

class Classroom {
    // Phương thức để tạo lớp học mới
    static async createClassroom({ class_name, grade, subject_name, class_img, teacher_id }) {
        const [result] = await db.query(
            'INSERT INTO classrooms (class_name, grade, subject_name, class_img, teacher_id) VALUES (?, ?, ?, ?, ?)',
            [class_name, grade, subject_name, class_img, teacher_id]
        );
        return result.insertId; // Trả về ID của lớp học vừa được tạo
    }

    //update thông tin
    static async updateClassroom({ classroom_id, class_name, grade, subject_name }) {
        const [result] = await db.query(
            'UPDATE classrooms SET class_name = ?, grade = ?, subject_name = ? WHERE classroom_id = ?',
            [class_name, grade, subject_name, classroom_id]
        );

        return result; // Trả về kết quả của truy vấn
    }

    // Lấy danh sách các lớp học mà học sinh đã tham gia dựa trên student_id
    static async getClassroomsByStudentId(student_id) {
        const [classrooms] = await db.query(`
            SELECT c.classroom_id, c.class_name, c.grade, c.subject_name, c.class_img
            FROM classrooms c
            INNER JOIN clr_student_join csj ON c.classroom_id = csj.classroom_id
            WHERE csj.student_id = ? AND csj.status = 1
        `, [student_id]);

        return classrooms;
    }

    // getAllClassForStudent
    static async getAllClass(student_id) {
        const [classroom] = await db.query(`
            SELECT c.classroom_id, c.class_name, c.grade, c.subject_name, c.class_img
            FROM classrooms c
            LEFT JOIN clr_student_join csj ON c.classroom_id = csj.classroom_id AND csj.student_id = ?
            WHERE csj.status IS NULL OR csj.status = 0
        `, [student_id]);
        return classroom;
    }


    static async getClassroomsByTeacher(teacher_id) {
        const [classroom] = await db.query(
            `SELECT classroom_id, class_name, grade, subject_name, class_img , numOfMem, numOfTest
            FROM classrooms WHERE teacher_id = ?`, [teacher_id]);
        return classroom;
    }


    static async studentJoinRequest(classroom_id, student_id) {

        const [existingRows] = await db.query(`
            SELECT * FROM clr_student_join WHERE classroom_id = ? AND student_id = ?
        `, [classroom_id, student_id]);


        if (existingRows.length === 0) {
            const [rows] = await db.query(`
            INSERT INTO clr_student_join (classroom_id, student_id, status) VALUES (?, ?, ?)
        `, [classroom_id, student_id, 0]);

            return rows;
        } else {
            // Nếu bản ghi đã tồn tại, có thể trả về thông báo hoặc dữ liệu nào đó
            return { message: "Student already requested to join this classroom" };
        }
    }

    static async respondJoinRequest(classroom_id, student_id, response) {
        if (response === 0) {
            const [result] = await db.query(
                'DELETE FROM clr_student_join WHERE classroom_id = ? AND student_id = ?',
                [classroom_id, student_id]
            );
            return result;
        } else if (response === 1) {
            const [result] = await db.query(
                'UPDATE clr_student_join SET status = 1 WHERE classroom_id = ? AND student_id = ?',
                [classroom_id, student_id]
            );
            await db.query(
                'UPDATE classrooms SET numOfMem = numOfMem + 1 WHERE classroom_id = ?',
                [classroom_id]
            );
            return result;
        } else {
            const [result] = await db.query(
                'DELETE FROM clr_student_join WHERE classroom_id = ? AND student_id = ?',
                [classroom_id, student_id]
            );
            await db.query(
                'UPDATE classrooms SET numOfMem = numOfMem - 1 WHERE classroom_id = ?',
                [classroom_id]
            );
            return result;
        }
    }

    static async getStudentRequest(classroom_id) {
        const [students] = await db.query(
            `SELECT u.user_id, u.username, u.phone
            FROM clr_student_join csj
            JOIN users u ON csj.student_id = u.user_id
            WHERE csj.classroom_id = ? AND csj.status = 0`,
            [classroom_id]
        );
        return students;
    }
    // static async getStudentRequest(classroom_id) {
    //     const [classroom] = await db.query(
    //         `SELECT student_id 
    //         FROM clr_student_join WHERE classroom_id = ? AND status = 0`, [classroom_id]);
    //     return classroom;
    // }

    static async getMemberClassroom(classroom_id) {
        const [members] = await db.query(
            `SELECT u.user_id, u.username, u.phone
            FROM clr_student_join csj
            JOIN users u ON csj.student_id = u.user_id
            WHERE csj.classroom_id = ? AND csj.status = 1`,
            [classroom_id]
        );
        return members;
    }


    static async createAnnouncement(classroom_id, text) {
        const result = await db.query(
            `INSERT INTO announcements (classroom_id, text) VALUES (?, ?)`,
            [classroom_id, text]
        );
        return result;
    }

    static async getAnnouncements(classroom_id) {
        const result = await db.query(
            `SELECT text, create_at 
            FROM announcements WHERE classroom_id = ? ORDER BY create_at DESC`,
            [classroom_id]
        );
        return result;
    }

    static async search(keyword) {
        const searchPattern = `%${keyword}%`;  // Mẫu tìm kiếm với ký tự đại diện %

        const [result] = await db.query(
            `SELECT classroom_id, class_name, grade, subject_name, class_img
                FROM classrooms 
                WHERE class_name LIKE ? 
                OR subject_name LIKE ? 
                OR grade LIKE ?`,
            [searchPattern, searchPattern, searchPattern]
        );
        // const [result] = await db.query(
        //     `SELECT c.classroom_id, c.class_name, c.grade, c.subject_name, c.class_img
        //         FROM classrooms c LEFT JOIN clr_student_join csj 
        //         ON c.classroom_id = csj.classroom_id AND csj.student_id = ?
        //         WHERE (c.class_name LIKE ? OR c.subject_name LIKE ? OR c.grade LIKE ?)
        //         AND (csj.classroom_id IS NULL OR csj.status = 0)`,
        //     [student_id, searchPattern, searchPattern, searchPattern]
        // );

        return result;
    }


    static async filterClassrooms({ subject_name, grade }) {
        let query = 'SELECT classroom_id, class_name, grade, subject_name, class_img FROM classrooms WHERE 1=1';
        const params = [];

        if (subject_name != "") {
            query += ' AND subject_name = ?';
            params.push(subject_name);
        }

        if (grade != "") {
            query += ' AND grade = ?';
            params.push(grade);
        }

        const [classrooms] = await db.query(query, params);
        return classrooms;
    }


    
    static async getAllStudentsInClassroom(classroom_id) {
        const [students] = await db.query(
            'SELECT student_id FROM clr_student_join WHERE classroom_id = ? AND status = 1',
            [classroom_id]
        );
        return students;
    }
}

module.exports = Classroom;
