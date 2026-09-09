# Angular state and RxJS

## Choose one owner

| State | Default owner |
| --- | --- |
| Expanded panel, local selection, draft | Component signals or typed form model |
| Shared feature state | Service provided at the intended feature boundary |
| Application-wide domain state | Root-provided service with explicit actions |
| Bookmarkable filters, sorting, pagination | Router parameters/query parameters |
| Async event sequences and cancellation | RxJS pipeline with a defined consumer |

Do not copy route state, form values, or observable results into multiple writable
stores. Derive view models from the owner. Preserve an existing state library;
do not install one for ordinary local/shared state.

## Stream boundaries

- Use RxJS for async composition, not nested subscriptions. For replaceable reads
  such as search, use `switchMap` to unsubscribe obsolete work. Choose concurrency
  deliberately for writes: cancellation does not undo an operation already
  received by a server.
- Debounce noisy input when required and suppress equivalent requests. Model
  idle, loading, success, empty, and error outcomes explicitly. Recover at the
  relevant inner request boundary when later input must still be accepted.
- Surface meaningful request errors; never map all failures to an empty success.
  Ensure pending state clears on success, error, and cancellation without an old
  request clearing a newer request's pending state.
- Prefer `AsyncPipe` for template-owned subscriptions or create `toSignal()` once
  and reuse it. Both can manage teardown. Multiple subscriptions to a cold
  request stream can repeat its work.
- `toSignal()` subscribes immediately and needs an injection context or explicit
  injector. Supply a meaningful initial value or handle `undefined`.
  Use `requireSync: true` only for streams guaranteed to emit synchronously.
  Observable errors otherwise throw when the signal is read.
- Use `toObservable()` when a signal needs stream operators. It is not a lossless
  log of every intermediate signal write; do not use state signals as event buses.
- For imperative subscriptions, use `takeUntilDestroyed()` where supported.
  Outside an injection context, pass a `DestroyRef` captured during construction.
  Keep teardown after operators creating inner subscriptions so those are owned
  by the same lifetime. Handle subscription errors explicitly.

Verify isolation between component instances, scope resets, stale responses,
subscription teardown, and retries with the
[testing guidance](../instructions/angular-testing.instructions.md).

Sources: [signals](https://angular.dev/guide/signals),
[RxJS interop and subscription semantics](https://angular.dev/ecosystem/rxjs-interop),
[`takeUntilDestroyed`](https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed).
