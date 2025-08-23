import coincident from 'coincident/server/worker';

// 😉 globalThis.workerful is provided server side
const { workerful } = globalThis;
delete globalThis.workerful;

const { server, window } = await coincident();

export { server, window };
