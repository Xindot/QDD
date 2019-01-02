const app = getApp()

Page({
	data: {
    WXUserInfo: null,
    list1: ['作业管理', '计划管理', '笔墨圈'],
    list2: ['代表作', '我的字豆', '意见或建议', '关于趣练字', '设置']
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
      case '作业管理': this.wxNavTo('myWork/index'); break;
      case '计划管理': this.wxNavTo('myPlan/index'); break;
      case '笔墨圈': this.wxNavTo('bimoim/index'); break;
      case '代表作': this.wxNavTo('mySubmitA/index'); break;
      case '我的字豆': this.wxNavTo('myZidou/index'); break;
      case '意见或建议': this.wxNavTo('feedback/index'); break;
      case '关于趣练字': this.wxNavTo('about/index'); break;
      case '设置': this.wxNavTo('setting/index'); break;
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