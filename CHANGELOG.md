# Changelog

## Unreleased

### Changed

- **Behavior change:** the first interaction is recorded once for the whole page
  and shared by every hook, with one set of window listeners. A component that
  mounts after the interaction, or mounts again, reports `true` right after its
  first render instead of waiting for another interaction.
- **Behavior change:** `useOnFirstInteraction` runs its callback straight away in
  a component that mounts after the interaction. Without `id` it still runs once
  per mounted component, so a remount runs it again.
- **Behavior change:** listeners are registered in the capture phase. A `scroll`
  on an inner element and an event whose propagation was stopped now count as
  the interaction.
- **Behavior change:** `delay` counts from the interaction and `timeout` from the
  start of the page (`performance.now()`), not from the mount. Changing `delay`,
  `timeout` or `disabled` while the delay is running no longer drops the
  interaction, and no longer restarts the timeout.
- **Behavior change:** the value follows the current options. Setting `disabled`
  after the hook has reported turns it back to `false`.

### Added

- `id` option for `useOnFirstInteraction`: callbacks under the same `id` run once
  per page load, however many times the hook mounts.
- `OnFirstInteractionOptions` type.
- `engines` in `package.json`, and CI runs the tests on React 18 as well as 19.

## 0.1.0

Initial release.

### Added

- `useFirstInteraction` — `false` until the visitor first touches the page, with
  `delay`, `events`, `timeout` and `disabled`.
- `useOnFirstInteraction` — run something once, then.
