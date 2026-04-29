import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentList from './pages/StudentList';
import AddPoints from './pages/AddPoints';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddHoursModalOpen, setIsAddHoursModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoursToAdd, setHoursToAdd] = useState('');

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch students from Firebase
  const fetchStudents = useCallback(async () => {
    if (!user) {
      setStudents([]);
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [user]);

  // Fetch students when user logs in
  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user, fetchStudents]);

  // Add new student
  const handleAddStudent = useCallback(async (studentData) => {
    if (!user) return;

    try {
      const newStudent = {
        name: studentData.name.trim(),
        studentId: studentData.studentId.trim(),
        gradYear: studentData.gradYear,
        hoursWorked: studentData.hoursWorked || 0,
        points: Math.floor((studentData.hoursWorked || 0) / 10),
        joinDate: new Date().toISOString(),
        userId: user.uid,
      };

      const docRef = doc(collection(db, 'students'));
      await setDoc(docRef, newStudent);

      setStudents(prev => [...prev, { id: docRef.id, ...newStudent }]);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    }
  }, [user]);

  // Remove student
  const handleRemoveStudent = useCallback(async (studentId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'students', studentId));
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Error removing student');
    }
  }, [user]);

  // Add or remove hours/points
  const handleAddPoints = useCallback(async (studentId, hoursToAdd) => {
    if (!user) return;

    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const newHours = Math.max(0, student.hoursWorked + hoursToAdd);
      const newPoints = Math.floor(newHours / 10);

      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        hoursWorked: newHours,
        points: newPoints,
      });

      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, hoursWorked: newHours, points: newPoints }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Error updating points');
    }
  }, [user, students]);

  // Modal handlers
  const openAddHoursModal = useCallback((student) => {
    setSelectedStudent(student);
    setHoursToAdd('');
    setIsAddHoursModalOpen(true);
  }, []);

  const closeAddHoursModal = useCallback(() => {
    setIsAddHoursModalOpen(false);
    setSelectedStudent(null);
    setHoursToAdd('');
  }, []);

  const handleAddHoursSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!selectedStudent || !hoursToAdd || Number(hoursToAdd) <= 0) {
      alert('Please enter valid hours');
      return;
    }

    handleAddPoints(selectedStudent.id, Number(hoursToAdd));
    closeAddHoursModal();
  }, [selectedStudent, hoursToAdd, handleAddPoints, closeAddHoursModal]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar user={user} />

      {user ? (
        <>
          <Routes>
            <Route
              path="/"
              element={<Home students={students} user={user} onAddHoursModal={openAddHoursModal} />}
            />
            <Route
              path="/students"
              element={
                <StudentList
                  students={students}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
                />
              }
            />
            <Route
              path="/add-points"
              element={
                <AddPoints
                  students={students}
                  onAddPoints={handleAddPoints}
                />
              }
            />
          </Routes>

          {isAddHoursModalOpen && (
            <div className="modal-overlay">
              <div className="add-hours-modal">
                <button
                  className="close-circle-button"
                  onClick={closeAddHoursModal}
                  type="button"
                >
                  ✕
                </button>
                <h2>Add Hours for {selectedStudent?.name}</h2>
                <form onSubmit={handleAddHoursSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label htmlFor="modal-hours-input" style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Hours to Add:
                    </label>
                    <input
                      id="modal-hours-input"
                      type="number"
                      value={hoursToAdd}
                      onChange={(e) => setHoursToAdd(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d5d9df', borderRadius: '8px' }}
                      min="0"
                      step="1"
                    />
                    <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                      Will result in {Math.floor(Number(hoursToAdd || 0) / 10)} points
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#1d4f91',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Add Hours
                    </button>
                    <button
                      type="button"
                      onClick={closeAddHoursModal}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#f5f6f8',
                        border: '1px solid #d5d9df',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.2rem', color: '#666' }}>
          <p>Please sign in to view student points.</p>
        </div>
      )}
    </div>
  );
}

export default App;
