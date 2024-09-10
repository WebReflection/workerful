import coincident from 'coincident/server/worker';
import serializer from './serializer.js';

// 😉 globalThis.workerful is provided server side
const { workerful } = globalThis;
delete globalThis.workerful;

const { server, window } = await coincident(
  serializer[workerful.serializer]
);

export { server, window };
