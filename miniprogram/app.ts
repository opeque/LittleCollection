import './init'

// 获取用户信息
function getUserInfo() {
  return wx.cloud.callFunction({
    name: 'getUserInfo',
  }).then(({ result }: { result: any }) => {
    if (result.errCode === 0) {
      return result.data
    }

    return {}
  })
}

App<IAppOption>({
  async onLaunch() {
    this.globalData.userInfo = await getUserInfo()
  },

  globalData: {
    userInfo: {},
    systemInfo: wx.getSystemInfoSync(),
  },
})
