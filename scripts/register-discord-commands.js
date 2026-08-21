// Run this script using: node scripts/register-discord-commands.js
// Make sure to set your DISCORD_TOKEN and DISCORD_APP_ID first!

import 'dotenv/config';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APP_ID;

if (!token || !applicationId) {
  console.error("❌ Missing DISCORD_TOKEN or DISCORD_APP_ID environment variables.");
  console.error("Please add them to your .env.local file or export them in your terminal.");
  process.exit(1);
}

// ── Shared option definitions (reused across subcommands) ──────

const TYPE_CHOICES = [
  { name: 'Notice 📢', value: 'notice' },
  { name: 'Assignment 📘', value: 'assignment' },
  { name: 'Lab 🧪', value: 'lab' },
  { name: 'Deadline 📅', value: 'deadline' },
  { name: 'Resource 📚', value: 'resource' },
  { name: 'Important ⭐', value: 'important' },
];

const STATUS_CHOICES = [
  { name: 'Published ✅', value: 'published' },
  { name: 'Draft 📝', value: 'draft' },
  { name: 'Archived 📦', value: 'archived' },
];

const ID_OPTION = {
  name: 'id',
  description: 'The post ID (UUID) — copy from /post list',
  type: 3, // STRING
  required: true,
};

// ── Command definitions ────────────────────────────────────────

const commands = [
  {
    name: 'post',
    description: 'Manage BatchHub posts — create, update, delete, pin, list, and more',
    options: [
      // ── /post create ──
      {
        name: 'create',
        description: 'Create a new post on BatchHub',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'title',
            description: 'The title of the post',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'type',
            description: 'The category of the post',
            type: 3, // STRING
            required: true,
            choices: TYPE_CHOICES,
          },
          {
            name: 'content',
            description: 'The detailed description or body of the post (supports Markdown)',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'due_date',
            description: 'Due date (e.g., 2025-10-31)',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'is_pinned',
            description: 'Pin this post to the top?',
            type: 5, // BOOLEAN
            required: false,
          },
          {
            name: 'tags',
            description: 'Comma-separated tags (e.g., math, urgent)',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'subject',
            description: 'Subject name (start typing to search)',
            type: 3, // STRING
            required: false,
            autocomplete: true,
          },
          {
            name: 'links',
            description: 'Links as "Label | URL, Label2 | URL2"',
            type: 3, // STRING
            required: false,
          },
        ],
      },

      // ── /post update ──
      {
        name: 'update',
        description: 'Update an existing post',
        type: 1, // SUB_COMMAND
        options: [
          ID_OPTION,
          {
            name: 'title',
            description: 'New title',
            type: 3,
            required: false,
          },
          {
            name: 'type',
            description: 'New category',
            type: 3,
            required: false,
            choices: TYPE_CHOICES,
          },
          {
            name: 'content',
            description: 'New content/body (supports Markdown)',
            type: 3,
            required: false,
          },
          {
            name: 'due_date',
            description: 'New due date (e.g., 2025-10-31) or "clear" to remove',
            type: 3,
            required: false,
          },
          {
            name: 'is_pinned',
            description: 'Pin or unpin this post',
            type: 5, // BOOLEAN
            required: false,
          },
          {
            name: 'status',
            description: 'New status',
            type: 3,
            required: false,
            choices: STATUS_CHOICES,
          },
          {
            name: 'tags',
            description: 'New tags (comma-separated) or "clear" to remove all',
            type: 3,
            required: false,
          },
          {
            name: 'subject',
            description: 'New subject (start typing to search) or "clear" to remove',
            type: 3,
            required: false,
            autocomplete: true,
          },
          {
            name: 'links',
            description: 'New links as "Label | URL, Label2 | URL2" or "clear" to remove all',
            type: 3,
            required: false,
          },
        ],
      },

      // ── /post delete ──
      {
        name: 'delete',
        description: 'Delete a post permanently',
        type: 1,
        options: [ID_OPTION],
      },

      // ── /post pin ──
      {
        name: 'pin',
        description: 'Pin a post to the top',
        type: 1,
        options: [ID_OPTION],
      },

      // ── /post unpin ──
      {
        name: 'unpin',
        description: 'Unpin a post',
        type: 1,
        options: [ID_OPTION],
      },

      // ── /post list ──
      {
        name: 'list',
        description: 'List recent posts',
        type: 1,
        options: [
          {
            name: 'type',
            description: 'Filter by post type',
            type: 3,
            required: false,
            choices: TYPE_CHOICES,
          },
          {
            name: 'count',
            description: 'Number of posts to show (1-10, default 5)',
            type: 4, // INTEGER
            required: false,
            min_value: 1,
            max_value: 10,
          },
          {
            name: 'status',
            description: 'Filter by status (default: published)',
            type: 3,
            required: false,
            choices: STATUS_CHOICES,
          },
        ],
      },

      // ── /post view ──
      {
        name: 'view',
        description: 'View full details of a post',
        type: 1,
        options: [ID_OPTION],
      },

      // ── /post archive ──
      {
        name: 'archive',
        description: 'Archive a post (hides from public feed)',
        type: 1,
        options: [ID_OPTION],
      },

      // ── /post publish ──
      {
        name: 'publish',
        description: 'Publish a draft or archived post',
        type: 1,
        options: [ID_OPTION],
      },
    ],
  },
];

// ── Register commands via Discord API ──────────────────────────

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

  console.log('Registering Discord slash commands...');
  console.log(`Registering ${commands[0].options.length} subcommands under /post\n`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${token}`,
    },
    body: JSON.stringify(commands),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Successfully registered slash commands globally!');
    console.log(`   Registered ${data.length} top-level command(s)`);
    console.log('   Subcommands: create, update, delete, pin, unpin, list, view, archive, publish');
    console.log('\nNote: Global commands can take up to an hour to appear across all servers.');
  } else {
    const errorText = await response.text();
    console.error('❌ Failed to register commands:');
    console.error(errorText);
  }
}

registerCommands();
