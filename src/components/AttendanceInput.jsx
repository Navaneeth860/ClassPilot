import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  calculateRiskLevel,
  calculateSubjectAttendanceStats,
  getSubjectSessionIndices,
} from '../utils/calculations';

const AttendanceInput = () => {
  const { state, DAYS, TIME_SLOTS, markAttendance, markDayAttendance } = useData();
  const [mode, setMode] = useState('per-class');

  const schedule = useMemo(() => {
    return DAYS.flatMap((day, dayIndex) =>
      TIME_SLOTS.map((slotLabel, slotIndex) => {
        const subjectId = state.timetable[day]?.[slotIndex];
        const attendanceIndex = dayIndex * TIME_SLOTS.length + slotIndex;
        const attended = subjectId
          ? !!state.attendance[subjectId]?.[attendanceIndex]
          : false;

        return {
          day,
          dayIndex,
          slotIndex,
          slotLabel,
          subjectId,
          subjectName: subjectId
            ? state.subjects.find(subject => subject.id === subjectId)?.name ?? 'Unknown'
            : null,
          attendanceIndex,
          attended,
        };
      })
    );
  }, [state.timetable, state.attendance, state.subjects, DAYS, TIME_SLOTS]);

  const daySummary = useMemo(() => {
    return DAYS.map((day, dayIndex) => {
      const entries = schedule.filter(item => item.dayIndex === dayIndex && item.subjectId);
      const attendedCount = entries.filter(item => item.attended).length;
      return {
        day,
        count: entries.length,
        attended: attendedCount,
      };
    });
  }, [schedule, DAYS]);

  const subjectMetrics = useMemo(() => {
    return state.subjects.map(subject => {
      const attendanceArray = state.attendance[subject.id] || [];
      const sessionIndices = getSubjectSessionIndices(subject.id, state.timetable, DAYS, TIME_SLOTS);
      const stats = calculateSubjectAttendanceStats(attendanceArray, sessionIndices);
      const percentage = stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;
      const risk = calculateRiskLevel(percentage);
      return {
        subject,
        stats,
        percentage,
        risk,
      };
    });
  }, [state.subjects, state.attendance, state.timetable, DAYS, TIME_SLOTS]);

  const handleClassToggle = (item) => {
    if (!item.subjectId) return;
    markAttendance(item.subjectId, item.attendanceIndex, !item.attended);
  };

  const handleMarkDay = (day, attended) => {
    const entries = schedule.filter(item => item.day === day && item.subjectId);
    const subjectIds = [...new Set(entries.map(entry => entry.subjectId))];
    subjectIds.forEach(subjectId => markDayAttendance(subjectId, day, attended));
  };

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Attendance Control</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Switch between per-class and per-day attendance entry. Every change updates attendance status immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode('per-class')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                mode === 'per-class'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Per Class
            </button>
            <button
              type="button"
              onClick={() => setMode('per-day')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                mode === 'per-day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Per Day
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{mode === 'per-class' ? 'Class Sessions' : 'Daily Attendance'}</h3>
          <div className="mt-4 space-y-4">
            {mode === 'per-class' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Day / Slot</th>
                      {TIME_SLOTS.map((slot, index) => (
                        <th key={index} className="px-4 py-3 whitespace-nowrap">{slot}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, dayIndex) => (
                      <tr key={day} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{day}</td>
                        {TIME_SLOTS.map((slot, slotIndex) => {
                          const item = schedule.find(s => s.day === day && s.slotIndex === slotIndex);
                          return (
                            <td key={slotIndex} className="px-4 py-3 align-top">
                              {item?.subjectId ? (
                                <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.subjectName}</span>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={item.attended}
                                      onChange={() => handleClassToggle(item)}
                                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">Present</span>
                                  </div>
                                </label>
                              ) : (
                                <span className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                  No class
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {daySummary.map(day => (
                  <div key={day.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{day.day}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {day.count} scheduled class{day.count !== 1 ? 'es' : ''}, {day.attended} attended
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleMarkDay(day.day, true)}
                          className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                        >
                          Mark all attended
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkDay(day.day, false)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
                        >
                          Mark all missed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Subject insights</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track each subject's attendance percentage and risk level in real time.
            </p>
          </div>
          <div className="grid gap-4">
            {subjectMetrics.map(({ subject, stats, percentage, risk }) => (
              <div key={subject.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{subject.name}</h4>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{risk}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{percentage}%</span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      risk === 'Safe'
                        ? 'bg-green-500'
                        : risk === 'Warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  {stats.attended} / {stats.total} classes attended
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AttendanceInput;
