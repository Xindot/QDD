const util = require('../../utils/util')

const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips
const Version = app.globalData.Version

Page({
  data: {
    Version,
    nowTime: util.formatTime(new Date(), '-:4'),
    YEAR_: new Date().getFullYear() + '-',
    pageName: 'me',
    dbUserInfo: null,
    tripTypes: [{
      label: '人找车',
    }, {
      label: '车找人',
    }],
    myPubList: null,
    list2: ['意见或建议', ''], //用户使用须知
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
    if (app.globalData.showRefresh) {
      this.getUserInfo()
      this.getMyPubList()
      app.globalData.showRefresh = false
    }
  },
  getUserInfo(){
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const _openid = dbUserInfo && dbUserInfo._openid
    if (!_openid) {
      wx.navigateTo({
        url: '../me/login/index',
      })
      return
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_user').where({
      _openid,
    }).get().then(res => {
      // console.log(res)
      if (res.errMsg=== 'collection.get:ok'){
        const dbUserInfo = res.data[0] || null
        if (dbUserInfo){
          this.setData({
            dbUserInfo,
          })
        }
        app.setDBUserInfo(dbUserInfo)
      }
      wx.stopPullDownRefresh()
    })
  },
  // 获取行程列表
  getMyPubList() {
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const _openid = dbUserInfo && dbUserInfo._openid
    if (!_openid) {
      wx.navigateTo({
        url: '../me/login/index',
      })
      return
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_pub').where({
      _openid,
      status: 1
    }).orderBy('tripTime', 'asc').limit(3).get().then(res => {
      // console.log(res)
      if (res.errMsg === 'collection.get:ok' && res.data instanceof Array) {
        let myPubList = res.data || []
        myPubList.forEach(n => {
          n.disABshow = util.distanceFormat(n.disAB)
          n.tripTimeShow = n.tripTime.replace(this.data.YEAR_, '')

          const disABrate = app.globalData.disABrate || 0.5
          const disAB = Number(n.disAB)
          if (disAB > 0) {
            n.disABmoneyVary = ((Number(disAB / 1000) * disABrate).toFixed(0))
          }
        })
        const nowTime = util.formatTime(new Date(), '-:4')
        this.setData({
          nowTime,
          myPubList,
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 行程详情
  targetDetail(e){
    // console.log(e)
    const pid = e.currentTarget.id
    const idx = e.currentTarget.dataset.idx || 0
    const openid = e.currentTarget.dataset.openid

    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const _openid = dbUserInfo && dbUserInfo._openid

    const phone = dbUserInfo && dbUserInfo.phone || ''
    if (!(phone && (/^0?(13|14|15|17|18)[0-9]{9}$/.test(phone)))) {
      wx.showModal({
        title: '设置行程，需要先设置联系方式',
        content: '方便需要的时候能联系到您',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../me/contact/index'
            })
          }
        }
      })
      return
    }

    if (openid === _openid){
      const myPubOneDetail = this.data.myPubList[idx]
      app.globalData.myPubOneDetail = myPubOneDetail
      try {
        wx.setStorageSync('myPubOneDetail', myPubOneDetail)
      } catch (e) {
        console.error(e)
      }
      wx.navigateTo({
        url: '../pub/add/index?pid='+pid
      })
    }
  },
  // 设置我的行程
  pubMyTrip() {
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    if (dbUserInfo && dbUserInfo.phone && (/^0?(13|14|15|17|18)[0-9]{9}$/.test(dbUserInfo.phone))) {
      wx.navigateTo({
        url: '../pub/add/index'
      })
    } else {
      wx.showModal({
        title: '设置行程，需要先设置联系方式',
        content: '方便需要的时候能联系到您',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../me/contact/index'
            })
          }
        }
      })
    }
  },
  // 设置联系方式
  setContact(){
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const uid = dbUserInfo._id
    if (!uid) {
      wx.navigateTo({
        url: '../me/login/index',
      })
      return
    }
    wx.navigateTo({
      url: 'contact/index?uid=' + uid
    })
  },
  commonTips(text){
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
      case '用户使用须知': this.wxNavTo('notice/index'); break;
      case '': this.commonTips('努力开发中...'); break;
    }
  },
  // 页面跳转
  wxNavTo(url) {
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const uid = dbUserInfo._id
    if (!uid) {
      wx.navigateTo({
        url: '../me/login/index',
      })
      return
    }
    wx.navigateTo({
      url: url + '?uid=' + uid
    })
  },
  // 分享我的行程
  shareMyTrip(){
    const SharePubList = this.data.myPubList
    if (SharePubList instanceof Array && SharePubList.length>0){
      wx.showModal({
        title: '',
        content: '暂未开放',
        showCancel: false,
      })
      // wx.setStorageSync('SharePubList', SharePubList)
      // wx.navigateTo({
      //   url: 'share/index'
      // })
    }
  }
})