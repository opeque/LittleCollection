const logManager = wx.getRealtimeLogManager?.()

const logger = {
  info(...args: Array<any>) {
    if (!logManager) return

    logManager.info.apply(logManager, args)
  },

  warn(...args: Array<any>) {
    if (!logManager) return

    logManager.warn.apply(logManager, args)
  },

  error(...args: Array<any>) {
    if (!logManager) return

    logManager.error.apply(logManager, args)
  },

  setFilterMsg(msg: string) {
    if (!logManager || !logManager.setFilterMsg) return

    logManager.setFilterMsg(msg)
  },

  addFilterMsg(msg: string) {
    if (!logManager || !logManager.addFilterMsg) return

    logManager.addFilterMsg(msg)
  },
}

export default logger
