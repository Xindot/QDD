const app = getApp()
const db = app.globalData.db

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
    console.log(options)
    const uid = options.uid || ''
    this.setData({
      uid,
    })
    this.setDefaultValue()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  setDefaultValue(){
    const WXUserInfo = app.globalData.WXUserInfo
    const contactList = this.data.contactList
    contactList.forEach(n => {
      n.value = WXUserInfo[n.key] || ''
      if (n.key === 'phone') {
        this.checkPhone(n.value)
      }
    })
    this.setData({
      contactList,
    })
  },
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
  contactSubmit(){
    if(!this.data.submitBtn.clickable){
      return
    }
    const uid = this.data.uid
    if (!uid) {
      return
    }
    const sform = {}
    const contactList = this.data.contactList
    contactList.forEach(n => {
      sform[n.key] = n.value
    })
    console.log('sform=>', sform)
    db.collection('xpc_user').doc(uid).update({
      data: sform
    }).then(res=>{
      console.log(res)
      if (res.errMsg ==='document.update:ok'){
        wx.showModal({
          title: '',
          content: '提交成功',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
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

  }
})