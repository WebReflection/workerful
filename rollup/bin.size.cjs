const { statSync } = require('node:fs');
const { join } = require('node:path');

let { size } = statSync(
  join(__dirname, '..', 'workerful.mjs')
);

while (size > 1024) size /= 1024;

process.stdout.write(`${size.toFixed(1)}KB`);
