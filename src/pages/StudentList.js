import { useState } from 'react';
import { getRankInfo } from '../utils/rankUtils';
import './StudentList.css';

function StudentList({ students, onAddStudent, onRemoveStudent }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    gradYear: new Date().getFullYear(),
    hoursWorked: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hoursWorked' || name === 'gradYear' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddStudent(formData);
      setFormData({
        name: '',
        studentId: '',
        gradYear: new Date().getFullYear(),
        hoursWorked: 0
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="student-list-page">
      <div className="list-header">
        <h1>Student List</h1>
        <button 
          className="add-student-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Add New Student
        </button>
      </div>

      <div className="list-container">
        {showAddForm && (
          <div className="add-student-form-container">
            <div className="form-card">
              <h2>Add New Student</h2>
              <form onSubmit={handleSubmit} className="add-student-form">
                <div className="form-group">
                  <label htmlFor="name">Student Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Enter student ID"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gradYear">Graduation Year</label>
                    <input
                      type="number"
                      id="gradYear"
                      name="gradYear"
                      value={formData.gradYear}
                      onChange={handleChange}
                      min="2024"
                      max="2030"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="hoursWorked">Initial Hours</label>
                    <input
                      type="number"
                      id="hoursWorked"
                      name="hoursWorked"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Add Student</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="student-list">
          {students.length === 0 ? (
            <div className="empty-state">
              <p>No students yet. Add one to get started!</p>
            </div>
          ) : (
            students.map(student => {
              const rankInfo = getRankInfo(student.points);
              return (
              <div key={student.id} className="student-list-item">
                <div className="item-header">
                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <div className="meta-info">
                      <span className="badge">{rankInfo.rank}</span>
                      <span className="id">ID: {student.studentId || 'N/A'}</span>
                    </div>
                  </div>
                  <button
                    className="remove-item-btn"
                    onClick={() => {
                      if (window.confirm(`Remove ${student.name}?`)) {
                        onRemoveStudent(student.id);
                      }
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>

                <div className="item-details">
                  <div className="detail-column">
                    <span className="detail-label">Graduation Year</span>
                    <span className="detail-value">{student.gradYear || 'N/A'}</span>
                  </div>
                  <div className="detail-column">
                    <span className="detail-label">Join Date</span>
                    <span className="detail-value">
                      {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-column">
                    <span className="detail-label">Current Points</span>
                    <span className="detail-value points">{student.points}</span>
                  </div>
                  <div className="detail-column">
                    <span className="detail-label">Current Hours</span>
                    <span className="detail-value">{student.hoursWorked}</span>
                  </div>
                  <div className="detail-column">
                    <span className="detail-label">Points to Next Rank</span>
                    <span className="detail-value">{rankInfo.pointsToNext}</span>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentList;
