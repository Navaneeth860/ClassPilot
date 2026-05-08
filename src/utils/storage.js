// LocalStorage utility functions
const STORAGE_KEYS = {
  TIMETABLE: 'classpilot_timetable',
  SUBJECTS: 'classpilot_subjects',
  ATTENDANCE: 'classpilot_attendance',
  EVENTS: 'classpilot_events',
  SETTINGS: 'classpilot_settings',
};

export const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(state.subjects));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(state.timetable));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(state.attendance));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = () => {
  try {
    const subjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const timetable = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    const attendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (subjects && timetable && attendance && events) {
      return {
        subjects: JSON.parse(subjects),
        timetable: JSON.parse(timetable),
        attendance: JSON.parse(attendance),
        events: JSON.parse(events),
        settings: settings ? JSON.parse(settings) : {},
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const exportData = () => {
  try {
    const data = {
      subjects: localStorage.getItem(STORAGE_KEYS.SUBJECTS),
      timetable: localStorage.getItem(STORAGE_KEYS.TIMETABLE),
      attendance: localStorage.getItem(STORAGE_KEYS.ATTENDANCE),
      events: localStorage.getItem(STORAGE_KEYS.EVENTS),
      settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};
