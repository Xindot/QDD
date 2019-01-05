const util = require('../../../utils/util')

const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    header: {
      tabs: ['我要提交','我已提交'],
      selectIndex: 0
    },
    fbSubmit: {
      content: ''
    },
    fbList: null,
    fbListTips: '加载中...'
  },
  onLoad(options) {
    this.getMyFeedbackList()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  // 下拉刷新
  onPullDownRefresh() {
    this.getMyFeedbackList()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, Timeout.wx.stopPullDownRefresh)
  },
  // Event handler.
  tabSwitch(e) {
    const idx = e.currentTarget.dataset.idx
    // console.log('idx:',idx)
    this.setData({
      'header.selectIndex':idx
    })
  },
  // 输入的内容改变
  contentChange(e){
    // console.log(e)
    const content = e.detail.value || ''
    this.setData({
      'fbSubmit.content': content
    })
  },
  // 提交反馈
  bindFormSubmit(){
    const fbSubmit = this.data.fbSubmit
    Object.assign(fbSubmit, {
      created_at: util.formatTime(new Date, '-:'),
      updated_at: util.formatTime(new Date, '-:'),
    })
    // console.log('fbSubmit=>',fbSubmit)
    if (fbSubmit.content==''){
      wx.showModal({
        title: '',
        content: '请填写意见或建议',
        showCancel: false,
        confirmText: '好的',
        confirmColor: '#000'
      })
    }else{
      db.collection('xpc_feedback').add({
        data: fbSubmit
      }).then(res => {
        // console.log(res)
        if (res.errMsg == "collection.add:ok"){
          this.setData({
            'fbSubmit.content': ''
          })
          wx.showModal({
            title: '提交成功',
            content: '您可以去我的反馈中查看',
            confirmText: '查看反馈',
            success:(res)=> {
              if (res.confirm) {
                // console.log('用户点击确定')
                this.setData({
                  'header.selectIndex': 1
                })
                this.getMyFeedbackList();
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            }
          })
        }
      }).catch(err=>{
        console.error(err)
      })
    }
  },
  // 获取我的反馈列表
  getMyFeedbackList(){
    const WXContext = wx.getStorageSync('WXContext')
    if (WXContext && WXContext.OPENID){
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      db.collection('xpc_feedback').where({
        _openid: WXContext.OPENID // 填入当前用户 openid
      })
      .orderBy('created_at', 'desc')
      .get().then(res => {
        // console.log(res)
        if (res.errMsg =='collection.get:ok'){
          const fbList = res.data || []
          let fbListTips = ''
          if (fbList.length == 0) {
            fbListTips = '暂无数据'
          }
          this.setData({
            fbList,
            fbListTips,
          })
        }
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
    }
  }
})