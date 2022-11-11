const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const wenjuan = db.collection('wenjuan')

  const openid = wxContext.OPENID

  // TODO: 根据用户查看时间倒序，分页查询
  const res = await wenjuan.where(_.or([
    { creator: openid },
    { updator: openid },
    { managers: openid },
    { members: { openid } },
  ])).get()

  return {
    errCode: 0,
    errMsg: '成功',
    data: res.data.map(item => ({
      id: item._id,
      name: item.name,
      desc: item.desc,
    })),
  }
}
