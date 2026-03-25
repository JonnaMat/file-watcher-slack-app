const now = () => new Date().toISOString();

export const logger = {
  info:  (msg, ...args) => console.log(`[${now()}] INFO  ${msg}`, ...args),
  warn:  (msg, ...args) => console.warn(`[${now()}] WARN  ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[${now()}] ERROR ${msg}`, ...args),
};
