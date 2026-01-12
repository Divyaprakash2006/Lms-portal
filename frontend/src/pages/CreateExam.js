import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam, getStudents, updateStudent, deleteStudent } from '../services/api';
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

  // Edit Student State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

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

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({ name: student.name, email: student.email, password: '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await updateStudent(editingStudent._id, editForm);
      alert('Student updated successfully!');

      // Update local state to reflect changes
      setStudents(prev => prev.map(s =>
        s._id === editingStudent._id ? { ...s, name: editForm.name, email: editForm.email } : s
      ));

      setShowEditModal(false);
      setEditingStudent(null);
    } catch (err) {
      alert('Failed to update student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${studentName}? This action cannot be undone.`)) {
      try {
        await deleteStudent(studentId);
        setStudents(prev => prev.filter(s => s._id !== studentId));
        alert('Student deleted successfully');
      } catch (err) {
        alert('Failed to delete student: ' + (err.response?.data?.message || err.message));
      }
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
                            onClick={() => openEditModal(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => handleDeleteStudent(student._id, student.name)}
                          >
                            Delete
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
      {/* Edit Student Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Edit Student</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingStudent.plainPassword || 'Not Recorded'}
                  disabled
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password to update"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateExam;
