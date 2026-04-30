import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './AddPoints.css';

function AddPoints({ students, onAddPoints }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoursToAdd, setHoursToAdd] = useState('');
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch transaction history for selected student
  useEffect(() => {
    if (!selectedStudent) {
      setPointsHistory([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'transactions'),
          where('studentId', '==', selectedStudent.id),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
        }));
        setPointsHistory(history);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [selectedStudent]);

  const handleAddPoints = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !hoursToAdd || Number(hoursToAdd) <= 0) {
      alert('Please select a student and enter hours');
      return;
    }

    setLoading(true);
    const hours = Number(hoursToAdd);
    const points = Math.floor(hours / 10);
    
    try {
      // Add transaction to Firestore
      await addDoc(collection(db, 'transactions'), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        hoursAdded: hours,
        pointsAdded: points,
        timestamp: new Date(),
        type: 'add'
      });

      // Call parent function to update student data
      await onAddPoints(selectedStudent.id, hours);
      
      setHoursToAdd('');
      alert('Added points!');

      // Refresh history (silently handle errors)
      try {
        const q = query(
          collection(db, 'transactions'),
          where('studentId', '==', selectedStudent.id),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
        }));
        setPointsHistory(history);
      } catch (historyError) {
        console.error('Error refreshing history:', historyError);
      }
    } catch (error) {
      console.error('Error adding points:', error);
      alert('Error adding points');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePoints = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !hoursToAdd || Number(hoursToAdd) <= 0) {
      alert('Please select a student and enter hours');
      return;
    }

    setLoading(true);
    const hours = Number(hoursToAdd);
    const points = Math.floor(hours / 10);
    
    try {
      // Add transaction to Firestore
      await addDoc(collection(db, 'transactions'), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        hoursRemoved: hours,
        pointsRemoved: points,
        timestamp: new Date(),
        type: 'remove'
      });

      // Call parent function to update student data
      await onAddPoints(selectedStudent.id, -hours);

      setHoursToAdd('');
      alert('Points removed!');

      // Refresh history (silently handle errors)
      try {
        const q = query(
          collection(db, 'transactions'),
          where('studentId', '==', selectedStudent.id),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
        }));
        setPointsHistory(history);
      } catch (historyError) {
        console.error('Error refreshing history:', historyError);
      }
    } catch (error) {
      console.error('Error removing points:', error);
      alert('Error removing points');
    } finally {
      setLoading(false);
    }
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
                    disabled={!selectedStudent || loading}
                  >
                    {loading ? 'Saving...' : '✓ Add Points'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePoints}
                    className="btn btn-remove"
                    disabled={!selectedStudent || loading}
                  >
                    {loading ? 'Saving...' : '✗ Remove Points'}
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
                        {entry.timestamp instanceof Date 
                          ? `${entry.timestamp.toLocaleDateString()} ${entry.timestamp.toLocaleTimeString()}`
                          : new Date(entry.timestamp).toLocaleString()
                        }
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
