const app = getApp()

Page({
  data: {
    tips: {
      text: '请完成微信授权以继续使用',
      btn: '授权微信用户信息'
    },
    visible: true,
  },
  onLoad(options) {
    // Do some initialize when page load.
  },
  onReady() {
    // Do something when page ready.
  },
  onShow() {
    // Do something when page show.
  },
  onHide() {
    // Do something when page hide.
  },
  onUnload() {
    // Do something when page close.
  },
  onPullDownRefresh() {
    // Do something when pull down
  },
  // Event handler.
  onGotUserInfo(e){
    // console.log(e.detail)
    if(e.detail.errMsg=='getUserInfo:ok'){
      try {
        const WXUserInfo = e.detail.userInfo
        app.setWXUserInfo(WXUserInfo)
        // 同步用户数据到数据库
        app.addUserToDB()
      } catch (e) {
        console.error(e)
      }
    }
  },
})