const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db

Page({
  data: {
    today: util.formatTime(new Date,'CN'),
    planForm: {
      title: '',
      desc: '',
      days: 30, // 30 60 自定义 
    },
    daysList: [
      { name: '30天', value: '30', checked: 'true' },
      { name: '60天', value: '60' },
      { name: '自定义', value: '' },
    ],
    daysOther: false
  },
  onLoad(options) {
    console.log(options.pid)
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  radioChange(e) {
    const days = Number(e.detail.value || '')
    if(days){
      this.setData({
        daysOther: false,
        'planForm.days': days
      })
    } else {
      this.setData({
        daysOther: true
      })
    }
  },
  daysChange(e) {
    let days = e.detail.value || ''
    if (isNaN(days)) {
      days = 0
    } else {
      days = Number(days)
    }
    console.log(days)
    this.setData({
      'planForm.days': days
    })
  },
  titleChange(e) {
    let title = e.detail.value || ''
    if(title){
      this.setData({
        'planForm.title': title
      })
    }
  },
  descChange(e) {
    let desc = e.detail.value || ''
    if (desc) {
      this.setData({
        'planForm.desc': desc
      })
    }
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
          console.log(res)
        });
      }
    })
  },
  planSubmit() {

    const pid = this.data.pid || ''
    const userInfo = app.globalData.InsertUserInfo
    console.log('userInfo=>', userInfo)

    const planForm = this.data.planForm
    console.log('planForm=>',planForm)

    if(planForm.title===''){
      wx.showModal({
        title: '',
        content: '请填写口号',
        showCancel: false,
      })
      return
    }
    if (!(planForm.days >0)) {
      wx.showModal({
        title: '',
        content: '请选择天数',
        showCancel: false,
      })
      return
    }

    if (planForm.title && planForm.days>0 && userInfo && userInfo.nickName){
      if (pid) {
        console.log('编辑计划')


      } else {
        console.log('新增计划')


        const sForm = {
          created_at: util.formatTime(new Date(), '-:'),
          updated_at: util.formatTime(new Date(), '-:'),
          userInfo,
          ...planForm,
        }
        db.collection('qlz_plan').add({
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