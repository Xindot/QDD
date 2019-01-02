const app = getApp()
const Version = app.globalData.Version

Page({
  data: {
    Version,
    text: "趣练字",
  },
  onLoad: function(options) {
    // Do some initialize when page load.
    console.log('onLoad')
  },
  onReady: function() {
    // Do something when page ready.
    console.log('onReady')
  },
  onShow: function() {
    // Do something when page show.
    console.log('onShow')
  },
  onHide: function() {
    // Do something when page hide.
    console.log('onHide')
  },
  onUnload: function() {
    // Do something when page close.
    console.log('onUnload')
  },
  onPullDownRefresh: function() {
    // Do something when pull down
    console.log('onPullDownRefresh')
  },
  // Event handler.
  viewTap: function() {
    this.setData({
      text: 'Set some data for updating view.'
    })
  }
})