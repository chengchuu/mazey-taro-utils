export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Node environment used by the build output. */
      NODE_ENV?: "development" | "production";
      /** Current Taro build platform. */
      TARO_ENV?:
        | "weapp"
        | "swan"
        | "alipay"
        | "h5"
        | "rn"
        | "tt"
        | "quickapp"
        | "qq"
        | "jd";
    }
  }
}
