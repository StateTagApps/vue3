# STA Vue 3 runtime — working notes

Architecture and preferences: `~/.claude/styles/state-tag-app.md`. API and tag reference: `README.md`.
This file holds the implementation rules learned the hard way. Each one prevents a real bug.

## Custom elements

- Every tag goes through `defineStaElement` (`src/sta/element.js`): `shadowRoot: false`, the shared Pinia instance
  via `configureApp`, and `inheritAttrs: false`. Without `inheritAttrs: false`, Vue copies host attributes onto the
  tag's root, so `onclick` fires twice and `style` doubles up.
- Tags are defined after `DOMContentLoaded`. Defined mid-parse (app.js as a plain `<script>` in `<head>`), a tag
  mounts before its children exist and slot content is lost. The dev server hides this (module scripts are deferred).
- No `<style>` blocks in components: library mode would emit a separate CSS file every site must load. Add CSS to
  `src/sta/styles.js` (injected, prepended to `<head>`, classes `sta-*`).
- Vue reflects default prop values back onto host attributes. Select tags in tests by attributes you set, not defaults.
- A Vue custom element `emit('x', payload)` arrives as a DOM CustomEvent with `event.detail === [payload]`.

## Nebula (gun.js)

- Address a room by soul: `gun.get(namespace + '/' + roomId)` — the same node Vue 2 STA reached with
  `gun.get(namespace).get(roomId)`. Walking the shared namespace parent stalled every room after a room switch.
- Never call gun's `.off()`: it silences every subscription under the namespace. Listeners for rooms we left stay
  attached and ignore updates.
- No `{change: true}`: joining a room must deliver its current value.
- Gun syncs latest state, not events. Remote commands are `name|from|id|sentAt`; receivers skip their own,
  duplicates, and anything sent before they booted.
- The dev gun relay advertises itself over local multicast: any local gun client may sync with it, whatever peer
  URL it was given. Don't treat a local ack as proof a remote relay answered.

## Build and dev servers

- Library mode leaves `process.env.NODE_ENV` in Vue's code; `vite.config.js` defines it. After a build,
  `grep -c 'process\.env\|import\.meta' dist/app.js` must print 0.
- `yarn serve` spawns `dev/servers.js` as its own Node process. Imported into Vite's process, the gun relay stored
  writes but never answered reads.
- `dev/servers.js` reuses ports already in use, so `yarn test` can run alongside `yarn serve`.

## Verifying a change

- Every new tag gets a demo section in `index.html` and a test in `tests/demo.test.js`.
- Check the production bundle too (`yarn build && yarn preview`), not only `yarn serve`.
- `yarn test` must pass before committing.
