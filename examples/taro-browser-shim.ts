interface TaroCallbackOptions<T> {
  success?(result: T): void;
  fail?(error: Error): void;
}

interface NavigationOptions {
  url: string;
}

interface ScrollOptions {
  selector: string;
  duration: number;
}

interface ToastOptions {
  title: string;
  icon: string;
}

const eventName = "mazey-taro-utils:taro-action";

function emit(method: string, payload: unknown): void {
  window.dispatchEvent(
    new CustomEvent(eventName, { detail: { method, payload } }),
  );
}

export function showToast(options: ToastOptions): void {
  emit("showToast", options);
}

export function getWindowInfo() {
  return {
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
  };
}

export function getSystemInfoSync() {
  return {
    system: navigator.platform || "Browser simulation",
  };
}

export function getCurrentInstance() {
  return {
    router: {
      path: window.location.pathname,
      params: Object.fromEntries(new URLSearchParams(window.location.search)),
    },
  };
}

export function navigateTo(options: NavigationOptions): void {
  emit("navigateTo", options);
}

export function redirectTo(options: NavigationOptions): void {
  emit("redirectTo", options);
}

export function login(options: TaroCallbackOptions<{ code: string }>): void {
  options.success?.({ code: "browser-demo-login-code" });
  emit("login", { code: "browser-demo-login-code" });
}

export function pageScrollTo(options: ScrollOptions): void {
  emit("pageScrollTo", options);
}
