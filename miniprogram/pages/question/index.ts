import { log } from '../../utils/index'

Page({
  data: {
    id: '',
    questionList: [] as any[],
  },

  onLoad(query) {
    const { id } = query
    this.setData({ id })

    this.getWenJuanDetail()
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

  changeInput(e: any) {
    const { questionList } = this.data
    const { qid } = e.currentTarget.dataset
    const val = e.detail.value

    questionList.forEach((item) => {
      if (item.qid === qid) {
        item.answer = val
      }
    })

    this.setData({ questionList: [...questionList] })
  },

  chooseImg(e: any) {
    const { questionList } = this.data
    const { qid } = e.currentTarget.dataset

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: ({ tempFiles }) => {
        const path = tempFiles[0].tempFilePath

        questionList.forEach((item) => {
          if (item.qid === qid) {
            item.answer = path
          }
        })

        this.setData({
          questionList: [...questionList],
        })
      },
    })
  },

  save() {
    const { id, questionList } = this.data

    let completed = true

    questionList.forEach((item) => {
      if (item.type === 'text') {
        item.answer = (item.answer || '').trim()
      }

      if (item.isMust === 1 && !item.answer) {
        completed = false
      }
    })

    if (!completed) {
      wx.showToast({
        title: '请填写完整后再提交',
        icon: 'none',
      })
      return
    }

    const promises: Promise<void>[] = []
    questionList.forEach((item) => {
      if (item.type === 'image') {
        const p = this.uploadImg(item.answer, item.qid)
        promises.push(p)
      }
    })

    Promise.all(promises).then(() => {
      const answerList = this.data.questionList.map((item: any) => {
        if (item.type === 'image') {
          const { fileID, ...restItem } = item
          return {
            ...restItem,
            answer: fileID,
          }
        }
        return item
      })
      wx.cloud.callFunction({
        name: 'updateAnswer',
        data: {
          id,
          answerList,
        },
      }).then(({ result }: { result: any }) => {
        if (result.errCode === 0) {
          wx.showToast({
            title: '提交成功',
            icon: 'none',
          })
          wx.navigateBack()
          return
        }

        wx.showToast({
          title: '提交异常，请稍后再试',
          icon: 'error',
        })
      }).catch((err) => {
        wx.showToast({
          title: '提交异常，请稍后再试',
          icon: 'error',
        })
        log.error('用户回答问卷异常', { err })
      })
    })
  },

  uploadImg(path: string, qid: string) {
    const { questionList } = this.data
    const imgName = path.split('/').pop()

    return wx.cloud.uploadFile({
      cloudPath: `wenjuan/answer/${imgName}`,
      filePath: path,
    }).then(({ fileID }) => {
      questionList.forEach((item) => {
        if (item.qid === qid) {
          item.fileID = fileID
        }
      })

      this.setData({ questionList: [...questionList] })
    })
  },
})
