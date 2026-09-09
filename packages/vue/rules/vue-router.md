# Vue Router

- Use the installed Vue 3-compatible Vue Router. Register the router once on the
  application; define route records with the project's route types and naming.
- Use `RouterView` for routed content and `RouterLink` for internal navigation.
  Preserve native anchors and open-in-new-tab behavior. Use `router.push()` for
  action outcomes and `replace()` for intentional history replacement.
- Lazy-load route SFCs with `() => import('./path/Page.vue')`. Do not wrap route
  components in `defineAsyncComponent()`; router lazy loading is separate.
- In setup, use `useRoute()` and `useRouter()`. Watch specific properties such as
  `() => route.params.id`, not the entire route. Components can be reused across
  parameter changes; mount-only loading misses those updates.
- Keep shareable filters and pagination in the URL. Normalize string, array,
  null, and missing query values deliberately, validate parameters, and preserve
  unrelated query keys when updating. Avoid route/state watcher feedback loops.
- Pass required route values into presentation components through props instead
  of coupling every descendant to the router.
- Use supported navigation guards and `onBeforeRouteLeave` for unsaved changes
  when required. Return redirects or cancellation outcomes consistently and
  handle failed navigation; do not create redirect loops.
- Guards are navigation UX, not authorization. Protected operations still need
  server-side authorization regardless of the visible route.
- Preserve the project's history mode. `createWebHistory()` needs an application
  fallback on the host for direct URLs; hash history does not require that
  fallback. Respect the deployment base path and provide a not-found route.
- Manage page titles, focus, scroll restoration, loading, and route-load errors
  deliberately. Keep canceled or stale data loads from overwriting the current
  route's state.

For integration tests, create a fresh router with `createMemoryHistory()`, install
it on the test app, push an initial location, and await `router.isReady()` before
asserting initial navigation. Use the
[testing guidance](../instructions/vue-testing.instructions.md) for subsequent
navigation and async updates.

Sources: [Composition API routing](https://router.vuejs.org/guide/advanced/composition-api.html),
[lazy routes](https://router.vuejs.org/guide/advanced/lazy-loading.html),
[history modes](https://router.vuejs.org/guide/essentials/history-mode.html).
