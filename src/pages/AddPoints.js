import { useState } from 'react';
import './AddPoints.css';

function AddPoints({ students, onAddPoints }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoursToAdd, setHoursToAdd] = useState('');
  const [pointsHistory, setPointsHistory] = useState([]);

  const handleAddPoints = (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !hoursToAdd || Number(hoursToAdd) <= 0) {
      alert('Please select a student and enter hours');
      return;
    }

    const hours = Number(hoursToAdd);
    const points = Math.floor(hours / 10);
    
    const historyEntry = {
      id: Date.now(),
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      hoursAdded: hours,
      pointsAdded: points,
      timestamp: new Date(),
      type: 'add'
    };

    setPointsHistory(prev => [historyEntry, ...prev]);
    onAddPoints(selectedStudent.id, hours);
    
    setHoursToAdd('');
    setSelectedStudent(null);
  };

  const handleRemovePoints = (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !hoursToAdd || Number(hoursToAdd) <= 0) {
      alert('Please select a student and enter hours');
      return;
    }

    const hours = Number(hoursToAdd);
    const points = Math.floor(hours / 10);
    
    const historyEntry = {
      id: Date.now(),
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      hoursRemoved: hours,
      pointsRemoved: points,
      timestamp: new Date(),
      type: 'remove'
    };

    setPointsHistory(prev => [historyEntry, ...prev]);
    onAddPoints(selectedStudent.id, -hours);
    
    setHoursToAdd('');
    setSelectedStudent(null);
  };

  const getStudentCurrentStats = () => {
    if (!selectedStudent) return null;
    return students.find(s => s.id === selectedStudent.id);
  };

  const currentStats = getStudentCurrentStats();

  return (
    <div className="add-points-page">
      <div className="page-header">
        <h1>Add or Remove Points</h1>
        <p>Manage student points and track all changes</p>
      </div>

      <div className="page-container">
        <div className="main-content">
          <div className="form-section">
            <div className="form-card">
              <h2>Update Points</h2>
              
              <form className="points-form">
                <div className="form-group">
                  <label htmlFor="student-select">Select Student *</label>
                  <select
                    id="student-select"
                    value={selectedStudent?.id || ''}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value);
                      setSelectedStudent(student);
                    }}
                    className="student-select"
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} (ID: {student.studentId || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                {currentStats && (
                  <div className="current-stats">
                    <div className="stat-box">
                      <span className="stat-label">Current Points</span>
                      <span className="stat-value">{currentStats.points}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Current Hours</span>
                      <span className="stat-value">{currentStats.hoursWorked}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="hours-input">Hours to Add/Remove *</label>
                  <input
                    id="hours-input"
                    type="number"
                    value={hoursToAdd}
                    onChange={(e) => setHoursToAdd(e.target.value)}
                    placeholder="Enter hours"
                    min="0"
                    step="1"
                  />
                  <small className="helper-text">
                    Will result in {Math.floor(Number(hoursToAdd || 0) / 10)} points
                  </small>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    onClick={handleAddPoints}
                    className="btn btn-add"
                    disabled={!selectedStudent}
                  >
                    ✓ Add Points
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePoints}
                    className="btn btn-remove"
                    disabled={!selectedStudent}
                  >
                    ✗ Remove Points
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="history-section">
            <div className="history-card">
              <h2>Transaction History</h2>
              
              {pointsHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="history-list">
                  {pointsHistory.map(entry => (
                    <div key={entry.id} className={`history-item ${entry.type}`}>
                      <div className="history-main">
                        <div className="history-student">
                          <span className="student-name">{entry.studentName}</span>
                          <span className="student-id">{entry.studentId}</span>
                        </div>
                        <div className="history-action">
                          {entry.type === 'add' ? (
                            <>
                              <span className="badge badge-add">+{entry.pointsAdded} pts</span>
                              <span className="hours">+{entry.hoursAdded} hrs</span>
                            </>
                          ) : (
                            <>
                              <span className="badge badge-remove">-{entry.pointsRemoved} pts</span>
                              <span className="hours">-{entry.hoursRemoved} hrs</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="history-time">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPoints;
