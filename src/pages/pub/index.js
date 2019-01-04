const util=require('../../utils/util')

//获取应用实例
const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    nowTime: util.formatTime(new Date(), '-:2'),
    tripTypes: [{
      label: '人找车',
    }, {
      label: '车找人',
    }],
    myPubList: null,
    selectMyPubIndex: 0,
    matchPubList: null,
    wheel: {
      loader: false 
    }
  },
  onLoad() {
    this.getMatchPubList()
  },
  onShow(){
    this.getMatchPubList()
  },
  // 下拉刷新
  onPullDownRefresh(){
    this.getMatchPubList()
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },
  selectOnePub(e){
    const idx = e.currentTarget.dataset.idx || 0
    this.setData({
      selectMyPubIndex: idx
    })
  },
  // 获取行程列表
  getMatchPubList(){
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    // console.log('getMatchPubList query=>',query)
    db.collection('xpc_pub').where({
      status: 1
    }).orderBy('tripTime', 'asc').get().then(res => {
      console.log('qlz_work res',res.data)
      if(res.data instanceof Array){
        let matchPubList = res.data || []
        matchPubList.forEach(n=>{
          n.disABshow = app.disABFormat(n.disAB)
          const disABrate = app.globalData.disABrate || 0.5
          n.disABmoney = '￥' + ((Number(n.disAB / 1000) * disABrate).toFixed(2))
        })
        this.setData({
          matchPubList,
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 行程详情
  targetDetail(e){
    console.log(e)
  },
  // 设置我的行程
  pubMyTrip(){
    wx.navigateTo({
      url: 'add/index'
    })
  },
});


