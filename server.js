
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const https = require("https");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/history', historyRoutes);

// HTTPS Configuration
const key = fs.readFileSync("key.pem");
const cert = fs.readFileSync("cert.pem");

const httpsOptions = {key,cert,};

// Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
});


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
