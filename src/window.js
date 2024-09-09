import coincident from 'coincident/server/main';

try {
  new SharedArrayBuffer(4);
}

catch ({ message }) {
  alert(message);
  close();
}

const { workerful } = globalThis;
delete globalThis.workerful;

addEventListener('beforeunload', () => {
  navigator.sendBeacon(`/${workerful.secret}?${
    encodeURIComponent(
      JSON.stringify({
        position: [screenX, screenY],
        size: [innerWidth, innerHeight]
      })
    )
  }`);
});

if (workerful.centered) {
  const { width, height } = screen;
  const x = (width - innerWidth) / 2;
  const y = (height - innerHeight) / 2;
  moveTo(x, y);
}

const { Worker } = coincident({ ws: workerful.ws });
new Worker('/workerful.js');
