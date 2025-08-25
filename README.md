# mazey-taro-utils

[![npm version][npm-image]][npm-url]
[![l][l-image]][l-url]

[npm-image]: https://img.shields.io/npm/v/mazey-taro-utils
[npm-url]: https://npmjs.org/package/mazey-taro-utils
[l-image]: https://img.shields.io/npm/l/mazey-taro-utils
[l-url]: https://github.com/chengchuu/mazey-taro-utils

Taro utils.

## Install

Use mazey-taro-utils via [npm](https://www.npmjs.com/package/mazey-taro-utils).

```shell
npm install mazey-taro-utils --save
```

Of course, you can also download this file and serve it yourself. The file locates at the `lib/mazey-taro-utils.min.js`.

## Quick Start

```javascript
import { getLoginCodeAsync } from "mazey-taro-utils";

getLoginCodeAsync()
  .then((code) => {
    console.log(`Login code: ${code}`);
  })
  .catch((error) => {
    console.error(error);
  });
```

## Usage

### `quickToast`

Displays a toast message.

**Parameters:**

- `msg` (string): The message to display in the toast.

**Example Usage:**

```javascript
quickToast('Hello, world!');
```

### `quickNavigateTo`

Navigates to a specified page.

**Parameters:**

- `page` (string): The page to navigate to. This should be the name of the directory under `/pages` without the `/index` part.
- `params` (object, optional): Query parameters to include in the URL.

**Example Usage:**

```javascript
quickNavigateTo('home', { params: { userId: 123 } });
```

### `quickRedirectTo`

Redirects to a specified page, without keeping the current page in the navigation history.

**Parameters:**

- `page` (string): The page to redirect to. This should be the name of the directory under `/pages` without the `/index` part.
- `params` (object, optional): Query parameters to include in the URL.

**Example Usage:**

```javascript
quickRedirectTo('home', { params: { userId: 123 } });
```

### `quickScrollTo`

Quickly scrolls to a specified element on the page.

**Parameters:**

- `selector` (string): The selector of the element to scroll to.
- `duration` (number, optional): The duration of the scroll animation in milliseconds. Default is 300ms.

**Example Usage:**

```javascript
quickScrollTo('#elementId', 500);
```

### `getEnv`

Gets the current environment the application is running in.

**Returns:** `string`

- The name of the current environment (e.g., `'h5'`, `'weapp'`, etc.).

**Example Usage:**

```javascript
console.log(`Current environment: ${getEnv()}`);
```

### `getCurrentPage`

Gets the path of the current page.

**Returns:** `string`

**Example Usage:**

```javascript
console.log(`Current page path: ${getCurrentPage()}`);
```

### `getAllParams`

Gets all parameters of the current page.

**Returns:** `object`

**Example Usage:**

```javascript
console.log(`Current page params: ${JSON.stringify(getAllParams())}`);
```

### `getQueryParam`

Gets the value of a query parameter from the current path.

**Parameters:**

- `name` (string): The name of the query parameter.

**Returns:** `string`

**Example Usage:**

```javascript
const userId = getQueryParam('userId');
console.log(`User ID: ${userId}`);
```

### `getWindowSize`

Gets the size of the current window.

**Returns:** `object`

- `width` (number): The width of the window.
- `height` (number): The height of the window.
- `ratio` (number): The width-to-height ratio.
- `hwRatio` (number): The height-to-width ratio.

**Example Usage:**

```javascript
const { width, height, ratio, hwRatio } = getWindowSize();
console.log(`Window size - Width: ${width}, Height: ${height}, Ratio: ${ratio}, HW Ratio: ${hwRatio}`);
```

### `getSystem`

Gets the current system information, such as "iOS 14.4".

**Returns:** `string`

**Example Usage:**

```javascript
const systemInfo = getSystem();
console.log(`System Info: ${systemInfo}`);
```

### `getLoginCodeAsync`

Calls the interface to get the login credential (code).

**Returns:** `Promise<string>`

**Example Usage:**

```javascript
getLoginCodeAsync().then(code => {
  console.log(`Login code: ${code}`);
}).catch(err => {
  console.error(`Failed to get login code: ${err}`);
});
```

### `isMiniProgram`

Checks if the current environment is a WeChat Mini Program.

**Returns:** `boolean`

**Example Usage:**

```javascript
if (isMiniProgram()) {
  console.log('Running in a WeChat Mini Program');
}
```

### `isH5`

Determines if the current environment is a web environment (H5).

**Returns:** `boolean`

- `true` if the current environment is H5.
- `false` otherwise.

**Example Usage:**

```javascript
if (isH5()) {
  console.log('Running in a web environment');
}
```

### `isWideScreen`

Checks if the device has a wide screen.

**Returns:** `boolean`

**Example Usage:**

```javascript
if (isWideScreen()) {
  console.log('Device has a wide screen');
}
```

### `isIOS`

Checks if the system is iOS.

**Returns:** `boolean`

**Example Usage:**

```javascript
if (isIOS()) {
  console.log('Running on iOS');
}
```

### `isAndroid`

Checks if the system is Android.

**Returns:** `boolean`

**Example Usage:**

```javascript
if (isAndroid()) {
  console.log('Running on Android');
}
```

## Contributing

Node.js Version: `16.x`

Install Dependencies:

```shell
npm i
```

Development:

```shell
npm run dev
```

Build:

```shell
npm run build
```

Document:

```shell
npm run docs
```

Test:

```shell
npm run test
```

## License

This software is released under the terms of the [MIT license](https://github.com/chengchuu/mazey-taro-utils/blob/main/LICENSE).
