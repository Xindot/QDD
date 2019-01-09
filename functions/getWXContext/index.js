const env = ['dev-e2a464', 'prod-e2a464'][0]
console.log('env=>', env)

const cloud = require('wx-server-sdk')
cloud.init({
  env,
})

exports.main = async (event, context) => {
  const {
    OPENID,
    APPID,
    UNIONID,
  } = cloud.getWXContext()

  return {
    OPENID,
    APPID,
    UNIONID,
  }
}