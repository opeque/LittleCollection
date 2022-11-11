const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { data: user } = await db.collection('user').where({
    openid: wxContext.OPENID,
  }).get()

  let userInfo = {}

  if (user[0]) {
    userInfo = user[0]
  }

  return {
    errCode: 0,
    errMsg: '成功',
    data: {
      openid: wxContext.OPENID,
      ...userInfo,
    },
  }
}
