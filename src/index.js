#!/usr/bin/env node

import '@ungap/with-resolvers';

import { writeFileSync, rm } from 'node:fs';
import { spawnSync } from 'node:child_process';

import { openApp, apps } from 'open';

import { parse, stringify, truthy } from './utils.js';
import { pkg, json, create } from './server.js';
import bootstrap from './bootstrap.js';

import serializer from './serializer.js';
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
  WORKERFUL_SERIALIZER = workerful.serializer || "json",
  WORKERFUL_HEADLESS = false,
  DEBUG = false,
} = process.env;

const WORKERFUL_SECRET = crypto.randomUUID();

const workerful_serializer = WORKERFUL_SERIALIZER.toLowerCase();

if (!(workerful_serializer in serializer))
  throw new Error(`Serializer ${WORKERFUL_SERIALIZER} is not json, circular or structured`);

const ok = (res, content = '') => {
  res.writeHead(200, { 'Content-Type': 'text/javascript;charset=utf-8' });
  res.end(content);
  return true;
};

let ws, summary = Promise.resolve();

const server = await create(serializer[workerful_serializer], (req, res) => {
  const { url, method, headers } = req;
  if (method === 'GET') {
    if (url === '/workerful') {
      let content, options = {
        serializer: workerful_serializer,
      };
      if (headers.referer.endsWith('/workerful.js'))
        content = `globalThis.workerful=${stringify(options)};\n${worker}`;
      else {
        content = `globalThis.workerful=${stringify({
          ...options, ws,
          secret: WORKERFUL_SECRET,
          centered: (
            WORKERFUL_CENTERED === 'always' ||
            truthy(WORKERFUL_CENTERED)
          ),
        })};\n${client}`;
      }
      return ok(res, content);
    }
  }
  else if (method === 'POST') {
    const secret = `/${WORKERFUL_SECRET}?`;
    if (url.startsWith(secret)) {
      if (WORKERFUL_KIOSK) return ok(res);
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
      return ok(res);
    }
  }
  return false;
});

server.listen(+WORKERFUL_PORT, WORKERFUL_IP, async function () {
  const { address, family, port } = this.address();

  const APP = `//${family === 'IPv4' ? address : 'localhost'}:${port}/`;

  const { name, dir, flags } = bootstrap(json, `http:${APP}`, truthy(WORKERFUL_KIOSK));

  ws = `ws:${APP}`;

  let bin = 'browser';
  if (!truthy(WORKERFUL_HEADLESS)) {
    for (bin of [].concat(apps[name])) {
      if (!spawnSync(bin, ['--version']).error) break;
      bin = '';
    }

    if (!bin) throw new Error(`Unable to start ${apps[name]}`);

    const app = await openApp(bin, {
      arguments: flags
    });

    const drop = () => {
      rm(dir, { recursive: true }, e => {
        process.exit(+!!e);
      });
    };

    const { pid } = app;
    process.on('SIGINT', () => {
      drop();
      process.kill(pid);
    });

    app.on('close', () => {
      setTimeout(async () => {
        await summary;
        drop();
      }, 250);
    });
  }

  if (truthy(DEBUG)) {
    console.debug(`\x1b[1mworkerful app launcher\x1b[0m`);
    console.debug(`${bin} ${flags.join(' ')}`);
    console.debug(`\x1b[1mworkerful serializer\x1b[0m `, WORKERFUL_SERIALIZER);
    console.debug(`\x1b[1mworkerful server\x1b[0m     `, `http://${APP}`);
  }
});
