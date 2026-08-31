/**
 * @author Cheng
 */
import {
  showToast,
  getWindowInfo,
  getSystemInfoSync,
  getCurrentInstance,
  navigateTo,
  redirectTo,
  login,
  pageScrollTo,
} from "@tarojs/taro";
import { convertObjectToQuery, getBrowserInfo } from "mazey";

/**
 * ZH: 获取当前页面的路径。
 *
 * EN: Get the path of the current page.
 */
export const getCurrentPage = () => {
  const ins = getCurrentInstance();
  let page = "";
  if (ins && ins.router && ins.router.path) {
    page = ins.router.path;
  }
  if (page && page.indexOf("?") > -1) {
    const arr = page.split("?");
    if (arr.length === 2 && arr[0]) {
      page = arr[0];
    }
  }
  return page;
};

/**
 * ZH: 获取当前页面的所有参数。
 *
 * EN: Get all params of the current page.
 */
export const getAllParams = () => {
  const ins = getCurrentInstance();
  if (ins && ins.router && ins.router.params) {
    return ins.router.params;
  }
  return {};
};

/**
 * ZH: 获取当前路径（Taro）的查询参数的值。
 *
 * EN: Get the query param's value of the current path(Taro).
 */
export const getQueryParam = (name: string) => {
  const allParams = getAllParams();
  return allParams[name] || "";
};

/**
 * ZH: 获取当前窗口的尺寸。
 *
 * EN: Get the size of the current window.
 */
export const getWindowSize = () => {
  const { windowHeight, windowWidth } = getWindowInfo();
  const widthHeightRatio = windowWidth / windowHeight;
  const hwRatio = windowHeight / windowWidth;
  return {
    width: windowWidth,
    height: windowHeight,
    ratio: widthHeightRatio,
    hwRatio,
  };
};

/**
 * ZH: 获取当前系统信息，如 "iOS 14.4"。
 *
 * EN: Get the current system information.
 */
export const getSystem = () => {
  const { system } = getSystemInfoSync();
  return system;
};

/**
 * ZH: 获取当前构建的平台，如 weapp、swan、alipay、h5、rn、tt、quickapp、qq、jd。
 *
 * EN: Get the current platform, such as weapp, swan, alipay, h5, rn, tt, quickapp, qq, jd.
 */
export const getEnv = (): string => {
  return process.env.TARO_ENV || "";
};

/**
 * ZH: 调用接口获取登录凭证（code）。
 *
 * EN: Call the interface to get the login credential (code).
 *
 * @see https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
 */
export const getLoginCodeAsync = async () => {
  const res = await new Promise<string>((resolve, reject) => {
    login({
      success: (res) => {
        resolve(res.code);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
  const code = res || "";
  if (!code) {
    return Promise.reject("fail");
  }
  return code;
};

/**
 * ZH: 是否是微信小程序环境。
 *
 * EN: Is it a WeChat Mini Program environment.
 */
export const isMiniProgram = (): boolean => {
  return process.env.TARO_ENV === "weapp";
};

/**
 * Alias of `isMiniProgram`.
 */
export const isWeapp = (): boolean => {
  return isMiniProgram();
};

/**
 * ZH: 是否是浏览器环境。
 *
 * EN: Is it a browser environment.
 */
export const isBrowser = (): boolean => {
  return process.env.TARO_ENV === "h5";
};

/**
 * Alias of `isBrowser`.
 */
export const isWeb = (): boolean => {
  return isBrowser();
};

/**
 * Alias of `isBrowser`.
 */
export const isH5 = (): boolean => {
  return isBrowser();
};

/**
 * ZH: 是否是 PC 端浏览器环境。
 *
 * EN: Is it a PC browser environment.
 */
export const isPC = (): boolean => {
  if (isH5()) {
    const info = getBrowserInfo();
    if (info.platform === "desktop") {
      return true;
    }
  }
  return false;
};

/**
 * ZH: 是否是宽屏设备。
 *
 * EN: Is it a wide screen device.
 */
export const isWideScreen = (): boolean => {
  const { ratio } = getWindowSize();
  if (ratio > 0.7) {
    return true;
  }
  return false;
};

/**
 * Alias of `isWideScreen`.
 */
export const isMiddleScreen = (): boolean => {
  return isWideScreen();
};

/**
 * ZH: 是否是长屏设备。
 *
 * EN: Is it a long screen device.
 */
export const isLongScreen = (): boolean => {
  const { hwRatio } = getWindowSize();
  if (hwRatio > 1.9) {
    return true;
  }
  return false;
};

/**
 * ZH: 是否是 iOS 系统。
 *
 * EN: Is it an iOS system.
 */
export const isIOS = (): boolean => {
  const system = getSystem();
  if (system.toLowerCase().indexOf("ios") > -1) {
    return true;
  }
  return false;
};

/**
 * ZH: 是否是 Android 系统。
 *
 * EN: Is it an Android system.
 */
export const isAndroid = (): boolean => {
  const system = getSystem();
  if (system.toLowerCase().indexOf("android") > -1) {
    return true;
  }
  return false;
};

/**
 * ZH: 快速显示一个 Toast 提示。
 *
 * EN: Quickly show a Toast.
 */
export const quickToast = (msg: string): void => {
  showToast({
    title: msg,
    icon: "none",
  });
};

/**
 * ZH: 快速跳转到指定页面。
 *
 * EN: Quickly navigate to a page.
 */
export const quickNavigateTo = (page: string, { params = {} } = {}): void => {
  const queryStr = convertObjectToQuery(params);
  navigateTo({
    url: `/pages/${page}/index${queryStr}`,
  });
};

/**
 * ZH: 快速重定向到指定页面。
 *
 * EN: Quickly redirect to a page.
 */
export const quickRedirectTo = (page: string, { params = {} } = {}): void => {
  const queryStr = convertObjectToQuery(params);
  redirectTo({
    url: `/pages/${page}/index${queryStr}`,
  });
};

/**
 * ZH: 快速滚动到指定元素。
 *
 * EN: Quickly scroll to a specified element.
 */
export const quickScrollTo = (selector: string, duration = 300): void => {
  pageScrollTo({
    selector,
    duration,
  });
};
