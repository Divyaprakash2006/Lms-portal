import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam, getStudents, createStudent } from '../services/api';
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

  // Add Student State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });

  // Load students on mount - Show all students with student role
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await getStudents();
        const studentsList = res.data.data || res.data || [];

        // Remove duplicates
        const uniqueStudents = studentsList.filter(
          (student, index, self) =>
            index === self.findIndex((s) => s._id === student._id)
        );

        console.log('Loaded students:', uniqueStudents); // Debug log
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add createdBy field to associate student with current trainer
      const studentData = {
        ...addForm,
        createdBy: user._id
      };

      await createStudent(studentData);
      alert('Student created successfully!');

      // Refresh list - show all students
      const res = await getStudents();
      const studentsList = res.data.data || res.data || [];

      const uniqueStudents = studentsList.filter(
        (student, index, self) =>
          index === self.findIndex((s) => s._id === student._id)
      );

      setStudents(uniqueStudents);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '' });
    } catch (err) {
      alert('Failed to create student: ' + (err.response?.data?.message || err.message));
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
              <div className="card exam-card-left h-100">
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
                <div className="card-header d-flex justify-content-between border-0 align-items-center fw-bold">
                  Assign Students
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    + Add
                  </button>
                </div>

                <div className="card-body overflow-auto" style={{ maxHeight: '500px' }}>
                  {students.length === 0 ? (
                    <p className="text-muted">No students available. Click "+ Add" to create students.</p>
                  ) : (
                    students
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((student, index) => (
                        <div
                          key={student._id}
                          className="d-flex align-items-center mb-2 p-3 rounded"
                          style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}
                        >
                          <input
                            className="form-check-input me-3"
                            type="checkbox"
                            value={student._id}
                            id={`studentCheck${index}`}
                            checked={formData.assignedStudents.includes(student._id)}
                            onChange={() => handleCheckboxChange(student._id)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                          <label
                            className="form-check-label mb-0 flex-grow-1"
                            htmlFor={`studentCheck${index}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div>
                              <strong>{student.name}</strong>
                            </div>
                            <small className="text-muted">{student.email}</small>
                          </label>
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
              className="btn btn-primary px-5 py-2 main-create-exam-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>

        </form>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">Add New Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddSubmit} id="addStudentForm">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required
                      placeholder="Enter student name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required
                      placeholder="Enter student email"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      required
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary px-4"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Create Student
                    </button>
                  </div>
                </form>
              </div>
              {/* <div className="modal-footer"> Removed to keep buttons inside form */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateExam;