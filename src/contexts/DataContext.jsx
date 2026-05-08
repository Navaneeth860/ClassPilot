import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const DataContext = createContext();

// Initialize default subjects (8 subjects)
const DEFAULT_SUBJECTS = Array.from({ length: 8 }, (_, i) => ({
  id: `subject_${i + 1}`,
  name: `Subject ${i + 1}`,
  total_classes: 0,
  attended_classes: 0,
}));

// Initialize default timetable structure
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
];

const DEFAULT_TIMETABLE = {};
DAYS.forEach(day => {
  DEFAULT_TIMETABLE[day] = Array(TIME_SLOTS.length).fill(null);
});

// Initialize default state
const INITIAL_STATE = {
  subjects: DEFAULT_SUBJECTS,
  timetable: DEFAULT_TIMETABLE,
  attendance: {}, // Will be populated per subject
  events: [],
  settings: {},
};

// Populate initial attendance tracking
DEFAULT_SUBJECTS.forEach(subject => {
  INITIAL_STATE.attendance[subject.id] = [];
});

export const DataProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = loadFromStorage();
    if (savedState) {
      setState(savedState);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // Update subject info
  const updateSubject = (subjectId, updates) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subjectId ? { ...s, ...updates } : s
      ),
    }));
  };

  // Update timetable
  const updateTimetable = (newTimetable) => {
    setState(prev => ({
      ...prev,
      timetable: newTimetable,
    }));
  };

  // Mark attendance for a specific subject and class session
  const markAttendance = (subjectId, sessionIndex, attended) => {
    setState(prev => {
      const attendance = [...(prev.attendance[subjectId] || [])];
      
      // Extend array if necessary
      while (attendance.length <= sessionIndex) {
        attendance.push(false);
      }
      
      attendance[sessionIndex] = attended;
      
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [subjectId]: attendance,
        },
      };
    });
  };

  // Mark entire day's attendance for a subject
  const markDayAttendance = (subjectId, dayName, attended) => {
    setState(prev => {
      const dayIndex = DAYS.indexOf(dayName);
      if (dayIndex === -1) return prev;

      const subjectsInDay = [];
      const timetable = prev.timetable;
      
      // Find all slots for this subject on this day
      for (let slotIndex = 0; slotIndex < TIME_SLOTS.length; slotIndex++) {
        if (timetable[dayName]?.[slotIndex] === subjectId) {
          subjectsInDay.push(slotIndex);
        }
      }

      // Mark all those sessions
      const attendance = [...(prev.attendance[subjectId] || [])];
      subjectsInDay.forEach(slotIndex => {
        const sessionGlobalIndex = dayIndex * TIME_SLOTS.length + slotIndex;
        while (attendance.length <= sessionGlobalIndex) {
          attendance.push(false);
        }
        attendance[sessionGlobalIndex] = attended;
      });

      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [subjectId]: attendance,
        },
      };
    });
  };

  // Add event
  const addEvent = (eventData) => {
    const newEvent = {
      id: uuidv4(),
      ...eventData,
      attended: false,
      subjects_marked: [],
    };
    setState(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    return newEvent;
  };

  // Update event
  const updateEvent = (eventId, updates) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
    }));
  };

  // Delete event
  const deleteEvent = (eventId) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId),
    }));
  };

  // Mark event as attended and handle subject overlap
  const markEventAttended = (eventId) => {
    setState(prev => {
      const event = prev.events.find(e => e.id === eventId);
      if (!event) return prev;

      // Find overlapping subject sessions based on timetable and event date/time
      const overlappingSessions = getOverlappingSessions(event, prev.timetable);
      
      // Mark only the overlapping session attendance
      let newAttendance = { ...prev.attendance };
      overlappingSessions.forEach(({ subjectId, slotIndex, dayName }) => {
        const dayIndex = DAYS.indexOf(dayName);
        if (dayIndex === -1) return;

        const sessionIndex = dayIndex * TIME_SLOTS.length + slotIndex;
        const attended = [...(newAttendance[subjectId] || [])];
        while (attended.length <= sessionIndex) {
          attended.push(false);
        }
        attended[sessionIndex] = true;
        newAttendance[subjectId] = attended;
      });

      const subjectsMarked = Array.from(new Set(overlappingSessions.map(s => s.subjectId)));

      return {
        ...prev,
        events: prev.events.map(e =>
          e.id === eventId ? { ...e, attended: true, subjects_marked: subjectsMarked } : e
        ),
        attendance: newAttendance,
      };
    });
  };

  // Reset all data
  const resetAllData = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem('classpilot_timetable');
    localStorage.removeItem('classpilot_subjects');
    localStorage.removeItem('classpilot_attendance');
    localStorage.removeItem('classpilot_events');
  };

  const value = {
    state,
    updateSubject,
    updateTimetable,
    markAttendance,
    markDayAttendance,
    addEvent,
    updateEvent,
    deleteEvent,
    markEventAttended,
    resetAllData,
    DAYS,
    TIME_SLOTS,
  };

  return (
    <DataContext.Provider value={value}>
      {isLoaded && children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Helper function to find overlapping subject sessions for a given event
function getOverlappingSessions(event, timetable) {
  const overlappingSessions = [];
  const eventDate = new Date(event.date);
  if (Number.isNaN(eventDate.getTime())) return overlappingSessions;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[eventDate.getDay()];
  const slots = timetable[dayName];
  if (!slots) return overlappingSessions;

  const eventStart = timeToMinutes(event.start_time);
  const eventEnd = timeToMinutes(event.end_time);
  if (eventStart >= eventEnd) return overlappingSessions;

  slots.forEach((subjectId, slotIndex) => {
    if (!subjectId) return;

    const slotTimeRange = TIME_SLOTS[slotIndex];
    const [slotStart, slotEnd] = slotTimeRange.split(' - ');
    const slotStartMin = timeToMinutes(slotStart);
    const slotEndMin = timeToMinutes(slotEnd);

    if (eventStart < slotEndMin && eventEnd > slotStartMin) {
      overlappingSessions.push({ subjectId, slotIndex, dayName });
    }
  });

  return overlappingSessions;
}

function timeToMinutes(timeStr) {
  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr.trim());
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    return hours * 60 + minutes;
  }

  return 0;
}
