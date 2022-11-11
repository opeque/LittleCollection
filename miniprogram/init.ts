import { log } from './utils/index'
import config from './config'

// 云开发初始化
wx.cloud.init({
  env: config.cloud,
  traceUser: true,
})

wx.getNetworkType()
  .then(({ networkType }) => {
    const systemInfo = wx.getSystemInfoSync()
    log.info(networkType, systemInfo)
  })

// 更新小程序版本
const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate(({ hasUpdate }) => {
  if (hasUpdate) {
    log.info('小程序版本有更新!')
  }
})

updateManager.onUpdateReady(() => {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success(res) {
      if (res.confirm) {
        updateManager.applyUpdate()
      }
    },
  })
})

updateManager.onUpdateFailed((err) => {
  log.error('小程序版本更新失败：', err.errMsg)
})
