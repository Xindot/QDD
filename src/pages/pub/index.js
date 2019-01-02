const util=require('../../utils/util')

//获取应用实例
const app = getApp()
const db = app.globalData.db
const QNImgStyle = app.globalData.QNImgStyle
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    QNImgStyle,
    pubList: null,
    wheel: {
      loader: false 
    }
  },
  onLoad() {
    this.getPubList()
  },
  onShow(){},
  // 下拉刷新
  onPullDownRefresh(){
    this.setData({
      'wheel.loader': true
    })
    this.getPubList()
    setTimeout(()=>{
      wx.stopPullDownRefresh()
      this.setData({
        'wheel.loader': false
      })
    },Timeout.wx.stopPullDownRefresh)
  },
  // 获取作业
  getPubList(){
    let query = {
      created_at: db.RegExp({
        regexp: util.formatTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), '-'),
        options: 'i',
      }),
      status: 1
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    console.log('getPubList query=>',query)
    db.collection('xpc_pub').where(query).get().then(res => {
      // console.log('qlz_work res',res.data)
      if(res.data instanceof Array){
        let pubList = res.data || []
        this.setData({
          pubList,
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 作业详情
  targetDetail(e){
    // console.log(e)
    const wid = e.currentTarget.id
    if(wid){
      wx.navigateTo({
        url: '../submit/targetDetail/index?wid='+wid
      })
    }
  },
  oneDetial(e){
    // console.log(e)
    const sid = e.currentTarget.id
    if (sid) {
      wx.navigateTo({
        url: '../submit/oneDetail/index?sid=' + sid
      })
    }
  },
  // 提交我的作业
  workSubmit(e){
    // console.log(e)
    const wid = e.currentTarget.dataset.id
    if(wid){
      wx.navigateTo({
        url: '../submit/index?wid='+wid
      })
    }
  },
  // 布置作业
  pubMyTrip(){
    wx.navigateTo({
      url: 'add/index'
    })
  },
});


