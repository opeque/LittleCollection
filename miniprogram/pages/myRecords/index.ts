import { formatDateTime } from '../../utils/index'

const app = getApp<IAppOption>()

Page({
  data: {
    id: '',
    recordList: [],
  },

  onLoad(query) {
    const { id } = query
    this.setData({ id })
  },

  onShow() {
    this.getRecords()
  },

  getRecords() {
    const { id } = this.data

    wx.cloud.callFunction({
      name: 'getMyAnswerList',
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
})
