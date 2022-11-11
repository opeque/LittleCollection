const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const _ = db.command
const now = db.serverDate()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id, answerId, answerList } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '没有问卷id',
    }
  }

  const openid = wxContext.OPENID

  const answer = db.collection('wenjuan-answer')

  let res = {}
  if (answerId) {
    res = await answer
      .where({
        _id: answerId,
        wenjuan: id,
      })
      .update({
        data: {
          answerList: _.set(answerList),
          updator: openid,
          updateTime: now,
        },
      })
  } else {
    res = await answer.add({
      data: {
        wenjuan: id,
        answerList,
        creator: wxContext.OPENID,
        createTime: now,
        updator: null,
        updateTime: null,
      },
    })
  }

  return {
    errCode: 0,
    errMsg: '成功',
    data: {
      id: res._id || '',
    }
  }
}
