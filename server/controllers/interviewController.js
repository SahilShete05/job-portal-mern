const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');

const ensureOwnership = async (applicationId, employerId) => {
  const application = await JobApplication.findById(applicationId).populate('job');
  if (!application) {
    return { error: 'Application not found' };
  }

  if (!application.job || application.job.createdBy.toString() !== employerId.toString()) {
    return { error: 'Not authorized to schedule interviews for this application' };
  }

  return { application };
};

exports.createInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, durationMinutes, location, meetingLink, notes } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Application and scheduled time are required',
      });
    }

    const { application, error } = await ensureOwnership(applicationId, req.user._id);
    if (error) {
      return res.status(403).json({
        success: false,
        message: error,
      });
    }

    await application.populate('applicant', 'name email');

    const interview = await Interview.create({
      job: application.job._id,
      application: application._id,
      employer: req.user._id,
      candidate: application.applicant,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 30,
      location: location || '',
      meetingLink: meetingLink || '',
      notes: notes || '',
    });

    await JobApplication.findByIdAndUpdate(application._id, { status: 'interview' });

    await createNotification({
      userId: application.applicant,
      type: 'interview',
      title: 'Interview scheduled',
      body: `Interview scheduled for ${application.job.title}`,
      link: '/interviews',
      meta: { interviewId: interview._id },
    });

    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Interview scheduled: ${application.job.title}`,
        text: `Your interview for ${application.job.title} is scheduled on ${new Date(scheduledAt).toLocaleString()}.`,
        html: `<p>Your interview for <strong>${application.job.title}</strong> is scheduled on <strong>${new Date(scheduledAt).toLocaleString()}</strong>.</p>`,
      });
    } catch (emailError) {
      console.warn('Interview email failed:', emailError.message || emailError);
    }

    const populated = await interview.populate([
      { path: 'job', select: 'title companyName' },
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
    });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'employer') {
      filter.employer = req.user._id;
    } else {
      filter.candidate = req.user._id;
    }

    const interviews = await Interview.find(filter)
      .populate('job', 'title companyName')
      .populate('candidate', 'name email')
      .populate('employer', 'name email')
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load interviews',
    });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const interview = await Interview.findById(id).populate('candidate', 'name email');
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview',
      });
    }

    const prevDate = interview.scheduledAt;
    const nextDate = updates.scheduledAt ? new Date(updates.scheduledAt) : interview.scheduledAt;

    interview.scheduledAt = nextDate;
    if (updates.durationMinutes !== undefined) interview.durationMinutes = updates.durationMinutes;
    if (updates.location !== undefined) interview.location = updates.location;
    if (updates.meetingLink !== undefined) interview.meetingLink = updates.meetingLink;
    if (updates.notes !== undefined) interview.notes = updates.notes;
    if (updates.status) interview.status = updates.status;

    if (updates.requestDecision && interview.candidateRequest?.type) {
      interview.candidateRequest.status = updates.requestDecision;

      if (updates.requestDecision === 'accepted') {
        if (interview.candidateRequest.type === 'cancel') {
          interview.status = 'canceled';
        }
        if (interview.candidateRequest.type === 'reschedule' && updates.scheduledAt) {
          interview.status = 'rescheduled';
          interview.scheduledAt = nextDate;
        }
      }
    }

    await interview.save();

    if (updates.scheduledAt || updates.status || updates.requestDecision) {
      await createNotification({
        userId: interview.candidate,
        type: 'interview',
        title: updates.status === 'canceled'
          ? 'Interview canceled'
          : updates.requestDecision
            ? 'Interview request updated'
            : 'Interview updated',
        body: updates.requestDecision
          ? `Your ${interview.candidateRequest?.type} request was ${updates.requestDecision}.`
          : `Interview updated from ${prevDate.toLocaleString()} to ${nextDate.toLocaleString()}`,
        link: '/interviews',
        meta: { interviewId: interview._id },
      });

      try {
        await sendEmail({
          to: interview.candidate.email,
          subject: updates.status === 'canceled'
            ? 'Interview canceled'
            : updates.requestDecision
              ? 'Interview request updated'
              : 'Interview updated',
          text: updates.requestDecision
            ? `Your ${interview.candidateRequest?.type} request was ${updates.requestDecision}.`
            : updates.status === 'canceled'
              ? 'Your interview has been canceled.'
              : `Your interview has been updated to ${nextDate.toLocaleString()}.`,
          html: updates.requestDecision
            ? `<p>Your ${interview.candidateRequest?.type} request was <strong>${updates.requestDecision}</strong>.</p>`
            : updates.status === 'canceled'
              ? '<p>Your interview has been <strong>canceled</strong>.</p>'
              : `<p>Your interview has been updated to <strong>${nextDate.toLocaleString()}</strong>.</p>`,
        });
      } catch (emailError) {
        console.warn('Interview email failed:', emailError.message || emailError);
      }
    }

    const populated = await interview.populate([
      { path: 'job', select: 'title companyName' },
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
    });
  }
};

exports.cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id).populate('candidate', 'name email');
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this interview',
      });
    }

    interview.status = 'canceled';
    await interview.save();

    await createNotification({
      userId: interview.candidate,
      type: 'interview',
      title: 'Interview canceled',
      body: 'Your interview has been canceled by the employer.',
      link: '/interviews',
      meta: { interviewId: interview._id },
    });

    try {
      await sendEmail({
        to: interview.candidate.email,
        subject: 'Interview canceled',
        text: 'Your interview has been canceled by the employer.',
        html: '<p>Your interview has been canceled by the employer.</p>',
      });
    } catch (emailError) {
      console.warn('Interview email failed:', emailError.message || emailError);
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview',
    });
  }
};

exports.updateInterviewByCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason, requestedAt } = req.body;

    const interview = await Interview.findById(id).populate('employer', 'name email');
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview',
      });
    }

    const normalizedType = String(type || '').toLowerCase();
    if (!['reschedule', 'cancel'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type. Must be reschedule or cancel',
      });
    }

    if (normalizedType === 'reschedule' && !requestedAt) {
      return res.status(400).json({
        success: false,
        message: 'Requested time is required for reschedule',
      });
    }

    interview.candidateRequest = {
      type: normalizedType,
      status: 'pending',
      requestedAt: requestedAt || '',
      reason: reason || '',
    };

    await interview.save();

    await createNotification({
      userId: interview.employer,
      type: 'interview',
      title: normalizedType === 'cancel' ? 'Interview cancel requested' : 'Reschedule requested',
      body: normalizedType === 'cancel'
        ? 'A candidate requested to cancel an interview.'
        : 'A candidate requested to reschedule an interview.',
      link: '/interviews',
      meta: { interviewId: interview._id },
    });

    try {
      if (interview.employer?.email) {
        await sendEmail({
          to: interview.employer.email,
          subject: normalizedType === 'cancel' ? 'Interview cancel requested' : 'Interview reschedule requested',
          text: normalizedType === 'cancel'
            ? 'A candidate requested to cancel an interview.'
            : 'A candidate requested to reschedule an interview.',
          html: normalizedType === 'cancel'
            ? '<p>A candidate requested to cancel an interview.</p>'
            : '<p>A candidate requested to reschedule an interview.</p>',
        });
      }
    } catch (emailError) {
      console.warn('Interview candidate update email failed:', emailError.message || emailError);
    }

    const populated = await interview.populate([
      { path: 'job', select: 'title companyName' },
      { path: 'candidate', select: 'name email' },
      { path: 'employer', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Candidate interview update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
    });
  }
};
