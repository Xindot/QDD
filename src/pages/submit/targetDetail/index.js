const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db
const QNImgStyle = app.globalData.QNImgStyle
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    QNImgStyle,
    query1: {
      target: null,
      targetid: null,
    },
    query2: {
      page: 1,
      size: 10,
    },
    targetDetail: null,
    submitList: null,
    operate: {
      icons: ['like','comment','score','share'],
      doing: false,
    }
  },
  onLoad(options) {
    const wid = options.wid || ''
    const pid = options.pid || ''
    if(wid){
      this.setData({
        'query1.target': 'work',
        'query1.targetid': wid,
      })
    }
    if (pid) {
      this.setData({
        'query1.target': 'plan',
        'query1.targetid': pid,
      })
    }
    this.getTargetDetail()
    this.getSubmitList()
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow() {

  },
  onHide: function() {
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  },
  onPullDownRefresh: function() {
    this.getSubmitList()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },
  // 查询作业详情
  getTargetDetail() {
    const target = this.data.query1.target
    const targetid = this.data.query1.targetid
    if (target==='work'){
      db.collection('qlz_work').doc(targetid).get().then(res => {
        console.log(res.data)
        if(res.data && res.data._id){
          const targetDetail = res.data
          this.setData({
            targetDetail,
          })
        }
      })
    }
    if (target === 'plan') {
      db.collection('qlz_plan').doc(targetid).get().then(res => {
        // console.log(res.data)
        if (res.data && res.data._id) {
          const targetDetail = res.data
          this.setData({
            targetDetail,
          })
        }
      })
    }
  },
  // 获取提交的作业
  getSubmitList(){
    const query1 = this.data.query1
    const page = this.data.query2.page
    const size = this.data.query2.size
    const userInfo = app.globalData.InsertUserInfo
    if (query1.target && query1.targetid){
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      db.collection('qlz_submit').where(query1).orderBy('created_at','asc').skip((page-1)*size).limit(size).get().then(res => {
        // console.log(res.data)
        if(res.data && res.data instanceof Array){
          let submitList = res.data || []
          if(submitList.length>0){
            submitList.forEach(n=>{
              const likeNum = n.likeUserList && n.likeUserList.length || 0
              n.operate = n.operate || {}
              n.operate.likeNum = likeNum
              if(n.likeUserList instanceof Array && n.likeUserList.indexOf(userInfo.openId)>=0){
                n.liked = true
              }
            })
          }
          this.setData({
            submitList,
          })
        }
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }).catch(err => {
        console.error(err)
      })
    }
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
      // let urls = []
      // if(submitList instanceof Array && submitList.length>0){
      //   submitList.forEach((n,i)=>{
      //     if(n.img){
      //       urls.push(n.img+wmUser)
      //     }
      //   });
      // }else{
      //   urls.push(img+wmUser)
      // }
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