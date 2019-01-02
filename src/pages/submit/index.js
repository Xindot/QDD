const util=require('../../utils/util')

const app = getApp()
const db = app.globalData.db
const QNImgStyle = app.globalData.QNImgStyle
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Array.prototype.remove = function (val) {
  let index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

Page({
  data: {
    today: util.formatTime(new Date(),'CN'),
    AEForm: {
      target: '', // 'work' 'plan'
      targetid: '',
      img: [],
      desc: '',
      viewAllow: 'Public', // 'Private'
      original: false,
      representative: false,
    },
    sid: null,
  },
  onLoad(option) {
    console.log(option)
    const wid = option.wid || '' // 作业id 提交作业作品
    const pid = option.pid || '' // 计划id 提交计划作品
    const sid = option.sid || '' // 提交id 编辑提交作品内容
    if(wid){
      this.setData({
        sid: null,
        'AEForm.target': 'work',
        'AEForm.targetid': wid,
      })
    }
    if (pid) {
      this.setData({
        sid: null,
        'AEForm.target': 'plan',
        'AEForm.targetid': pid,
      })
    }
    if(sid){
      this.setData({
        sid,
        'AEForm.target': '',
        'AEForm.targetid': '',
      })
      wx.setNavigationBarTitle({
        title: '编辑作品'
      })
      this.getWorkSubmitDetail(sid)
    }
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  // 获取作品详情
  getWorkSubmitDetail(sid) {
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('qlz_submit').doc(sid).get().then(res => {
      console.log(res.data)
      if(res.data && res.data.img){
        this.setData({
          'AEForm.img': res.data.img,
          'AEForm.desc': res.data.desc || '',
          'AEForm.viewAllow': res.data.viewAllow || 'Public',
          'AEForm.original': res.data.original || false,
          'AEForm.representative': res.data.representative || false
        })
      }
      wx.hideLoading()
    })
  },
  // 切换谁可以看
  switchViewAllowChange(e){
    console.log(e)
    const viewAllow = e.detail.value ? 'Public' : 'Private'
    this.setData({
      'AEForm.viewAllow': viewAllow
    })
  },
  // 切换是否原创
  switchOriginalChange(e){
    console.log(e)
    const original = e.detail.value ? true : false
    this.setData({
      'AEForm.original': original
    })
  },
  // 切换是否代表作
  switchRepresentativeChange(e) {
    console.log(e)
    const representative = e.detail.value ? true : false
    this.setData({
      'AEForm.representative': representative
    })
  },
  /**
   * 上传图片
   */
  chooseImageUpload() {
    // const img = this.data.AEForm.img || []
    // const num = 9 - Number(img.length)
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success:(res)=> {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: Tips.wx.showUploading,
        })
        setTimeout(function () {
          wx.hideLoading()
        }, Timeout.wx.hideLoading)
        app.uploadQiniu(res.tempFilePaths,(res)=>{
          // console.log(res)
          if(res.code && res.code==200){
            if(res.url){
              let img = this.data.AEForm.img || []
              img.push(res.url)
              this.setData({
                'AEForm.img':img
              })
              wx.hideLoading()
            }
          }
        });
      }
    })
  },
  // 描述改变
  bindTextAreaInput(e) {
    // console.log(e.detail.value)
    this.setData({
      'AEForm.desc': e.detail.value
    })
  },
  // 提交作业
  goSubmit(){
    if (this.data.AEForm.target && this.data.AEForm.targetid){
      this.addOneSubmit()
    }
    if (this.data.sid) {
      this.updateOneSubmitDetail()
    }
  },
  // 新增一个作业提交
  addOneSubmit(){
    const AEForm = this.data.AEForm
    console.log('AEForm=>', AEForm)
    const target = AEForm.target || ''
    const targetid = AEForm.targetid || ''
    if(target === '' || targetid === ''){
      wx.showModal({
        title: '',
        content: '提交对象不能为空',
        showCancel: false,
      })
      return
    }
    const img = AEForm.img || []
    if (!(img instanceof Array && img.length>0)) {
      wx.showModal({
        title: '',
        content: '请先上传作品',
        showCancel: false,
      })
      return
    }
    const userInfo = app.globalData.InsertUserInfo
    const addForm = {
      created_at: util.formatTime(new Date, '-:'),
      updated_at: util.formatTime(new Date, '-:'),
      userInfo,
      ...AEForm,
    }
    // console.log('addForm=>',addForm)
    wx.showLoading({
      title: Tips.wx.showSubmiting,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('qlz_submit').add({
      data: addForm  // data 字段表示需新增的 JSON 数据
    }).then(res => {
      wx.hideLoading()
      // console.log(res)
      if (res.errMsg == 'collection.add:ok') {
        wx.showModal({
          title: '',
          content: '提交作业成功',
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
  },
  // 更新我提交的作业内容
  updateOneSubmitDetail(){
    const sid = this.data.sid || ''
    if(sid===''){
      return
    }
    const editForm = {
      updated_at: util.formatTime(new Date(), '-:'),
      img: this.data.AEForm.img,
      desc: this.data.AEForm.desc,
      viewAllow: this.data.AEForm.viewAllow,
      original: this.data.AEForm.original,
      representative: this.data.AEForm.representative,
    }
    console.log('editForm=>',editForm)

    db.collection('qlz_submit').doc(sid).update({
      data: editForm
    }).then(res=>{
      console.log(res)
      if (res.errMsg =='document.update:ok'){
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
    }).catch(err=>{
      console.error(err)
    })

  },
  // 预览图片
  wxPreviewImage(e){
    console.log(e)
    const img = e.currentTarget.dataset.img
    if(img){
      const current = img
      const urls = [img]
      wx.previewImage({
        current, // 当前显示图片的http链接
        urls // 需要预览的图片http链接列表
      })
    }
  },
  // 删除图片
  deleteImg(e){
    console.log(e)
    wx.showModal({
      title: '',
      content: '删除图片？',
      success:(res)=> {
        if (res.confirm) {
          console.log('用户点击确定')
          const img = e.currentTarget.dataset.img
          let formimg = this.data.AEForm.img
          if (img && formimg instanceof Array) {
            formimg.remove(img)
            this.setData({
              'AEForm.img': formimg
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  }
})