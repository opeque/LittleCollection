import { log } from '../../../utils/index'

Page({
  data: {
    id: '',
    name: '',
    desc: '',
  },

  onLoad(query) {
    const { id, name, desc } = query
    this.setData({
      id,
      name,
      desc,
    })
  },

  editInput(e: any) {
    this.setData({
      name: e.detail.value
    })
  },

  editTextarea (e: any) {
    this.setData({
      desc: e.detail.value,
    })
  },

  async save() {
    let { id, name, desc } = this.data

    name = name.trim()
    desc = desc.trim()

    if (!name) {
      wx.showToast({
        title: '标题不能为空',
        icon: 'error'
      })
      return
    }

    // 创建
    if (!id) {
      let draft = wx.getStorageSync('wenjuan_draft')
      if (!draft) {
        draft = {}
      }
      wx.setStorageSync('wenjuan_draft', {
        ...draft,
        name,
        desc,
      })
      wx.navigateBack()
      return
    }

    wx.showLoading({
      title: '保存中~'
    })
    wx.cloud.callFunction({
      name: 'updateWenJuan',
      data: {
        id,
        name,
        desc,
      },
    }).then(({ result }: { result: any }) => {
      wx.hideLoading()
      if (result.errCode === 0) {
        wx.navigateBack()
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    })
    .catch((e) => {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'error',
      })
      log.error('保存问卷标题和描述异常', e)
    })
  },
})
