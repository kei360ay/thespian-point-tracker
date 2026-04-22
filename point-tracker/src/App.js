import "./App.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Navigate, Route, Routes } from "react-router-dom";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from 'firebase/auth';
import AuthButton from './components/Auth-Button';

const getPointsFromHours = (hours) => Math.floor(Number(hours) / 10);
const getProgressPercent = (points) => Math.max(0, Math.min(100, Number(points) * 10));


function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
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
    const parsedHours = Number(hoursWorked);

    if (!trimmedStudentName) {
      setError("Please enter a student name.");
      return;
    }

    if (!trimmedStudentId) {
      setError("Please enter a student ID.");
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
        { name: trimmedStudentName, studentId: trimmedStudentId, hoursworked: parsedHours, points },
        { merge: true }
      );

      setNewStudentName("");
      setNewStudentId("");
      setHoursWorked("");
      await fetchStudents();
    } catch {
      setError("Could not save to Firestore. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  }, [newStudentName, newStudentId, hoursWorked, fetchStudents]);

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

  const StudentListPage = ({
    students,
    newStudentName,
    setNewStudentName,
    newStudentId,
    setNewStudentId,
    hoursWorked,
    setHoursWorked,
    handleSubmit,
    openAddHoursModal,
    isSaving,
    error,
  }) => (
    <div className="App">
      <header className="App-header">
        <h1>Thespian Point Tracker</h1>
        <AuthButton user={user} />
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label>
            New Student Name:
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
            />
          </label>
          <label>
            New Student ID:
            <input
              type="text"
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
            />
          </label>
          <label>
            Hours Worked:
            <input
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
            />
          </label>
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Student"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Hours Worked</th>
              <th>Points</th>
              <th>Progress to Next Point</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.studentId}</td>
                <td>{student.hoursworked}</td>
                <td>{student.points}</td>
                <td>
                  <progress
                    value={getProgressPercent(student.points)}
                    max="100"
                  ></progress>
                </td>
                <td>
                  <button onClick={() => openAddHoursModal(student)}>
                    Add Hours
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Hours for {selectedStudent?.name}</h2>
            <form onSubmit={handleAddHoursSubmit}>
              <label>
                Hours to Add:
                <input
                  type="number"
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(e.target.value)}
                />
              </label>
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Add Hours"}
              </button>
              <button type="button" onClick={closeAddHoursModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const AppRoutes = useMemo(
    () => (
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <StudentListPage
                students={students}
                newStudentName={newStudentName}
                setNewStudentName={setNewStudentName}
                newStudentId={newStudentId}
                setNewStudentId={setNewStudentId}
                hoursWorked={hoursWorked}
                setHoursWorked={setHoursWorked}
                handleSubmit={handleSubmit}
                isSaving={isSaving}
                error={error}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    ),
    [
      students,
      newStudentName,
      newStudentId,
      hoursWorked,
      handleSubmit,
      openAddHoursModal,
      isSaving,
      error,
      user,
    ]
  );

  return (
    <div className="App">
      <AuthButton user={user} />
      {user ? (
        <div className="App tracker-page">
          <main className="tracker-card">{AppRoutes}</main>
        </div>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Sign in to view student points.
        </p>
      )}
    </div>
  );
}

export default App;
