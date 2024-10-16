// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

function joinRequestNotiToTeacher(teacherToken) {

    const message = {
        notification: {
            title: 'Yêu cầu tham gia lớp học mới',
            body: `Có 1 yêu cầu mới tham gia lớp học của bạn`,
        },
        data: {
            // Thêm các dữ liệu cần thiết
            title: 'Yêu cầu tham gia lớp học mới',
            body: `Có 1 yêu cầu mới tham gia lớp học của bạn`,
        },
        token: teacherToken, // Token của thiết bị giáo viên
    };

    admin.messaging().send(message)
        .then(response => {
            console.log('Successfully sent message:', response);
        })
        .catch(error => {
            console.log('Error sending message:', error);
        });
}

function joinRespondNotiStudent(studentToken, status) {
    let bodyMessage = '';

    if (status === 0) {
        bodyMessage = 'Yêu cầu tham gia của bạn đã bị từ chối';
    } else if (status === 1) {
        bodyMessage = 'Yêu cầu tham gia của bạn đã được chấp nhận';
    } else {
        bodyMessage = 'Bạn bị vừa bị giáo viên xóa khỏi lớp';
    }

    const message = {
        notification: {
            title: 'Thông báo',
            body: bodyMessage,
        },
        data: {
            title: 'Thông báo',
            body: bodyMessage,
        },
        token: studentToken,
    };

    admin.messaging().send(message)
        .then(response => {
            console.log('Successfully sent message:', response);
        })
        .catch(error => {
            console.log('Error sending message:', error);
        });
}


function newAnnouncementNoti(token, announcementText) {
    const message = {
        notification: {
            title: 'Thông báo mới từ lớp học',
            body: announcementText,
        },
        data: {
            title: 'Thông báo mới từ lớp học',
            body: announcementText,
        },
        token: token, 
    };

    admin.messaging().send(message)
        .then(response => {
            console.log('Successfully sent multicast message:', response);
        })
        .catch(error => {
            console.log('Error sending message:', error);
        });
}

function newExamNoti(token) {
    const message = {
        notification: {
            title: 'Thông báo mới từ lớp học',
            body: 'Vừa có bài kiểm tra mới',
        },
        data: {
            title: 'Thông báo mới từ lớp học',
            body: 'Vừa có bài kiểm tra mới',
        },
        token: token, 
    };

    admin.messaging().send(message)
        .then(response => {
            console.log('Successfully sent multicast message:', response);
        })
        .catch(error => {
            console.log('Error sending message:', error);
        });
}

module.exports = { joinRequestNotiToTeacher, joinRespondNotiStudent, newAnnouncementNoti, newExamNoti };
