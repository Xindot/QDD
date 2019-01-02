const app = getApp()
const db = app.globalData.db
const WXContext = app.globalData.WXContext

Page({
  data: {
    planObj: {},
    header: {
      tabs: ['进行中','已完成'],
      selectIndex: 0
    },
    myPlanList: null,
    progress: {
      over: 0,
      percent: 0
    }
  },
  onLoad() {
    this.getMyPlanList()
  },
  onShow() {
    this.getMyPlanList()
  },
  selectTab(e){
    // console.log(e)
    this.setData({
      'header.selectIndex': Number(e.currentTarget.dataset.idx)
    })
  },
  onPullDownRefresh(){
    this.getMyPlanList()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },3000)
  },
  // 获取我的计划列表
  getMyPlanList() {
    if(WXContext && WXContext.OPENID){
      db.collection('qlz_plan').where({
        _openid: WXContext.OPENID // 填入当前用户 openid
      }).get().then(res => {
        console.log(res)
        if (res.errMsg ==='collection.get:ok'){
          this.setData({
            myPlanList: res.data
          })
        }
      })
    }
  },
  creatOnePlan(){
    wx.navigateTo({
      url: 'add/index'
    })
  },
  concel: function(){
    wx.navigateBack(1)
  },
  selectImg: function(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(res)
      }
    })
  },
  planWorkSubmit(e){
    const pid = e.currentTarget.id
    console.log(e, pid)

    if (pid) {
      wx.navigateTo({
        url: '../submit/index?pid=' + pid
      })
    }

  },
  /**
   * 跳转至今天
   */
  jump() {
    jumpToToday();
  }
})
