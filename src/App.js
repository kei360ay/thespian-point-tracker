import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from 'firebase/auth';
import AuthButton from './components/Auth-Button';

const getPointsFromHours = (hours) => Math.floor(Number(hours) / 10);
const getProgressPercent = (points) => Math.max(0, Math.min(100, Number(points) * 10));

const StudentListPage = ({
  students,
  newStudentName,
  setNewStudentName,
  newStudentId,
  setNewStudentId,
  gradYear,
  setGradYear,
  hoursWorked,
  setHoursWorked,
  handleSubmit,
  openAddHoursModal,
  closeAddHoursModal,
  isAddModalOpen,
  selectedStudent,
  handleAddHoursSubmit,
  hoursToAdd,
  setHoursToAdd,
  isSaving,
  error,
  user,
}) => (
  <div className="App">
    <header className="App-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <h1>Thespian Point Tracker</h1>
        <AuthButton user={user} />
      </div>
    </header>
    <div className="page-content">
      <div className="welcome-card">
        <h2>Welcome Back, {user?.displayName || user?.email || "User"}</h2>
      </div>
      <main className="tracker-card">
      <h2 style={{ marginTop: 0 }}>Students / Progress</h2>
      
      <div className="section-heading-row">
        <button className="filter-button">🔧 Filter</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="student-grid">
        {students.map((student) => (
          <div key={student.id} className="student-card-item">
            <div className="student-card-head">
              <div>
                <h3>{student.name}</h3>
                <p className="student-id">ID: {student.studentId}</p>
                <p className="student-id">Grad Year: {student.gradYear}</p>
              </div>
              <button
                className="plus-button"
                onClick={() => openAddHoursModal(student)}
                title="Add hours"
              >
                +
              </button>
            </div>
            <p className="points-text">Total Points: {student.points}</p>
            <div className="progress-wrap">
              <p>Progress:</p>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${getProgressPercent(student.points)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #d5d9df' }}>
        <h3 style={{ marginBottom: '16px' }}>Add New Student</h3>
        <form onSubmit={handleSubmit} className="tracker-form">
          <input
            type="text"
            placeholder="Student Name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Student ID"
            value={newStudentId}
            onChange={(e) => setNewStudentId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Graduation Year"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="Initial Hours"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
          />
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Student"}
          </button>
        </form>
      </div>
    </main>

    {isAddModalOpen && (
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
              <label htmlFor="hours-input" style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                Hours to Add:
              </label>
              <input
                id="hours-input"
                type="number"
                value={hoursToAdd}
                onChange={(e) => setHoursToAdd(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d5d9df', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1d4f91',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Add Hours"}
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
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoursToAdd, setHoursToAdd] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchStudents = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "students"));

    const studentsData = querySnapshot.docs.map((studentDoc) => {
      const data = studentDoc.data();
      const hours = Number(data.hoursworked ?? 0);
      const storedPoints = Number(data.points);

      return {
        id: studentDoc.id,
        name: data.name,
        studentId: data.studentId,
        gradYear: data.gradYear,
        hoursworked: hours,
        points: Number.isNaN(storedPoints)
          ? getPointsFromHours(hours)
          : storedPoints,
      };
    });

    studentsData.sort((a, b) => a.id.localeCompare(b.id));

    setStudents(studentsData);
  }, []);

  useEffect(() => {
    if (user) {
      fetchStudents().catch(() => {
        setError("Could not load students from Firestore.");
      });
    }
  }, [user, fetchStudents]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setError("");

    const trimmedStudentName = newStudentName.trim();
    const trimmedStudentId = newStudentId.trim();
    const trimmedGradYear = gradYear.trim();
    const parsedHours = Number(hoursWorked);

    if (!trimmedStudentName) {
      setError("Please enter a student name.");
      return;
    }

    if (!trimmedStudentId) {
      setError("Please enter a student ID.");
      return;
    }

    if (!trimmedGradYear) {
      setError("Please enter a graduation year.");
      return;
    }

    if (Number.isNaN(parsedHours) || parsedHours < 0) {
      setError("Hours worked must be a number that is 0 or greater.");
      return;
    }

    setIsSaving(true);

    try {
      const points = getPointsFromHours(parsedHours);
      const studentDocId = trimmedStudentName.toLowerCase().replace(/\s+/g, '-');

      await setDoc(
        doc(db, "students", studentDocId),
        { name: trimmedStudentName, studentId: trimmedStudentId, gradYear: trimmedGradYear, hoursworked: parsedHours, points },
        { merge: true }
      );

      setNewStudentName("");
      setNewStudentId("");
      setGradYear("");
      setHoursWorked("");
      await fetchStudents();
    } catch {
      setError("Could not save to Firestore. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  }, [newStudentName, newStudentId, gradYear, hoursWorked, fetchStudents]);

  const openAddHoursModal = useCallback((student) => {
    setError("");
    setSelectedStudent(student);
    setHoursToAdd("");
    setIsAddModalOpen(true);
  }, []);

  const closeAddHoursModal = useCallback(() => {
    setError("");
    setSelectedStudent(null);
    setHoursToAdd("");
    setIsAddModalOpen(false);
  }, []);

  const handleAddHoursSubmit = useCallback(async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }

    const parsedHoursToAdd = Number(hoursToAdd);

    if (Number.isNaN(parsedHoursToAdd) || parsedHoursToAdd <= 0) {
      setError("Hours to add must be a number greater than 0.");
      return;
    }

    const updatedHours = Number(selectedStudent.hoursworked ?? 0) + parsedHoursToAdd;
    const updatedPoints = getPointsFromHours(updatedHours);

    setIsSaving(true);

    try {
      await setDoc(
        doc(db, "students", selectedStudent.id),
        { hoursworked: updatedHours, points: updatedPoints },
        { merge: true }
      );

      await fetchStudents();
      closeAddHoursModal();
    } catch {
      setError("Could not add hours. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  }, [selectedStudent, hoursToAdd, fetchStudents, closeAddHoursModal]);

  return (
    <>
      {user ? (
        <StudentListPage
          students={students}
          newStudentName={newStudentName}
          setNewStudentName={setNewStudentName}
          newStudentId={newStudentId}
          setNewStudentId={setNewStudentId}
          gradYear={gradYear}
          setGradYear={setGradYear}
          hoursWorked={hoursWorked}
          setHoursWorked={setHoursWorked}
          handleSubmit={handleSubmit}
          openAddHoursModal={openAddHoursModal}
          closeAddHoursModal={closeAddHoursModal}
          isAddModalOpen={isAddModalOpen}
          selectedStudent={selectedStudent}
          handleAddHoursSubmit={handleAddHoursSubmit}
          hoursToAdd={hoursToAdd}
          setHoursToAdd={setHoursToAdd}
          isSaving={isSaving}
          error={error}
          user={user}
        />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.2rem', color: '#666' }}>
          <p>Please sign in to view student points.</p>
          <AuthButton user={user} />
        </div>
      )}
    </>
  );
}

export default App;
