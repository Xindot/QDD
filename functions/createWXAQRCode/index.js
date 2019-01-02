// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const superagent = require('superagent')

// 云函数入口函数
exports.main = async (event, context) => {
  return '暂未开放'
  const gATData = await cloud.callFunction({
    // 要调用的云函数名称
    name: 'getAccessToken',
    // 传递给云函数的参数
    data: {}
  })
  if (gATData.errMsg =='callFunction:ok' && gATData.result){
    const access_token = gATData.result.access_token || ''
    const url = `https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=${access_token}`
    const sData = {
      access_token,
      path: 'page/work/index',
      // width:''
    }
    return await superagent.post(url).send(JSON.stringify(sData)).then(res => {
      return res.body
    }).catch(err => {
      return err
    })
  }else{
    return gATData
  }
}