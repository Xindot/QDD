const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db
const QNImgStyle = app.globalData.QNImgStyle
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    share: {
      img: null
    }
  },
  onLoad: function(options) {
    const id = options.id || ''
    const idType = options.idType || ''
    console.log('id:'+id,'idType:'+idType)
    if(idType=='workSubmit'){
      if(id){
        this.getWorkSubmitDetail(id)
      }
    }
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow: function() {
    // Do something when page show.
  },
  onHide: function() {
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  },
  onPullDownRefresh: function() {
    // Do something when pull down
  },
  // 获取提交作业详情
  getWorkSubmitDetail(id) {
    // console.log(id)
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('qlz_submit').doc(id).get().then(res => {
      console.log(res.data)
      if(res.data && res.data._id){
        const img = res.data.img || ''
        if(img){
          const src = img + QNImgStyle.wmMps
          this.wxGetImageInfo(src)
        }
      }
    })
  },
  // 获取图片信息
  wxGetImageInfo(src){
    wx.getImageInfo({
      src,
      success:(res)=> {
        // console.log(res)
        if(res.errMsg=='getImageInfo:ok'){
          const share = {
            img: res.path
          }
          this.setData({
            share,
          })
          wx.hideLoading()
        }
      }
    })
  },
  // 保存图片到系统相册 第一步
  wxSaveImageToPhotosAlbum() {

    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success(res) {
        console.log(res.tapIndex)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
    return

    wx.showLoading({
      title: Tips.wx.showSaving,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    wx.getSetting({
      complete:(res)=> {
        // console.log('wx.getSetting.complete=>',res)
        if(res.errMsg=='getSetting:ok'){
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success:(res)=> {
                this.wxSaveImageToPhotosAlbumReal()
              }
            })
          }else{
            this.wxSaveImageToPhotosAlbumReal()
          }
        }else{
          wx.showModal({
            title: '',
            content: res.errMsg,
          })
        }
      }
    })
  },
  // 保存图片到系统相册 第二步
  wxSaveImageToPhotosAlbumReal(){
    const filePath = this.data.share.img
    wx.saveImageToPhotosAlbum({
      filePath,
      complete:(res)=> {
        // console.log('wx.saveImageToPhotosAlbum.complete',res)
        if(res.errMsg=='saveImageToPhotosAlbum:ok'){
          wx.showModal({
            title: '',
            content: '图片已经保存到相册了，可以去发朋友圈咧~',
            showCancel: false,
            success:(res)=> {
              if (res.confirm) {
                // console.log('用户点击确定')
                // 返回上一页
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }else{
          wx.showModal({
            title: '',
            content: '图片保存失败：'+res.errMsg,
          })
        }
        wx.hideLoading()
      }
    })
  }
})