import { join } from 'node:path';
import { homedir } from 'node:os';

export default ({ name: projectName, workerful: { name, browser, window } }, app, kiosk) => {
  const browserName = browser?.name || 'chrome';
  const flags = (browser?.flags || []).slice(0);
  const appName = name || projectName;
  // ⚠️ TODO: only chrome is supported at this point
  switch (browserName) {
    case 'chrome': {
      // https://peter.sh/experiments/chromium-command-line-switches/
      flags.push(
        // '--disable-web-security', // this is trouble
        `--window-position=${(window?.position || [0, 0]).join(',')}`,
        `--window-size=${(window?.size || [640, 400]).join(',')}`,
        `--window-name=${appName}`,
        // this is mandatory to avoid inheriting other chrome/ium instances/state
        `--user-data-dir=${join(homedir(), '.workerful', appName.replace(/\s/g, '-'))}`,
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
        '--no-default-browser-check',
        '--disable-popup-blocking',
        // not sure this does anything
        '--disable-system-font-check',
      );
      if (kiosk) flags.push('--kiosk', app);
      else flags.push(`--app=${app}`);
      break;
    }
    default: throw new Error(`Unsupported browser ${browserName}`);
  }
  return { name: browserName, flags };
};
