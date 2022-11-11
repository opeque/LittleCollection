/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo: Partial<WechatMiniprogram.UserInfo> & { openid?: string; };
    systemInfo: WechatMiniprogram.SystemInfo;
    [key: string]: unknown;
  }
}
