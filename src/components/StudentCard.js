import React from 'react';
import { getRankInfo, getProgressPercent, getStarRating } from '../utils/rankUtils';
import './StudentCard.css';

const StudentCard = React.memo(function StudentCard({ student, onAddHours, onRemoveStudent, onViewDetails }) {
  const rankInfo = getRankInfo(student.points);
  const progressPercent = getProgressPercent(student.points);
  const starRating = getStarRating(student.points);

  return (
    <div className="student-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="student-name">{student.name}</h3>
          <p className="star-rating">{starRating}</p>
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
        <p className="rank-display">
          <strong>Rank:</strong> <span className="rank-name">{rankInfo.rank}</span>
        </p>
        <p className="points-display">
          <strong>Total Points:</strong> <span className="points-number">{student.points}</span>
        </p>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          {rankInfo.nextThreshold ? `Progress to Next Rank (${rankInfo.pointsToNext} more)` : 'Max Rank Achieved! 🏆'}
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: rankInfo.color,
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
});

export default StudentCard;
