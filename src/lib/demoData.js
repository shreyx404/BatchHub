/* ============================================================
   Demo Data — Used when Supabase is not configured
   ============================================================ */

const DEMO_SUBJECTS = [
  { id: 'subj-mdm', name: 'MDM', code: 'MDM', color: '#6366f1' },
  { id: 'subj-dt', name: 'DT', code: 'DT', color: '#10b981' },
  { id: 'subj-fds', name: 'FDS', code: 'FDS', color: '#f59e0b' },
  { id: 'subj-dcn', name: 'DCN', code: 'DCN', color: '#3b82f6' },
  { id: 'subj-biot', name: 'BIot', code: 'BIot', color: '#ec4899' },
];

const now = new Date('2026-08-13T10:00:00Z'); // Fixed baseline for demo stability
// Helper to get dates relative to 'now'
const getRelativeDate = (offsetDays) => {
  return new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000).toISOString();
};

const DEMO_POSTS = [
  {
    id: 'post-1',
    title: 'Scan & Upload PDF of MDM assignment 2 on GCR',
    content: `Please make sure to scan and upload the PDF of MDM assignment 2 on Google Classroom.`,
    type: 'assignment',
    subject_id: 'subj-mdm',
    is_pinned: false,
    status: 'published',
    due_date: null,
    tags: ['assignment', 'mdm'],
    links: [],
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    subjects: DEMO_SUBJECTS[0],
    attachments: [],
  },
  {
    id: 'post-2',
    title: 'DT Problem statements',
    content: `Prepare the DT Problem statements.`,
    type: 'assignment',
    subject_id: 'subj-dt',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(1), // Tomorrow
    tags: ['dt', 'assignment'],
    links: [],
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    subjects: DEMO_SUBJECTS[1],
    attachments: [],
  },
  {
    id: 'post-3',
    title: 'MDM Statistics assignment 3',
    content: `Complete MDM Statistics assignment 3.`,
    type: 'assignment',
    subject_id: 'subj-mdm',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(1), // Tomorrow
    tags: ['mdm', 'assignment'],
    links: [],
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[0],
    attachments: [],
  },
  {
    id: 'post-4',
    title: 'VIVA - FDS Lab codes',
    content: `VIVA on Assignment 1,2,3 codes\n\nAlso checking of all codes & outputs`,
    type: 'lab',
    subject_id: 'subj-fds',
    is_pinned: false,
    status: 'published',
    due_date: '2026-08-19T23:59:59Z', // Wed, Aug 19
    tags: ['viva', 'lab', 'fds'],
    links: [],
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[2],
    attachments: [],
  },
  {
    id: 'post-5',
    title: 'DCN assignment 1 & 2',
    content: `Corrections & remaining part`,
    type: 'assignment',
    subject_id: 'subj-dcn',
    is_pinned: false,
    status: 'published',
    due_date: '2026-08-20T23:59:59Z', // Thu, Aug 20
    tags: ['dcn', 'assignment'],
    links: [],
    created_at: getRelativeDate(-3),
    updated_at: getRelativeDate(-3),
    subjects: DEMO_SUBJECTS[3],
    attachments: [],
  },
  {
    id: 'post-6',
    title: 'BIot assignment 1, 2 & 3',
    content: `Also, the Lab Notebook writeup part of A3`,
    type: 'assignment',
    subject_id: 'subj-biot',
    is_pinned: false,
    status: 'published',
    due_date: '2026-08-22T23:59:59Z', // Sat, Aug 22
    tags: ['biot', 'assignment', 'lab'],
    links: [],
    created_at: getRelativeDate(-4),
    updated_at: getRelativeDate(-4),
    subjects: DEMO_SUBJECTS[4],
    attachments: [],
  },
];

export { DEMO_SUBJECTS, DEMO_POSTS };
