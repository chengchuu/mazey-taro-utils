/** @jest-environment jsdom */

import { initializeInstallExperience } from "../site/pwa";

function setStandalone(value: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: value,
      media: "(display-mode: standalone)",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

beforeEach(() => {
  document.body.innerHTML = `
    <div data-pwa-install-help>Installation help</div>
    <span data-pwa-install-container>
      <button type="button" data-pwa-install>Install app</button>
    </span>
    <p data-pwa-status></p>
  `;
});

test("hides installation controls and help in standalone mode", () => {
  setStandalone(true);

  const stop = initializeInstallExperience();

  expect(
    document.querySelector<HTMLElement>("[data-pwa-install-help]")?.hidden,
  ).toBe(true);
  expect(
    document.querySelector<HTMLButtonElement>("[data-pwa-install]")?.hidden,
  ).toBe(true);
  expect(
    document.querySelector<HTMLElement>("[data-pwa-install-container]")?.hidden,
  ).toBe(true);
  stop();
});

test("switches to installed state after the appinstalled event", () => {
  setStandalone(false);
  const stop = initializeInstallExperience();

  window.dispatchEvent(new Event("appinstalled"));

  expect(
    document.querySelector<HTMLElement>("[data-pwa-install-help]")?.hidden,
  ).toBe(true);
  expect(document.querySelector("[data-pwa-status]")?.textContent).toBe(
    "The website app was installed.",
  );
  stop();
});
