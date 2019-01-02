const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db

Page({
  data: {
    today: util.formatTime(new Date(),'CN'),
    workForm: {
      img: '',
      title: '',
      desc: '',
      remark: '',
      status: 1
    },
    wid: null,
  },
  onLoad(options) {
    const wid = options.wid
    if (wid) {
      this.setData({
        wid,
      })
      this.getWorkDetail(wid);
    }
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  getWorkDetail(wid){
    db.collection('qlz_work').doc(wid).get().then(res => {
      // console.log(res)
      if (res.errMsg === 'document.get:ok') {
        const detail = res.data
        // console.log(detail)
        if(detail && detail.img) {
          this.setData({
            'workForm.img': detail.img || '',
            'workForm.title': detail.title || '',
            'workForm.desc': detail.desc || '',
            'workForm.remark': detail.remark || '',
            'workForm.status': detail.status || 0,
          })
        }
      } else {
        wx.showModal({
          title: '',
          content: '获取布置作业详情错误',
          showCancel: false,
        })
      }
    })
  },
  /**
   * 上传图片
   */
  chooseImageUpload: function() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success:(res)=> {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        app.uploadQiniu(res.tempFilePaths,(res)=>{
          // console.log(res)
          if(res.code==200){
            if(res.url){
              this.setData({
                'workForm.img': res.url
              })
            }
          }
        });
      }
    })
  },
  // 作业标题改变
  titleChange(e) {
    var value = e.detail.value
    // console.log(e,value)
    this.setData({
      'workForm.title': value
    })
  },
  // 作业内容改变
  descChange(e) {
    var value = e.detail.value
    // console.log(e,value)
    this.setData({
      'workForm.desc': value
    })
  },
  // 作业要求改变
  remarkChange(e) {
    var value = e.detail.value
    // console.log(e,value)
    this.setData({
      'workForm.remark': value
    })
  },
  workSubmit() {
    const wid = this.data.wid || ''
    const userInfo = app.globalData.InsertUserInfo
    // console.log('userInfo=>', userInfo)

    const workForm = this.data.workForm
    if (workForm.title === '') {
      wx.showModal({
        title: '',
        content: '作业标题不能为空',
        showCancel: false,
      })
      return
    }
    if (workForm.title === '') {
      wx.showModal({
        title: '',
        content: '作业内容不能为空',
        showCancel: false,
      })
      return
    }
    if (workForm.remark === '') {
      wx.showModal({
        title: '',
        content: '作业要求不能为空',
        showCancel: false,
      })
      return
    }
    if(workForm.img === ''){
      wx.showModal({
        title: '',
        content: '作业封面不能为空',
        showCancel: false,
      })
      return
    }
    if (workForm.img && workForm.title && userInfo && userInfo.nickName){
      console.log('workForm=>', workForm)
      if (wid){
        console.log('编辑布置的作业')
        db.collection('qlz_work').doc(wid).update({
          data: workForm
        }).then(res => {
          console.log(res)
          if (res.errMsg ==='document.update:ok'){
            wx.showModal({
              title: '',
              content: '更新成功',
              showCancel: false,
              success: (res) => {
                if (res.confirm) { // console.log('用户点击确定')
                  // 返回上一页
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        }).catch(err => {
          console.error(err)
        })
      }else{
        console.log('新增布置作业')
        const sForm = {
          created_at: util.formatTime(new Date(), '-:'),
          updated_at: util.formatTime(new Date(), '-:'),
          userInfo,
          ...workForm,
        }
        db.collection('qlz_work').add({
          data: sForm
        }).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        })
      }

    }
  }
})