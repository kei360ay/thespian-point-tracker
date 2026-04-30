import './StudentCard.css';

function StudentCard({ student, onAddHours, onRemoveStudent, onViewDetails }) {
  const getProgressPercent = (points) => {
    const numPoints = Number(points);
    const progressInTier = numPoints % 10;
    return Math.min(100, progressInTier * 10);
  };

  const getProgressColor = (points) => {
    const numPoints = Number(points);
    const tier = Math.floor(numPoints / 10);
    const colors = ['#10b981', '#f59e0b', '#ff6b35', '#dc2626', '#10b981', '#eab308']; // green, yellow, orange, red, green, yellow
    return colors[tier % colors.length];
  };

  const getStarRating = (points) => {
    if (points >= 50) return '⭐⭐⭐⭐⭐';
    if (points >= 40) return '⭐⭐⭐⭐';
    if (points >= 30) return '⭐⭐⭐';
    if (points >= 20) return '⭐⭐';
    if (points >= 10) return '⭐';
    return '';
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
            style={{ 
              width: `${getProgressPercent(student.points)}%`,
              backgroundColor: getProgressColor(student.points),
              background: getProgressColor(student.points)
            }}
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
