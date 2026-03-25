import 'dotenv/config';
import fs from 'node:fs';

function requireEnv(key) {
  const val = process.env[key];
  if (!val || !val.trim()) {
    throw new Error(`Missing required environment variable: ${key}\nSee .env.example for setup instructions.`);
  }
  return val.trim();
}

function parsePatterns(raw) {
  if (!raw || !raw.trim()) {
    throw new Error('Missing required environment variable: WATCH_PATTERNS\nProvide comma-separated globs, e.g. *.pdf,*.txt');
  }
  return raw.split(',').map(p => {
    p = p.trim();
    // Normalise bare extensions: "pdf" or ".pdf" → "**/*.pdf"
    if (/^\.[a-zA-Z0-9]+$/.test(p)) return `**/*${p}`;
    if (/^[a-zA-Z0-9]+$/.test(p)) return `**/*.${p}`;
    return p;
  });
}

const watchPath = requireEnv('WATCH_PATH');

try {
  fs.accessSync(watchPath, fs.constants.R_OK);
} catch {
  throw new Error(`WATCH_PATH does not exist or is not readable: ${watchPath}`);
}

const debounceMs = parseInt(process.env.DEBOUNCE_MS ?? '60000', 10);
if (isNaN(debounceMs) || debounceMs < 0) {
  throw new Error('DEBOUNCE_MS must be a non-negative integer.');
}

export const config = Object.freeze({
  slackBotToken: requireEnv('SLACK_BOT_TOKEN'),
  slackUserId:   requireEnv('SLACK_USER_ID'),
  watchPath,
  watchPatterns:  parsePatterns(process.env.WATCH_PATTERNS),
  debounceMs,
  slackMessage:   (process.env.SLACK_MESSAGE ?? 'New file detected by File Watcher').trim(),
});
