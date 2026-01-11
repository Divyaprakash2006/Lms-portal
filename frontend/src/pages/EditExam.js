import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, updateExam } from '../services/api';
import './CreateExam.css';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(id);
        const examData = response.data.data;
        
        // Format dates for input fields
        const startDate = new Date(examData.startTime).toISOString().slice(0, 16);
        const endDate = new Date(examData.endTime).toISOString().slice(0, 16);
        
        setFormData({
          title: examData.title,
          description: examData.description,
          subject: examData.subject,
          duration: examData.duration,
          totalMarks: examData.totalMarks,
          passingMarks: examData.passingMarks,
          startTime: startDate,
          endTime: endDate
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const examData = {
        ...formData,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime)
      };

      await updateExam(id, examData);
      navigate('/exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update exam');
    }
  };

  if (loading) {
    return (
      <div className="edit-exam-page">
      <div className="d-flex justify-content-center align-items-center vh-50">
        <h4 className="text-primary">Loading exam...</h4>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-exam-page">
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/exams')}>
          Back to Exams
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="edit-exam-page">
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Edit Exam</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Exam Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Passing Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleChange}
                      min="1"
                      max={formData.totalMarks}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      min={formData.startTime}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/exams')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Exam
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EditExam;
