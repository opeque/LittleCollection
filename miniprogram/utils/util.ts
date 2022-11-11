// 今天
function today() {
  const date = new Date()

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${month}-${day}`
}

// 格式化日期时间
function formatDateTime(time: string) {
  const date = new Date(time)

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export {
  today,
  formatDateTime,
}
