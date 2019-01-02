const qiniu = require('qiniu')
const moment = require('moment')

//需要填写你的 Access Key 和 Secret Key
const d6h5_key={
  accessKey:'UtR9-061L8qFst2lvhiBR9Tc9E_u3sprXyOnTbSS',
  secretKey:'huy_QYClFu6AEjVqc24cwX_98UjtWjKczjIAcjpF'
}
const d6h5_mac = new qiniu.auth.digest.Mac(d6h5_key.accessKey, d6h5_key.secretKey);
const d6h5_C={
  bucket:'d-6h5',
  origin:'https://img.6h5.cn/'
}

// 获取上传uptoken
// 云函数入口函数
exports.main = async (event, context) => {
  const { clientTime } = event

  const get_options = {
    scope: d6h5_C.bucket,
    expires: 3600 * 24 * 7   //自定义上传凭证有效期（1小时=3600，expires单位为秒，为上传凭证的有效时间）7天
  }
  const putPolicy = new qiniu.rs.PutPolicy(get_options)
  const uploadToken = putPolicy.uploadToken(d6h5_mac);

  const serverTime = new Date().getTime()
  const timeA = serverTime
  const timeB = timeA + get_options.expires * 1000

  return {
    code: 200,
    msg: 'success',
    result:{
      uptoken: uploadToken,
      origin: d6h5_C.origin,
      expires: {
        timeA: moment(timeA).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss'),
        timeB: moment(timeB).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }
}