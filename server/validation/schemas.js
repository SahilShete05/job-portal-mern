const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(128),
  }).strict(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(128),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6).max(128),
    newPassword: z.string().min(6).max(128),
  }),
});

const jobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    location: z.string().min(2).max(120),
    companyName: z.string().min(2).max(200),
    jobType: z.enum(['full-time', 'part-time', 'internship', 'remote']).optional(),
    salary: z.string().max(120).optional(),
    skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  }),
});

const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    location: z.string().min(2).max(120).optional(),
    companyName: z.string().min(2).max(200).optional(),
    jobType: z.enum(['full-time', 'part-time', 'internship', 'remote']).optional(),
    salary: z.string().max(120).optional(),
    skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  }),
});

const applyJobSchema = z.object({
  params: z.object({
    jobId: z.string().min(1),
  }),
});

const applicationIdParamSchema = z.object({
  params: z.object({
    applicationId: z.string().min(1),
  }),
});

const applicationStatusSchema = z.object({
  params: z.object({
    applicationId: z.string().min(1),
  }),
  body: z.object({
    status: z.enum([
      'pending',
      'accepted',
      'applied',
      'shortlisted',
      'interview',
      'offered',
      'hired',
      'rejected',
      'withdrawn',
      'closed',
    ]),
  }),
});

const interviewSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1),
    scheduledAt: z.string().min(1),
    durationMinutes: z.number().min(15).max(240).optional(),
    location: z.string().max(200).optional(),
    meetingLink: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
  }),
});

const interviewUpdateSchema = z.object({
  body: z.object({
    scheduledAt: z.string().min(1).optional(),
    durationMinutes: z.number().min(15).max(240).optional(),
    location: z.string().max(200).optional(),
    meetingLink: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'rescheduled', 'completed', 'canceled']).optional(),
    requestDecision: z.enum(['accepted', 'rejected']).optional(),
  }),
});

const interviewCandidateUpdateSchema = z.object({
  body: z.object({
    type: z.enum(['reschedule', 'cancel']),
    reason: z.string().max(2000).optional(),
    requestedAt: z.string().max(100).optional(),
  }),
});

const profileUpdateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .max(20)
      .refine((value) => {
        const trimmed = value.trim();
        if (!trimmed) return true;
        return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(trimmed);
      }, 'Please provide a valid phone number')
      .optional(),
    location: z.string().max(120).optional(),
    about: z.string().max(2000).optional(),
    skills: z.array(z.string().min(1).max(50)).max(30).optional(),
    experience: z.string().max(2000).optional(),
  }),
});

const employerProfileUpdateSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(200).optional(),
    contactEmail: z.union([z.string().email(), z.literal('')]).optional(),
    companyWebsite: z.string().max(200).optional(),
    industry: z.string().max(120).optional(),
    companySize: z.string().max(50).optional(),
    location: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    logo: z.string().max(500).optional(),
  }),
});

const messageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1).optional(),
    conversationId: z.string().min(1).optional(),
    jobId: z.string().min(1).optional(),
    content: z.string().min(1).max(2000),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  jobSchema,
  updateJobSchema,
  applyJobSchema,
  applicationIdParamSchema,
  applicationStatusSchema,
  interviewSchema,
  interviewUpdateSchema,
  interviewCandidateUpdateSchema,
  profileUpdateSchema,
  employerProfileUpdateSchema,
  messageSchema,
};
