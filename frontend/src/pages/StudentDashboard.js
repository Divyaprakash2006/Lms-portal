import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedExams();
    }, []);

    const fetchAssignedExams = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using the route I saw in examRoutes: router.get('/student', protect, getStudentExams);
            // Backend URL context: /api/exams/student
            const res = await axios.get('http://localhost:5000/api/exams/student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle the standardized response format I added earlier: { success: true, count: N, data: [...] }
            // Or fallback if it returns raw array (the controller was updated to return standard JSON)
            setExams(res.data.data || res.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-dashboard-page">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#333' }}>
                    Welcome, {user?.name}
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    Here are your assigned exams and upcoming assessments.
                </p>
            </div>

            <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ marginBottom: '25px', fontSize: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    My Exams
                </h2>

                {loading ? (
                    <p>Loading exams...</p>
                ) : exams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <p>You have no assigned exams at the moment.</p>
                        <Link to="/exams" style={{ color: '#667eea', fontWeight: '600' }}>
                            View All Public Exams
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {exams.map(exam => (
                            <div key={exam._id} style={{
                                border: '1px solid #eee',
                                borderRadius: '10px',
                                padding: '20px',
                                transition: 'transform 0.2s',
                                backgroundColor: '#ffffff'
                            }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{exam.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                                    {exam.subject} • {exam.duration} mins
                                </p>
                                <Link to={`/take-exam/${exam._id}`} style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    background: '#667eea',
                                    color: 'white',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: '600'
                                }}>
                                    Start Exam
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px' }}>
                <Link to="/results" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600'
                }}>
                    View My Results
                </Link>
            </div>
        </div>
        </div>
    );
};

export default StudentDashboard;
