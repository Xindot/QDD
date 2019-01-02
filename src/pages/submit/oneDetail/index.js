const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    oneDetail: null,
  },
  onLoad(options) {
    const sid = options.sid || ''
    if(sid){
      this.getOneDetail(sid)
    }
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  // 查询提交作品详情
  getOneDetail(sid) {
    db.collection('qlz_submit').doc(sid).get().then(res => {
      console.log(res)
      if (res.errMsg ==='document.get:ok'){
        if (res.data && res.data._id) {
          const oneDetail = res.data
          this.setData({
            oneDetail,
          })
        }
      }
    })
  },
  // 微信图片预览
  wxPreviewImage(e){
    // console.log(e)
    const img = e.currentTarget.dataset.img
    if(img){
      const imgRelInfo = {
        author: e.currentTarget.dataset.author,
        original: e.currentTarget.dataset.original || false,
      }
      const wmUser = app.generateUserWatermark(imgRelInfo)
      const submitList = this.data.submitList

      const current = img+wmUser
      const urls = [img+wmUser]
      wx.previewImage({
        current, // 当前显示图片的http链接
        urls // 需要预览的图片http链接列表
      })
    }
  },
  // 提交我的作业
  workSubmit(e){
    // console.log(e)
    const wid = e.currentTarget.id
    if (wid){
      wx.navigateTo({
        url: '../../submit/index?wid=' + wid
      })
    }
  },
  // 操作
  operateWorkSubmitedOne(e){
    if(this.data.operate.doing){
      return
    }
    // console.log(e)
    const idx = e.currentTarget.dataset.idx // 点击作业列表的索引
    const idx2 = e.currentTarget.dataset.idx2 // 点击图标的索引
    const wsId = e.currentTarget.id // 提交作品的id
    if(idx>=0 && idx2>=0){
      const icon = this.data.operate.icons[idx2]
      console.log(`点击第${idx}行第${idx2}个图标:`,icon)
      // 点击喜欢
      if(idx2==0 && icon=='like'){
        // 点赞
        const userInfo = app.globalData.InsertUserInfo
        if(wsId && userInfo && userInfo.openId){
          const openId = userInfo.openId
          wx.navigateTo({
            url: `../../operate/like/index?id=${wsId}&idType=workSubmit`
          })
        }
      }
      if(idx2==3 && icon=='share'){
        if(wsId){
          wx.navigateTo({
            url: `../../operate/share/index?id=${wsId}&idType=workSubmit`
          })
        }
      }
    }
  },
  operateLookMore(e){
    const idx = e.currentTarget.dataset.idx // 点击作业列表的索引
    const lookMore = this.data.submitList[idx].lookMore || false
    this.data.submitList[idx].lookMore = !lookMore
    console.log(this.data.submitList[idx].lookMore)
    const submitList = this.data.submitList
    this.setData({
      submitList,
    })
  },
})