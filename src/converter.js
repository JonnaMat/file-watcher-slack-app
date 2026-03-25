import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

/**
 * Convert a Markdown file to PDF using pandoc.
 * Returns the path to a temporary PDF file that the caller must delete after use.
 * @param {string} mdPath - Absolute path to the .md file
 * @returns {Promise<string>} Absolute path to the generated temporary PDF
 */
export async function convertMdToPdf(mdPath) {
  const outPath = path.join(os.tmpdir(), `fw-${randomUUID()}.pdf`);
  const basename = path.basename(mdPath, '.md');

  logger.info(`Converting to PDF: ${mdPath}`);
  try {
    await execFileAsync('pandoc', [
      mdPath,
      '--output', outPath,
      '--pdf-engine', 'pdflatex',
      '--variable', 'geometry:margin=2cm',
      '--variable', `title:${basename}`,
    ]);
  } catch (err) {
    // Clean up partial output if it exists
    await fs.promises.rm(outPath, { force: true });
    throw new Error(`pandoc conversion failed for ${mdPath}: ${err.message}`);
  }

  logger.info(`PDF ready: ${outPath}`);
  return outPath;
}
