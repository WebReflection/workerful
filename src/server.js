import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createServer } from 'node:http';

import { WebSocketServer } from 'ws';
import staticHandler from 'static-handler';
import coincident from 'coincident/server';

import { parse } from './utils.js';

const [...rest] = process.argv.slice(2);

export const pkg = rest.at(0) || join(process.cwd(), 'package.json');
if (pkg === '--help' || !existsSync(pkg)) {
  const code = +(pkg !== '--help');
  if (code) console.error(`\x1b[1mUnable to parse package.json\x1b[0m\n`);
  console[code ? 'error' : 'log'](`
workerful [options]

[options]
--help        # this message
package.json  # the package.json file at the root
              # of your workerful project
  `.trim());
  process.exit(code);
}

export const json = parse(readFileSync(pkg).toString('utf-8'));

export const create = async (serializer, workerful) => {
  const listener = json.workerful?.server;
  const handler = listener ?
    (await import(resolve(dirname(pkg), listener))).default :
    staticHandler(join(dirname(pkg), 'public'))
  ;
  const server = createServer(async (req, res) => {
    let status = 0;
    try {
      if (workerful(req, res)) return;
      if (await handler(req, res)) return;
      status = 404;
    }
    catch (error) {
      console.error(error);
      status = 500;
    }
    res.writeHead(status);
    res.end();
  });
  const wss = new WebSocketServer({ server });
  coincident({ wss, ...serializer });
  return server;
};
