const app = getApp()

Page({
	data: {
    WXUserInfo: null,
    list1: ['行程管理'],
    list2: ['实名认证','意见或建议', '趣搭个车用户协议']
  },
  onPullDownRefresh: function(){
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },500)
  },
	onLoad() {

	},
  onShow() {
    // console.log(app.globalData.WXUserInfo)
    if(app.globalData.WXUserInfo && app.globalData.WXUserInfo.nickName){
      this.setData({
        WXUserInfo: app.globalData.WXUserInfo
      })
    }
  },
  addOneTrip(){
    this.wxNavTo('../pub/add/index')
  },
  tips: function(text){
    wx.showModal({
      title: '',
      content: text,
      showCancel:false,
    })
  },
  goPage: function(e) {
    // console.log(e.currentTarget.dataset.text)
    var name = e.currentTarget.dataset.text
    switch(name){
      case '微信登录': this.wxNavTo('login/index'); break;
      case '行程管理': this.wxNavTo('myWork/index'); break;
      case '实名认证': this.wxNavTo('myPlan/index'); break;
      case '意见或建议': this.wxNavTo('feedback/index'); break;
      case '趣搭用户协议': this.wxNavTo('about/index'); break;
      case '': this.tips('努力开发中...'); break;
    }
  },
  // 页面跳转
  wxNavTo: function(url) {
    wx.navigateTo({
      url: url
    })
  },
})