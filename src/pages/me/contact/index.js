const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    uid: null,
    contactList: [{
      label: '手机号',
      need: true,
      placeholder: '请输入手机号',
      maxlength: 11,
      type: 'digit',
      key:'phone',
      value:''
    }, {
      label: '微信号',
      need: false,
      key: 'otherContact',
      placeholder: '请输入微信号，可不填',
      maxlength: 30,
      value: ''
    }],
    submitBtn: {
      clickable: false,
      tips: '提交'
    },
  },
  onLoad(options) {
    // console.log(options)
    const uid = options.uid || ''
    if (uid){
      this.setData({
        uid,
      })
      this.setDefaultValue()
    }else{
      wx.showModal({
        title: '',
        content: '获取用户id错误',
        showCancel: false,
      })
    }
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  setDefaultValue(){
    const dbUserInfo = app.globalData.dbUserInfo || wx.getStorageSync('dbUserInfo')
    const contactList = this.data.contactList
    contactList.forEach(n => {
      n.value = dbUserInfo[n.key] || ''
      if (n.key === 'phone') {
        this.checkPhone(n.value)
      }
    })
    this.setData({
      contactList,
    })
  },
  // 输入改变
  inputValueChange(e){
    // console.log(e)
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    const contactList = this.data.contactList
    contactList.forEach(n=>{
      if(n.key===key){
        n.value = value
        if(n.key==='phone'){
          this.checkPhone(value)
        }
      }
    })
    this.setData({
      contactList,
    })
  },
  // 检查手机号码格式
  checkPhone(val){
    if (/^0?(13|14|15|17|18)[0-9]{9}$/.test(val)) {
      this.setData({
        'submitBtn.clickable': true
      })
    }else{
      this.setData({
        'submitBtn.clickable': false
      })
    }
  },
  // 提交修改
  contactSubmit(){
    if(!this.data.submitBtn.clickable){
      return
    }
    this.setData({
      'submitBtn.clickable': false,
      'submitBtn.tips': '提交中...'
    })
    const uid = this.data.uid || ''
    if (!uid) {
      wx.showModal({
        title: '',
        content: '获取用户id错误',
        showCancel: false,
      })
      return
    }
    const sform = {}
    const contactList = this.data.contactList
    contactList.forEach(n => {
      sform[n.key] = n.value
    })
    // console.log('sform=>', sform)
    db.collection('xpc_user').doc(uid).update({
      data: sform
    }).then(res=>{
      // console.log(res)
      if (res.errMsg ==='document.update:ok'){
        wx.showModal({
          title: '',
          content: '提交成功',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              this.getUserInfo(uid)
              app.globalData.showRefresh = true     
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
  // 获取用户信息
  getUserInfo(uid) {
    wx.showLoading({
      title: Tips.wx.showLoading,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, Timeout.wx.hideLoading)
    db.collection('xpc_user').doc(uid).get().then(res => {
      // console.log(res)
      if (res.errMsg === 'document.get:ok') {
        const dbUserInfo = res.data || null
        if (dbUserInfo) {
          this.setData({
            dbUserInfo,
          })
        }
        app.setDBUserInfo(dbUserInfo)
      }
      wx.stopPullDownRefresh()
    })
  },
})