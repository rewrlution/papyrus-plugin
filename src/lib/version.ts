/**
 * Print the plugin version from package.json.
 *
 * Usage (from a skill):
 *   npx tsx ${CLAUDE_PLUGIN_ROOT}/src/lib/version.ts
 *
 * Output:
 *   Papyrus v0.1.0
 */

import { createRequire } from 'module';
import { join } from 'path';

const require = createRequire(import.meta.url);
const pkg = require(join(new URL('.', import.meta.url).pathname, '../../package.json'));

process.stdout.write(`Papyrus v${pkg.version}\n`);
