import { log } from '../../utils/index'

Page({
  data: {
    id: '',
    name: '',
    desc: '',
    questionList: [],
    startDate: '',
    endDate: '',
    shareImage: '',
  },

  onLoad({ id }) {
    if (id) {
      this.setData({ id })
    }
  },

  onShow() {
    if (this.data.id) {
      this.getWenJuanDetail()
    } else {
      let draft = wx.getStorageSync('wenjuan_draft')
      if (!draft) {
        draft = {}
      }
      this.setData(draft)
    }
  },

  // 获取问卷详情
  getWenJuanDetail() {
    const { id } = this.data

    if (!id) {
      wx.showToast({
        title: '无法获取问卷详情',
        icon: 'none',
      })
      log.error('编辑页问卷详情id为空')
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

  toEditTitle() {
    const { id, name, desc } = this.data
    wx.navigateTo({
      url: `/edit/pages/title/title?id=${id}&name=${name}&desc=${desc}`,
    })
  },

  toEditQuestion(e: any) {
    const { id } = this.data
    const { qid, type, name, ismust } = e.currentTarget.dataset

    wx.navigateTo({
      url: `/edit/pages/question/question?id=${id}&qid=${qid}&type=${type}&name=${name}&isMust=${ismust}`,
    })
  },

  deleteQuestion(e: any) {
    const { id, questionList } = this.data
    const { qid, name } = e.currentTarget.dataset

    wx.showModal({
      title: '确定删除吗？',
      content: '删除后该问题将无法恢复！',
      success: (res) => {
        if (res.confirm) {
          if (!id) {
            this.setData({
              questionList: questionList.filter((item: any) => item.name !== name)
            })
            return
          }

          wx.showLoading({
            title: '删除中~',
            mask: true,
          })
          wx.cloud.callFunction({
            name: 'deleteWenJuanQuestionById',
            data: {
              id,
              qid,
            },
          })
          .then(({ result }: { result: any }) => {
            wx.hideLoading()
            if (result.errCode === 0) {
              this.setData({
                questionList: questionList.filter((item: any) => item.qid !== qid)
              })
            } else {
              wx.showToast({
                title: '删除异常，请稍后重试~',
                icon: 'none',
              })
            }
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({
              title: '删除异常，请稍后重试~',
              icon: 'none'
            })
            log.error('删除问卷问题异常', { id, qid, err })
          })
        }
      },
    })
  },

  addQuestion() {
    const { id } = this.data
    wx.navigateTo({
      url: `/edit/pages/question/question?id=${id}`
    })
  },

  changeStartDate(e: any) {
    const { id } = this.data
    const startDate = e.detail.value

    if (!id) {
      this.setData({ startDate })
      return
    }

    wx.cloud.callFunction({
      name: 'updateWenJuan',
      data: {
        id,
        startDate,
      },
    }).then(({ result }: { result: any }) => {
      if (result.errCode === 0) {
        this.setData({ startDate })
      }
    }).catch((err) => {
      wx.showToast({
        title: '问卷开始日期设置异常',
        icon: 'none',
      })
      log.error('问卷开始日期设置异常', { err })
    })
  },

  changeEndDate(e: any) {
    const { id } = this.data
    const endDate = e.detail.value

    if (!id) {
      this.setData({ endDate })
      return
    }

    wx.cloud.callFunction({
      name: 'updateWenJuan',
      data: {
        id,
        endDate,
      },
    }).then(({ result }: { result: any }) => {
      if (result.errCode === 0) {
        this.setData({ endDate })
      }
    }).catch((err) => {
      wx.showToast({
        title: '问卷结束日期设置异常',
        icon: 'none',
      })
      log.error('问卷结束日期设置异常', { err })
    })
  },

  chooseShareImage() {
    const { id } = this.data

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: ({ tempFiles }) => {
        const path = tempFiles[0].tempFilePath

        if (!id) {
          this.setData({
            shareImage: path,
          })
          return
        }

        this.uploadImage(path, (fileID) => {
          wx.cloud.callFunction({
            name: 'updateWenJuan',
            data: {
              id,
              shareImage: fileID,
            },
          }).then(({ result }: { result: any }) => {
            if (result.errCode === 0) {
              this.setData({ shareImage: fileID })
            }
          }).catch((err) => {
            wx.showToast({
              title: '上传图片异常',
              icon: 'none',
            })
            log.error('更新问卷分享图url异常', { err })
          })
        })
      },
    })
  },

  uploadImage(path: string, cb?: (fileID: string) => void) {
    const imgName = path.split('/').pop()
    wx.cloud.uploadFile({
      cloudPath: `wenjuan/shareImage/${imgName}`,
      filePath: path,
      success: ({ fileID }) => {
        cb && cb(fileID)
      },
    })
  },

  save() {
    const { id, name, questionList, shareImage } = this.data

    if (!name) {
      wx.showToast({
        title: '必须填写问卷标题',
        icon: 'none',
      })
      return
    }

    if (questionList.length === 0) {
      wx.showToast({
        title: '必须有至少一个问题',
        icon: 'none',
      })
      return
    }

    wx.showModal({
      title: '确定保存吗？',
      content: '保存后无法修改',
      success: (res) => {
        if (res.confirm) {
          // 创建
          if (!id) {
            if (shareImage) {
              wx.showLoading({
                title: '上传分享图片',
                mask: true,
              })
              this.uploadImage(shareImage, (fileID) => {
                wx.hideLoading()
                this.createWenJuan(fileID)
              })
            } else {
              this.createWenJuan()
            }

            return
          }

          wx.redirectTo({
            url: `/pages/home/index?id=${id}`
          })
        }
      },
    })
  },

  createWenJuan(shareImage: string = '') {
    const { name, desc, questionList, startDate, endDate } = this.data

    wx.showLoading({
      title: '创建中~',
    })
    wx.cloud.callFunction({
      name: 'addWenJuan',
      data: {
        name,
        desc,
        questionList,
        startDate,
        endDate,
        shareImage,
      },
    }).then(({ result }: { result: any }) => {
      wx.hideLoading()
      if (result.errCode === 0) {
        this.setData({
          id: result?.data?.id
        })
        wx.removeStorage({
          key: 'wenjuan_draft',
          success() {
            wx.redirectTo({
              url: `/pages/home/index?id=${result?.data?.id}`
            })
          },
        })
      }
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '创建异常',
        icon: 'error',
      })
      log.error('创建新问卷出错', { err })
    })
  },
})
