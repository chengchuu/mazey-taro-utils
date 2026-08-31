# mazey-taro-utils

[![npm version][npm-image]][npm-url]
[![license][license-image]][license-url]

Taro helpers for environment detection, navigation, login, scrolling, toasts,
page parameters, and device information.

- Website: <https://chengchuu.github.io/mazey-taro-utils/>
- Playground: <https://chengchuu.github.io/mazey-taro-utils/playground/>
- API documentation: <https://chengchuu.github.io/mazey-taro-utils/api/>
- GitHub: <https://github.com/chengchuu/mazey-taro-utils>
- npm: <https://www.npmjs.com/package/mazey-taro-utils>

## Install

```shell
npm install mazey-taro-utils
```

The package uses `@tarojs/taro` and `mazey` at runtime.

## Quick start

Import helpers from the package root:

```ts
import {
  getEnv,
  getWindowSize,
  quickNavigateTo,
  quickToast,
} from "mazey-taro-utils";

quickToast(`Running in ${getEnv() || "an unspecified Taro environment"}`);
quickNavigateTo("profile", {
  params: {
    userId: "42",
  },
});

const { width, height } = getWindowSize();
console.log({ width, height });
```

## Public API

### Page information

- `getCurrentPage()` returns the current Taro route without its query string.
- `getAllParams()` returns the current route parameters, or an empty object.
- `getQueryParam(name)` returns one route parameter, or an empty string.

```ts
import { getAllParams, getCurrentPage, getQueryParam } from "mazey-taro-utils";

console.log(getCurrentPage());
console.log(getAllParams());
console.log(getQueryParam("userId"));
```

### Environment and device information

- `getEnv()` reads `process.env.TARO_ENV`.
- `getWindowSize()` returns width, height, width-to-height ratio, and
  height-to-width ratio from Taro window information.
- `getSystem()` returns the Taro system string.
- `isMiniProgram()` and `isWeapp()` detect the `weapp` build environment.
- `isBrowser()`, `isWeb()`, and `isH5()` detect the `h5` build environment.
- `isPC()` uses browser information when the build environment is `h5`.
- `isWideScreen()` and `isMiddleScreen()` check whether the width-to-height
  ratio is greater than `0.7`.
- `isLongScreen()` checks whether the height-to-width ratio is greater than
  `1.9`.
- `isIOS()` and `isAndroid()` inspect the Taro system string.

```ts
import {
  getEnv,
  getSystem,
  getWindowSize,
  isH5,
  isMiniProgram,
} from "mazey-taro-utils";

console.log({
  environment: getEnv(),
  system: getSystem(),
  window: getWindowSize(),
  h5: isH5(),
  miniProgram: isMiniProgram(),
});
```

### Navigation and interaction

- `quickNavigateTo(page, options?)` calls Taro `navigateTo` with a route below
  `/pages`.
- `quickRedirectTo(page, options?)` calls Taro `redirectTo` with the same route
  convention.
- `quickScrollTo(selector, duration?)` calls Taro `pageScrollTo`; the default
  duration is `300` milliseconds.
- `quickToast(message)` displays a text-only Taro toast.
- `getLoginCodeAsync()` resolves with the Taro login code and rejects when the
  login request fails or returns no code.

```ts
import {
  getLoginCodeAsync,
  quickRedirectTo,
  quickScrollTo,
  quickToast,
} from "mazey-taro-utils";

quickToast("Loading profile");
quickRedirectTo("profile", { params: { userId: "42" } });
quickScrollTo("#profile", 500);

const code = await getLoginCodeAsync();
console.log(code);
```

## Package outputs

- CommonJS: `lib/index.cjs.js`
- ES modules: `lib/index.esm.js`
- Browser IIFE: `lib/mazey-taro-utils.min.js`
- TypeScript declarations: `lib/index.d.ts`

The browser IIFE expects `Taro` and `mazey` globals because both runtime
dependencies remain external to the package bundle.

## Development

Use Node.js 22 for the repository tooling.

```shell
pnpm install
npm run typecheck
npm run lint
npm test
npm run build
npm run docs
```

`npm run docs` creates the final GitHub Pages artifact in `docs/`, including the
homepage, React playground, TypeDoc API site, manifest, icons, service worker,
robots file, and sitemap.

Run a production-like Pages preview at
`http://127.0.0.1:4173/mazey-taro-utils/`:

```shell
npm run pwa:preview
```

The public playground uses controlled browser-side Taro stubs. It demonstrates
the package’s generated requests without claiming to run a real mini-program
environment.

## License

Released under the [MIT License](LICENSE).

[npm-image]: https://img.shields.io/npm/v/mazey-taro-utils
[npm-url]: https://www.npmjs.com/package/mazey-taro-utils
[license-image]: https://img.shields.io/npm/l/mazey-taro-utils
[license-url]: https://github.com/chengchuu/mazey-taro-utils/blob/main/LICENSE
