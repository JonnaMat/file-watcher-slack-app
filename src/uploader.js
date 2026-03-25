import { WebClient } from '@slack/web-api';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { logger } from './logger.js';
import { convertMdToPdf } from './converter.js';

const slack = new WebClient(config.slackBotToken, {
  retryConfig: { retries: 3 },
});

const MAX_FILE_SIZE_BYTES  = 1_000_000_000; // 1 GB — Slack hard limit
const WARN_FILE_SIZE_BYTES =   100_000_000; // 100 MB — log a warning

// Cached DM channel ID between the bot and the configured user.
// Resolved once on first upload via conversations.open.
let dmChannelId = null;

async function getDmChannelId() {
  if (dmChannelId) return dmChannelId;
  const res = await slack.conversations.open({ users: config.slackUserId });
  dmChannelId = res.channel.id;
  logger.info(`Resolved App Home DM channel: ${dmChannelId}`);
  return dmChannelId;
}

/**
 * Upload a file to the user's App Home (DM with the bot).
 * @param {string} filePath - Absolute path to the file to upload
 * @param {string} eventType - 'add' (new file) or 'change' (updated file)
 */
export async function uploadFile(filePath, eventType) {
  // Confirm the file is still readable (may have been deleted during the debounce)
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    logger.error(`File no longer readable, skipping upload: ${filePath}`);
    return;
  }

  const stat = await fs.promises.stat(filePath);

  if (stat.size > MAX_FILE_SIZE_BYTES) {
    logger.error(`File exceeds 1 GB limit (${(stat.size / 1e9).toFixed(2)} GB), skipping: ${filePath}`);
    return;
  }

  if (stat.size > WARN_FILE_SIZE_BYTES) {
    logger.warn(`Large file (${(stat.size / 1e6).toFixed(1)} MB): ${filePath}`);
  }

  // Convert .md to PDF before uploading
  let uploadPath = filePath;
  let tempPdf = null;
  if (path.extname(filePath).toLowerCase() === '.md') {
    try {
      tempPdf = await convertMdToPdf(filePath);
      uploadPath = tempPdf;
    } catch (err) {
      logger.error(`Skipping upload — conversion failed: ${err.message}`);
      return;
    }
  }

  const filename = path.extname(uploadPath).toLowerCase() === '.pdf' && tempPdf
    ? path.basename(filePath, '.md') + '.pdf'
    : path.basename(filePath);

  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const channelId = await getDmChannelId();
        const result = await slack.files.uploadV2({
          channel_id:      channelId,
          file:            fs.createReadStream(uploadPath),
          filename,
          initial_comment: `${config.slackMessage} (${eventType === 'add' ? 'new file' : 'updated'}): \`${filePath}\``,
        });

        const fileId = result.files?.[0]?.id ?? result.file?.id ?? '(unknown)';
        logger.info(`Uploaded successfully: ${filename} (file ID: ${fileId})`);
        return;
      } catch (err) {
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          logger.warn(`Upload attempt ${attempt}/3 failed for ${filename}: ${err.message} — retrying in ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          logger.error(`Upload failed after 3 attempts for ${filename}: ${err.message}`);
        }
      }
    }
  } finally {
    // Clean up the temporary PDF if one was created
    if (tempPdf) {
      await fs.promises.rm(tempPdf, { force: true });
    }
  }
}
