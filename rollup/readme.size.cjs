const { readFileSync, writeFileSync } = require('node:fs');
const { execSync } = require('node:child_process');
const { join } = require('node:path');

const README = join(__dirname, '..', 'README.md');

writeFileSync(
  README,
  readFileSync(README).toString('utf-8').replace(
    /<span>.*?<\/span>/,
    `<span>${execSync(`node ${join(__dirname, 'bin.size.cjs')}`)}</span>`
  )
);
