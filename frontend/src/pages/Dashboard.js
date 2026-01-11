import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateExam.css';
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Redirect if user is not a trainer
    if (user?.role !== 'trainer') {
      navigate('/student-dashboard'); // Redirect to student dashboard
    } else {
      fetchStudentReports();
    }
  }, [user, navigate]);

  const fetchStudentReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://lms-portal-u9ze.vercel.app/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reportData = res.data.data || res.data;
      setReports(Array.isArray(reportData) ? reportData : []);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      setReports([]);
    }
  };

  // Optional: in case user data is not loaded yet
  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="Dashboard-page">
      <div className="container py-5">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Trainer Dashboard</h2>

        <Link to="/student-login" className="btn btn-outline-primary">
          Student Login Page
        </Link>
      </div>

      <p className="text-muted mb-4">
        Welcome <strong>{user.name}</strong> ({user.role})
      </p>

      {/* REPORT TABLE */}
      <div className="card">
        <div className="card-header text-black fw-semibold">
          Recent Student Reports
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Student Name</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No student submissions yet
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.studentName}</td>
                    <td>{report.examTitle}</td>
                    <td>{report.score}/{report.totalMarks}</td>
                    <td>{report.percentage.toFixed(2)}%</td>
                    <td>
                      <span
                        className={`badge ${report.status === 'pass' ? 'bg-success' : 'bg-danger'}`}
                      >
                        {report.status === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Dashboard;
