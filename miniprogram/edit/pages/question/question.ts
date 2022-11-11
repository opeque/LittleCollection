import { log } from '../../../utils/index'

Page({
  data: {
    typeList: [
      { value: 'text', name: '文本' },
      { value: 'image', name: '图片' },
    ],
    id: '',
    qid: '',
    name: '',
    typeIndex: 0,
    isMust: true,
    editIndex: -1,
  },

  onLoad(query) {
    const { id, qid, type, name, isMust } = query
    const { typeList } = this.data
    this.setData({
      id,
    })

    if (qid || type || name || isMust) {
      const index = typeList.findIndex(item => item.value === type)
      this.setData({
        qid,
        typeIndex: index === -1 ? 0 : index,
        name,
        isMust: isMust === '1',
      })
    }

    // 创建问卷时编辑问题
    if (!id && name) {
      let draft = wx.getStorageSync('wenjuan_draft')
      if (!draft) {
        draft = {}
      }
      const questionList = draft.questionList || []
      const editIndex = questionList.findIndex((item: any) => item.name === name)
      this.setData({
        editIndex,
      })
    }
  },

  changeName(e: any) {
    this.setData({
      name: e.detail.value,
    })
  },

  changeType(e: any) {
    const i = +e.detail.value
    this.setData({
      typeIndex: i,
    })
  },

  changeMust(e: any) {
    this.setData({
      isMust: e.detail.value,
    })
  },

  save() {
    const { typeList, id, qid, typeIndex, isMust, editIndex } = this.data
    let { name } = this.data

    name = name.trim()

    if (!name) {
      wx.showToast({
        title: '名称不能为空',
        icon: 'error'
      })
      return
    }

    // 创建问卷时
    if (!id) {
      let draft = wx.getStorageSync('wenjuan_draft')
      if (!draft) {
        draft = {}
      }
      const questionList = draft.questionList || []
      const question = {
        name,
        type: typeList[typeIndex].value,
        isMust: isMust ? 1 : 0,
      }
      // 编辑问题
      if (editIndex > -1) {
        questionList[editIndex] = question
      } else {
        // 新增问题
        questionList.push(question)
      }
      wx.setStorageSync('wenjuan_draft', {
        ...draft,
        questionList,
      })
      wx.navigateBack()
      return
    }

    wx.showLoading({
      title: '保存中~',
      mask: true,
    })
    wx.cloud.callFunction({
      name: 'updateWenJuanQuestion',
      data: {
        id,
        qid,
        name,
        type: typeList[typeIndex].value,
        isMust: isMust ? 1 : 0,
      },
    }).then(({ result }: { result: any }) => {
      wx.hideLoading()
      if (result.errCode === 0) {
        wx.showToast({
          title: '保存成功~',
          icon: 'none',
        })
        wx.navigateBack()
      }
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败，请稍后重试',
        icon: 'error',
      })
      log.error('保存问题异常', { err })
    })
  },
})
