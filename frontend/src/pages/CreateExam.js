import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam, getStudents } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CreateExam.css';

const CreateExam = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    startTime: '',
    endTime: '',
    assignedStudents: [],
  });

  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load students on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await getStudents();
        const studentsList = res.data.data || res.data || [];
        const uniqueStudents = studentsList.filter(
          (student, index, self) =>
            index === self.findIndex((s) => s._id === student._id)
        );
        setStudents(uniqueStudents);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load students. Ensure you have trainer access.'
        );
      }
    };
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(id)
        ? prev.assignedStudents.filter((sid) => sid !== id)
        : [...prev.assignedStudents, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const examData = { ...formData, createdBy: user._id };
      await createExam(examData);
      alert('Exam created successfully!');
      navigate('/exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page py-5">
      <div className="container">
        <h1 className="text-center mb-5">Create Exam</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">

            {/* Exam Details */}
            <div className="col-lg-6">
              <div className="card exam-card-left    h-100 ">
                <div className="card-header text-black border-0 fw-bold">Exam Details</div>
                <div className="card-body">

                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Duration (mins) *</label>
                      <input
                        type="number"
                        name="duration"
                        className="form-control"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Passing Marks *</label>
                      <input
                        type="number"
                        name="passingMarks"
                        className="form-control"
                        value={formData.passingMarks}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Total Marks *</label>
                      <input
                        type="number"
                        name="totalMarks"
                        className="form-control"
                        value={formData.totalMarks}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Start Time *</label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        className="form-control"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">End Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      className="form-control"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* Assign Students */}
            <div className="col-lg-6">
              <div className="card exam-card-right h-100">
                <div className="card-header d-flex justify-content-between  border-0 align-items-center fw-bold">
                  Assign Students
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => alert('Add Student Modal Here')}
                  >
                    + Add
                  </button>
                </div>

                <div className="card-body overflow-auto" style={{ maxHeight: '500px' }}>
                  {students.length === 0 ? (
                    <p className="text-muted">No students available</p>
                  ) : (
                    students
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((student, index) => (
                        <div
                          key={student._id}
                          className="d-flex justify-content-between align-items-center mb-2 p-2"
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <div className="d-flex align-items-center">
                            <input
                              className="form-check-input1 me-2"
                              type="checkbox" 
                              value={student._id}
                              id={`studentCheck${index}`}
                              checked={formData.assignedStudents.includes(student._id)}
                              onChange={() => handleCheckboxChange(student._id)}
                            />
                            <label
                              className="form-check-label mb-0"
                              htmlFor={`studentCheck${index}`}
                              style={{ fontSize: '0.95rem' }}
                            >
                              <strong>{student.name}</strong>
                              <br />
                              <small className="text-muted">{student.email}</small>
                            </label>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-warning ms-2"
                            onClick={() => alert('Edit student: ' + student.name)}
                          >
                            Edit
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-4 text-center">
            <button
              type="submit"
              className="btn btn-primary   px-2"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateExam;
