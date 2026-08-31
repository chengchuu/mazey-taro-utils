# Taro 4 Upgrade Plan

## Summary

Upgrade `mazey-taro-utils` to support Taro 4 only. Keep `@tarojs/taro` as a direct runtime
dependency, change its version range from `^3.6.0` to `^4.2.1`, and publish the library as version
`2.0.0`. Modernize the package TypeScript configuration for its Rollup and Babel build pipeline.

This is a new package with no released versions or existing users. The upgrade does not require a
Taro 3 compatibility path, migration layer, or deprecation period.

## Current State

- `package.json` already declares version `2.0.0`.
- `package.json` still declares `@tarojs/taro` as `^3.6.0`.
- `pnpm-lock.yaml` still resolves Taro 3.6.40.
- `node_modules` must be restored because an interrupted dependency installation removed the local
  Taro package.
- The existing `pnpm-workspace.yaml` changes are user-owned and must remain unchanged.

## Implementation Changes

1. Change the existing `@tarojs/taro` entry in `package.json` to `^4.2.1`.
2. Keep `@tarojs/taro` in `dependencies`. Do not move it to `peerDependencies` or
   `devDependencies`.
3. Keep the package version at `2.0.0`.
4. Modernize `tsconfig.json` with the configuration defined in the next section.
5. Change the React `FormEvent` import in `examples/App.tsx` to a type-only import so
   `verbatimModuleSyntax` can validate the site build.
6. Run `CI=true pnpm install --no-frozen-lockfile` to restore `node_modules` and update
   `pnpm-lock.yaml`.
7. Confirm that the installed Taro version satisfies `^4.2.1` and that the lockfile no longer
   contains Taro 3 packages required only by this project.
8. Review the lockfile diff and retain only dependency-graph changes caused by the Taro upgrade.

Do not change the public API, runtime implementation, declarations, tests, README, build formats,
browser globals, GitHub Actions workflows, or release scripts unless validation identifies a
confirmed Taro 4 or TypeScript incompatibility.

## Modern TypeScript Configuration

Update `tsconfig.json` to use the following compiler contract:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "rootDir": ".",
    "outDir": "lib",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "importHelpers": true,
    "strict": true,
    "noImplicitThis": false,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"],
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["src/**/*.ts", "types/**/*.d.ts"],
  "exclude": [
    ".pages-api",
    "coverage",
    "dist",
    "dist-dev",
    "docs",
    "lib",
    "node_modules"
  ]
}
```

Keep `tsconfig.site.json` as the website-specific override. It continues to inherit the strict
module settings while retaining its explicit `ES2018` target, JSX configuration, and site source
scope. Do not enable `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, or
`noUncheckedSideEffectImports` as part of this upgrade.

## Public Contract

- Package version: `2.0.0`
- Supported Taro version: `^4.2.1`
- Unsupported Taro versions: Taro 3 and earlier
- Dependency model: direct runtime dependency
- Package TypeScript target: `ES2022`
- Public functions and module entry points: unchanged

## Validation

Run the following checks after updating the dependency and lockfile:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run docs
npm pack --dry-run
git diff --check
```

Then review `git status` and the complete diff. Confirm that:

- the package builds against the installed Taro 4 types;
- both `tsconfig.json` and `tsconfig.site.json` pass type checking with the inherited modern module
  settings;
- all Jest suites pass;
- CommonJS, ES module, browser IIFE, and declaration outputs validate;
- the generated documentation passes SEO and PWA validation;
- the packed package reports version `2.0.0` and includes only the intended files;
- no Taro 3 dependency remains in the root package contract;
- the existing `pnpm-workspace.yaml` changes remain intact.

## Release Constraints

Do not publish, tag, push, deploy, or run the release script as part of the implementation or
validation. Perform those actions only after separate authorization.
