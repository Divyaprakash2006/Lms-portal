import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAllExams } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ExamList = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getAllExams();
      setExams(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Fetch exams error:', err);
      setError('Failed to fetch exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this exam?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://lms-portal-u9ze.vercel.app/api/exams/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setExams(exams.filter((exam) => exam._id !== id));
      alert('Exam deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete exam');
    }
  };
  
  const isTrainer = user?.role === 'trainer' || user?.role === 'admin';

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '100px', color: '#c33' }}>{error}</div>;

  return (
    <div className="exam-list-page">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 50 }}>
        Available Exams
      </h1>

      {exams.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: 15,
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
          }}
        >
          <p>No exams available</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 30
          }}
        >
          {exams.map((exam) => (
            <div
              key={exam._id}
              style={{
                background: 'white',
                padding: 25,
                borderRadius: 15,
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 10 }}>{exam.title}</h3>
                <p style={{ color: '#666', marginBottom: 15 }}>{exam.description}</p>

                <div style={{ marginBottom: 20 }}>
                  <div><strong>Subject:</strong> {exam.subject}</div>
                  <div><strong>Duration:</strong> {exam.duration} mins</div>
                  <div><strong>Total Marks:</strong> {exam.totalMarks}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to={`/exams/${exam._id}`}
                  className="btn btn-secondary flex-grow-1 text-center"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  View Details
                </Link>

                <Link
                  to={`/take-exam/${exam._id}`}
                  className="btn"
                  style={{
                    flexGrow: 1,
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  Take Exam
                </Link>

                {isTrainer && (
                  <>
                    <Link
                      to={`/edit-exam/${exam._id}`}
                      className="btn btn-warning flex-grow-1 text-center"
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="btn btn-danger flex-grow-1"
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ExamList;
