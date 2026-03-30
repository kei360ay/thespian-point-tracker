import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";


function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const getPointsFromHours = (hours) => Math.floor(Number(hours) / 10);

  const fetchStudents = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    const studentsData = querySnapshot.docs.map((studentDoc) => {
      const data = studentDoc.data();
      const hours = Number(data.hoursworked ?? 0);
      const storedPoints = Number(data.points);

      return {
        id: studentDoc.id,
        hoursworked: hours,
        points: Number.isNaN(storedPoints)
          ? getPointsFromHours(hours)
          : storedPoints,
      };
    });

    setStudents(studentsData);
  }, []);

  useEffect(() => {
    fetchStudents().catch(() => {
      setError("Could not load students from Firestore.");
    });
  }, [fetchStudents]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedStudentId = studentId.trim();
    const parsedHours = Number(hoursWorked);

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

      await setDoc(
        doc(db, "students", trimmedStudentId),
        { hoursworked: parsedHours, points },
        { merge: true }
      );

      setHoursWorked("");
      await fetchStudents();
    } catch {
      setError("Could not save to Firestore. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="App tracker-page">
      <main className="tracker-card">
        <h1>Thespian Point Tracker</h1>
        <p className="subheading">Firestore path: students/{'{studentId}'}.hoursworked + .points</p>

        <form className="tracker-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Hours worked"
            value={hoursWorked}
            onChange={(event) => setHoursWorked(event.target.value)}
          />
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Hours"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <section>
          <h2>Students</h2>
          <ul className="student-list">
            {students.map((student) => (
              <li key={student.id}>
                <strong>{student.id}</strong>
                <span>{student.hoursworked} hours</span>
                <span>{student.points} points</span>
              </li>
            ))}
            {students.length === 0 && <li>No student records yet.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
