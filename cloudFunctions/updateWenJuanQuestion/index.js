const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const db = cloud.database()
const now = db.serverDate()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id, qid, userInfo, ...rest } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '缺少问卷id参数',
    }
  }

  const wenjuan = db.collection('wenjuan')

  if (qid) {
    await wenjuan.where({
      _id: id,
      'questionList.qid': qid,
    }).update({
      data: {
        'questionList.$': {
          qid,
          ...rest,
        },
        updator: wxContext.OPENID,
        updateTime: now,
      },
    })
  } else {
    let qid = ''
    const az = 'abcdefghijklmnopqrstuvwxyz'
    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * az.length)
      qid += az[random]
    }
    await wenjuan.doc(id).update({
      data: {
        questionList: _.push({
          qid,
          ...rest,
        }),
        updator: wxContext.OPENID,
        updateTime: now,
      },
    })
  }

  return {
    errCode: 0,
    errMsg: '成功',
  }
}
