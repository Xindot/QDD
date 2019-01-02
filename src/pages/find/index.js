
const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

// pages/find/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userList: null,
    bannerSwiper: {
      imgUrls: [],
      indicatorDots: true,
      indicatorColor: '#fff',
      indicatorActiveColor: '#000',
      autoplay: true,
      interval: 5000,
      duration: 300
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserList()
    this.getBanner()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getUserList()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 获取用户列表
  getUserList(){
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('qlz_user').where({}).get().then(res => {
      console.log(res.data)
      if(res.data instanceof Array){
        this.setData({
          userList: res.data || []
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 获取广告
  getBanner(){
    const query = {
      status: 1
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('qlz_banner').where(query).get().then(res => {
      // console.log('getBanner res=>',res.data)
      if(res.data instanceof Array && res.data.length>0){
        this.setData({
          'bannerSwiper.imgUrls': res.data
        });
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
})