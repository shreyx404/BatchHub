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

const commands = [
  {
    name: 'post',
    description: 'Create a new post on BatchHub directly from Discord!',
    options: [
      {
        name: 'title',
        description: 'The title of the post',
        type: 3, // STRING type
        required: true,
      },
      {
        name: 'type',
        description: 'The category of the post',
        type: 3, // STRING type
        required: true,
        choices: [
          { name: 'Notice 📢', value: 'notice' },
          { name: 'Assignment 📘', value: 'assignment' },
          { name: 'Lab 🧪', value: 'lab' },
          { name: 'Deadline 📅', value: 'deadline' },
          { name: 'Resource 📚', value: 'resource' },
          { name: 'Important ⭐', value: 'important' }
        ]
      },
      {
        name: 'content',
        description: 'The detailed description or body of the post',
        type: 3, // STRING type
        required: false,
      }
    ]
  }
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

  console.log('Registering Discord slash commands...');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${token}`,
    },
    body: JSON.stringify(commands),
  });

  if (response.ok) {
    console.log('✅ Successfully registered slash commands globally!');
    console.log('Note: Global commands can take up to an hour to appear across all servers.');
  } else {
    const errorText = await response.text();
    console.error('❌ Failed to register commands:');
    console.error(errorText);
  }
}

registerCommands();
