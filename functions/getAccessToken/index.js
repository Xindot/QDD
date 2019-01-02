const superagent = require('superagent')
const moment = require('moment')

const QLZ = {
  APPID: 'wxebdf16d05e5efaa7',
  APPSECRET: '2c7b165971c799a2cd8d31822250b412'
}
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${QLZ.APPID}&secret=${QLZ.APPSECRET}`

// 云函数入口函数
exports.main = async (event, context) => {
  const rData = await superagent.get(url).then(res=>{
    return JSON.parse(res.text)
  }).catch(err=>{
    return err
  })
  const expires_in = Number(rData.expires_in||'')
  if (expires_in && expires_in > 0){
    const timeA = new Date().getTime()
    const timeB = timeA + expires_in * 1000
    rData.expires_time = [
      moment(timeA).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss'),
      moment(timeB).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss')
    ]
  }
  return rData
}