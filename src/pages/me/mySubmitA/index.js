const app = getApp()
const db = app.globalData.db
const WXContext = app.globalData.WXContext

Page({
  data: {
    text: "已交作业",
    submitAList: null,
  },
  onLoad(options) {
    this.getSubmitA()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  getSubmitA() {
    db.collection('qlz_submit').where({
      _openid: WXContext.OPENID,
      original: true,
      representative: true,
    }).orderBy('created_at', 'desc').get().then(res => {
      console.log(res.data)
      if (res.data && res.data instanceof Array) {
        this.setData({
          submitAList: res.data
        })
      }
    })
  }
})