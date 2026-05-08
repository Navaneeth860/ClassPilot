
import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Calendar,
  Target,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';
import { DataProvider, useData } from './contexts/DataContext';
import TimetableEditor from './components/TimetableEditor';
import AttendanceInput from './components/AttendanceInput';
import CalendarView from './components/CalendarView';
import EventManager from './components/EventManager';
import Dashboard from './components/Dashboard';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '32px',
          background: 'var(--bg-surface)',
          color: 'var(--critical)',
          minHeight: '100vh',
          fontFamily: 'var(--font-ui)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>RUNTIME ERROR</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {this.state.error?.message}
          </p>
          <button
            className="cp-btn-ghost"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const wrap = (Component) => () => (
  <ErrorBoundary><Component /></ErrorBoundary>
);

const DashboardComponent    = wrap(Dashboard);
const TimetableManager      = wrap(TimetableEditor);
const AttendanceTracker     = wrap(AttendanceInput);
const CalendarViewComponent = wrap(CalendarView);
const EventManagerComponent = wrap(EventManager);

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'timetable',  label: 'Timetable',  Icon: CalendarDays    },
  { id: 'attendance', label: 'Attendance', Icon: CheckSquare      },
  { id: 'calendar',   label: 'Calendar',   Icon: Calendar         },
  { id: 'events',     label: 'Events',     Icon: Target           },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ currentView, setCurrentView, onReset, onClose }) => (
  <aside style={{
    width: 220,
    minWidth: 220,
    height: '100vh',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  }}>
    {/* Wordmark */}
    <div style={{
      padding: '20px 20px 18px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          ClassPilot
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.02em' }}>
          Attendance Tracker
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={16} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 10px 8px', textTransform: 'uppercase' }}>
        Navigation
      </div>
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`cp-nav-item${currentView === id ? ' active' : ''}`}
          onClick={() => { setCurrentView(id); onClose?.(); }}
        >
          <Icon size={15} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </nav>

    {/* Footer */}
    <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
      <button className="cp-btn-danger" style={{ width: '100%' }} onClick={onReset}>
        <RotateCcw size={13} />
        Reset Data
      </button>
    </div>
  </aside>
);

// ─── App Content ──────────────────────────────────────────────────────────────
const AppContent = () => {
  const { resetAllData } = useData();
  const [currentView, setCurrentView]       = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    try {
      switch (currentView) {
        case 'dashboard':  return <DashboardComponent />;
        case 'timetable':  return <TimetableManager />;
        case 'attendance': return <AttendanceTracker />;
        case 'calendar':   return <CalendarViewComponent />;
        case 'events':     return <EventManagerComponent />;
        default:           return <DashboardComponent />;
      }
    } catch (error) {
      return (
        <div style={{ padding: 24, color: 'var(--critical)', fontFamily: 'var(--font-ui)' }}>
          <h3>Failed to load {currentView}</h3>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{error.message}</p>
        </div>
      );
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all data? This action cannot be undone.')) {
      resetAllData();
      setCurrentView('dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* Desktop Sidebar — always visible on desktop, hidden on mobile via .cp-desktop-sidebar */}
      <div className="cp-desktop-sidebar">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onReset={handleReset}
        />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50 }}>
            <Sidebar
              currentView={currentView}
              setCurrentView={setCurrentView}
              onReset={handleReset}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
          className="mobile-topbar"
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
            ClassPilot
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderView()}
        </main>
      </div>

      <style>{`
        /* Desktop: show sidebar, hide mobile topbar */
        .cp-desktop-sidebar { display: flex; }
        .mobile-topbar      { display: none; }

        /* Mobile: hide sidebar, show topbar */
        @media (max-width: 767px) {
          .cp-desktop-sidebar { display: none; }
          .mobile-topbar      { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  );
}

export default App;