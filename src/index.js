import { config } from './config.js';
import { startWatcher } from './watcher.js';
import { cancelAll } from './debouncer.js';
import { logger } from './logger.js';

logger.info('Starting Slack File Watcher');
logger.info(`Watch path : ${config.watchPath}`);
logger.info(`Patterns   : ${config.watchPatterns.join(', ')}`);
logger.info(`User ID    : ${config.slackUserId}`);
logger.info(`Debounce   : ${config.debounceMs}ms`);

const watcher = startWatcher();

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down...`);
  cancelAll();
  await watcher.close();
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
