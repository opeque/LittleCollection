const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id, invitor, inviteType } = event

  if (!id) {
    return {
      errCode: 1,
      errMsg: '没有问卷id',
    }
  }

  const openid = wxContext.OPENID

  const wenjuan = db.collection('wenjuan').doc(id)
  const { data } = await wenjuan.get()
  const { creator, managers, members } = data

  if (
    inviteType === 'manager' &&
    invitor === creator &&
    !managers.includes(openid)
  ) {
    await wenjuan.update({
      data: {
        managers: [...managers, openid],
        members: members.findIndex(item => item.openid === openid) === -1 ?
          [...members,
          {
            openid,
            super: invitor,
          }] :
          members,
      },
    })
  }

  if (
    inviteType === 'member' &&
    (invitor === creator || managers.includes(invitor)) &&
    members.findIndex(item => item.openid === openid) === -1
  ) {
    members.push({
      openid,
      super: invitor,
    })
    await wenjuan.update({
      data: {
        members,
      },
    })
  }

  return {
    errCode: 0,
    errMsg: '成功',
  }
}
