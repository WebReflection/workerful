import { server, window } from '/workerful';

const { render, html } = await window.import('https://esm.run/uhtml');
const { default: os } = await server.import('os');

const [
  platform,
  arch,
  cpus,
  totalmem,
  freemem,
] = [
  os.platform(),
  os.arch(),
  os.cpus().length,
  os.totalmem(),
  os.freemem(),
];

render(window.document.body, html`
  <h1>👷 workerful</h1>
  <ul>
    <li>Platform: ${platform}</li>
    <li>Arch: ${arch}</li>
    <li>CPUS: ${cpus}</li>
    <li>RAM: ${totalmem}</li>
    <li>Free: ${freemem}</li>
  </ul>
`);
