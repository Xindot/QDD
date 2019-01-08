const util = require('../../../utils/util')

const app = getApp()
const db = app.globalData.db

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tips: {
      text: '请完成微信授权以继续使用',
      btn: '授权微信用户信息'
    },
    visible: true,
  },
  onLoad(options) {
    // 查看是否授权
    // wx.getSetting({
    //   success:(res)=> {
    //     console.log(res)
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success:(res)=> {
    //           const wxUserInfo = res.userInfo
    //           // console.log('getUserInfo,0=>', wxUserInfo)
    //           this.addUserToDB(wxUserInfo)
    //         }
    //       })
    //     } else {
    //       // this.wxOpenSetting()
    //     }
    //   }
    // })
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  // Event handler.
  bindGetUserInfo(e){
    console.log(e)
    if(e.detail.errMsg=='getUserInfo:ok'){
      const wxUserInfo = e.detail.userInfo
      // console.log('getUserInfo,1=>', wxUserInfo)
      this.addUserToDB(wxUserInfo)      
    }else{
      this.wxOpenSetting()
    }
  },
  // 打开设置
  wxOpenSetting(){
    wx.showModal({
      title: '您已拒绝授权使用用户信息',
      content: '无法继续使用，您可以在小程序设置界面（「右上角」-「关于」-「右上角」-「设置」）中授权',
      // showCancel: false,
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              console.log(res.authSetting)
            }
          })
        }
      }
    })
  },
  // 增加用户到数据库
  addUserToDB(wxUserInfo) {
    const WXContext = app.globalData.WXContext ||  wx.getStorageSync('WXContext')
    if (!(WXContext && WXContext.OPENID)) {
      // console.log('获取OPENID错误')
      wx.showModal({
        title: '',
        content: '获取OPENID错误',
        showCancel: false,
      })
      return
    }
    if (!(wxUserInfo && wxUserInfo.nickName)) {
      // console.log('获取用户信息错误')
      wx.showModal({
        title: '',
        content: '获取用户信息错误',
        showCancel: false,
      })
      return
    }
    const OPENID = WXContext.OPENID
    db.collection('xpc_user').where({
      _openid: OPENID,
    }).get({
      success: (res) => {
        if (res.errMsg == 'collection.get:ok') {
          if (res.data && res.data instanceof Array && res.data.length > 0) {
            console.log('新增用户提示：用户已存在')
            const user = res.data[0]
            db.collection('xpc_user').doc(user._id).update({
              data: {
                updated_at: util.formatTime(new Date(), '-:'),
                ...wxUserInfo
              }
            }).then(res => {
              console.log(res)
            }).catch(err => {
              console.error(err)
            })
          } else {
            console.log('新增用户提示：用户不存在')
            const newUser = {
              created_at: util.formatTime(new Date(), '-:'),
              updated_at: util.formatTime(new Date(), '-:'),
              ...wxUserInfo
            }
            db.collection('xpc_user').add({
              data: newUser
            }).then(res => {
              // console.log(res)
              if (res.errMsg == 'collection.add:ok') {
                console.log('新增用户提示：添加成功')
                app.checkDBUser(OPENID)
              }
            }).catch(err => {
              console.error(err)
            })
          }
          wx.showModal({
            title: '',
            content: '授权登录成功',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                app.globalData.showRefresh = true
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        } else {
          console.error(res.errMsg)
        }
      }
    })
  },
})