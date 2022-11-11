const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const log = cloud.logger()
const db = cloud.database()
const _ = db.command
const now = db.serverDate()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id, qid } = event

  if (!id || !qid) {
    log.error({
      name: 'deleteWenJuanQuestionById',
      msg: `删除问卷问题出错, 参数id: ${id}, qid: ${qid}`,
    })
    return {
      errCode: 1,
      errMsg: '缺少问卷id参数或问题id参数',
    }
  }

  const doc = db.collection('wenjuan').doc(id)

  await doc.update({
    data: {
      questionList: _.pull({ qid }),
      updator: wxContext.OPENID,
      updateTime: now,
    },
  })

  return {
    errCode: 0,
    errMsg: '成功'
  }
}
