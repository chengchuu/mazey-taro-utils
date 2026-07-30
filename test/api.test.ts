import { jest } from "@jest/globals";

const taro = {
  getCurrentInstance: jest.fn(),
  getSystemInfoSync: jest.fn(),
  getWindowInfo: jest.fn(),
  login: jest.fn(),
  navigateTo: jest.fn(),
  pageScrollTo: jest.fn(),
  redirectTo: jest.fn(),
  showToast: jest.fn(),
};

jest.unstable_mockModule("@tarojs/taro", () => taro);
jest.unstable_mockModule("mazey", () => ({
  convertObjectToQuery: (params: Record<string, unknown>) => {
    const search = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ).toString();
    return search ? `?${search}` : "";
  },
  getBrowserInfo: () => ({ platform: "desktop" }),
}));

const api = await import("../src/index");

beforeEach(() => {
  jest.clearAllMocks();
  taro.getCurrentInstance.mockReturnValue({
    router: {
      path: "/pages/profile/index?source=test",
      params: { source: "test", empty: "" },
    },
  });
  taro.getWindowInfo.mockReturnValue({
    windowWidth: 390,
    windowHeight: 844,
  });
  taro.getSystemInfoSync.mockReturnValue({ system: "iOS 17.0" });
  taro.login.mockImplementation(({ success }) =>
    success({ code: "login-code" }),
  );
  process.env.TARO_ENV = "h5";
});

test("reads page, parameter, environment, window, and system information", () => {
  expect(api.getCurrentPage()).toBe("/pages/profile/index");
  expect(api.getAllParams()).toEqual({ source: "test", empty: "" });
  expect(api.getQueryParam("source")).toBe("test");
  expect(api.getQueryParam("missing")).toBe("");
  expect(api.getEnv()).toBe("h5");
  expect(api.getWindowSize()).toEqual({
    width: 390,
    height: 844,
    ratio: 390 / 844,
    hwRatio: 844 / 390,
  });
  expect(api.getSystem()).toBe("iOS 17.0");
});

test("falls back safely when the current Taro instance is unavailable", () => {
  taro.getCurrentInstance.mockReturnValue(undefined);

  expect(api.getCurrentPage()).toBe("");
  expect(api.getAllParams()).toEqual({});
  expect(api.getQueryParam("source")).toBe("");
});

test("reports environment, browser, screen, and system predicates", () => {
  expect(api.isBrowser()).toBe(true);
  expect(api.isWeb()).toBe(true);
  expect(api.isH5()).toBe(true);
  expect(api.isPC()).toBe(true);
  expect(api.isMiniProgram()).toBe(false);
  expect(api.isWeapp()).toBe(false);
  expect(api.isWideScreen()).toBe(false);
  expect(api.isMiddleScreen()).toBe(false);
  expect(api.isLongScreen()).toBe(true);
  expect(api.isIOS()).toBe(true);
  expect(api.isAndroid()).toBe(false);

  process.env.TARO_ENV = "weapp";
  taro.getSystemInfoSync.mockReturnValue({ system: "Android 14" });
  expect(api.isMiniProgram()).toBe(true);
  expect(api.isWeapp()).toBe(true);
  expect(api.isBrowser()).toBe(false);
  expect(api.isAndroid()).toBe(true);
});

test("forwards toast, navigation, redirect, and scroll requests to Taro", () => {
  api.quickToast("Saved");
  api.quickNavigateTo("profile", { params: { userId: "42" } });
  api.quickRedirectTo("home");
  api.quickScrollTo("#profile", 500);

  expect(taro.showToast).toHaveBeenCalledWith({
    title: "Saved",
    icon: "none",
  });
  expect(taro.navigateTo).toHaveBeenCalledWith({
    url: "/pages/profile/index?userId=42",
  });
  expect(taro.redirectTo).toHaveBeenCalledWith({
    url: "/pages/home/index",
  });
  expect(taro.pageScrollTo).toHaveBeenCalledWith({
    selector: "#profile",
    duration: 500,
  });
});

test("resolves login codes and preserves Taro failures", async () => {
  await expect(api.getLoginCodeAsync()).resolves.toBe("login-code");

  const failure = new Error("Login unavailable");
  taro.login.mockImplementation(({ fail }) => fail(failure));
  await expect(api.getLoginCodeAsync()).rejects.toBe(failure);

  taro.login.mockImplementation(({ success }) => success({ code: "" }));
  await expect(api.getLoginCodeAsync()).rejects.toBe("fail");
});
