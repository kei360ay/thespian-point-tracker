import { useState, useCallback } from 'react';
import StudentCard from '../components/StudentCard';
import './Home.css';

function Home({ students, user, onAddHoursModal }) {
  const [sortOrder, setSortOrder] = useState('nameAsc');
  const [filterYear, setFilterYear] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredAndSortedStudents = useCallback(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filterYear === 'all' || student.gradYear === Number(filterYear);
      return matchesSearch && matchesYear;
    });

    // Sort
    filtered.sort((a, b) => {
      switch(sortOrder) {
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'pointsHigh':
          return b.points - a.points;
        case 'pointsLow':
          return a.points - b.points;
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, sortOrder, filterYear, searchTerm]);

  const filteredStudents = getFilteredAndSortedStudents();
  const years = [...new Set(students.map(s => s.gradYear))].sort().reverse();

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="header-content">
          <h1>Welcome Back, {user?.displayName || 'User'}! 👋</h1>
          <p>Track your thespian troupe's points and progress</p>
        </div>
      </div>

      <div className="home-container">
        <div className="controls-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
                <option value="pointsHigh">Points (High to Low)</option>
                <option value="pointsLow">Points (Low to High)</option>
              </select>
            </div>

            {years.length > 0 && (
              <div className="filter-group">
                <label>Graduation Year:</label>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="filter-select">
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              className="reset-btn"
              onClick={() => {
                setSearchTerm('');
                setSortOrder('nameAsc');
                setFilterYear('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="results-info">
          Showing {filteredStudents.length} of {students.length} students
        </div>

        {filteredStudents.length > 0 ? (
          <div className="student-grid">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onAddHours={onAddHoursModal}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No students found matching your criteria.</p>
            <button 
              className="reset-link"
              onClick={() => {
                setSearchTerm('');
                setSortOrder('nameAsc');
                setFilterYear('all');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
