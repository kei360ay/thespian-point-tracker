import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const EXAMPLE_STUDENTS = [
  "alex-johnson",
  "maria-garcia",
  "noah-lee",
  "zoe-patel",
  "liam-walker",
];


function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [hoursToAdd, setHoursToAdd] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activePage, setActivePage] = useState("list");
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

  const openAddHoursPage = (student) => {
    setError("");
    setHoursToAdd("");
    setSelectedStudent(student);
    setActivePage("add-hours");
  };

  const handleBackToList = () => {
    setError("");
    setHoursToAdd("");
    setSelectedStudent(null);
    setActivePage("list");
  };

  const handleAddHoursSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedStudent) {
      setError("Please pick a student first.");
      return;
    }

    const parsedHoursToAdd = Number(hoursToAdd);

    if (Number.isNaN(parsedHoursToAdd) || parsedHoursToAdd <= 0) {
      setError("Hours to add must be a number greater than 0.");
      return;
    }

    const updatedHours = Number(selectedStudent.hoursworked) + parsedHoursToAdd;
    const updatedPoints = getPointsFromHours(updatedHours);

    setIsSaving(true);

    try {
      await setDoc(
        doc(db, "students", selectedStudent.id),
        { hoursworked: updatedHours, points: updatedPoints },
        { merge: true }
      );

      await fetchStudents();
      handleBackToList();
    } catch {
      setError("Could not add hours. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedStudents = async () => {
    setError("");
    setIsSaving(true);

    try {
      await Promise.all(
        EXAMPLE_STUDENTS.map((id) =>
          setDoc(
            doc(db, "students", id),
            { hoursworked: 0, points: 0 },
            { merge: true }
          )
        )
      );

      await fetchStudents();
    } catch {
      setError("Could not create example students. Check your Firestore rules/config.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="App tracker-page">
      <main className="tracker-card">
        {activePage === "list" ? (
          <>
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

            <button
              type="button"
              className="seed-button"
              onClick={handleSeedStudents}
              disabled={isSaving}
            >
              {isSaving ? "Working..." : "Create Example Students"}
            </button>

            {error && <p className="error-text">{error}</p>}

            <section>
              <h2>Students</h2>
              <ul className="student-list">
                {students.map((student) => (
                  <li key={student.id}>
                    <strong>{student.id}</strong>
                    <span>{student.hoursworked} hours</span>
                    <span>{student.points} points</span>
                    <button
                      type="button"
                      className="plus-button"
                      onClick={() => openAddHoursPage(student)}
                      aria-label={`Add hours to ${student.id}`}
                    >
                      +
                    </button>
                  </li>
                ))}
                {students.length === 0 && <li>No student records yet.</li>}
              </ul>
            </section>
          </>
        ) : (
          <>
            <h1>Add Hours</h1>
            <p className="subheading">
              Student: <strong>{selectedStudent?.id}</strong>
            </p>

            <form className="tracker-form add-hours-form" onSubmit={handleAddHoursSubmit}>
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Hours to add"
                value={hoursToAdd}
                onChange={(event) => setHoursToAdd(event.target.value)}
              />
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Add Hours"}
              </button>
              <button type="button" className="secondary-button" onClick={handleBackToList}>
                Back
              </button>
            </form>

            {error && <p className="error-text">{error}</p>}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
