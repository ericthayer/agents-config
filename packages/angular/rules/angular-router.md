# Angular routing

- Define typed `Routes` at application and feature boundaries. Register the
  router with `provideRouter()` in a standalone application's providers.
- Use `loadComponent` for lazy standalone pages and `loadChildren` for lazy child
  route configurations. Return the named export when using named exports. Avoid
  eager imports that defeat the lazy boundary.
- Route order matters: put specific paths before parameterized paths and the
  `**` fallback last. Use `pathMatch: 'full'` for empty-path redirects.
- Import `RouterOutlet`, `RouterLink`, and `RouterLinkActive` where used. Render
  navigation as `<a [routerLink]="...">`, preserving native open-in-new-tab
  behavior. Use imperative navigation for action outcomes, not every link.
- Keep bookmarkable filters and pagination in query parameters. Parse and
  validate URL values, preserve unrelated parameters intentionally, and avoid
  feedback loops when normalizing them. Never put secrets in URLs.
- Consume `ActivatedRoute` parameter/query streams when the same component can
  remain active across URL changes. A snapshot is a one-time read, not a live
  subscription. Handle missing or malformed parameters explicitly.
- Use functional guards with dependencies injected in their supported context.
  Return a `UrlTree` for redirects rather than returning `false` and navigating
  separately. `canMatch: false` tries another matching route; it is not equivalent
  to denying all navigation.
- Client-side guards improve UX; they are not an authorization boundary.
  Enforce authorization on the server independently.
- Load only truly prerequisite data in resolvers; present other loading/error
  states within the page. Define behavior for canceled and failed navigation.
- Supply route titles, deliberate focus management after navigation, a usable
  not-found page, and a policy for leaving unsaved forms.

Example entry in an existing `Routes` array (the import must name a real page):

```ts
{
  path: 'catalog',
  title: 'Catalog',
  loadComponent: () =>
    import('./features/catalog/catalog-page/catalog-page.component')
      .then(module => module.CatalogPageComponent),
}
```

Exercise direct URLs, parameter-only navigation, redirects, guards, back/forward,
and lazy-route failures with
[router tests](../instructions/angular-testing.instructions.md).

Sources: [route definitions](https://angular.dev/guide/routing/define-routes),
[live route state and snapshots](https://angular.dev/guide/routing/read-route-state),
[loading strategies](https://angular.dev/guide/routing/loading-strategies),
[guards](https://angular.dev/guide/routing/route-guards),
[routing tests](https://angular.dev/guide/routing/testing).
