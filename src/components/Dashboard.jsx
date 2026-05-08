// export default Dashboard
import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Trophy,
  CalendarDays,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import {
  getAllSubjectMetrics,
  calculateTotalActivityPoints,
  getUpcomingEvents,
} from '../utils/calculations';
import SubjectManager from './SubjectManager';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const riskMeta = {
  Safe:     { color: 'var(--safe)',     dim: 'var(--safe-dim)',     cls: 'cp-badge-safe'     },
  Warning:  { color: 'var(--warning)',  dim: 'var(--warning-dim)',  cls: 'cp-badge-warning'  },
  Critical: { color: 'var(--critical)', dim: 'var(--critical-dim)', cls: 'cp-badge-critical' },
};

const progressClass = { Safe: 'cp-progress-safe', Warning: 'cp-progress-warning', Critical: 'cp-progress-critical' };

const RiskIcon = ({ level, size = 13 }) => {
  if (level === 'Safe')    return <CheckCircle  size={size} style={{ color: 'var(--safe)',     flexShrink: 0 }} />;
  if (level === 'Warning') return <AlertTriangle size={size} style={{ color: 'var(--warning)', flexShrink: 0 }} />;
  return                          <AlertTriangle size={size} style={{ color: 'var(--critical)',flexShrink: 0 }} />;
};

const getActionRecommendation = (metric) => {
  if (metric.attendance_percentage < 85) {
    return `Attend ${metric.classes_to_attend} more class${metric.classes_to_attend !== 1 ? 'es' : ''} to reach 85%`;
  }
  if (metric.classes_can_skip === 0) {
    return 'Maintain current attendance to stay above 85%';
  }
  return `Can skip ${metric.classes_can_skip} class${metric.classes_can_skip !== 1 ? 'es' : ''} and still maintain 85%`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, value, label, iconColor }) => (
  <div className="cp-stat-chip">
    <Icon size={15} style={{ color: iconColor, flexShrink: 0 }} strokeWidth={1.8} />
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.02em' }}>
        {label}
      </div>
    </div>
  </div>
);

const SubjectCard = ({ metric, index }) => {
  const meta    = riskMeta[metric.risk_level] || riskMeta.Critical;
  const isSafe  = metric.attendance_percentage >= 85;
  const action  = getActionRecommendation(metric);

  return (
    <div
      className="cp-card animate-in"
      style={{ padding: '20px', animationDelay: `${index * 40}ms` }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.2 }}>
            {metric.subjectName}
          </div>
          <span className={`cp-badge ${meta.cls}`}>
            <RiskIcon level={metric.risk_level} size={10} />
            {metric.risk_level}
          </span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 500,
            color: meta.color,
            lineHeight: 1,
          }}>
            {metric.attendance_percentage}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {metric.attended_classes}/{metric.total_classes}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="cp-progress-track" style={{ marginBottom: 14 }}>
        <div
          className={`cp-progress-fill ${progressClass[metric.risk_level]}`}
          style={{ width: `${Math.min(metric.attendance_percentage, 100)}%` }}
        />
      </div>

      {/* 85% marker label */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{
          position: 'absolute',
          left: '85%',
          transform: 'translateX(-50%)',
          top: -22,
          fontSize: 9,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
        }}>
          85%
        </div>
      </div>

      {/* Insight row */}
      <div className="cp-insight">
        {isSafe
          ? <TrendingDown size={13} style={{ color: 'var(--safe)',     marginTop: 1, flexShrink: 0 }} />
          : <TrendingUp   size={13} style={{ color: 'var(--critical)', marginTop: 1, flexShrink: 0 }} />
        }
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            {isSafe ? 'On track' : 'Action required'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {action}
          </div>
        </div>
      </div>
    </div>
  );
};

const OverallStatusCard = ({ stats }) => (
  <div className="cp-card" style={{ padding: '20px' }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
      Overall Status
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { label: 'Safe',     value: `${stats.safeSubjects}/${stats.totalSubjects}`, color: 'var(--safe)'     },
        { label: 'Warning',  value: stats.warningSubjects,                           color: 'var(--warning)'  },
        { label: 'Critical', value: stats.criticalSubjects,                          color: 'var(--critical)' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color }}>{value}</span>
        </div>
      ))}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Safe rate</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          {stats.safePercentage}%
        </span>
      </div>
    </div>
  </div>
);

const UpcomingEventsCard = ({ events }) => (
  <div className="cp-card" style={{ padding: '20px' }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
      Upcoming Events
    </div>
    {events.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <CalendarDays size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} strokeWidth={1.4} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No upcoming events</div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(event => (
          <div key={event.id} className="cp-card-elevated" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {event.title}
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--accent)',
                background: 'var(--accent-dim)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 4,
                padding: '2px 6px',
                flexShrink: 0,
              }}>
                +{event.points}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <Clock size={11} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { state, DAYS, TIME_SLOTS } = useData();

  const subjectMetrics = useMemo(() =>
    getAllSubjectMetrics(state.subjects, state.attendance, state.timetable, DAYS, TIME_SLOTS),
    [state.subjects, state.attendance, state.timetable, DAYS, TIME_SLOTS]
  );

  const totalActivityPoints = useMemo(() =>
    calculateTotalActivityPoints(state.events),
    [state.events]
  );

  const upcomingEvents = useMemo(() =>
    getUpcomingEvents(state.events).slice(0, 3),
    [state.events]
  );

  const overallStats = useMemo(() => {
    const totalSubjects    = subjectMetrics.length;
    const safeSubjects     = subjectMetrics.filter(m => m.risk_level === 'Safe').length;
    const warningSubjects  = subjectMetrics.filter(m => m.risk_level === 'Warning').length;
    const criticalSubjects = subjectMetrics.filter(m => m.risk_level === 'Critical').length;
    return {
      totalSubjects, safeSubjects, warningSubjects, criticalSubjects,
      safePercentage: totalSubjects > 0 ? Math.round((safeSubjects / totalSubjects) * 100) : 0,
    };
  }, [subjectMetrics]);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Attendance overview and activity summary
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <StatChip
            icon={Trophy}
            value={totalActivityPoints}
            label="Points"
            iconColor="var(--warning)"
          />
          <StatChip
            icon={CheckCircle}
            value={`${overallStats.safePercentage}%`}
            label="Safe rate"
            iconColor="var(--safe)"
          />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

        {/* Left: subject cards */}
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Subject Status — {subjectMetrics.length} subjects
          </div>

          {subjectMetrics.length === 0 ? (
            <div className="cp-card" style={{ padding: 40, textAlign: 'center' }}>
              <CalendarDays size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} strokeWidth={1.2} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>No subjects yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure your timetable to get started.</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}>
              {subjectMetrics.map((metric, i) => (
                <SubjectCard key={metric.subjectId} metric={metric} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Right: sidebar panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SubjectManager />
          <OverallStatusCard stats={overallStats} />
          <UpcomingEventsCard events={upcomingEvents} />
        </div>
      </div>

      {/* Responsive collapse for narrow screens */}
      <style>{`
        @media (max-width: 860px) {
          div[style*="gridTemplateColumns: '1fr 260px'"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="padding: '28px 32px'"] {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;