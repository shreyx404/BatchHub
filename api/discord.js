import nacl from 'tweetnacl';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// We disable Vercel's default body parser so we can get the raw string body.
// This is strictly required by Discord for cryptographic signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

// ── Helper: Read raw body from request stream ──────────────────
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

// ── Helper: Extract option value by name ───────────────────────
function getOption(options, name) {
  const opt = (options || []).find(o => o.name === name);
  return opt ? opt.value : undefined;
}

// ── Helper: Parse "Label | URL, Label2 | URL2" into JSONB ──────
function parseLinks(str) {
  if (!str || str.trim().toLowerCase() === 'clear') return [];
  return str.split(/,\s*(?=[^,]+(?:\||https?:\/\/))/i).map(segment => {
    const parts = segment.trim().split('|').map(p => p.trim());
    if (parts.length >= 2) {
      return { label: parts[0], url: parts.slice(1).join('|').trim() };
    }
    // No separator — use the URL as label too
    return { label: parts[0], url: parts[0] };
  }).filter(link => link.url);
}

// ── Helper: Parse comma-separated tags ─────────────────────────
function parseTags(str) {
  if (!str || str.trim().toLowerCase() === 'clear') return [];
  return str.split(',').map(t => t.trim()).filter(Boolean);
}

// ── Helper: Map post type to emoji ─────────────────────────────
function typeEmoji(type) {
  const map = {
    notice: '📢',
    assignment: '📘',
    lab: '🧪',
    deadline: '📅',
    resource: '📚',
    important: '⭐',
  };
  return map[type] || '📄';
}

// ── Helper: Status emoji ───────────────────────────────────────
function statusEmoji(status) {
  const map = {
    published: '✅',
    draft: '📝',
    archived: '📦',
  };
  return map[status] || '❓';
}

// ── Helper: Format a post as a Discord embed ───────────────────
function formatPostEmbed(post, { detailed = false } = {}) {
  const fields = [
    { name: 'Type', value: `${typeEmoji(post.type)} ${post.type}`, inline: true },
    { name: 'Status', value: `${statusEmoji(post.status)} ${post.status}`, inline: true },
    { name: 'Pinned', value: post.is_pinned ? '📌 Yes' : 'No', inline: true },
  ];

  if (post.subjects) {
    const subjectText = post.subjects.code
      ? `${post.subjects.name} (${post.subjects.code})`
      : post.subjects.name;
    fields.push({ name: 'Subject', value: subjectText, inline: true });
  }

  if (post.due_date) {
    const date = new Date(post.due_date);
    fields.push({ name: 'Due Date', value: `<t:${Math.floor(date.getTime() / 1000)}:R>`, inline: true });
  }

  if (post.tags && post.tags.length > 0) {
    fields.push({ name: 'Tags', value: post.tags.map(t => `\`${t}\``).join(' '), inline: false });
  }

  if (detailed && post.links && post.links.length > 0) {
    const linksText = post.links.map(l => `[${l.label}](${l.url})`).join('\n');
    fields.push({ name: 'Links', value: linksText, inline: false });
  }

  if (detailed) {
    fields.push({ name: 'ID', value: `\`${post.id}\``, inline: false });
  }

  const embed = {
    title: post.title,
    color: 0x09090b, // Dark monochromatic — matches BatchHub aesthetic
    fields,
    timestamp: post.created_at,
    footer: { text: `Created by ${post.created_by || 'admin'}` },
  };

  if (detailed && post.content) {
    // Truncate to Discord's embed description limit (4096 chars)
    embed.description = post.content.length > 4000
      ? post.content.slice(0, 4000) + '…'
      : post.content;
  }

  return embed;
}

// ── Helper: Init Supabase with service role key ────────────────
function initSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── Helper: Discord response shorthands ────────────────────────
function reply(content) {
  return { type: 4, data: { content } };
}

function replyEmbed(content, embeds) {
  return { type: 4, data: { content, embeds } };
}

function replyError(message) {
  return { type: 4, data: { content: `❌ ${message}` } };
}

function autocompleteResponse(choices) {
  return { type: 8, data: { choices } };
}

// ── Subcommand Handlers ────────────────────────────────────────

async function handleCreate(options, resolved, supabase) {
  const title = getOption(options, 'title') || 'Untitled';
  const type = getOption(options, 'type') || 'notice';
  const content = getOption(options, 'content') || '';
  const dueDate = getOption(options, 'due_date') || null;
  const isPinned = getOption(options, 'is_pinned') || false;
  const tagsRaw = getOption(options, 'tags');
  const subjectId = getOption(options, 'subject') || null;
  const linksRaw = getOption(options, 'links');

  const tags = tagsRaw ? parseTags(tagsRaw) : [];
  const links = linksRaw ? parseLinks(linksRaw) : [];

  // Insert the post
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title,
      type,
      content,
      status: 'published',
      created_by: 'Discord Bot',
      due_date: dueDate,
      is_pinned: isPinned,
      tags,
      links,
      subject_id: subjectId,
    })
    .select('*, subjects(*)')
    .single();

  if (error) {
    console.error('Create post error:', error);
    return replyError('Failed to create post. Check the logs.');
  }

  const subjectText = post.subjects ? ` — ${post.subjects.name}` : '';
  const linksCountText = links.length > 0 ? `\n🔗 ${links.length} Link(s) attached` : '';
  return reply(
    `✅ Created ${typeEmoji(type)} **${type.toUpperCase()}**: **${title}**${subjectText}${linksCountText}\n` +
    `📌 ID: \`${post.id}\``
  );
}

async function handleUpdate(options, supabase) {
  const id = getOption(options, 'id');

  // Build updates object from provided options only
  const updates = {};
  const title = getOption(options, 'title');
  const type = getOption(options, 'type');
  const content = getOption(options, 'content');
  const dueDate = getOption(options, 'due_date');
  const isPinned = getOption(options, 'is_pinned');
  const status = getOption(options, 'status');
  const tagsRaw = getOption(options, 'tags');
  const subjectId = getOption(options, 'subject');
  const linksRaw = getOption(options, 'links');

  if (title !== undefined) updates.title = title;
  if (type !== undefined) updates.type = type;
  if (content !== undefined) updates.content = content;
  if (isPinned !== undefined) updates.is_pinned = isPinned;
  if (status !== undefined) updates.status = status;

  if (dueDate !== undefined) {
    updates.due_date = dueDate.toLowerCase() === 'clear' ? null : dueDate;
  }
  if (tagsRaw !== undefined) {
    updates.tags = parseTags(tagsRaw);
  }
  if (subjectId !== undefined) {
    updates.subject_id = subjectId.toLowerCase() === 'clear' ? null : subjectId;
  }
  if (linksRaw !== undefined) {
    updates.links = parseLinks(linksRaw);
  }

  if (Object.keys(updates).length === 0) {
    return replyError('No fields provided to update. Specify at least one field to change.');
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('*, subjects(*)')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return replyError(`Post not found: \`${id}\``);
    console.error('Update post error:', error);
    return replyError('Failed to update post.');
  }

  const changed = Object.keys(updates).join(', ');
  return reply(`✏️ Updated **${post.title}** — changed: ${changed}\n🔗 ID: \`${post.id}\``);
}

async function handleDelete(options, supabase) {
  const id = getOption(options, 'id');

  // Fetch the post title first for the confirmation message
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('title, type')
    .eq('id', id)
    .single();

  if (fetchError || !post) {
    return replyError(`Post not found: \`${id}\``);
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete post error:', error);
    return replyError('Failed to delete post.');
  }

  return reply(`🗑️ Deleted ${typeEmoji(post.type)} **${post.title}**`);
}

async function handlePin(options, supabase) {
  const id = getOption(options, 'id');

  const { data: post, error } = await supabase
    .from('posts')
    .update({ is_pinned: true })
    .eq('id', id)
    .select('title')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return replyError(`Post not found: \`${id}\``);
    console.error('Pin post error:', error);
    return replyError('Failed to pin post.');
  }

  return reply(`📌 Pinned **${post.title}**`);
}

async function handleUnpin(options, supabase) {
  const id = getOption(options, 'id');

  const { data: post, error } = await supabase
    .from('posts')
    .update({ is_pinned: false })
    .eq('id', id)
    .select('title')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return replyError(`Post not found: \`${id}\``);
    console.error('Unpin post error:', error);
    return replyError('Failed to unpin post.');
  }

  return reply(`📌 Unpinned **${post.title}**`);
}

async function handleList(options, supabase) {
  const type = getOption(options, 'type');
  const count = getOption(options, 'count') || 5;
  const status = getOption(options, 'status') || 'published';

  let query = supabase
    .from('posts')
    .select('id, title, type, status, is_pinned, created_at, due_date, subjects(name)')
    .eq('status', status)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(count);

  if (type) {
    query = query.eq('type', type);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('List posts error:', error);
    return replyError('Failed to fetch posts.');
  }

  if (!posts || posts.length === 0) {
    const filterText = type ? ` of type **${type}**` : '';
    return reply(`📭 No ${status} posts found${filterText}.`);
  }

  const lines = posts.map((p, i) => {
    const pin = p.is_pinned ? '📌 ' : '';
    const subject = p.subjects?.name ? ` · ${p.subjects.name}` : '';
    const date = new Date(p.created_at);
    const timestamp = `<t:${Math.floor(date.getTime() / 1000)}:R>`;
    return `${pin}${typeEmoji(p.type)} **${p.title}**${subject}\n` +
           `   \`${p.id}\` · ${timestamp}`;
  });

  const filterText = type ? ` (${type})` : '';
  const statusText = status !== 'published' ? ` [${status}]` : '';

  const embed = {
    title: `📋 Recent Posts${filterText}${statusText}`,
    description: lines.join('\n\n'),
    color: 0x1a1a2e,
    footer: { text: `Showing ${posts.length} post(s) · Use /post view id:<uuid> for details` },
  };

  return replyEmbed('', [embed]);
}

async function handleView(options, supabase) {
  const id = getOption(options, 'id');

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, subjects(*)')
    .eq('id', id)
    .single();

  if (error || !post) {
    return replyError(`Post not found: \`${id}\``);
  }

  const embed = formatPostEmbed(post, { detailed: true });
  return replyEmbed('', [embed]);
}

async function handleArchive(options, supabase) {
  const id = getOption(options, 'id');

  const { data: post, error } = await supabase
    .from('posts')
    .update({ status: 'archived' })
    .eq('id', id)
    .select('title')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return replyError(`Post not found: \`${id}\``);
    console.error('Archive post error:', error);
    return replyError('Failed to archive post.');
  }

  return reply(`📦 Archived **${post.title}**`);
}

async function handlePublish(options, supabase) {
  const id = getOption(options, 'id');

  const { data: post, error } = await supabase
    .from('posts')
    .update({ status: 'published' })
    .eq('id', id)
    .select('title')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return replyError(`Post not found: \`${id}\``);
    console.error('Publish post error:', error);
    return replyError('Failed to publish post.');
  }

  return reply(`✅ Published **${post.title}**`);
}

// ── Autocomplete: Subject search ───────────────────────────────

async function handleSubjectAutocomplete(focusedValue, supabase) {
  const search = (focusedValue || '').trim();

  let query = supabase
    .from('subjects')
    .select('id, name, code')
    .order('name')
    .limit(25);

  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  const { data: subjects, error } = await query;

  if (error || !subjects) {
    return autocompleteResponse([]);
  }

  const choices = subjects.map(s => ({
    name: s.code ? `${s.name} (${s.code})` : s.name,
    value: s.id,
  }));

  return autocompleteResponse(choices);
}

// ── Main Handler ───────────────────────────────────────────────

export default async function handler(req, res) {
  // 1. Verify the request method
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Extract Discord security headers and verify signature
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = await getRawBody(req);

  if (!signature || !timestamp) {
    return res.status(401).send('Missing Discord signature headers');
  }

  const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
  if (!PUBLIC_KEY) {
    console.error("Missing DISCORD_PUBLIC_KEY environment variable");
    return res.status(500).send('Server misconfiguration');
  }

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).send('Invalid request signature');
  }

  // Parse the verified JSON body
  const body = JSON.parse(rawBody);

  // 3. Handle Discord's initial PING (type 1)
  if (body.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  // 4. Handle Autocomplete (type 4)
  if (body.type === 4) {
    const supabase = initSupabase();
    if (!supabase) {
      return res.status(200).json(autocompleteResponse([]));
    }

    // Find the focused option (the one the user is currently typing in)
    const subcommand = body.data.options?.[0];
    const focusedOption = subcommand?.options?.find(o => o.focused);

    if (focusedOption?.name === 'subject') {
      const result = await handleSubjectAutocomplete(focusedOption.value, supabase);
      return res.status(200).json(result);
    }

    return res.status(200).json(autocompleteResponse([]));
  }

  // 5. Handle Application Commands (type 2)
  if (body.type === 2 && body.data.name === 'post') {
    const supabase = initSupabase();
    if (!supabase) {
      return res.status(200).json(replyError('Server misconfiguration. Missing database keys.'));
    }

    // Extract subcommand and its options
    const subcommand = body.data.options?.[0];
    if (!subcommand) {
      return res.status(200).json(replyError('No subcommand provided.'));
    }

    const subName = subcommand.name;
    const subOptions = subcommand.options || [];
    const resolved = body.data.resolved || {};

    try {
      let result;

      switch (subName) {
        case 'create':
          result = await handleCreate(subOptions, resolved, supabase);
          break;
        case 'update':
          result = await handleUpdate(subOptions, supabase);
          break;
        case 'delete':
          result = await handleDelete(subOptions, supabase);
          break;
        case 'pin':
          result = await handlePin(subOptions, supabase);
          break;
        case 'unpin':
          result = await handleUnpin(subOptions, supabase);
          break;
        case 'list':
          result = await handleList(subOptions, supabase);
          break;
        case 'view':
          result = await handleView(subOptions, supabase);
          break;
        case 'archive':
          result = await handleArchive(subOptions, supabase);
          break;
        case 'publish':
          result = await handlePublish(subOptions, supabase);
          break;
        default:
          result = replyError(`Unknown subcommand: ${subName}`);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('Discord command error:', err);
      return res.status(200).json(replyError('An unexpected error occurred. Check server logs.'));
    }
  }

  // Unknown interaction type
  return res.status(400).send('Unknown interaction type');
}
