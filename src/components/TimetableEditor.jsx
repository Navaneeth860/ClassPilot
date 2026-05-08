import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';

const buildEmptyTimetable = (DAYS, TIME_SLOTS) => {
  const timetable = {};
  DAYS.forEach(day => {
    timetable[day] = Array(TIME_SLOTS.length).fill(null);
  });
  return timetable;
};

const TimetableEditor = () => {
  const { state, DAYS, TIME_SLOTS, updateTimetable } = useData();
  const [localTimetable, setLocalTimetable] = useState(() => state.timetable);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLocalTimetable(state.timetable);
  }, [state.timetable]);

  const handleCellChange = (day, slotIndex, value) => {
    setLocalTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((cell, index) => (index === slotIndex ? (value || null) : cell)),
    }));
  };

  const handleSave = () => {
    updateTimetable(localTimetable);
    setStatus('Timetable saved');
    window.setTimeout(() => setStatus(''), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset timetable to empty schedule?')) {
      const emptyTimetable = buildEmptyTimetable(DAYS, TIME_SLOTS);
      setLocalTimetable(emptyTimetable);
      updateTimetable(emptyTimetable);
      setStatus('Timetable reset');
      window.setTimeout(() => setStatus(''), 2500);
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Weekly Timetable</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Assign subjects to each hourly slot from Monday to Friday. This timetable is used to calculate attendance and event overlap.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Save Timetable
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Reset
            </button>
          </div>
        </div>
        {status && <p className="mt-4 text-sm text-green-600 dark:text-green-400">{status}</p>}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Day / Slot</th>
              {TIME_SLOTS.map((slot, index) => (
                <th key={index} className="px-4 py-3 whitespace-nowrap">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{day}</td>
                {TIME_SLOTS.map((slot, slotIndex) => (
                  <td key={slotIndex} className="px-4 py-3 align-top">
                    <select
                      value={localTimetable?.[day]?.[slotIndex] ?? ''}
                      onChange={(e) => handleCellChange(day, slotIndex, e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                    >
                      <option value="">No subject</option>
                      {state.subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableEditor;
