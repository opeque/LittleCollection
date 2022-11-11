const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const db = cloud.database()
const _ = db.command
const log = cloud.logger()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '没有问卷id',
    }
  }

  const openid = wxContext.OPENID
  const answer = db.collection('wenjuan-answer')
  const user = db.collection('user')

  const { data: list } = await answer.where({
    wenjuan: id,
    creator: openid,
  }).orderBy('createTime', 'desc').get()

  const { data: userList } = await user.where({
    openid: _.in(list.map(item => item.creator))
  }).get()

  list.forEach(item => {
    const user = userList.find(u => u.openid === item.creator)
    if (user) {
      item.nickName = user.nickName
      item.avatarUrl = user.avatarUrl
    }
  })

  return {
    errCode: 0,
    errMsg: '成功',
    data: list,
  }
}
