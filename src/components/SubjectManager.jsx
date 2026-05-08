import React from 'react';
import { useData } from '../contexts/DataContext';

const SubjectManager = () => {
  const { state, updateSubject } = useData();

  const handleNameChange = (subjectId, name) => {
    updateSubject(subjectId, { name });
  };

  return (
    <div className="cp-card" style={{ padding: '20px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
        Subject Names
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Rename subjects to match your courses. Changes are saved automatically.
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {state.subjects.map((subject, index) => (
          <label key={subject.id} style={{ display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-primary)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Subject {index + 1}
            </span>
            <input
              type="text"
              value={subject.name}
              onChange={(e) => handleNameChange(subject.id, e.target.value)}
              placeholder="Enter subject name"
              style={{
                width: '100%',
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                padding: '12px 14px',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default SubjectManager;
