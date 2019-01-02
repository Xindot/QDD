const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips
const WXContext = app.globalData.WXContext
const QNImgStyle = app.globalData.QNImgStyle

Page({
  data: {
    QNImgStyle,
    header:{
      tabs: ['我提交的','我布置的'],
      selectIndex: 0
    },
    myWorkSubmitList: null,
    myWorkAdminList: null,
  },
  onLoad(options) {
    this.getMyWorkList('onLoad')
  },
  onReady() {},
  onShow() {
    this.getMyWorkList('onLoad')
  },
  onHide() {},
  onUnload() {},
  // 下拉刷新
  onPullDownRefresh() {
    this.getMyWorkList('onPullDownRefresh')
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },
  // 获取我的作业列表
  getMyWorkList(type) {
    if(WXContext && WXContext.OPENID){
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      if(type=='onLoad'){
        this.getMyWorkSubmitList()
        this.getMyWorkAdminList()
      }
      if(type=='onPullDownRefresh'){
        if(this.data.header.selectIndex==0){
          this.getMyWorkSubmitList()
        }
        if(this.data.header.selectIndex==1){
          this.getMyWorkAdminList()
        }
      }
    }
  },
  // 获取我的提交作业列表
  getMyWorkSubmitList(){
    db.collection('qlz_submit').where({
      _openid: WXContext.OPENID,
      target: 'work',
    }).orderBy('created_at', 'desc').get().then(res => {
      console.log(res.data)
      if(res.data && res.data instanceof Array){
        this.setData({
          myWorkSubmitList: res.data
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 获取我的布置作业列表
  getMyWorkAdminList(){
    db.collection('qlz_work').where({
      _openid: WXContext.OPENID // 填入当前用户 openid
    }).orderBy('created_at', 'desc').get().then(res => {
      console.log(res.data)
      if(res.data && res.data instanceof Array){
        this.setData({
          myWorkAdminList: res.data
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 选择切换tab
  selectTabOne(e){
    // console.log(e)
    const idx = e.currentTarget.dataset.idx
    this.setData({
      'header.selectIndex': idx
    })
  },
  // 编辑我提交的作业
  editMyWorkSubmitOne(e){
    // console.log(e)
    const sid = e.currentTarget.id 
    if (sid){
      wx.navigateTo({
        url: '../../submit/index?sid=' + sid
      })
    }
  },
  // 编辑我布置的作业
  editMyWorkAdminOne(e){
    console.log(e)
    const wid = e.currentTarget.id
    if (wid) {
      wx.navigateTo({
        url: '../../work/add/index?wid=' + wid
      })
    }
  },
})