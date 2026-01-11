# AI-Powered Learning Management System

A comprehensive Learning Management System built with React and Node.js, featuring AI-powered evaluation and question import capabilities.

## 🚀 Framework & Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Styling**: Bootstrap 5.3.3, Bootstrap Icons
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **Build Tool**: Create React App with CRACO

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **File Upload**: Multer
- **XML Parsing**: xml2js
- **CORS**: CORS middleware
- **Development**: Nodemon

## 📁 Project Structure

```
AI-Powered-LMS/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js           # Main app component
│   ├── package.json
│   └── craco.config.js
│
├── backend/                  # Express backend API
│   ├── config/              # Configuration files
│   │   └── db.js            # Database connection
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── server.js            # Entry point
│   └── package.json
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the backend server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📦 Package Scripts

### Backend
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Frontend
```json
{
  "start": "craco start",
  "build": "craco build",
  "test": "craco test",
  "eject": "react-scripts eject"
}
```

## 🌟 Key Features

### For Teachers
- Create and manage exams
- Import questions from XML (Moodle format)
- Multiple question types support
- Automated grading system
- Performance analytics
- Student progress tracking

### For Students
- Take exams with timed sessions
- View results and feedback
- Track performance history
- User-friendly interface

## 🔐 Authentication

The system uses JWT-based authentication:
- Token expires in 30 days
- Stored in localStorage on frontend
- Protected routes with middleware
- Role-based access (Teacher/Student)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam (Teacher)
- `GET /api/exams/:id` - Get exam details
- `PUT /api/exams/:id` - Update exam (Teacher)
- `DELETE /api/exams/:id` - Delete exam (Teacher)

### Questions
- `POST /api/questions/import` - Import questions from XML

### Submissions
- `POST /api/submissions` - Submit exam
- `GET /api/submissions/exam/:examId` - Get submissions for exam
- `GET /api/submissions/student` - Get student's submissions

### Reports
- `GET /api/reports/exam/:examId` - Get exam report
- `GET /api/reports/student/:studentId` - Get student report

## 🗄️ Database Models

### User
- email, password, role (teacher/student)
- JWT authentication

### Exam
- title, description, duration
- questions array
- createdBy (teacher reference)
- timestamps

### Question
- question, options, correctAnswer
- type (multiple-choice, true-false)
- points

### Submission
- student, exam references
- answers array
- score, submittedAt
- grading details

### Report
- Performance analytics
- Statistics and insights

## 🚦 Development Workflow

1. **Start MongoDB**:
```bash
mongod
```

2. **Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

3. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm start
```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📝 XML Import Format

The system supports Moodle XML question format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="multichoice">
    <name>
      <text>Sample Question</text>
    </name>
    <questiontext format="html">
      <text>What is 2+2?</text>
    </questiontext>
    <answer fraction="100">
      <text>4</text>
    </answer>
    <answer fraction="0">
      <text>3</text>
    </answer>
  </question>
</quiz>
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
cd backend
npm test
```

## 🏗️ Build for Production

### Frontend
```bash
cd frontend
npm run build
```
Creates optimized production build in `frontend/build/`

### Backend
```bash
cd backend
npm start
```
Runs in production mode

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for MongoDB Atlas)

### CORS Errors
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check CORS configuration in backend

### Port Already in Use
```bash
# Kill process on port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Divyaprakash

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Happy Learning! 🎓**
