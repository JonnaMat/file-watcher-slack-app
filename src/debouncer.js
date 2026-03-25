import { logger } from './logger.js';

// Per-file debounce timers: Map<absoluteFilePath, TimeoutHandle>
const timers = new Map();
// First event type seen per file within the current debounce window
const eventTypes = new Map();

/**
 * Schedule an upload for a file after delayMs, resetting any existing timer.
 * The first event type (add/change) seen for each file is preserved across resets.
 * @param {string} filePath - Absolute path to the file
 * @param {string} eventType - 'add' or 'change'
 * @param {number} delayMs - Debounce delay in milliseconds
 * @param {(filePath: string, eventType: string) => Promise<void>} onReady
 */
export function scheduleUpload(filePath, eventType, delayMs, onReady) {
  if (timers.has(filePath)) {
    clearTimeout(timers.get(filePath));
    logger.info(`Debounce reset for: ${filePath}`);
  } else {
    eventTypes.set(filePath, eventType); // record first event type only
    logger.info(`Debounce started (${delayMs}ms) for: ${filePath}`);
  }

  const handle = setTimeout(async () => {
    const firstEventType = eventTypes.get(filePath) ?? eventType;
    timers.delete(filePath);
    eventTypes.delete(filePath);
    logger.info(`Debounce elapsed, uploading: ${filePath}`);
    await onReady(filePath, firstEventType);
  }, delayMs);

  timers.set(filePath, handle);
}

/**
 * Cancel all pending debounce timers (call on graceful shutdown).
 */
export function cancelAll() {
  for (const handle of timers.values()) {
    clearTimeout(handle);
  }
  const count = timers.size;
  timers.clear();
  eventTypes.clear();
  if (count > 0) {
    logger.info(`Cancelled ${count} pending upload(s).`);
  }
}
