const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const createESM = path => {
  const file = join(__dirname, '..', 'src', `${path}.mjs`);
  writeFileSync(
    file,
    `export default ${
      JSON.stringify(
        readFileSync(file).toString()
      )
    };`,
  );
};

createESM('window');
createESM('worker');
