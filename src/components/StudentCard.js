import './StudentCard.css';

function StudentCard({ student, onAddHours, onRemoveStudent, onViewDetails }) {
  const getProgressPercent = (points) => Math.max(0, Math.min(100, Number(points) * 10));
  const getStarRating = (points) => {
    if (points >= 60) return '⭐⭐⭐⭐⭐';
    if (points >= 20) return '⭐⭐⭐⭐';
    if (points >= 10) return '⭐⭐⭐';
    if (points >= 5) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="student-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="student-name">{student.name}</h3>
          <p className="star-rating">{getStarRating(student.points)}</p>
        </div>
        <button 
          className="quick-add-btn"
          onClick={() => onAddHours && onAddHours(student)}
          title="Add hours"
        >
          +
        </button>
      </div>

      <div className="card-details">
        <p className="detail-line">
          <span className="label">ID:</span> {student.studentId || 'N/A'}
        </p>
        <p className="detail-line">
          <span className="label">Grad Year:</span> {student.gradYear || 'N/A'}
        </p>
        <p className="points-display">
          <strong>Total Points:</strong> <span className="points-number">{student.points}</span>
        </p>
      </div>

      <div className="progress-section">
        <div className="progress-label">Progress to Next Rank</div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${getProgressPercent(student.points)}%` }}
          ></div>
        </div>
      </div>

      {onRemoveStudent && (
        <button 
          className="remove-btn"
          onClick={() => onRemoveStudent && onRemoveStudent(student.id)}
          title="Remove student"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default StudentCard;
