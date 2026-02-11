import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cancelInterview, createInterview, getInterviews, updateInterview, requestInterviewUpdate } from '../services/interviewService';
import Button from '../components/Button';

const Interviews = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [editingInterviewId, setEditingInterviewId] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [requestingInterviewId, setRequestingInterviewId] = useState('');
  const [requestType, setRequestType] = useState('reschedule');
  const [requestReason, setRequestReason] = useState('');
  const [requestTime, setRequestTime] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [decisionSubmittingId, setDecisionSubmittingId] = useState('');
  const [form, setForm] = useState({
    applicationId: '',
    scheduledAt: '',
    durationMinutes: 30,
    location: '',
    meetingLink: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isEmployer = user?.role === 'employer';

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInterviews();
      setInterviews(data);
    } catch (err) {
      setError(err.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    const appId = searchParams.get('applicationId');
    if (appId) {
      setForm((prev) => ({ ...prev, applicationId: appId }));
    }
  }, [searchParams]);

  const upcoming = useMemo(
    () => interviews.filter((item) => item.status !== 'canceled'),
    [interviews]
  );

  const interviewsByDate = useMemo(() => {
    return upcoming.reduce((acc, item) => {
      const dateKey = new Date(item.scheduledAt).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
  }, [upcoming]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.applicationId || !form.scheduledAt) {
      setFeedback({ type: 'error', message: 'Application and schedule are required.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingInterviewId) {
        await updateInterview(editingInterviewId, {
          scheduledAt: form.scheduledAt,
          durationMinutes: form.durationMinutes,
          location: form.location,
          meetingLink: form.meetingLink,
          notes: form.notes,
          status: 'rescheduled',
        });
        setFeedback({ type: 'success', message: 'Interview rescheduled successfully.' });
      } else {
        await createInterview({
          applicationId: form.applicationId,
          scheduledAt: form.scheduledAt,
          durationMinutes: form.durationMinutes,
          location: form.location,
          meetingLink: form.meetingLink,
          notes: form.notes,
        });
        setFeedback({ type: 'success', message: 'Interview scheduled successfully.' });
      }
      setForm({
        applicationId: '',
        scheduledAt: '',
        durationMinutes: 30,
        location: '',
        meetingLink: '',
        notes: '',
      });
      setEditingInterviewId('');
      await loadInterviews();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to schedule interview.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (interviewId) => {
    const confirmed = window.confirm('Cancel this interview?');
    if (!confirmed) return;

    try {
      await cancelInterview(interviewId);
      setFeedback({ type: 'success', message: 'Interview canceled.' });
      await loadInterviews();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel interview.' });
    }
  };

  const handleStartRequest = (interview, type) => {
    setRequestingInterviewId(interview._id);
    setRequestType(type);
    setRequestReason('');
    setRequestTime('');
  };

  const handleReschedule = (interview) => {
    setEditingInterviewId(interview._id);
    setForm({
      applicationId: interview.application?._id || '',
      scheduledAt: interview.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 16) : '',
      durationMinutes: interview.durationMinutes || 30,
      location: interview.location || '',
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || '',
    });
  };

  const handleClearForm = () => {
    setEditingInterviewId('');
    setForm({
      applicationId: '',
      scheduledAt: '',
      durationMinutes: 30,
      location: '',
      meetingLink: '',
      notes: '',
    });
  };

  const handleCandidateRequest = async (interview) => {
    if (!requestType) return;

    if (requestType === 'reschedule' && !requestTime) {
      setFeedback({ type: 'error', message: 'Please select a requested time.' });
      return;
    }

    try {
      setRequestSubmitting(true);
      const requestedAt = requestType === 'reschedule' ? new Date(requestTime).toISOString() : undefined;
      await requestInterviewUpdate(interview._id, {
        type: requestType,
        reason: requestReason || undefined,
        requestedAt,
      });
      setFeedback({ type: 'success', message: 'Request sent to employer.' });
      setRequestingInterviewId('');
      setRequestReason('');
      setRequestTime('');
      await loadInterviews();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send request.' });
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleRequestDecision = async (interview, decision) => {
    try {
      setDecisionSubmittingId(interview._id);
      const payload = { requestDecision: decision };

      if (decision === 'accepted' && interview.candidateRequest?.type === 'reschedule' && interview.candidateRequest?.requestedAt) {
        payload.scheduledAt = interview.candidateRequest.requestedAt;
      }

      await updateInterview(interview._id, payload);
      setFeedback({ type: 'success', message: `Request ${decision}.` });
      await loadInterviews();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update request.' });
    } finally {
      setDecisionSubmittingId('');
    }
  };

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfMonth });

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Interviews</h1>
          <p className="text-muted">Track upcoming interviews and scheduling updates.</p>
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              feedback.type === 'success'
                ? 'bg-success-soft border-success-soft text-success'
                : 'bg-danger-soft border-danger-soft text-danger'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-danger-soft bg-danger-soft p-4 text-danger">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isEmployer && (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-subtle rounded-2xl shadow-card p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-primary">Schedule Interview</h2>
              {editingInterviewId && (
                <div className="rounded-lg border border-[color:var(--app-border)] bg-[color:var(--app-accent-soft)] p-3 text-sm text-primary">
                  Editing existing interview.{' '}
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="text-[color:var(--app-accent)] font-semibold"
                  >
                    Clear
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Application ID</label>
                <input
                  value={form.applicationId}
                  onChange={(event) => setForm((prev) => ({ ...prev, applicationId: event.target.value }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="Paste application id"
                  disabled={Boolean(editingInterviewId)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={form.durationMinutes}
                  onChange={(event) => setForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Location</label>
                <input
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="Office or city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Meeting Link</label>
                <input
                  value={form.meetingLink}
                  onChange={(event) => setForm((prev) => ({ ...prev, meetingLink: event.target.value }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  rows="3"
                />
              </div>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting
                  ? editingInterviewId
                    ? 'Rescheduling...'
                    : 'Scheduling...'
                  : editingInterviewId
                    ? 'Reschedule Interview'
                    : 'Schedule Interview'}
              </Button>
            </form>
          )}

          <div className={isEmployer ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {upcoming.length === 0 ? (
              <div className="bg-card border border-subtle rounded-2xl shadow-card p-12 text-center">
                <AlertCircle size={32} className="mx-auto text-muted mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">No interviews yet</h2>
                <p className="text-muted">Upcoming interviews will appear here.</p>
              </div>
            ) : viewMode === 'calendar' ? (
              <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto -mx-2 px-2">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted mb-3">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-sm">
                      {leadingBlanks.map((_, index) => (
                        <div key={`blank-${index}`} className="h-24 rounded-lg border border-transparent" />
                      ))}
                      {calendarDays.map((day) => {
                        const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                        const dateKey = date.toDateString();
                        const dayInterviews = interviewsByDate[dateKey] || [];
                        return (
                          <div key={day} className="h-24 rounded-lg border border-subtle bg-surface p-2 overflow-hidden">
                            <div className="text-xs font-semibold text-primary mb-1">{day}</div>
                            {dayInterviews.slice(0, 2).map((interview) => (
                              <div key={interview._id} className="text-[10px] text-[color:var(--app-accent)] truncate">
                                {interview.job?.title || 'Interview'}
                              </div>
                            ))}
                            {dayInterviews.length > 2 && (
                              <div className="text-[10px] text-muted">+{dayInterviews.length - 2} more</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((interview) => (
                  <div key={interview._id} className="bg-card border border-subtle rounded-2xl shadow-card p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {interview.job?.title || 'Interview'}
                        </h3>
                        <p className="text-sm text-muted">
                          {isEmployer
                            ? `Candidate: ${interview.candidate?.name || 'Job seeker'}`
                            : `Employer: ${interview.employer?.name || 'Employer'}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        interview.status === 'canceled'
                          ? 'bg-danger-soft text-danger'
                          : interview.status === 'rescheduled'
                            ? 'bg-warning-soft text-warning'
                            : 'bg-success-soft text-success'
                      }`}>
                        {interview.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(interview.scheduledAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {interview.durationMinutes} minutes
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {interview.location}
                        </div>
                      )}
                      {interview.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Video size={16} />
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[color:var(--app-accent)] hover:underline"
                          >
                            Join meeting
                          </a>
                        </div>
                      )}
                    </div>

                    {interview.candidateRequest?.status && (
                      <div className="mt-4 rounded-lg border border-subtle bg-surface p-3 text-sm text-muted">
                        <p className="font-semibold text-primary">Candidate request</p>
                        <p>
                          {interview.candidateRequest.type === 'cancel'
                            ? 'Cancel interview'
                            : 'Reschedule interview'}{' '}
                          <span className="text-muted">({interview.candidateRequest.status})</span>
                        </p>
                        {interview.candidateRequest.requestedAt && (
                          <p>Requested time: {new Date(interview.candidateRequest.requestedAt).toLocaleString()}</p>
                        )}
                        {interview.candidateRequest.reason && (
                          <p>Reason: {interview.candidateRequest.reason}</p>
                        )}
                      </div>
                    )}

                    {isEmployer && interview.status !== 'canceled' && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(interview._id)}
                        >
                          Cancel Interview
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReschedule(interview)}
                        >
                          Reschedule
                        </Button>
                        {interview.candidateRequest?.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRequestDecision(interview, 'accepted')}
                              disabled={decisionSubmittingId === interview._id}
                            >
                              Accept request
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestDecision(interview, 'rejected')}
                              disabled={decisionSubmittingId === interview._id}
                            >
                              Reject request
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {!isEmployer && interview.status !== 'canceled' && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartRequest(interview, 'cancel')}
                          disabled={interview.candidateRequest?.status === 'pending'}
                        >
                          Request Cancel
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartRequest(interview, 'reschedule')}
                          disabled={interview.candidateRequest?.status === 'pending'}
                        >
                          Request Reschedule
                        </Button>
                        {interview.candidateRequest?.status === 'pending' && (
                          <span className="text-xs text-muted">Request pending employer review.</span>
                        )}
                      </div>
                    )}

                    {!isEmployer && requestingInterviewId === interview._id && (
                      <div className="mt-4 rounded-lg border border-subtle bg-surface p-4">
                        <div className="mb-3 text-sm font-semibold text-primary">
                          {requestType === 'cancel' ? 'Request cancel' : 'Request reschedule'}
                        </div>
                        {requestType === 'reschedule' && (
                          <div className="mb-3">
                            <label className="block text-sm font-semibold text-muted mb-2">Requested time</label>
                            <input
                              type="datetime-local"
                              value={requestTime}
                              onChange={(event) => setRequestTime(event.target.value)}
                              className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                            />
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="block text-sm font-semibold text-muted mb-2">Reason (optional)</label>
                          <textarea
                            value={requestReason}
                            onChange={(event) => setRequestReason(event.target.value)}
                            className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                            rows="3"
                          />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCandidateRequest(interview)}
                            disabled={requestSubmitting}
                          >
                            {requestSubmitting ? 'Sending...' : 'Send request'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRequestingInterviewId('')}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interviews;
