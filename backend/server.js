const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

/* ======================
   DATABASE CONNECTION
====================== */
connectDB();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   TEST ROUTE
====================== */
app.get('/', (req, res) => {
  res.json({
    message: 'Online Examination System API',
    status: 'Running',
    version: '1.0.0'
  });
});

/* ======================
   API ROUTES
====================== */

// Authentication (login, register)
app.use('/api/auth', require('./routes/authRoutes'));

// Users (students, trainers)
app.use('/api/users', require('./routes/userRoutes'));

// Exams + assignment logic
app.use('/api/exams', require('./routes/exam'));

// Questions
app.use('/api/questions', require('./routes/question'));

// Submissions
app.use('/api/submissions', require('./routes/submission'));

// Reports (optional - commented out due to missing Report model)
// app.use('/api/reports', require('./routes/reportRoutes'));

/* ======================
   ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
