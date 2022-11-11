const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const now = db.serverDate()

// TODO: 更新权限控制，更新者昵称，头像
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id, userInfo, ...rest } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '缺少问卷id参数',
    }
  }

  const doc = db.collection('wenjuan').doc(id)

  await doc.update({
    data: {
      ...rest,
      updator: wxContext.OPENID,
      updateTime: now,
    },
  })

  return {
    errCode: 0,
    errMsg: '成功',
  }
}
