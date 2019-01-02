// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

Array.prototype.remove = function (val) {
  let index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  return '已废弃,该接口建议在小程序端请求'
  const { wsId, openId } = event
  if (!wsId) {
    return { code: -1, msg:'wsId不能为空'}
  }
  if (!openId) {
    return { code: -1, msg: 'openId不能为空' }
  }
  try {
    const wsRes = await db.collection('qlz_work_submit').doc(wsId).get()
    if (wsRes.errMsg==="document.get:ok") {
      let likeUserList = wsRes.data.likeUserList
      if(!(likeUserList instanceof Array)){
        likeUserList = []
      }
      if (likeUserList.length > 0 && likeUserList.indexOf(openId) >= 0) {
        // '已点过赞'
        likeUserList.remove(openId)
        const result = await db.collection('qlz_work_submit').doc(wsId).update({
          data: {
            likeUserList,
          }
        })
        if (result.errMsg ==='document.update:ok'){
          return { code: 200, msg:'取消点赞成功',like:false}
        } else {
          return { code: -1, msg:'取消点赞失败'}
        }
      } else {
        // '未点过赞'
        likeUserList.push(openId)
        const result = await db.collection('qlz_work_submit').doc(wsId).update({
          data: {
            likeUserList,
          }
        })
        if (result.errMsg === 'document.update:ok') {
          return { code: 200, msg: '点赞成功', like: true }
        } else {
          return { code: -1, msg: '点赞失败' }
        }
      }
    } else {
      return { code: -1, msg: wsRes.errMsg }
    }
  } catch (e) {
    console.error(e)
    return { code: -1, msg: e }
  }
}