const util=require('../../../utils/util')

const app = getApp()
const db = app.globalData.db

Page({
  data: {
    today: util.formatTime(new Date(),'CN'),
    pubForm: {
      pointA: {
        name: '',
        address: '',
        lnglat: '',
      },
      pointB: {
        name: '',
        address: '',
        lnglat: '',
      },
      userInfo: null, // 用户信息
      tripTime: '', // 精确到年月日日时 左右
      remark: '', // 备注
      status: 1, // 是否发布 0取消发布 1发布
    },
  },
  onLoad(options) {
    const xpid = options.xpid || ''
    if(xpid){
      this.getPubDetail(xpid)
    }
    this.setData({
      'pubForm.tripTime': util.formatTime(new Date(), '-:')
    })
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  getPubDetail(wid){
    db.collection('xpc_pub').doc(xpid).get().then(res => {
      // console.log(res)
      if (res.errMsg === 'document.get:ok') {
        const detail = res.data
        console.log(detail)
        if(detail && detail.img) {

        }
      } else {
        wx.showModal({
          title: '',
          content: '获取详情错误',
          showCancel: false,
        })
      }
    })
  },
  getPoint(e){
    const p = e.currentTarget.dataset.p || ''
    if(p){
      this.wxChooseLocation(p)
    }
  },
  wxChooseLocation(p){
    wx.chooseLocation({
      type: 'wgs84',
      success:(res)=> {
        console.log(res)
        if(res.errMsg==="chooseLocation:ok"){
          if(p ==='A' || p ==='B'){
            const point = {
              name: res.name,
              address: res.address,
              lnglat: res.longitude + ',' + res.latitude,
            }
            this.data.pubForm['point'+p] = point
            this.setData({
              pubForm: this.data.pubForm
            })
          }
        }
      }
    })
  },
  pubSubmit(){
    const userInfo = app.globalData.WXUserInfo
    const pubForm = this.data.pubForm

    console.log(pubForm)

    console.log('新增发布行程')
    const sForm = {
      created_at: util.formatTime(new Date(), '-:'),
      updated_at: util.formatTime(new Date(), '-:'),
      userInfo,
      ...pubForm,
    }
    db.collection('xpc_pub').add({
      data: sForm
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.error(err)
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