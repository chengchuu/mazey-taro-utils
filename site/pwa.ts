import {
  isSafePWAEnv,
  isStandalonePWA,
  watchServiceWorkerUpdates,
} from "mazey";

export interface SitePwaConfig {
  appName: string;
  enabled: boolean;
  scope: string;
  serviceWorkerUrl: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function announce(message: string): void {
  document
    .querySelectorAll<HTMLElement>("[data-pwa-status]")
    .forEach((region) => {
      region.textContent = message;
    });
}

function setInstallVisible(visible: boolean): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-pwa-install]")
    .forEach((button) => {
      button.hidden = !visible;
      button.disabled = false;
      const container = button.closest<HTMLElement>(
        "[data-pwa-install-container]",
      );
      if (container) container.hidden = !visible;
    });
}

function hideInstallHelp(): void {
  document
    .querySelectorAll<HTMLElement>("[data-pwa-install-help]")
    .forEach((element) => {
      element.hidden = true;
    });
}

export function initializeInstallExperience(): () => void {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-pwa-install]"),
  );
  const handlePrompt = (event: Event): void => {
    if (isStandalonePWA()) return;
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    setInstallVisible(true);
  };
  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt;
    deferredPrompt = null;
    buttons.forEach((button) => {
      button.disabled = true;
    });
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      announce(
        choice.outcome === "accepted"
          ? "The website app installation was accepted."
          : "Installation was dismissed. You can use the browser menu later.",
      );
    } catch {
      announce(
        "The install prompt was unavailable. Use the browser menu instead.",
      );
    } finally {
      setInstallVisible(false);
    }
  };
  const handleClick = (): void => {
    void handleInstall();
  };
  const handleInstalled = (): void => {
    deferredPrompt = null;
    setInstallVisible(false);
    hideInstallHelp();
    announce("The website app was installed.");
  };

  if (isStandalonePWA()) {
    setInstallVisible(false);
    hideInstallHelp();
  }
  buttons.forEach((button) => button.addEventListener("click", handleClick));
  window.addEventListener("beforeinstallprompt", handlePrompt);
  window.addEventListener("appinstalled", handleInstalled);
  return () => {
    buttons.forEach((button) =>
      button.removeEventListener("click", handleClick),
    );
    window.removeEventListener("beforeinstallprompt", handlePrompt);
    window.removeEventListener("appinstalled", handleInstalled);
  };
}

export async function registerSiteServiceWorker(
  config: SitePwaConfig,
): Promise<ServiceWorkerRegistration | null> {
  if (!config.enabled || !isSafePWAEnv({ scope: config.scope })) return null;
  try {
    const registration = await navigator.serviceWorker.register(
      config.serviceWorkerUrl,
      { scope: config.scope },
    );
    const notice = document.querySelector<HTMLElement>("[data-pwa-update]");
    const updateButton = document.querySelector<HTMLButtonElement>(
      "[data-pwa-update-now]",
    );
    let reloadRequested = false;
    const watcher = watchServiceWorkerUpdates(
      registration,
      navigator.serviceWorker,
      {
        onUpdateAvailable() {
          if (notice) notice.hidden = false;
          announce(`A new version of ${config.appName} is available.`);
        },
        onControllerChange() {
          if (notice) notice.hidden = true;
          if (reloadRequested) window.location.reload();
        },
      },
    );
    updateButton?.addEventListener("click", () => {
      reloadRequested = watcher.activateWaiting();
      if (reloadRequested) {
        updateButton.disabled = true;
        announce("Updating the website now.");
      }
    });
    return registration;
  } catch (error) {
    console.error(
      `Failed to register the ${config.appName} service worker.`,
      error,
    );
    return null;
  }
}

export function initializeSitePwa(config: SitePwaConfig): void {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return;
  }
  const root = document.documentElement;
  if (root.dataset.pwaReady === "true") return;
  root.dataset.pwaReady = "true";
  initializeInstallExperience();
  if (!config.enabled || !isSafePWAEnv({ scope: config.scope })) return;

  const register = (): void => {
    window.setTimeout(() => {
      void registerSiteServiceWorker(config);
    }, 0);
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
