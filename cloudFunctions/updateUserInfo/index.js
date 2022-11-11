const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const log = cloud.logger()
const db = cloud.database()

exports.main = async (event, context) => {
  const { userInfo, ...rest } = event

  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const user = db.collection('user')

  const { data: info } = await user.where({ openid }).get()

  let res = {}
  if (info.length > 0) {
    // 更新用户资料
    res = await user.where({ openid }).update({
      data: {
        ...rest,
      },
    })

    log.info({
      openid,
      updateUserInfo: event,
    })
  } else {
    // 新增用户
    res = await user.add({
      data: {
        openid,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
        ...rest,
      },
    })

    log.info({
      opeinid,
      newUser: event,
    })
  }

  return {
    errCode: 0,
    errMsg: '成功',
    data: {
      id: res._id || '',
    },
  }
}
