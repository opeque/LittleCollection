import { log, formatDateTime } from '../../utils/index'

const app = getApp<IAppOption>()

Page({
  data: {
    id: '',
    name: '',
    desc: '',
    startDate: '',
    endDate: '',
    shareImage: '',
    canIUseGetUserProfile: false,
    openid: '',
    invitor: '',
    inviteType: '',
    showInviteManager: false,
    showInviteMember: false,
    recordList: [],
  },

  onLoad(query) {
    const { id, invitor, type } = query
    const { openid } = app.globalData.userInfo
    this.setData({ id, openid })

    if (invitor && type) {
      this.setData({
        invitor,
        inviteType: type,
      })
    }

    if (wx.getUserProfile as any) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
  },

  onShow() {
    this.getWenJuanDetail()
    this.getRecords()
  },

  onShareAppMessage(e) {
    const { id, openid, shareImage }  = this.data
    if (e.from === 'button') {
      const { type } = e.target.dataset
      return {
        title: type === 'manager' ? '邀请你当问卷管理员': '邀请你参与问卷',
        path: `/pages/home/index?id=${id}&invitor=${openid}&type=${type}`,
        imageUrl: shareImage,
      }
    }

    return {
      title: '邀请你创建小问卷',
      path: '/pages/index/index',
      imageUrl: '',
    }
  },

  // 获取问卷详情
  getWenJuanDetail() {
    const { id, openid } = this.data

    if (!id) {
      wx.showToast({
        title: '无法获取问卷详情',
        icon: 'none',
      })
      log.error('问卷主页详情id为空')
      // 回到首页
      wx.reLaunch({
        url: '/pages/index/index',
      })
      return
    }

    wx.showLoading({
      title: '加载中~',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'getWenJuanDetailById',
      data: {
        id
      },
    }).then(({ result }: { result: any }) => {
      wx.hideLoading()

      if (result.errCode === 0) {
        this.setData({
          ...result.data,
          showInviteManager: result.data.creator === openid,
          showInviteMember: result.data.creator === openid ||
            (result.data.managers || []).includes(openid),
        })
      } else {
        wx.showToast({
          title: '出错啦，请重新进入再试',
          icon: 'none',
        })
      }
    }).catch((e) => {
      wx.hideLoading()
      wx.showToast({
        title: '出错啦，请重新进入再试',
        icon: 'none',
      })
      log.error('获取问卷详情出错', e)
    })
  },

  getUserProfile() {
    const { nickName } = app.globalData.userInfo
    if (!nickName) {
      wx.getUserProfile({
        desc: '用于显示参与信息',
        success: (res) => {
          wx.cloud.callFunction({
            name: 'updateUserInfo',
            data: res.userInfo,
          }).then(({ result }: { result: any }) => {
            if (result.errCode === 0) {
              app.globalData.userInfo = {
                ...app.globalData.userInfo,
                ...res.userInfo,
              }
            }
            this.joinWenJuan()
          })
        },
      })
    } else {
      this.joinWenJuan()
    }
  },

  getUserInfo(e: any) {
    console.log(e.detail.value)
  },

  joinWenJuan() {
    const { id, invitor, inviteType } = this.data

    if (!id) {
      wx.showToast({
        title: '问卷无效',
        icon: 'error',
      })
      return
    }

    if (invitor && inviteType) {
      wx.cloud.callFunction({
        name: 'joinWenJuan',
        data: {
          invitor,
          inviteType,
          id,
        },
      }).then(({ result }: { result: any }) => {
        if (result.errCode === 0) {
          wx.navigateTo({
            url: `/pages/question/index?id=${id}`,
          })
        }
      })
    } else {
      wx.navigateTo({
        url: `/pages/question/index?id=${id}`,
      })
    }
  },

  getRecords() {
    const { id } = this.data

    wx.cloud.callFunction({
      name: 'getAnswerList',
      data: {
        id,
      },
    }).then(({ result }: { result: any }) => {
      if (result.errCode === 0) {
        const list = result.data || []

        const { screenWidth } = app.globalData.systemInfo
        const maxWidth = 510 * (screenWidth / 750)
        const maxHeight = 200
        const radio = maxWidth / maxHeight

        const promises: Promise<any>[] = []

        list.forEach((item: any) => {
          item.createTime = formatDateTime(item.createTime)
          item.answerList?.forEach((answer: any) => {
            if (answer.type === 'image') {
              const p = wx.getImageInfo({
                src: answer.answer,
              }).then(({ width, height }) => {
                if (width > maxWidth) {
                  // 偏宽
                  if (width / height > radio) {
                    answer.width = maxWidth
                    answer.height = height / width * maxWidth
                  } else {
                    // 偏高
                    answer.width = width / height * maxHeight
                    answer.height = maxHeight
                  }
                } else if (height > maxHeight) {
                  // 偏高
                  answer.width = width / height * maxHeight
                  answer.height = maxHeight
                } else {
                  answer.width = width
                  answer.height = height
                }
              })
              promises.push(p)
            }
          })
        })

        Promise.all(promises).then(() => {
          this.setData({
            recordList: list,
          })
        })
      }
    })
  },

  previewImage(e: any) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: [url],
      showmenu: true,
    })
  },

  toMyRecords() {
    const { id } = this.data

    wx.navigateTo({
      url: `/pages/myRecords/index?id=${id}`
    })
  },
})
