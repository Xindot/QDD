const util=require('../../utils/util')

//获取应用实例
const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips
const disABFormat = app.disABFormat
const disABrate = app.globalData.disABrate || 0.5

Page({
  data: {
    tripTypes: [{
      label: '人找车',
    }, {
      label: '车找人',
    }],
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
    this.getPubList()
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },
  // 获取行程列表
  getPubList(){
    let query = {
      status: 1
    }
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    // console.log('getPubList query=>',query)
    db.collection('xpc_pub').where(query).get().then(res => {
      console.log('qlz_work res',res.data)
      if(res.data instanceof Array){
        let pubList = res.data || []
        pubList.forEach(n=>{
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
  // 设置我的行程
  pubMyTrip(){
    wx.navigateTo({
      url: 'add/index'
    })
  },
});


