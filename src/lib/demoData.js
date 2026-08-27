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

// Helper to get dates relative to now
const getRelativeDate = (offsetDays, offsetHours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
};

const DEMO_POSTS = [
  {
    id: 'post-1',
    title: '⚠️ Mid-Semester Exam Guidelines & Seating Arrangement',
    content: `## Mid-Semester Examination Guidelines\n\nAll students are required to follow these instructions:\n\n1. Bring your **Physical College ID card**.\n2. Arrive at least **15 minutes** before the scheduled time.\n3. No smart watches, mobile phones, or programmable calculators permitted.\n\n_Check the seating allotment sheet linked below._`,
    type: 'important',
    subject_id: null,
    is_pinned: true,
    status: 'published',
    due_date: null,
    tags: ['exam', 'guidelines', 'urgent'],
    links: [
      { label: 'Seating Allotment Sheet (G-Drive)', url: 'https://drive.google.com' },
      { label: 'Exam Timetable PDF', url: 'https://example.com/timetable.pdf' },
    ],
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    subjects: null,
  },
  {
    id: 'post-2',
    title: 'DT Problem Statements & Submission Portal',
    content: `Prepare the DT Problem statements and submit your analysis.\n\nEnsure problem framing adheres to the rubric provided in class.`,
    type: 'assignment',
    subject_id: 'subj-dt',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(1, 4), // Due tomorrow
    tags: ['dt', 'assignment'],
    links: [
      { label: 'Submission Portal (GCR)', url: 'https://classroom.google.com' },
      { label: 'Problem Statements PDF', url: 'https://example.com/dt-problems.pdf' },
    ],
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    subjects: DEMO_SUBJECTS[1],
  },
  {
    id: 'post-3',
    title: 'MDM Statistics Assignment 3',
    content: `Complete MDM Statistics assignment 3 questions 1 through 8 with step-by-step hypothesis tests.`,
    type: 'assignment',
    subject_id: 'subj-mdm',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(2), // In 2 days
    tags: ['mdm', 'assignment'],
    links: [
      { label: 'Assignment Questions (PDF)', url: 'https://example.com/mdm-a3.pdf' },
    ],
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[0],
  },
  {
    id: 'post-4',
    title: 'VIVA — FDS Lab Codes & Viva Checklist',
    content: `VIVA on Assignment 1, 2, 3 codes.\n\nAlso checking of all codes, outputs, and GitHub repository commits.`,
    type: 'lab',
    subject_id: 'subj-fds',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(3), // In 3 days
    tags: ['viva', 'lab', 'fds'],
    links: [
      { label: 'FDS Lab Manual & Rubric', url: 'https://example.com/fds-manual.pdf' },
    ],
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[2],
  },
  {
    id: 'post-5',
    title: 'DCN Reference Material — TCP/IP Protocol Stack Notes',
    content: `Curated reference resources and lecture slides for Unit 3: Transport Layer & TCP Congestion Control.`,
    type: 'resource',
    subject_id: 'subj-dcn',
    is_pinned: false,
    status: 'published',
    due_date: null,
    tags: ['dcn', 'reference', 'notes'],
    links: [
      { label: 'Lecture Slides (G-Drive)', url: 'https://drive.google.com' },
      { label: 'Wireshark Lab Handout', url: 'https://wireshark.org' },
    ],
    created_at: getRelativeDate(-3),
    updated_at: getRelativeDate(-3),
    subjects: DEMO_SUBJECTS[3],
  },
  {
    id: 'post-6',
    title: 'BIoT Lab Notebook Writeup & Sensor Interfacing',
    content: `Complete the Lab Notebook writeup part of Assignment 3, including circuit schematic diagrams.`,
    type: 'assignment',
    subject_id: 'subj-biot',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(5),
    tags: ['biot', 'assignment', 'lab'],
    links: [
      { label: 'Sensor Interfacing Guide', url: 'https://example.com/biot-guide.pdf' },
    ],
    created_at: getRelativeDate(-4),
    updated_at: getRelativeDate(-4),
    subjects: DEMO_SUBJECTS[4],
  },
  {
    id: 'post-7',
    title: 'DCN Socket Programming Lab',
    content: `Implement a TCP client-server chat application using Python sockets. Include error handling and multi-client support.`,
    type: 'lab',
    subject_id: 'subj-dcn',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(7),
    tags: ['dcn', 'lab', 'socket'],
    links: [
      { label: 'Lab Manual (PDF)', url: 'https://example.com/dcn-lab-manual.pdf' },
    ],
    created_at: getRelativeDate(-3),
    updated_at: getRelativeDate(-3),
    subjects: DEMO_SUBJECTS[3],
  },
  {
    id: 'post-8',
    title: 'MDM Probability Quiz 2',
    content: `In-class quiz covering Bayes Theorem, conditional probability, and random variables. Bring your calculator and stat tables.`,
    type: 'deadline',
    subject_id: 'subj-mdm',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(10, 2),
    tags: ['mdm', 'quiz'],
    links: [],
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    subjects: DEMO_SUBJECTS[0],
  },
  {
    id: 'post-9',
    title: 'BIoT Mini Project Proposal Submission',
    content: `Submit your mini project proposal with abstract, objectives, block diagram, and component list. Max 3 pages.`,
    type: 'assignment',
    subject_id: 'subj-biot',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(14),
    tags: ['biot', 'project', 'proposal'],
    links: [
      { label: 'Proposal Template (Docs)', url: 'https://docs.google.com' },
    ],
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[4],
  },
  {
    id: 'post-10',
    title: 'FDS Lab Assignment 1 Code Submission',
    content: `Submit Python implementation for Pandas and NumPy exploratory data analysis tasks.`,
    type: 'lab',
    subject_id: 'subj-fds',
    is_pinned: false,
    status: 'archived',
    due_date: getRelativeDate(-4),
    tags: ['fds', 'lab', 'archived'],
    links: [
      { label: 'Archived Lab Problem Set', url: 'https://example.com/fds-a1.pdf' },
    ],
    created_at: getRelativeDate(-10),
    updated_at: getRelativeDate(-4),
    subjects: DEMO_SUBJECTS[2],
  },
  {
    id: 'post-11',
    title: 'DT Empathy Map & Persona Draft',
    content: `Completed group submission for user interviews and persona synthesis sheets.`,
    type: 'assignment',
    subject_id: 'subj-dt',
    is_pinned: false,
    status: 'published',
    due_date: getRelativeDate(-2, -3), // Past due
    tags: ['dt', 'design-thinking'],
    links: [
      { label: 'Empathy Map Template', url: 'https://miro.com' },
    ],
    created_at: getRelativeDate(-8),
    updated_at: getRelativeDate(-2),
    subjects: DEMO_SUBJECTS[1],
  },
  {
    id: 'post-12',
    title: 'MDM Hypothesis Testing Practice Sheet',
    content: `Archived practice problems set for two-sample t-tests and ANOVA distribution models.`,
    type: 'assignment',
    subject_id: 'subj-mdm',
    is_pinned: false,
    status: 'archived',
    due_date: getRelativeDate(-7),
    tags: ['mdm', 'statistics', 'archived'],
    links: [
      { label: 'Solution PDF', url: 'https://example.com/mdm-solutions.pdf' },
    ],
    created_at: getRelativeDate(-14),
    updated_at: getRelativeDate(-7),
    subjects: DEMO_SUBJECTS[0],
  },
];

export { DEMO_SUBJECTS, DEMO_POSTS };
