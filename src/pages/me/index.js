
const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips
const Version = app.globalData.Version
const disABFormat = app.disABFormat
const disABrate = app.globalData.disABrate || 0.5

Page({
  data: {
    Version,
    userInfo: null,
    tripTypes: [{
      label: '人找车',
    }, {
      label: '车找人',
    }],
    pubList: null,
    list2: ['意见或建议', '趣搭用户协议'],
  },
  onPullDownRefresh: function(){
    this.getUserInfo()
    this.getPubList()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },500)
  },
	onLoad() {
    this.getUserInfo()
    this.getPubList()
	},
  onShow() {},
  getUserInfo(){
    const OPENID = app.globalData.WXContext.OPENID
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_user').where({
      _openid: OPENID
    }).get().then(res => {
      // console.log(res)
      if (res.errMsg=== 'collection.get:ok'){
        const userInfo = res.data[0]
        this.setData({
          userInfo,
        })
        app.setWXUserInfo(userInfo)
      }
      wx.stopPullDownRefresh()
    })
  },
  // 获取行程列表
  getPubList() {
    const OPENID = app.globalData.WXContext.OPENID
    let query = {
      _openid: OPENID, 
      status: 1
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_pub').where(query).get().then(res => {
      // console.log(res)
      if (res.errMsg === 'collection.get:ok' && res.data instanceof Array) {
        let pubList = res.data || []
        pubList.forEach(n => {
          n.disABshow = disABFormat(n.disAB)
          n.disABmoney = '￥' + ((Number(n.disAB / 1000) * disABrate).toFixed(2))
        })
        this.setData({
          pubList,
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 设置我的行程
  pubMyTrip() {
    wx.navigateTo({
      url: '../pub/add/index'
    })
  },
  // 设置联系方式
  setContact(){
    const uid = this.data.userInfo._id
    wx.navigateTo({
      url: 'contact/index?uid=' + uid
    })
  },
  tips(text){
    wx.showModal({
      title: '',
      content: text,
      showCancel:false,
    })
  },
  goPage(e) {
    // console.log(e.currentTarget.dataset.text)
    var name = e.currentTarget.dataset.text
    switch(name){
      case '微信登录': this.wxNavTo('login/index'); break;
      case '意见或建议': this.wxNavTo('feedback/index'); break;
      case '趣搭用户协议': this.wxNavTo('about/index'); break;
      case '': this.tips('努力开发中...'); break;
    }
  },
  // 页面跳转
  wxNavTo(url) {
    const uid = this.data.userInfo._id
    if(uid){
      wx.navigateTo({
        url: url + '?uid=' + uid
      })
    }
  },
})