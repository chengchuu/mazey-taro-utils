import { DEFAULT_EXTENSIONS } from "@babel/core";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { dts } from "rollup-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");
const { packageDetails } = require("./project-config-utils.js");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resolveFromScripts = (relativePath) =>
  path.resolve(__dirname, relativePath);
const packageConfig = packageDetails(pkg);
const packageVersion =
  process.env.SCRIPTS_NPM_PACKAGE_VERSION || process.env.VERSION || "unknown";
const debugMode = process.env.SCRIPTS_NPM_PACKAGE_DEBUG;
const input = resolveFromScripts("../src/index.ts");
const external = ["@tarojs/taro", "mazey"];
const banner =
  "/*!\n" +
  ` * ${packageConfig.name} v${packageVersion} ${pkg.repository.url.replace(/^git\\+/, "").replace(/\\.git$/, "")}\n` +
  ` * (c) 2018-${new Date().getFullYear()} ${packageConfig.author.name || packageConfig.name}\n` +
  ` * Released under the ${packageConfig.license || "MIT"} License.\n` +
  " */";

const clean = () => ({
  name: "clean-lib",
  buildStart() {
    rmSync(resolveFromScripts("../lib"), { recursive: true, force: true });
  },
});

const plugins = [
  typescript({
    compilerOptions: {
      declaration: false,
      declarationMap: false,
    },
  }),
  babel({
    babelHelpers: "bundled",
    exclude: "**/node_modules/**",
    extensions: [...DEFAULT_EXTENSIONS, ".ts"],
  }),
];
const minify = [];

if (debugMode !== "open") {
  minify.push(
    terser({
      format: {
        comments: /^!\n\s\*/,
      },
    }),
  );
}

export default [
  {
    input,
    output: [
      {
        file: resolveFromScripts("../lib/index.cjs.js"),
        format: "cjs",
        banner,
        sourcemap: true,
        plugins: minify,
      },
      {
        file: resolveFromScripts("../lib/index.esm.js"),
        format: "esm",
        banner,
        sourcemap: true,
        plugins: minify,
      },
    ],
    plugins: [clean(), ...plugins],
    external,
  },
  {
    input,
    output: [
      {
        file: resolveFromScripts(
          `../lib/${packageConfig.bundleBaseName}.min.js`,
        ),
        format: "iife",
        name: packageConfig.iifeGlobal,
        banner,
        globals: {
          "@tarojs/taro": "Taro",
          mazey: "mazey",
        },
        sourcemap: true,
        plugins: minify,
      },
    ],
    plugins,
    external,
  },
  {
    input,
    output: [
      {
        file: resolveFromScripts("../lib/index.d.ts"),
        format: "es",
        banner: '/// <reference path="./global.d.ts" />',
      },
    ],
    plugins: [dts()],
    external,
  },
  {
    input: resolveFromScripts("../src/typing.d.ts"),
    output: [
      {
        file: resolveFromScripts("../lib/typing.d.ts"),
        format: "es",
      },
    ],
    plugins: [dts()],
    external,
  },
  {
    input: resolveFromScripts("../types/global.d.ts"),
    output: [
      {
        file: resolveFromScripts("../lib/global.d.ts"),
        format: "es",
      },
    ],
    plugins: [dts()],
    external,
  },
];
