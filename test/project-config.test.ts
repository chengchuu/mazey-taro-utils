/** @jest-environment node */

import { readFileSync } from "node:fs";

import projectConfig from "../project.config.js";

const workflowInstallCounts = new Map([
  [".github/workflows/pages.yml", 1],
  [".github/workflows/publish-npm.yml", 2],
]);

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

test("workflows install with npm without package-manager bootstrapping", () => {
  const packageMetadata = JSON.parse(readFileSync("package.json", "utf8")) as {
    packageManager?: unknown;
  };

  expect(packageMetadata.packageManager).toBeUndefined();

  for (const [workflowPath, expectedInstallCount] of workflowInstallCounts) {
    const workflow = readFileSync(workflowPath, "utf8");
    const installSteps = workflow.match(
      /- name: Install dependencies\n\s+run: npm install/gu,
    );

    expect(installSteps).toHaveLength(expectedInstallCount);
    expect(workflow).not.toContain("pnpm/action-setup");
    expect(workflow).not.toContain("corepack");
    expect(workflow).not.toMatch(/^\s+run:\s*npm ci\b/mu);
    expect(workflow).not.toContain("legacy-peer-deps");
    expect(workflow).not.toMatch(/^\s+cache:/mu);
  }
});
