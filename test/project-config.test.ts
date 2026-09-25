/** @jest-environment node */

import projectConfig from "../project.config.js";

test("central configuration derives package and Pages identity", () => {
  expect(projectConfig.package.name).toBe("mazey-taro-utils");
  expect(projectConfig.package.installCommand).toBe(
    "npm install mazey-taro-utils",
  );
  expect(projectConfig.site.url).toBe(
    "https://chengchuu.github.io/mazey-taro-utils/",
  );
  expect(projectConfig.site.basePath).toBe("/mazey-taro-utils/");
  expect(projectConfig.site.pages.playground.url).toBe(
    "https://chengchuu.github.io/mazey-taro-utils/playground/",
  );
  expect(projectConfig.site.pages.api.url).toBe(
    "https://chengchuu.github.io/mazey-taro-utils/api/",
  );
  expect(projectConfig.site.theme.storageKey).toBe("mazey-taro-utils-theme");
  expect(projectConfig.pwa.icons.map(({ file }) => file)).toEqual([
    "logo-192x192.png",
    "logo-512x512.png",
    "logo-maskable-512x512.png",
  ]);
});
