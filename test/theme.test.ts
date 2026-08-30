/** @jest-environment jsdom */

import { jest } from "@jest/globals";
import projectConfig from "../project.config.js";
import { initializeThemeControls } from "../site/theme";

const { colorDark, colorLight, colorPrimary, storageKey } =
  projectConfig.site.theme;
let media: {
  matches: boolean;
  listener?: (event: MediaQueryListEvent) => void;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
};

beforeEach(() => {
  history.replaceState({}, "", "/");
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme-controls-ready");
  document.documentElement.removeAttribute("data-bs-theme");
  document.head.innerHTML = `
    <meta name="theme-color" content="${colorPrimary}" data-theme-color
      data-theme-color-light="${colorLight}" data-theme-color-dark="${colorDark}">
  `;
  document.body.innerHTML = `
    <select data-theme-select aria-label="Theme">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `;
  media = {
    matches: false,
    addEventListener: jest.fn((_name, listener) => {
      media.listener = listener;
    }),
    removeEventListener: jest.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => media,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("resolves stored and system preferences through Mazey", () => {
  localStorage.setItem(storageKey, "dark");
  const stop = initializeThemeControls(storageKey);

  expect(document.documentElement.dataset.bsTheme).toBe("dark");
  expect(
    document.querySelector<HTMLSelectElement>("[data-theme-select]")?.value,
  ).toBe("dark");
  expect(
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.content,
  ).toBe(colorDark);
  stop();
});

test("applies a session preference when storage rejects the write", () => {
  const stop = initializeThemeControls(storageKey);
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage unavailable", "SecurityError");
  });
  const select = document.querySelector<HTMLSelectElement>(
    "[data-theme-select]",
  )!;

  select.value = "system";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  expect(document.documentElement.dataset.bsTheme).toBe("light");

  media.matches = true;
  media.listener?.({ matches: true } as MediaQueryListEvent);
  expect(document.documentElement.dataset.bsTheme).toBe("dark");
  stop();
});

test("keeps a fixed URL preference authoritative", () => {
  history.replaceState({}, "", `/?${storageKey}=dark`);
  const stop = initializeThemeControls(storageKey);
  const select = document.querySelector<HTMLSelectElement>(
    "[data-theme-select]",
  )!;

  select.value = "light";
  select.dispatchEvent(new Event("change", { bubbles: true }));

  expect(document.documentElement.dataset.bsTheme).toBe("dark");
  expect(select.value).toBe("dark");
  stop();
});
