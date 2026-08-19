import nacl from 'tweetnacl';
import { createClient } from '@supabase/supabase-js';

// We disable Vercel's default body parser so we can get the raw string body.
// This is strictly required by Discord for cryptographic signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read the raw body from the incoming request stream
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

export default async function handler(req, res) {
  // 1. Verify the request method
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Extract Discord security headers
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = await getRawBody(req);

  if (!signature || !timestamp) {
    return res.status(401).send('Missing Discord signature headers');
  }

  // 3. Verify the request came from Discord securely
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

  // 4. Handle Discord's initial PING (type 1)
  if (body.type === 1) {
    return res.status(200).json({ type: 1 });
  }

  // 5. Handle Application Commands (type 2)
  if (body.type === 2 && body.data.name === 'post') {
    const options = body.data.options || [];
    
    // Extract options provided by the user
    const titleOpt = options.find(opt => opt.name === 'title');
    const typeOpt = options.find(opt => opt.name === 'type');
    const contentOpt = options.find(opt => opt.name === 'content');
    const dueOpt = options.find(opt => opt.name === 'due_date');
    const pinOpt = options.find(opt => opt.name === 'is_pinned');
    const tagsOpt = options.find(opt => opt.name === 'tags');
    
    const title = titleOpt ? titleOpt.value : 'Untitled';
    const postType = typeOpt ? typeOpt.value : 'notice';
    const content = contentOpt ? contentOpt.value : '';
    const due_date = dueOpt ? dueOpt.value : null;
    const is_pinned = pinOpt ? pinOpt.value : false;
    
    let tags = [];
    if (tagsOpt && tagsOpt.value) {
      tags = tagsOpt.value.split(',').map(t => t.trim());
    }

    // Initialize Supabase with the SERVICE_ROLE key to bypass RLS policies
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing Supabase environment variables");
      return res.status(200).json({
        type: 4,
        data: { content: "❌ Server misconfiguration. Missing database keys." }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Insert into Supabase
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          type: postType,
          content,
          status: 'published',
          created_by: 'Discord Bot',
          due_date,
          is_pinned,
          tags
        }
      ]);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(200).json({
        type: 4,
        data: { content: '❌ Something went wrong while creating the post. Please try again.' }
      });
    }

    // Success response to Discord
    return res.status(200).json({
      type: 4,
      data: { content: `✅ Successfully created ${postType.toUpperCase()} post: **${title}**!` }
    });
  }

  // Unknown command
  return res.status(400).send('Unknown interaction type');
}
