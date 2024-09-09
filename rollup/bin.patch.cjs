const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const workerful = join(__dirname, '..', 'workerful.mjs');

writeFileSync(
  workerful,
  readFileSync(workerful).toString('utf-8').replace(
    '#!/usr/bin/env node',
    `#!/usr/bin/env node
/*!
${readFileSync(join(__dirname, '..', 'LICENSE')).toString().trim().replace(/^/mg, ' * ')}
 */`
  )
);
