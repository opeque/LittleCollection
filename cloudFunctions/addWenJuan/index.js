const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()

// TODO: 创建者昵称，头像
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const now = db.serverDate()

  const { userInfo, questionList, ...rest } = event

  if (questionList.length > 0) {
    questionList.forEach((item) => {
      item.qid = getRandomString()
    })
  }

  const wenjuan = db.collection('wenjuan')

  const { _id } = await wenjuan.add({
    data: {
      ...rest,
      questionList: questionList || [],
      creator: wxContext.OPENID,
      createTime: now,
      updator: null,
      updateTime: null,
      // 管理员
      managers: [],
      // 参与者
      members: [],
    },
  })

  return {
    errCode: 0,
    errMsg: '成功',
    data: {
      id: _id,
    },
  }
}

function getRandomString(len = 3) {
  let s = ''
  const az = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < len; i++) {
    const random = Math.floor(Math.random() * az.length)
    s += az[random]
  }
  return s
}
