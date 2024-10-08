import { join } from 'node:path';
import { tmpdir } from 'node:os';

export default ({ name: projectName, workerful: { name, browser, window } }, app, kiosk) => {
  const browserName = browser?.name || 'chrome';
  const flags = (browser?.flags || []).slice(0);
  const userDataDir = join(tmpdir(), '.workerful', crypto.randomUUID());
  // ⚠️ TODO: only chrome is supported at this point
  switch (browserName) {
    case 'chrome': {
      if (!/^http:\/\/localhost:\d+\//.test(app))
        flags.push(`--unsafely-treat-insecure-origin-as-secure=${app}`, `--test-type`);
      // https://peter.sh/experiments/chromium-command-line-switches/
      flags.push(
        // '--disable-web-security', // this is trouble
        `--window-position=${(window?.position || [0, 0]).join(',')}`,
        `--window-size=${(window?.size || [640, 400]).join(',')}`,
        `--window-name=${name || projectName || 'unknown'}`,
        // this is mandatory to avoid inheriting other chrome/ium instances/state
        `--user-data-dir=${userDataDir}`,
        '--ignore-profile-directory-if-not-exists',
        '--enable-webgpu-developer-features',
        '--ignore-gpu-blocklist',
        '--disable-extensions',
        '--allow-running-insecure-content',
        '--allow-files-access-from-files',
        '--enable-features=SharedArrayBuffer',
        '--disable-first-run-ui',
        '--new-window',
        '--minimal',
        '--content-shell-hide-toolbar',
        '--incognito',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-cache',
        '--disable-popup-blocking',
        // not sure this does anything
        // '--disable-system-font-check',
      );
      if (kiosk) flags.push('--kiosk', app);
      else flags.push(`--app=${app}`);
      break;
    }
    default: throw new Error(`Unsupported browser ${browserName}`);
  }
  return { name: browserName, dir: userDataDir, flags };
};
