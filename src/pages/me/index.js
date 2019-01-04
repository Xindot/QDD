const util = require('../../utils/util')

const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips
const Version = app.globalData.Version

Page({
  data: {
    Version,
    nowTime: util.formatTime(new Date(), '-:2'),
    pageName: 'me',
    userInfo: null,
    tripTypes: [{
      label: '人找车',
    }, {
      label: '车找人',
    }],
    myPubList: null,
    list2: ['意见或建议', '用户使用须知'],
    contactList: [{
      label: '手机号',
      key: 'phone',
    }, {
      label: '微信号',
      key: 'otherContact',
    }],
  },
  onPullDownRefresh: function(){
    this.getUserInfo()
    this.getMyPubList()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },500)
  },
	onLoad() {
    this.getUserInfo()
    this.getMyPubList()
	},
  onShow() {
    this.getUserInfo()
    this.getMyPubList()
  },
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
  getMyPubList() {
    const OPENID = app.globalData.WXContext.OPENID
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_pub').where({
      _openid: OPENID,
      status: 1
    }).orderBy('tripTime', 'asc').get().then(res => {
      // console.log(res)
      if (res.errMsg === 'collection.get:ok' && res.data instanceof Array) {
        let myPubList = res.data || []
        myPubList.forEach(n => {
          n.disABshow = app.disABFormat(n.disAB)
          const disABrate = app.globalData.disABrate || 0.5
          n.disABmoney = '￥' + ((Number(n.disAB / 1000) * disABrate).toFixed(2))
        })
        this.setData({
          myPubList,
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  targetDetail(e){
    console.log(e)
    const pid = e.currentTarget.id
    const openid = e.currentTarget.dataset.openid
    const OPENID = app.globalData.WXContext.OPENID
    if(openid===OPENID){
      wx.navigateTo({
        url: '../pub/add/index?pid='+pid
      })
    }
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
      case '用户使用须知': this.wxNavTo('about/index'); break;
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