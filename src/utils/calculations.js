// Calculations and business logic for attendance, predictions, and risk levels

/**
 * Calculate attendance percentage for a subject
 * @param {Array} attendanceArray - Array of boolean values representing attended classes
 * @returns {number} Attendance percentage (0-100)
 */
export const calculateAttendancePercentage = (attendanceArray) => {
  if (!attendanceArray || attendanceArray.length === 0) return 0;
  const attended = attendanceArray.filter(a => a === true).length;
  return Math.round((attended / attendanceArray.length) * 100);
};

/**
 * Calculate total classes conducted and attended from explicit session indices.
 * @param {Array} attendanceArray - Array of boolean values
 * @param {Array<number>} sessionIndices - Indices of scheduled sessions for a subject
 * @returns {object} { total: number, attended: number }
 */
export const calculateSubjectAttendanceStats = (attendanceArray, sessionIndices) => {
  if (!sessionIndices || sessionIndices.length === 0) {
    return { total: 0, attended: 0 };
  }

  const attended = sessionIndices.reduce((count, index) => {
    return count + (attendanceArray?.[index] === true ? 1 : 0);
  }, 0);

  return {
    total: sessionIndices.length,
    attended,
  };
};

/**
 * Calculate total classes conducted and attended
 * @param {Array} attendanceArray - Array of boolean values
 * @returns {object} { total: number, attended: number }
 */
export const calculateClassStatistics = (attendanceArray) => {
  if (!attendanceArray || attendanceArray.length === 0) {
    return { total: 0, attended: 0 };
  }
  const attended = attendanceArray.filter(a => a === true).length;
  return {
    total: attendanceArray.length,
    attended,
  };
};

/**
 * Determine risk level based on attendance percentage
 * @param {number} percentage - Attendance percentage
 * @returns {string} Risk level: "Safe", "Warning", or "Critical"
 */
export const calculateRiskLevel = (percentage) => {
  if (percentage >= 85) return 'Safe';
  if (percentage >= 75) return 'Warning';
  return 'Critical';
};

/**
 * Get color for risk level
 * @param {string} riskLevel - Risk level
 * @returns {string} Tailwind color class
 */
export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'Safe':
      return 'bg-green-500 dark:bg-green-600';
    case 'Warning':
      return 'bg-yellow-500 dark:bg-yellow-600';
    case 'Critical':
      return 'bg-red-500 dark:bg-red-600';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Calculate consecutive classes needed to reach 85% attendance.
 *
 * Scenario: you attend every upcoming class without skipping any.
 * Both `attended` and `total` increase by x simultaneously.
 * Solve for the minimum integer x such that:
 *   (attended + x) / (total + x) >= 0.85
 *
 * Derivation:
 *   attended + x = 0.85 * (total + x)
 *   attended + x = 0.85*total + 0.85*x
 *   x - 0.85*x  = 0.85*total - attended
 *   0.15*x      = 0.85*total - attended
 *   x           = (0.85*total - attended) / 0.15
 *
 * No assumption about total semester length is needed — this is computed
 * purely from current actuals and updates dynamically every time a class
 * is held or attended.
 *
 * Returns 0 if already at or above 85%.
 * @param {number} totalClasses - Total classes conducted so far
 * @param {number} attendedClasses - Classes attended so far
 * @returns {number} Number of consecutive classes to attend to reach 85%
 */
export const calculateClassesToAttend = (totalClasses, attendedClasses) => {
  if (totalClasses === 0) return 0;

  const currentPercentage = (attendedClasses / totalClasses) * 100;
  if (currentPercentage >= 85) return 0;

  return Math.ceil((0.85 * totalClasses - attendedClasses) / 0.15);
};

/**
 * Calculate classes that can still be skipped while staying at or above 85%.
 *
 * Scenario: you skip upcoming classes. `total` increases by x (class was held)
 * but `attended` stays the same (you weren't there).
 * Solve for the maximum integer x such that:
 *   attended / (total + x) >= 0.85
 *
 * Derivation:
 *   attended = 0.85 * (total + x)
 *   attended = 0.85*total + 0.85*x
 *   0.85*x   = attended - 0.85*total
 *   x        = (attended - 0.85*total) / 0.85
 *
 * This is the live "bunk budget" — it updates every time a class is held
 * or attended, with no dependency on semester length or future schedule.
 *
 * Returns 0 if already below 85% (no bunk budget remaining).
 * @param {number} totalClasses - Total classes conducted so far
 * @param {number} attendedClasses - Classes attended so far
 * @returns {number} Number of upcoming classes that can be skipped
 */
export const calculateClassesCanSkip = (totalClasses, attendedClasses) => {
  if (totalClasses === 0) return 0;

  const currentPercentage = (attendedClasses / totalClasses) * 100;
  if (currentPercentage < 85) return 0;

  return Math.floor((attendedClasses - 0.85 * totalClasses) / 0.85);
};

/**
 * Generate insight message for a subject
 * @param {number} percentage - Attendance percentage
 * @param {number} classesToAttend - Classes needed to attend
 * @param {number} classesCanSkip - Classes that can be skipped
 * @returns {string} Insight message
 */
export const generateInsight = (percentage, classesToAttend, classesCanSkip) => {
  if (percentage < 85) {
    return `Attend ${classesToAttend} consecutive class${classesToAttend !== 1 ? 'es' : ''} to reach 85%`;
  }

  if (classesCanSkip === 0) return 'Maintain current attendance to stay above 85%';
  return `Can skip ${classesCanSkip} class${classesCanSkip !== 1 ? 'es' : ''} and still maintain 85%`;
};

/**
 * Calculate total activity points from all attended events
 * @param {Array} events - Array of event objects
 * @returns {number} Total activity points
 */
export const calculateTotalActivityPoints = (events) => {
  return events.reduce((sum, event) => {
    return event.attended ? sum + (event.points || 0) : sum;
  }, 0);
};

/**
 * Get all attended events
 * @param {Array} events - Array of event objects
 * @returns {Array} Filtered array of attended events
 */
export const getAttendedEvents = (events) => {
  return events.filter(e => e.attended);
};

/**
 * Get upcoming events (not yet attended)
 * @param {Array} events - Array of event objects
 * @returns {Array} Filtered array of upcoming events
 */
export const getUpcomingEvents = (events) => {
  return events.filter(e => !e.attended);
};

/**
 * Calculate subject-wise metrics
 * @param {Object} subject - Subject object
 * @param {Array} attendance - Attendance array for subject
 * @returns {object} Complete metrics object
 */
export const calculateSubjectMetrics = (subject, attendance, sessionIndices = null) => {
  const stats = sessionIndices
    ? calculateSubjectAttendanceStats(attendance, sessionIndices)
    : calculateClassStatistics(attendance);

  const percentage = sessionIndices
    ? Math.round((stats.attended / Math.max(stats.total, 1)) * 100)
    : calculateAttendancePercentage(attendance);

  const riskLevel = calculateRiskLevel(percentage);
  const classesToAttend = calculateClassesToAttend(stats.total, stats.attended);
  const classesCanSkip = calculateClassesCanSkip(stats.total, stats.attended);
  const insight = generateInsight(percentage, classesToAttend, classesCanSkip);

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    total_classes: stats.total,
    attended_classes: stats.attended,
    attendance_percentage: percentage,
    risk_level: riskLevel,
    classes_to_attend: classesToAttend,
    classes_can_skip: classesCanSkip,
    insight,
  };
};

/**
 * Get an array of session indices for a subject from a timetable.
 * @param {string} subjectId
 * @param {Object} timetable
 * @param {Array<string>} DAYS
 * @param {Array<string>} TIME_SLOTS
 * @returns {Array<number>}
 */
export const getSubjectSessionIndices = (subjectId, timetable, DAYS, TIME_SLOTS) => {
  const indices = [];
  DAYS.forEach((day, dayIndex) => {
    const slots = timetable[day] || [];
    slots.forEach((slotSubjectId, slotIndex) => {
      if (slotSubjectId === subjectId) {
        indices.push(dayIndex * TIME_SLOTS.length + slotIndex);
      }
    });
  });
  return indices;
};

/**
 * Get all subject metrics in one call
 * @param {Array} subjects - Array of subjects
 * @param {Object} attendance - Attendance object indexed by subject ID
 * @param {Object} timetable - Timetable object keyed by day
 * @param {Array<string>} DAYS - Ordered list of weekdays
 * @param {Array<string>} TIME_SLOTS - Ordered list of timeslots
 * @returns {Array} Array of subject metrics
 */
export const getAllSubjectMetrics = (subjects, attendance, timetable = null, DAYS = null, TIME_SLOTS = null) => {
  return subjects.map(subject => {
    const subjectAttendance = attendance[subject.id] || [];
    const sessionIndices = timetable && DAYS && TIME_SLOTS
      ? getSubjectSessionIndices(subject.id, timetable, DAYS, TIME_SLOTS)
      : null;
    return calculateSubjectMetrics(subject, subjectAttendance, sessionIndices);
  });
};

/**
 * Check if a student is at risk (below 85%)
 * @param {number} percentage - Attendance percentage
 * @returns {boolean} True if at risk
 */
export const isAtRisk = (percentage) => {
  return percentage < 85;
};

/**
 * Determine action recommendation
 * @param {number} percentage - Attendance percentage
 * @param {number} classesToAttend - Classes to attend
 * @returns {string} Action recommendation
 */
export const getActionRecommendation = (percentage, classesToAttend) => {
  if (percentage < 85) {
    return `ACTION: Attend class to improve attendance. Need ${classesToAttend} more.`;
  }
  return 'ACTION: Your attendance is safe. Keep up the good work!';
};