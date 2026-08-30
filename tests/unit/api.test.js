import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchPosts,
  fetchAllPosts,
  fetchPost,
  fetchUpcomingDeadlines,
  fetchCalendarDeadlines,
  createPost,
  updatePost,
  deletePost,
  autoArchiveExpiredPosts,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from '../../src/lib/api.js';
import { DEMO_POSTS, DEMO_SUBJECTS } from '../../src/lib/demoData.js';

describe('Dual-Mode API & Data Layer (Demo Fallback Mode)', () => {
  // Snapshot initial demo data length to avoid cross-test pollution
  let initialPostCount;
  let initialSubjectCount;

  beforeEach(() => {
    initialPostCount = DEMO_POSTS.length;
    initialSubjectCount = DEMO_SUBJECTS.length;
  });

  describe('fetchPosts & Feed Sorting', () => {
    it('should return published posts with pinned posts at the top', async () => {
      const posts = await fetchPosts({ status: 'published' });
      assert.ok(Array.isArray(posts));
      assert.ok(posts.length > 0);

      // Verify all posts are published
      for (const p of posts) {
        assert.equal(p.status, 'published');
      }

      // Verify pinned posts come before unpinned posts
      let seenUnpinned = false;
      for (const p of posts) {
        if (!p.is_pinned) {
          seenUnpinned = true;
        } else if (seenUnpinned) {
          assert.fail('Found pinned post after unpinned post in sorted output');
        }
      }
    });

    it('should dynamically unpin posts whose due_date has already passed', async () => {
      // Create a test post in DEMO_POSTS that is pinned but has a past due date
      const pastDuePost = {
        id: 'test-past-due-pinned',
        title: 'Expired Pinned Post',
        type: 'assignment',
        is_pinned: true,
        status: 'published',
        due_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        links: [],
      };
      DEMO_POSTS.unshift(pastDuePost);

      const posts = await fetchPosts({ status: 'published' });
      const retrieved = posts.find(p => p.id === 'test-past-due-pinned');
      assert.ok(retrieved, 'Post should be retrieved');
      assert.equal(retrieved.is_pinned, false, 'Expired pinned post should dynamically have is_pinned = false');

      // Cleanup
      const idx = DEMO_POSTS.findIndex(p => p.id === 'test-past-due-pinned');
      if (idx !== -1) DEMO_POSTS.splice(idx, 1);
    });

    it('should correctly sort unpinned deliverables by due_date ascending, placing no-due-date posts at the end', async () => {
      const posts = await fetchPosts({ status: 'published' });
      const unpinned = posts.filter(p => !p.is_pinned);

      let seenNullDueDate = false;
      let lastDueDate = null;

      for (const p of unpinned) {
        if (!p.due_date) {
          seenNullDueDate = true;
        } else {
          assert.equal(seenNullDueDate, false, 'Post with due_date found after post without due_date');
          const currentDue = new Date(p.due_date).getTime();
          if (lastDueDate !== null) {
            assert.ok(currentDue >= lastDueDate, 'Deliverables with due dates must be sorted ascending');
          }
          lastDueDate = currentDue;
        }
      }
    });

    it('should filter posts accurately by content type', async () => {
      const assignments = await fetchPosts({ type: 'assignment', status: 'published' });
      assert.ok(assignments.length > 0);
      for (const p of assignments) {
        assert.equal(p.type, 'assignment');
      }

      const labs = await fetchPosts({ type: 'lab', status: 'published' });
      assert.ok(labs.length > 0);
      for (const p of labs) {
        assert.equal(p.type, 'lab');
      }
    });

    it('should filter posts accurately by subject ID', async () => {
      const targetSubjectId = 'subj-dt';
      const dtPosts = await fetchPosts({ subjectId: targetSubjectId, status: 'published' });
      assert.ok(dtPosts.length > 0);
      for (const p of dtPosts) {
        assert.equal(p.subject_id, targetSubjectId);
      }
    });

    it('should search posts across title and content (case-insensitive)', async () => {
      const searchResults = await fetchPosts({ search: 'Guidelines' });
      assert.ok(searchResults.length > 0);
      for (const p of searchResults) {
        const matchesTitle = p.title.toLowerCase().includes('guidelines');
        const matchesContent = p.content && p.content.toLowerCase().includes('guidelines');
        assert.ok(matchesTitle || matchesContent, 'Search result must contain query in title or content');
      }
    });
  });

  describe('fetchUpcomingDeadlines', () => {
    it('should return only published deliverables with future due dates sorted ascending', async () => {
      const deadlines = await fetchUpcomingDeadlines();
      assert.ok(Array.isArray(deadlines));

      const now = new Date();
      let lastDueDate = 0;

      for (const item of deadlines) {
        assert.equal(item.status, 'published');
        assert.ok(item.due_date, 'Item must have due_date');
        const itemDue = new Date(item.due_date).getTime();
        assert.ok(itemDue >= now.getTime(), 'Due date must be in the future');
        assert.ok(itemDue >= lastDueDate, 'Deadlines must be sorted ascending');
        lastDueDate = itemDue;
      }
    });
  });

  describe('fetchCalendarDeadlines', () => {
    it('should fetch deadlines for given month including +-6 days padding', async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const posts = await fetchCalendarDeadlines(year, month);
      assert.ok(Array.isArray(posts));

      const startBoundary = new Date(year, month, 1);
      startBoundary.setDate(startBoundary.getDate() - 6);
      startBoundary.setHours(0, 0, 0, 0);

      const endBoundary = new Date(year, month + 1, 0);
      endBoundary.setDate(endBoundary.getDate() + 6);
      endBoundary.setHours(23, 59, 59, 999);

      for (const post of posts) {
        assert.ok(post.due_date);
        const postDate = new Date(post.due_date);
        assert.ok(postDate >= startBoundary, `Post date ${post.due_date} must be >= ${startBoundary.toISOString()}`);
        assert.ok(postDate <= endBoundary, `Post date ${post.due_date} must be <= ${endBoundary.toISOString()}`);
      }
    });

    it('should filter calendar posts by status (e.g. archived)', async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const archivedPosts = await fetchCalendarDeadlines(year, month, { status: 'archived' });
      for (const p of archivedPosts) {
        assert.equal(p.status, 'archived');
      }
    });
  });

  describe('autoArchiveExpiredPosts', () => {
    it('should auto-archive posts whose due_date passed more than 24 hours ago', async () => {
      const testExpiredPost = {
        id: 'test-auto-archive-item',
        title: 'Expired Deliverable for Auto Archive',
        type: 'assignment',
        status: 'published',
        due_date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 36 hours ago
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        links: [],
      };
      DEMO_POSTS.push(testExpiredPost);

      const count = await autoArchiveExpiredPosts();
      assert.ok(count >= 1, 'At least 1 expired post should be archived');

      const found = DEMO_POSTS.find(p => p.id === 'test-auto-archive-item');
      assert.equal(found.status, 'archived', 'Post status must become archived');

      // Cleanup
      const idx = DEMO_POSTS.findIndex(p => p.id === 'test-auto-archive-item');
      if (idx !== -1) DEMO_POSTS.splice(idx, 1);
    });
  });

  describe('CRUD Operations (Demo Mode)', () => {
    let createdPostId;
    let createdSubjectId;

    it('should create a new post and retrieve it via fetchPost', async () => {
      const postData = {
        title: 'New Automated Test Post',
        content: '## Markdown body for test post',
        type: 'notice',
        subject_id: null,
        is_pinned: true,
        status: 'published',
        due_date: null,
        tags: ['test', 'automated'],
        links: [{ label: 'Test Link', url: 'https://example.com' }],
      };

      const created = await createPost(postData);
      assert.ok(created.id);
      assert.equal(created.title, postData.title);
      assert.equal(created.type, postData.type);
      createdPostId = created.id;

      const fetched = await fetchPost(createdPostId);
      assert.equal(fetched.id, createdPostId);
      assert.equal(fetched.title, postData.title);
      assert.equal(fetched.links.length, 1);
    });

    it('should update an existing post', async () => {
      assert.ok(createdPostId, 'createdPostId must exist');
      const updated = await updatePost(createdPostId, {
        title: 'Updated Test Post Title',
        is_pinned: false,
        status: 'archived',
      });

      assert.equal(updated.title, 'Updated Test Post Title');
      assert.equal(updated.is_pinned, false);
      assert.equal(updated.status, 'archived');

      const fetched = await fetchPost(createdPostId);
      assert.equal(fetched.title, 'Updated Test Post Title');
      assert.equal(fetched.status, 'archived');
    });

    it('should delete an existing post', async () => {
      assert.ok(createdPostId, 'createdPostId must exist');
      await deletePost(createdPostId);

      await assert.rejects(
        async () => { await fetchPost(createdPostId); },
        /Post not found/
      );
    });

    it('should create, update, and delete subjects', async () => {
      const initialSubjects = await fetchSubjects();
      const initialCount = initialSubjects.length;

      // 1. Create Subject
      const newSubject = await createSubject({
        name: 'Machine Learning',
        code: 'CS401',
        color: '#8b5cf6',
      });
      assert.ok(newSubject.id);
      assert.equal(newSubject.name, 'Machine Learning');
      createdSubjectId = newSubject.id;

      const subjectsAfterCreate = await fetchSubjects();
      assert.equal(subjectsAfterCreate.length, initialCount + 1);

      // 2. Update Subject
      const updatedSubject = await updateSubject(createdSubjectId, {
        name: 'Advanced Machine Learning',
        color: '#ec4899',
      });
      assert.equal(updatedSubject.name, 'Advanced Machine Learning');
      assert.equal(updatedSubject.color, '#ec4899');

      // 3. Delete Subject
      await deleteSubject(createdSubjectId);
      const subjectsAfterDelete = await fetchSubjects();
      assert.equal(subjectsAfterDelete.length, initialCount);
      assert.ok(!subjectsAfterDelete.some(s => s.id === createdSubjectId));
    });
  });
});
