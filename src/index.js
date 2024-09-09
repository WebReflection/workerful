#!/usr/bin/env node

import '@ungap/with-resolvers';

import { writeFileSync } from 'node:fs';

import { openApp, apps } from 'open';

import { parse, stringify, truthy } from './utils.js';
import { pkg, json, create } from './server.js';
import bootstrap from './bootstrap.js';

import client from './window.mjs';
import worker from './worker.mjs';

const workerful = json.workerful || (json.workerful = {
  ip: 'localhost',
  port: 0,
  centered: true,
  kiosk: false,
  window: {}
});

const {
  WORKERFUL_CENTERED = !!workerful.centered,
  WORKERFUL_IP = workerful.ip || 'localhost',
  WORKERFUL_PORT = workerful.port || 0,
  WORKERFUL_KIOSK = workerful.kiosk || false,
} = process.env;

const WORKERFUL_SECRET = crypto.randomUUID();

let ws, summary = Promise.resolve();

const server = await create((req, res) => {
  const { url, method, headers } = req;
  if (method === 'GET') {
    if (url === '/workerful') {
      let content;
      if (headers.referer.endsWith('/workerful.js'))
        content = worker;
      else {
        content = `globalThis.workerful=${stringify({
          ws,
          secret: WORKERFUL_SECRET,
          centered: (
            WORKERFUL_CENTERED === 'always' ||
            truthy(WORKERFUL_CENTERED)
          )
        })};${client}`;
      }
      res.writeHead(200, { 'Content-Type': 'text/javascript;charset=utf-8' });
      res.end(content);
      return true;
    }
  }
  else if (method === 'POST') {
    const secret = `/${WORKERFUL_SECRET}?`;
    if (url.startsWith(secret)) {
      const { promise, resolve } = Promise.withResolvers();
      summary = promise;
      try {
        Object.assign(
          workerful.window,
          parse(
            decodeURIComponent(
              url.slice(secret.length)
            )
          )
        );
        if (workerful.centered !== 'always') workerful.centered = false;
        writeFileSync(pkg, `${stringify(json, null, '\t')}\n`);
      }
      finally {
        resolve();
      }
      return true;
    }
  }
  return false;
});

server.listen(+WORKERFUL_PORT, WORKERFUL_IP, async function () {
  const { address, family, port } = this.address();

  const APP = `//${family === 'IPv4' ? address : 'localhost'}:${port}/`;

  const { name, flags } = bootstrap(json, `http:${APP}`, truthy(WORKERFUL_KIOSK));

  ws = `ws:${APP}`;

  const app = await openApp(apps[name], {
    arguments: flags
  });

  const { pid } = app;
  process.on('SIGINT', () => {
    setTimeout(() => process.exit(0));
    process.kill(pid);
  });

  app.on('close', () => {
    setTimeout(async () => {
      await summary;
      process.exit(0);
    }, 250);
  });

  if (process.env.DEBUG) {
    console.debug(`chromium ${flags.join(' ')}`);
    console.debug(`\x1b[1mhttp://${APP}\x1b[0m`);
  }

});
