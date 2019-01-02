// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return '已废弃,该接口建议在小程序端请求'
  let { userInfo, newUser } = event
  let { OPENID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  if (!OPENID) {
    return {
      code: -1,
      msg: 'OPENID未获取',
      OPENID,
    }
  }else{
    newUser._openid = OPENID
  }
  if (!(newUser && newUser.nickName)) {
    return {
      code: -1,
      msg: '提交参数不足',
      newUser,
    }
  }
  try {
    const checkUser = await db.collection('qlz_user').where({
      _openid: OPENID // 填入当前用户 openid
    }).get();
    if(checkUser.errMsg!='collection.get:ok'){
      return {code:-1,msg:checkUser.errMsg}
    }
    if(checkUser.data && checkUser.data instanceof Array && checkUser.data.length>0){
      return {code: -1,msg: '该用户库中已存在'}
    }
    const addUserRes = await db.collection('qlz_user').add({
      // data 字段表示需新增的 JSON 数据
      data: newUser
    })
    if(addUserRes.errMsg!='collection.add:ok'){
      return {code:-1,msg:addUserRes.errMsg}
    }
    return {
      code: 200,
      msg: '添加成功',
      checkUser,
      newUser,
      addUserRes,
      userInfo,
    }
  } catch(e) {
    return {
      code: 500,
      e,
    }
  }

}