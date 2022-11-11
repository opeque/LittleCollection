import { log } from '../../utils/index'

const app = getApp<IAppOption>()

Component({
  data: {
    list: [],
  },

  methods: {
    onShow() {
      this.getMyWenJuanList()
    },

    onShareAppMessage(e: WechatMiniprogram.Page.IShareAppMessageOption) {
      return {
        title: '邀请你创建小问卷',
        path: '/pages/index/index',
        imageUrl: '',
      }
    },

    async getMyWenJuanList() {
      wx.cloud.callFunction({
        name: 'getMyWenJuanList',
      }).then(({ result }: { result: any }) => {
        if (result?.errCode === 0) {
          this.setData({
            list: result.data,
          })
        }
      })
    },

    async toCreate() {
      if (!app.globalData.userInfo.nickName) {
        wx.getUserProfile({
          desc: '用于显示问卷创建人信息',
          success: ({ userInfo }) => {
            wx.cloud.callFunction({
              name: 'updateUserInfo',
              data: userInfo,
            }).then(({ result }: { result: any }) => {
              if (result.errCode === 0) {
                app.globalData.userInfo = {
                  ...app.globalData.userInfo,
                  ...userInfo,
                }
              }
              wx.navigateTo({
                url: '/edit/pages/index',
              })
            })
          },
        })
      } else {
        wx.navigateTo({
          url: '/edit/pages/index',
        })
      }
    },

    toDetail(e: any) {
      const { id } = e.currentTarget.dataset

      if (!id) {
        wx.showToast({
          title: '已失效~',
          icon: 'none',
        })
        log.error('点击去问卷首页出错，没有有效的问卷id')
        return
      }

      wx.navigateTo({
        url: `/pages/home/index?id=${id}`
      })
    },
  },
})
