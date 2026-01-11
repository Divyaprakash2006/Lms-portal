import axios from 'axios';

/* ======================
   AXIOS INSTANCE
====================== */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

/* ======================
   TOKEN INTERCEPTOR
====================== */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================
   AUTH APIs
====================== */
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getCurrentUser = () => API.get('/auth/me');

/* ======================
   USER APIs
====================== */
export const getStudents = () => API.get('/users/students');
export const getStudentById = (id) => API.get(`/users/${id}`);
export const deleteStudent = (id) => API.delete(`/users/${id}`);

/* ======================
   EXAM APIs
====================== */
export const getAllExams = () => API.get('/exams');
export const getExamById = (id) => API.get(`/exams/${id}`);
export const createExam = (data) => API.post('/exams', data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const deleteExam = (id) => API.delete(`/exams/${id}`);
export const getExamQuestions = (examId) =>
  API.get(`/exams/${examId}/questions`);

/* ======================
   QUESTION APIs
====================== */
export const importQuestionsFromXML = (examId, file) => {
  const formData = new FormData();
  formData.append('xmlFile', file);

  return API.post(`/questions/import/${examId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const previewQuestionsFromXML = (examId, file) => {
  const formData = new FormData();
  formData.append('xmlFile', file);

  return API.post(`/questions/import-preview/${examId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteQuestion = (id) =>
  API.delete(`/questions/${id}`);

/* ======================
   SUBMISSION APIs
====================== */
export const submitExam = (data) => API.post('/submissions', data);
export const getAllSubmissions = () => API.get('/submissions');
export const getSubmissionById = (id) => API.get(`/submissions/${id}`);
export const getSubmissionsByStudent = (studentId) =>
  API.get(`/submissions/student/${studentId}`);
export const getSubmissionsByExam = (examId) =>
  API.get(`/submissions/exam/${examId}`);

/* ======================
   REPORT APIs (NEW)
====================== */
export const getAllReports = () => API.get('/reports');
export const getReportsByStudent = (studentId) =>
  API.get(`/reports/student/${studentId}`);
export const getReportsByExam = (examId) =>
  API.get(`/reports/exam/${examId}`);

export default API;
