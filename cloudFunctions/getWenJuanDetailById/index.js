const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const log = cloud.logger()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { id } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '缺少问卷id参数',
    }
  }

  const doc = await db.collection('wenjuan').doc(id).get()
  log.info(doc.data)

  return {
    errCode: 0,
    errMsg: '成功',
    data: doc.data,
  }
}
