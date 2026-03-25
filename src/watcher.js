import chokidar from 'chokidar';
import { minimatch } from 'minimatch';
import { config } from './config.js';
import { scheduleUpload } from './debouncer.js';
import { uploadFile } from './uploader.js';
import { logger } from './logger.js';

function matchesAnyPattern(filePath) {
  return config.watchPatterns.some(pattern =>
    minimatch(filePath, pattern, { matchBase: true, dot: false })
  );
}

/**
 * Start watching the configured path for file additions and changes.
 * @returns {import('chokidar').FSWatcher}
 */
export function startWatcher() {
  const watcher = chokidar.watch(config.watchPath, {
    persistent:    true,
    ignoreInitial: true,             // don't fire 'add' for pre-existing files on startup
    recursive:     true,             // watch all subfolders
    ignored:       /(^|[/\\])\./,   // ignore dotfiles/dotdirs
    awaitWriteFinish: {
      stabilityThreshold: 2000,      // wait until file size unchanged for 2s
      pollInterval:        500,
    },
  });

  function handleEvent(eventName, filePath) {
    if (!matchesAnyPattern(filePath)) return;
    logger.info(`[${eventName}] ${filePath}`);
    scheduleUpload(filePath, eventName, config.debounceMs, uploadFile);
  }

  watcher.on('add',    filePath => handleEvent('add',    filePath));
  watcher.on('change', filePath => handleEvent('change', filePath));
  watcher.on('error',  err      => logger.error(`Watcher error: ${err.message}`));
  watcher.on('ready',  ()       => {
    logger.info(`Watching: ${config.watchPath}`);
    logger.info(`Patterns: ${config.watchPatterns.join(', ')}`);
  });

  return watcher;
}
