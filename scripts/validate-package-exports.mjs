import { existsSync, readFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const expectedExports = [
  "getAllParams",
  "getCurrentPage",
  "getEnv",
  "getLoginCodeAsync",
  "getQueryParam",
  "getSystem",
  "getWindowSize",
  "isAndroid",
  "isBrowser",
  "isH5",
  "isIOS",
  "isLongScreen",
  "isMiddleScreen",
  "isMiniProgram",
  "isPC",
  "isWeapp",
  "isWeb",
  "isWideScreen",
  "quickNavigateTo",
  "quickRedirectTo",
  "quickScrollTo",
  "quickToast",
];
const files = [pkg.main, pkg.module, pkg.types, pkg.unpkg];

for (const relative of files) {
  if (!relative || !existsSync(path.join(root, relative)))
    throw new Error(`Missing configured package output: ${relative}`);
}

const commonJsSource = readFileSync(path.join(root, pkg.main), "utf8");
const esmSource = readFileSync(path.join(root, pkg.module), "utf8");
const declarationSource = readFileSync(path.join(root, pkg.types), "utf8");
const browserSource = readFileSync(path.join(root, pkg.unpkg), "utf8");
for (const name of expectedExports) {
  if (!new RegExp(`\\b${name}\\b`).test(commonJsSource))
    throw new Error(`CommonJS package entry does not expose ${name}`);
  if (!new RegExp(`\\b${name}\\b`).test(esmSource))
    throw new Error(`ES module package entry does not expose ${name}`);
  if (!new RegExp(`\\b${name}\\b`).test(declarationSource))
    throw new Error(`Package declarations do not expose ${name}`);
  if (!new RegExp(`\\b${name}\\b`).test(browserSource))
    throw new Error(`Browser package entry does not expose ${name}`);
}

for (const websiteOnlyDependency of ["bootstrap", "react", "react-dom"]) {
  for (const [label, source] of [
    ["CommonJS", commonJsSource],
    ["ES module", esmSource],
    ["browser", browserSource],
  ]) {
    if (source.includes(websiteOnlyDependency))
      throw new Error(
        `${label} package bundle unexpectedly includes ${websiteOnlyDependency}`,
      );
  }
}

console.log(
  "CommonJS, ES module, declaration, and browser outputs validated statically.",
);
