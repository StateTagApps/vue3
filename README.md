# State Tag Applications (STA) · Vue 3

Custom HTML tags that read and write state, call APIs, and receive socket and nebula (gun.js) pushes.
A backend developer hands designers the tags plus a few script tags; designers build the GUI in plain HTML.

This is the Vue 3 + Vite port of [STA for Vue 2](../vue).

```html
<x-text-html locus="msg.en"></x-text-html>
<x-text-html service="api" src="/HelloWorld/TextHtml.json" locus="en"></x-text-html>
<x-text-html service="socket" src="timecast" locus="stamp"></x-text-html>
<x-input service="nebula" locus="demo"></x-input>
```

## Commands

| Command | What it does |
|---|---|
| `yarn serve` | Dev server with the demo page, plus local socket.io (:3131) and gun (:8181) relays |
| `yarn build` | Builds `dist/app.js` (the runtime) and copies the demo page into `dist/` |
| `yarn preview` | Serves `dist/` — the production bundle against the production env |
| `yarn test` | End-to-end tests (TestCafe, headless Chrome) against the demo page |

## Two layers

| Layer | Files | Written by |
|---|---|---|
| **App** | `public/js/sta-config.js`, `sta-state.js`, `sta-api.js`, `sta-io.js`, `sta-socket.js`, `sta-nebula.js` | each website using the tags |
| **Runtime** | `src/` → `dist/app.js` | this package |

Load the app scripts first, then `app.js`:

```html
<script src="/js/sta-config.js"></script>
<script src="/js/sta-state.js"></script>
<script src="/js/sta-api.js"></script>
<script src="/js/sta-socket.js"></script>
<script src="/js/sta-nebula.js"></script>
<script src="/js/sta-io.js"></script>
<script src="https://your-cdn/app.js"></script>
```

The runtime validates the app layer at boot and throws on anything missing.

## service · src · locus

| service | src | locus |
|---|---|---|
| `state` (default) | — | path into the declared state |
| `api` | URL (relative → joined to the api base) | path into the JSON response |
| `socket` | event name | path into the event payload |
| `nebula` | — | key in the nebula room |

Tags reading the same api `src`, socket event or nebula key share one source.
Errors render inside the tag (`[STA: locus "msg.typo" is not declared…]`).

## Tags

| Tag | Purpose |
|---|---|
| `<x-text-html>` | Show a value. `tag-specs`, `fallback`, `is-html`, `filters='[{"name":"numberFormat"}]'` |
| `<x-input>`, `<x-input-number>`, `<x-input-multiline>`, `<x-input-date>` | Edit a value. `name` (translated label), `icon`, `placeholder`, `required`; emit `updated` on blur |
| `<x-currency-input>`, `<x-lang-input>`, `<x-number-format>` | Pick a currency / language / number format for a locus |
| `<x-lang>` | UI language switcher (`langpack.selected`); optional `options-src`, `pack-src` |
| `<x-modal>` | Renders `stateTagApp.showModal(header, body)`; bodies may contain tags |
| `<x-undo>` | Cancels a pending `$api(…, {undo: true})` request |
| `<x-api-progress>` | Top progress bar while requests are in flight |
| `<x-progress-button>` | Button with a busy stripe: `loading` or `loading-locus` |
| `<x-badge>` | Count pill, hidden at zero, `1.5k` for large counts |
| `<x-debug>` | Raw JSON of any locus |
| `<x-socket-status>` | Socket connected / disconnected (slot = label) |
| `<x-qr>` | QR code of a value or `template="{stateTagApp.base}pair/{value}"` |

## stateTagApp (runtime API)

| | |
|---|---|
| State | `$read(locus)`, `$write(locus, value)`, `reset(branch?)`, `watch(locus, cb)`, `$execute('resetState' \| 'resetApp')` |
| API | `$api(endpoint, {params, body, method, headers, caller, key, undo, cache})` → `{data, status, headers}`; `undo()` |
| Socket | `$onSocket(event, cb)`, `$emitSocket(event, payload)` |
| Nebula | `$nebula(key, value)`, `$onNebula(key, cb)`, `sendRemoteCommand(name)` (defined in sta-nebula.js) |
| UI | `showModal(header, body, options)`, `hideModal()`, `modalError(message)`, `$translate(key)` |
| Events | `$broadcast({type, from, event})` to the embedding page; `onMessage(message)` receives |
| Formatting | `formatters.date / number / numberFormat / k / json / translation / userLang` (+ your own) |

Reserved state branch `sta`: `nebulaId`, `route`, `api.pending`, `undo`, `modal`, `context`.

## Config (sta-config.js)

`namespace`, `disk` (`blackhole | localStorage | sessionStorage`), `log`, `broadcastOrigin`, `tokenLocus`,
`undoDelay` (s), `cacheTimeout` (ms), `format.date` (Intl options), `base`, and `api` / `socket` / `nebula`
URL maps keyed by environment (`development`, `production`). A missing environment throws.

The `development` env points socket and nebula at the local relays `yarn serve` starts.
