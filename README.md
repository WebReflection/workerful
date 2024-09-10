# 👷 workerful

A *wonderful* [Electron](https://www.electronjs.org/) standalone alternative 🌈, based on both system (*Chrome/ium based*) browser and node presence, hence weighting **only <span>96.4KB</span> to bootstrap**.

```js
// test it via NodeJS
npx workerful ~/project/folder/package.json
```

<details>
<summary><strong>Background / Project goal</strong></summary>

This project goal is to provide a minimalistic *App Container* fully based on system software and it uses by default *ESM* and all the modern *Web Standards* features through the (currently) most capable browser: *Chrome/ium*.

As the majority of Web developers and users most likely have *NodeJS* installed, and as pretty much everyone also has *Chrome* or *Chromium* installed on their machines, I've decided to give this approach a spin to hopefully see how much the community can create around its simple, yet extremely powerful, primitives that this tiny tool enables.

</details>

- - -

## Quick Start

Given a project folder with this minimal structure:

```
project/
├▸ package.json
├▸ public/
│  ├▸ index.html
│  └▸ workerful.js
└▸ ...
```

and providing that `package.json` as optional argument, where the default one is retrieved out of the current working folder, this module will bootstrap, through the system *NodeJS* default version, an incognito instance out of any installed *Chrome/ium* system browser, confining all its data in the user's *home directory* under `~/.workerful/project-name`.

### package.json

The `package.json` file is used to describe all desired *app* bootstrap features through its optional *workerful* namespace, eventually created if not already present and updated once the application is closed.

```json
{
	"workerful": {
		"name": "your project name",
		"ip": "localhost",
		"port": 0,
		"centered": true,
		"kiosk": false,
		"serializer": "json",
		"server": "",
		"browser": {
			"name": "chrome",
			"flags": []
		},
		"window": {
			"size": [400, 220],
			"position": [520, 340]
		}
	}
}
```

<details>
<summary><strong>Fields description</strong></summary>

  * **name** is your app name. This will be used as top bar name in your OS and recognized with such name among your running processes
  * **ip** is your app IP v4 address. By default it's `localhost` but it can be any other *IP* address. This field can be overridden via environment `WORKERFUL_IP` variable.
  * **port** is your app *port*. By default the project runs on any available port and it's completely transparent for your app. This field can be overridden via environment `WORKERFUL_PORT` variable.
  * **centered** which can be `true`, to center the *app* on its first bootstrap, `false` to run the *app* on top-left corner and then run where it was left last time, or `"always"` to always start the *app* centered, even if the user moved the window elsewhere. This field can be overridden via environment `WORKERFUL_CENTERED` variable, where `1`, `y`, `yes`, `ok` or `always` are valid values
  * **kiosk** to launch the *app* in *kiosk* mode (fullscreen). This field can be overridden via environment `WORKERFUL_KIOSK` variable, where `1`, `y`, `yes` or `ok` are valid values
  * **serializer** is the *stringify* / *parse* used to post messages between the *worker* and either the main *window* thread or the *server*. By default it's `"json"` but it can be also `"circular"`, based on [flatted](https://github.com/WebReflection/flatted?tab=readme-ov-file#flatted), or `"structured"`, based on [@ungap/structured-clone/json](https://github.com/ungap/structured-clone?tab=readme-ov-file#tojson). As quick summary:
    * **json** is the default serializer. It's the preferred method for DB related data exchanges or simple payloads (and it's also slightly faster than others)
    * **circular** is like *json* but it allows circular references within passed *data* among "*worlds*"
    * **structured** allows both circular references and extra types such as *Date*, *U/Int8Array*, *U/Int16Array*,  *U/Int32Array* or *Float32Array*, *Error* and more
  * **server** to optionally specify a *request handler/listener* for the *app*" where `export default (req, res) => { res.writeHead(200); res.end() }` would be a valid, bare-minimal, implementation. The file default export would be awaited and invoked with default *NodeJS* server references and if it does not return `true` on success, the server will respond with a `404`. You can implement or orchestrate any logic you like through this handler but, if not specified, a default [static file handler](https://github.com/WebReflection/static-handler) is used instead
  * **browser** is your *app* browser name based on [open API](https://github.com/sindresorhus/open?tab=readme-ov-file#api). Currently only *chrome* is supported but in the future *firefox* and *edge* might be supported too. This field has two optional nested fields:
    * **name** which is currently only *chrome*
    * **flags** which allows extra flags to be passed on *app* bootstrap. See this curated [list of Chrome/ium flags](https://peter.sh/experiments/chromium-command-line-switches/) to know more and consider many flags are already in place.
  * **window** is your *app* UI size and position, reflected in the app via `window.screenX` and `window.screenY` for the position and `window.screen.width` plus `window.screen.height` for the size. This field has two optional nested fields, ignored when the *app* starts in *kiosk* mode:
    * **size** which is an array of `[width, height]` numbers
    * **position** which is an array of `[x, y]` numbers

</details>

- - -

### public folder

This is the expected folder the server will automatically handle per each request and where all *client* side related files should be, most notably the `index.html` file and a `workerful.js` file to allow the automatically bootstrapped *Worker* to communicate or handle both the main *window* world and the *server* one.

#### workerful.js

The `workerful.js` file is automated after [coincident/server](https://github.com/WebReflection/coincident?tab=readme-ov-file#server) and its minimal content would look like this:

```js
import { server, window } from '/workerful'; // 🤖

const message = 'This is Workerful 🌈';

// show the message in the main window's body
window.document.body.append(message);

// log the message in console through the server
server.console.log(message);
```

These two primitives allow your worker code to send or receive data to show on the main thread UI or deal directly with anything available on the server, including importing modules or reaching out global references:

```js
// import modules from the main thread
const { render, html } = await window.import('https://esm.run/uhtml');

// import modules from the server
const { default: os } = await server.import('os');

// or simply reach its globals
const { process } = server;
```

<details>
<summary><strong>Best practices</strong></summary>

Due inevitable roundtrip delay between the worker and the main thread or the server one, it's important to keep in mind that highly / real-time reactive changes on the main UI are better passed along via listeners or exposed functionalities within the main thread, where it would receive, as example, only data to update or take care about, and so it goes for the server.

The rule of thumb here: delegate to respective domains heavy operations and expose utilities through dedicated modules which goal is to help the worker receive, or send, just data. This would be the *TL;DR* "*best practice*" of this *worker driven* pattern.

</details>

- - -

#### index.html

This file is the main file launched out of the box when the application starts and its minimal content would look like this:

```html
<!doctype html>
<html>
  <head>
    <title>This is Workerful 🌈</title>
    <script type="module" src="/workerful"></script>
  </head>
  <body></body>
</html>
```

The `/workerful` import on both main *window* thread and the *worker* is automatically disambiguated through the logic.

On the **main** thread, it provides a minimal bootstrap logic that automatically bootstrap a *Worker* to drive the application but after that module, everything else is allowed just like any regular *Web Application*.

<details>
<summary><strong>Good to know</strong></summary>

Both *main* `/workerful` and *worker* `/workeful` imports are handled on the *NodeJS* side and these two requests will never leak through the provided handler.

It is hence useless, or meaningless, to check for `req.url` and match against `/workerful` as that won't ever happen.

</details>
