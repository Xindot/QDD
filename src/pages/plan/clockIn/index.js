const util=require('../../../utils/util')

const app = getApp()

Page({
  data: {
    today: util.formatTime(new Date,'CN'),
    form: {
      planId: null,
      img: null,
      text: null
    }
  },
  onLoad: function(options) {
    console.log(options.planId)
    this.setData({
      'form.planId': options.planId || null
    })
    // Do some initialize when page load.
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow: function() {
    // Do something when page show.
  },
  onHide: function() {
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  },
  onPullDownRefresh: function() {
    // Do something when pull down
  },
  // Event handler.
  viewTap: function() {
    this.setData({
      text: 'Set some data for updating view.'
    })
  },
  chooseImage: function() {
    var _this = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        _this.setData({
          'form.img': tempFilePaths[0]
        })
      }
    })
  },
  bindTextAreaInput: function(e) {
    // console.log(e.detail.value)
    this.setData({
      'form.text': e.detail.value
    })
  },
  clockInSubmit: function(){
    console.log(this.data.form)
    if(!app.globalData.qlz_userid){
      this.tips('请先登录')
      return
    }
    if(!this.data.form.planId){
      this.tips('请先选择计划')
      return
    }
    if(!this.data.form.img){
      this.tips('请先上传作品')
      return
    }
  },
  tips: function(text){
    wx.showModal({
      title: '',
      content: text,
      showCancel: false,
    })
  }
})