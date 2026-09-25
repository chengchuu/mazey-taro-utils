# AGENTS.md

Guidance for contributors and automated coding agents working in this repository.

## Scope And Purpose

`mazey-taro-utils` is a TypeScript package of Taro helpers for page parameters, environment and
device detection, navigation, login, scrolling, and toasts. It also contains a static project site,
a React playground, generated TypeDoc API documentation, and a website-only Progressive Web App
(PWA).

Keep changes inside this checkout unless the user explicitly includes another repository. The
parent `/Users/cheng/web/npm` directory contains independent Git repositories and is not a monorepo.
Run Git and package commands from this directory, preserve unrelated work, and do not stage, commit,
tag, push, publish, or deploy unless the user asks.

## Architecture Boundaries

- `src/index.ts` is the published package entry point. It adapts `@tarojs/taro` and selected `mazey`
  utilities into the flat public API.
- `src/typing.d.ts` and `types/global.d.ts` own declarations used by the package build.
- `examples/` owns the browser playground. React is development-only and must not leak into the
  published package runtime.
- `site/` owns the homepage, shared navigation, theme behavior, PWA behavior, and TypeDoc browser
  enhancements. Do not import site code from `src/index.ts`.
- `project.config.js` is the source of truth for package-derived site identity, URLs, Pages paths,
  theme values, SEO data, and PWA configuration. Webpack exposes only the browser-safe subset from
  `site/runtime-config.ts`.
- `scripts/rollup.config.mjs` builds the consumer package. `scripts/webpack.config.dev.js` builds the
  homepage and playground. `scripts/build-pages.mjs` assembles the final Pages artifact and
  transforms generated TypeDoc HTML.
- `test/` contains Jest coverage for package behavior and the maintained site sources.
- `lib/`, `dist-dev/`, `docs/`, `.pages-api/`, and `coverage/` are generated outputs. Never edit them
  by hand.

Keep the consumer runtime, the React playground, and the website runtime as separate products with
separate build boundaries.

## Package Contract

Rollup emits these public outputs from `src/index.ts`:

- CommonJS: `lib/index.cjs.js`
- ES modules: `lib/index.esm.js`
- Browser IIFE: `lib/mazey-taro-utils.min.js`
- TypeScript declarations: `lib/index.d.ts`, `lib/typing.d.ts`, and `lib/global.d.ts`

`@tarojs/taro` and `mazey` remain external in the JavaScript bundles. The browser IIFE therefore
expects `Taro` and `mazey` globals. When changing a public helper, keep the implementation, root
exports, declarations, tests, README examples, and generated outputs aligned.

## Frontend Entry Points And Component Hierarchy

Webpack builds four entries. The homepage and playground depend on the shared entry; the generated
API site uses its own entry.

```text
Webpack browser build
├── shared: site/shared.ts
│   ├── Bootstrap CSS and Collapse
│   ├── initializeThemeControls()
│   ├── initializeNavigation()
│   └── initializeSitePwa()
├── home: site/index.html + site/index.ts
│   ├── static header, navigation, hero, feature, install, usage, and PWA sections
│   └── install-command copy control
├── playground: examples/index.html + examples/index.tsx
│   ├── static header, navigation, links, footer, and PWA controls
│   └── #playground-root
│       └── React.StrictMode
│           └── App(api)
│               ├── Public API controls section
│               │   ├── navigation form
│               │   ├── toast control
│               │   └── scroll control
│               └── Controlled Taro output section
│                   ├── latest shim request
│                   └── environment and window information
└── api: generated TypeDoc HTML + site/api.ts
    ├── API-specific CSS
    ├── initializeThemeControls()
    └── initializeSitePwa()
```

`scripts/build-pages.mjs` adds project links, theme controls, PWA update UI, metadata, and the API
entry assets to TypeDoc output. Change that script or its owning source instead of editing generated
API HTML.

## Shared State

There is no application-wide React store. State ownership is intentionally local:

- `App` owns six `useState` values: `page`, `parameterName`, `parameterValue`, `toastMessage`,
  `error`, and `result`.
- `environment` is derived with `useMemo` from the injected `api` object. It contains no React
  state of its own.
- `params` is derived during each render from the controlled parameter fields.
- The playground shim publishes the latest simulated Taro request through the
  `mazey-taro-utils:taro-action` browser event. `App` subscribes in `useEffect`, writes the formatted
  payload to `result`, and removes the listener during cleanup.
- Theme state lives in the `initializeThemeControls()` closure as `selectedPreference` and
  `sessionOnlyPreference`. The resolved theme is reflected through root data attributes, CSS
  `color-scheme`, theme-color metadata, TypeDoc storage, and every `[data-theme-select]` control.
- PWA install state lives in the `initializeInstallExperience()` closure as `deferredPrompt`.
  Service-worker update state lives in `registerSiteServiceWorker()` as `reloadRequested`.
- Navigation state is owned by Bootstrap Collapse plus a per-navbar `restoreFocus` closure.
- DOM data attributes such as `data-theme-controls-ready`, `data-navigation-ready`, and
  `data-pwa-ready` prevent duplicate initialization.
- `SITE_RUNTIME_CONFIG` is an immutable build-time value injected by Webpack. Do not turn it into
  mutable UI state.

Do not introduce a global store for the current surface. Add shared state only when multiple
independent components must coordinate values that cannot remain at their nearest common owner.

## Prop Flow And Browser Event Flow

The React prop graph has one edge:

1. `examples/index.tsx` imports the real public helpers from `src/index.ts`.
2. It creates one `api` object and passes it to `<App api={...} />`.
3. `App` calls those functions from event handlers and renders their derived environment values.

There is no prop drilling and no callback flow from child components because `App` currently has no
React child components. Keep the `api` prop as the test seam: playground tests inject Jest mocks,
while the browser build injects real package helpers.

For the browser simulation, Webpack aliases `@tarojs/taro` to `examples/taro-browser-shim.ts`. A
user action follows this path:

```text
React control → injected package helper → Taro browser shim
              → CustomEvent on window → App effect → result state → output panel
```

The shim must remain controlled and local. It demonstrates request payloads; it is not a real Taro
or mini-program runtime.

## Context Usage

The frontend does not create or consume React context. Do not add a provider for the existing
single-component tree. Consider context only if a future component hierarchy has several distant
consumers that need the same stable service or state and explicit props have become unclear.

Bootstrap Collapse, DOM data attributes, local storage, media queries, and browser events are not
React context. Keep their lifecycle and cleanup rules explicit.

## Rendering And Performance

No rendering bottleneck is currently confirmed. The playground is small and performs no network
fetching, list rendering, animation loop, or expensive computation.

Watch these boundaries as the playground grows:

- Every controlled-input update rerenders the complete `App`, including both panels. This is
  acceptable for the current shallow tree. Split stable panels into components only when the tree
  becomes materially larger or profiling shows useful isolation.
- `params`, inline handlers, and the API options object passed to navigation are recreated during
  renders. Do not add `useCallback` or additional memoization without a memoized consumer or
  measured cost.
- `environment` is memoized so synchronous Taro environment calls rerun only when the `api` identity
  changes. Keep the injected object stable at the root.
- `actionText()` pretty-prints the shim payload with `JSON.stringify`. Current payloads are small;
  bound or defer formatting before supporting large payloads.
- Theme and PWA helpers use `querySelectorAll` when low-frequency browser events occur so multiple
  controls stay synchronized. Cache elements only if measurements show repeated traversal is
  significant and the DOM lifecycle remains correct.
- `initializeNavigation()` installs one document-level Escape handler per initialized navbar. The
  current templates contain one navbar per page. Revisit ownership if a page can contain many
  independently mounted navbars.
- React `StrictMode` can repeat render and effect setup in development. Preserve effect cleanup so
  development behavior does not duplicate event subscriptions.

Measure with the React Profiler or browser performance tools before adding memoization, context,
virtualization, or another state library.

## Frontend Change Rules

- Keep homepage and playground HTML useful without React. Preserve semantic landmarks, one
  descriptive `h1`, keyboard access, labels, live regions, and the `<noscript>` explanation.
- Keep playground calls routed through the injected public `api`; do not duplicate package logic in
  React components or import the browser shim directly from `App`.
- Preserve the custom-event name and payload shape when changing the shim, `App`, or tests together.
- Keep `initializeThemeControls()` idempotent and retain listener cleanup. Theme preference values
  are `system`, `light`, and `dark`; the applied theme remains `light` or `dark`.
- Use Mazey's verified theme and PWA helpers for their existing contracts. Project code continues to
  own DOM mutation, accessible controls, browser metadata, and update policy.
- Keep navigation progressively enhanced. Links must remain available if Bootstrap JavaScript does
  not initialize, and Escape handling must restore focus after the mobile menu closes.
- Keep service-worker activation user-controlled. Do not reload a playground session merely because
  an update becomes available.
- Derive names, URLs, storage keys, base paths, SEO values, and PWA values from `project.config.js`.
  Do not duplicate them in React or site modules.
- Avoid new runtime dependencies without checking the package externals, IIFE globals, declarations,
  consumer installation, and browser bundle.

## Testing Map

- `test/api.test.ts`: public Taro adapter behavior with deterministic Taro and Mazey mocks.
- `test/playground.test.tsx`: React rendering, keyboard access, controlled values, public-helper
  calls, and accessible error output.
- `test/theme.test.ts`: stored, system, unavailable-storage, and URL theme precedence.
- `test/pwa.test.ts`: install controls and installed-state behavior.
- `test/service-worker.test.ts`: service-worker caching and update behavior.
- `test/seo.test.ts`: maintained templates and final Pages metadata transformations.
- `test/project-config.test.ts`: derived project configuration.

There is no focused navigation unit test at present. Add jsdom coverage when changing navigation
state, focus restoration, Bootstrap event handling, or listener ownership.

Keep tests independent of real Taro runtimes, production credentials, network access, current time,
local theme preference, and the developer machine's window size.

## Development And Validation

Use Node.js 22 for repository tooling. The repository tracks `pnpm-lock.yaml` and ignores
`package-lock.json`. Use pnpm for local dependency changes, but run the documented project scripts
through npm. GitHub Actions installs with `npm install`.

The README and Pages workflow use Node.js 22. The npm publishing workflow currently declares
Node.js 20. Preserve that observed difference unless a workflow task explicitly changes and
validates the publishing runtime.

Common commands are:

```bash
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run docs
npm run preview
```

- `npm run dev` serves the homepage and playground on port `8080`.
- `npm run build` creates and validates the publishable package outputs.
- `npm run docs` generates TypeDoc, builds the site, assembles `docs`, and runs SEO and PWA
  validation.
- `npm run preview` runs type checking, linting, package build, Jest, and the documentation build.
  It does not run `format:check`, so run that command separately before handoff.

Match validation to the change:

- Package API changes: run type checking, lint, build, Jest, and `npm pack --dry-run` when practical.
- React playground changes: run `test/playground.test.tsx`, type checking, lint, formatting, and the
  production site build or `npm run docs`.
- Theme, navigation, SEO, or PWA changes: run the focused Jest suites and `npm run docs` so the final
  Pages artifact and validators are exercised.
- Workflow or configuration changes: validate syntax, run referenced scripts, and inspect the
  complete workflow diff without triggering publication or deployment.

Before handoff, run `git diff --check`, review `git status` and the complete diff, and report any
checks that could not run.

## Release Safety

`.github/workflows/pages.yml` builds and deploys `docs` through the `github-pages` environment.
`.github/workflows/publish-npm.yml` can publish to npm and GitHub Packages and create a version tag.
Treat workflow triggers, permissions, package identity, registry configuration, secrets, versioning,
and release scripts as release-sensitive. Never run `npm publish`, `npm run release`, push a tag, or
trigger a deployment as routine verification.
