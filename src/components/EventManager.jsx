import React from 'react';
import { Calendar, Trophy, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { calculateTotalActivityPoints, getAttendedEvents, getUpcomingEvents } from '../utils/calculations';

const EventManager = () => {
  const { state, markEventAttended, deleteEvent } = useData();

  const totalPoints = calculateTotalActivityPoints(state.events);
  const attendedEvents = getAttendedEvents(state.events);
  const upcomingEvents = getUpcomingEvents(state.events);

  const handleMarkAttended = (eventId) => {
    markEventAttended(eventId);
  };

  const handleDelete = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Event Management</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track your event participation and activity points. Events can automatically mark class attendance.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-100 px-4 py-2 dark:bg-blue-900/30">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {totalPoints} Points
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upcoming Events</h3>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.type}</p>
                      {event.organizing_club && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">by {event.organizing_club}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>{formatDate(event.date)}</span>
                        <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {event.points} points
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleMarkAttended(event.id)}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                    >
                      Mark Attended
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Attended Events */}
        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Attended Events</h3>
          </div>

          {attendedEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No attended events yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendedEvents.map(event => (
                <div key={event.id} className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">{event.title}</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">{event.type}</p>
                      {event.organizing_club && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">by {event.organizing_club}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                        <span>{formatDate(event.date)}</span>
                        <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {event.points} points earned
                        </span>
                      </div>
                      {event.subjects_marked && event.subjects_marked.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Marked attendance for: {event.subjects_marked.map(id => {
                              const subject = state.subjects.find(s => s.id === id);
                              return subject?.name;
                            }).filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventManager;