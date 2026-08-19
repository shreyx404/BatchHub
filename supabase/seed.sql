-- ============================================================
-- BatchHub — Seed Data
-- Run this after schema.sql to populate sample data
-- ============================================================

-- Sample subjects
INSERT INTO subjects (id, name, code, color) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Data Structures & Algorithms', 'CS201', '#6366f1'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Database Management Systems', 'CS301', '#10b981'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Operating Systems', 'CS302', '#f59e0b'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Computer Networks', 'CS303', '#3b82f6'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Software Engineering', 'CS304', '#ef4444');

-- Sample posts
INSERT INTO posts (title, content, type, subject_id, is_pinned, status, due_date, tags, links) VALUES
(
  'DSA Assignment 4 — Binary Trees',
  E'## Instructions\n\nImplement the following binary tree operations:\n\n1. **Inorder traversal** (iterative)\n2. **Level-order traversal** using a queue\n3. **Check if a binary tree is a BST**\n4. **Find the lowest common ancestor** of two nodes\n\n### Submission Guidelines\n- Submit on the portal before the deadline\n- Include time and space complexity analysis\n- Write clean, commented code\n\n> **Note:** Plagiarism will result in zero marks.',
  'assignment',
  'a1b2c3d4-0001-4000-8000-000000000001',
  false,
  'published',
  now() + interval '5 days',
  ARRAY['graded', 'individual'],
  '[{"label": "Submission Portal", "url": "https://example.com/submit"}]'
),
(
  'DBMS Lab 6 — SQL Joins & Subqueries',
  E'## Lab Objectives\n\nPractice advanced SQL queries involving:\n- **INNER, LEFT, RIGHT, FULL OUTER JOINs**\n- **Correlated and non-correlated subqueries**\n- **EXISTS and NOT EXISTS**\n- **Aggregate functions with GROUP BY and HAVING**\n\n### Dataset\nUse the `university` database provided in Lab 1.\n\n### Deliverables\n- SQL file with all queries\n- Screenshot of output for each query',
  'lab',
  'a1b2c3d4-0002-4000-8000-000000000002',
  false,
  'published',
  now() + interval '3 days',
  ARRAY['lab', 'sql'],
  '[]'
),
(
  'Mid-Semester Exam Schedule Released',
  E'## Mid-Semester Examination Schedule\n\nThe mid-semester exams will be conducted from **Week 8** as per the following schedule:\n\n| Date | Subject | Time |\n|------|---------|------|\n| Monday | Data Structures | 10:00 AM - 12:00 PM |\n| Wednesday | DBMS | 10:00 AM - 12:00 PM |\n| Friday | Operating Systems | 2:00 PM - 4:00 PM |\n\n### Important Notes\n- Bring your **college ID card**\n- No electronic devices allowed\n- Seating arrangement will be shared 2 days before',
  'notice',
  NULL,
  true,
  'published',
  NULL,
  ARRAY['exam', 'midsem'],
  '[]'
),
(
  'OS Project Proposal Deadline',
  E'Submit your Operating Systems project proposal by the deadline. The proposal should include:\n\n- **Project title**\n- **Team members** (max 3)\n- **Problem statement**\n- **Proposed solution approach**\n- **Technology stack**\n\nFormat: 2-page PDF document.',
  'deadline',
  'a1b2c3d4-0003-4000-8000-000000000003',
  false,
  'published',
  now() + interval '2 days',
  ARRAY['project', 'team'],
  '[{"label": "Proposal Template", "url": "https://example.com/template.pdf"}]'
),
(
  'CN Reference — TCP/IP Protocol Stack',
  E'## Recommended Resources for TCP/IP\n\nHere are curated resources for understanding the TCP/IP protocol stack:\n\n### Video Lectures\n- Computer Networks by Neso Academy\n- TCP/IP Illustrated series summary\n\n### Reading Material\n- Kurose & Ross, Chapter 3\n- RFC 793 (TCP specification)\n\n### Practice\n- Wireshark labs for packet analysis\n- Socket programming exercises',
  'resource',
  'a1b2c3d4-0004-4000-8000-000000000004',
  false,
  'published',
  NULL,
  ARRAY['reference', 'tcp', 'networking'],
  '[{"label": "Neso Academy Playlist", "url": "https://youtube.com"}, {"label": "Wireshark Download", "url": "https://wireshark.org"}]'
),
(
  '⚠️ Class Cancelled — Software Engineering (Tomorrow)',
  E'**Software Engineering lecture scheduled for tomorrow (Tuesday) stands cancelled.**\n\nReason: Faculty is attending a conference.\n\nThe class will be rescheduled — updated schedule will be shared soon.\n\n_Please do not come to the classroom._',
  'important',
  'a1b2c3d4-0005-4000-8000-000000000005',
  true,
  'published',
  NULL,
  ARRAY['cancelled', 'urgent'],
  '[]'
),
(
  'DSA Lab 5 — Graph Traversal',
  E'## Lab Tasks\n\nImplement the following graph algorithms:\n\n1. **BFS** (Breadth-First Search)\n2. **DFS** (Depth-First Search)\n3. **Detect cycle** in a directed graph\n4. **Topological Sort**\n\nUse adjacency list representation. Test with the provided sample graphs.\n\n### Bonus (Optional)\n- Implement Dijkstra''s shortest path algorithm',
  'lab',
  'a1b2c3d4-0001-4000-8000-000000000001',
  false,
  'published',
  now() + interval '7 days',
  ARRAY['graph', 'bfs', 'dfs'],
  '[]'
),
(
  'DBMS Assignment 3 — Normalization',
  E'## Assignment Details\n\nGiven the following unnormalized relations, perform normalization up to **3NF** (Third Normal Form):\n\n### Relations\n1. StudentCourse(StudentID, StudentName, CourseID, CourseName, InstructorID, InstructorName, Grade)\n2. Library(BookID, Title, AuthorName, BorrowerID, BorrowerName, IssueDate, ReturnDate)\n\n### Requirements\n- Identify functional dependencies\n- Show step-by-step normalization (1NF → 2NF → 3NF)\n- Draw the final ER diagram\n- Explain any assumptions made',
  'assignment',
  'a1b2c3d4-0002-4000-8000-000000000002',
  false,
  'published',
  now() + interval '6 days',
  ARRAY['normalization', 'graded'],
  '[]'
);
