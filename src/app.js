const ENV = ['dev','prod'][0]
const Version = 'v1.0.0'
const util=require('utils/util')
// console.log('wx.cloud=>',wx.cloud)
wx.cloud.init({
  ENV: ENV=='prod' ? 'prod-e2a464' : 'dev-e2a464'
})
const db = wx.cloud.database()

//app.js
App({
  onLaunch: function () {
    // 获取用户OPENID
    this.getWXOPENID()

    // 获取七牛配置项
    this.getQNConfig()

    // 获取当前帐号信息
    // const accountInfo = wx.getAccountInfoSync();
    // console.log('accountInfo=>',accountInfo)
  },
  // 获取用户OPENID by缓存
  getWXOPENID(){
    try {
      var WXContext = wx.getStorageSync('WXContext')
      if (WXContext && WXContext.OPENID) {
        console.log('OPENID缓存中存在')
        this.globalData.WXContext = WXContext
        this.checkUser()
      } else {
        console.log('OPENID缓存中不存在')
        this.getWXContext()
      }
    } catch (e) {
      console.error(e)
    }
  },
  // 获取用户OPENID by云函数
  getWXContext(){
    wx.cloud.callFunction({
      name: 'getWXContext',      // 要调用的云函数名称
      data: {}      // 传递给云函数的event参数
    }).then(res => {
      // console.log('getWXContext res=>',res)
      const WXContext = res.result
      // console.log('WXContext=>',WXContext)
      if(WXContext && WXContext.OPENID){
        try {
          wx.setStorageSync('WXContext', WXContext)
          this.globalData.WXContext = WXContext
          this.checkUser()
        } catch (e) {
          console.error(e)
        }
      }
    }).catch(err => {
      console.error(err)
    })
  },
  // 判断当前用户是否在库中
  checkUser(){
    const WXContext = this.globalData.WXContext
    if(WXContext && WXContext.OPENID){
      db.collection('xpc_user').where({
        _openid: WXContext.OPENID // 填入当前用户 openid
      }).get({
        success: (res)=> {
          // console.log('checkUser=>',res)
          if(res.errMsg=='collection.get:ok'){
            if(res.data && res.data instanceof Array && res.data.length>0){
              console.log('判断当前用户：在库中')
              const WXUserInfo = res.data[0]
              this.setWXUserInfo(WXUserInfo)
            }else{
              console.log('判断当前用户：不在库中')
              wx.navigateTo({
                url: '/pages/me/login/index'
              })
            }
          }else{
            console.error(res.errMsg)
          }
        }
      })
    }
  },
  // 设置用户信息
  setWXUserInfo(WXUserInfo){
    if(WXUserInfo.nickName){
      wx.setStorageSync('WXUserInfo', WXUserInfo)
      this.globalData.WXUserInfo = WXUserInfo
      const InsertUserInfo = {
        openId: WXUserInfo._openid,
        nickName: WXUserInfo.nickName,
        avatarUrl: WXUserInfo.avatarUrl,
        gender: WXUserInfo.gender,
      }
      wx.setStorageSync('InsertUserInfo', InsertUserInfo)
      this.globalData.InsertUserInfo = InsertUserInfo
    }
  },
  // 增加用户到数据库
  addUserToDB(){
    if(!(this.globalData.WXContext && this.globalData.WXContext.OPENID)){
      console.log('获取OPENID错误')
      return
    }
    if(!(this.globalData.WXUserInfo && this.globalData.WXUserInfo.nickName)){
      console.log('获取用户信息错误')
      return
    }
    const OPENID = this.globalData.WXContext.OPENID
    db.collection('xpc_user').where({
      _openid: OPENID // 填入当前用户 openid
    }).get({
      success: (res)=> {
        if(res.errMsg=='collection.get:ok'){
          if(res.data && res.data instanceof Array && res.data.length>0){
            console.log('新增用户提示：用户已存在')
            const user = res.data[0]
            db.collection('xpc_user').doc(user._id).update({
              data: {
                updated_at: util.formatTime(new Date(), '-:'),
                ...this.globalData.WXUserInfo                
              }
            }).then(res=>{
              console.log(res)
            }).catch(err=>{
              console.error(err)
            })
          }else{
            console.log('新增用户提示：用户不存在')
            const newUser = {
              created_at: util.formatTime(new Date(),'-:'),
              updated_at: util.formatTime(new Date(),'-:'),
              ...this.globalData.WXUserInfo
            }
            db.collection('xpc_user').add({
              data: newUser
            }).then(res => {
              // console.log(res)
              if(res.errMsg=='collection.add:ok'){
                console.log('新增用户提示：添加成功')
                this.checkUser()
              }
            }).catch(err =>{
              console.error(err)
            })
          }
          wx.showModal({
            title: '',
            content: '登录成功',
            showCancel: false,
            success:(res) => {
              if (res.confirm) { // console.log('用户点击确定')
                // 返回上一页
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }else{
          console.error(res.errMsg)
        }
      }
    })
  },
  // 获取七牛上传token by缓存
  getQNConfig(){
    try {
      var QNConfig = wx.getStorageSync('QNConfig')
      if (QNConfig.uptoken && QNConfig.origin && QNConfig.expires && QNConfig.expires.timeB) {
        const timeC = util.formatTime(new Date(),'-')
        if(timeC < QNConfig.expires.timeB){
          console.log('uptoken缓存中存在且未失效，目前可用')
          Object.assign(this.globalData.QNConfig, QNConfig);
        } else {
          console.log('uptoken缓存中存在但已失效，需重新获取')
          this.getQNUptoken()
        }
      } else {
        console.log('uptoken缓存中不存在，需重新获取')
        this.getQNUptoken()
      }
    } catch (e) {
      console.error(e)
    }
  },
  // 获取七牛上传token by调用云函数
  getQNUptoken(){
    wx.cloud.callFunction({
      name: 'getQnUptoken',      // 要调用的云函数名称
      data: {} // 传递给云函数的event参数
    }).then(res => {
      // console.log('getQNConfig res=>',res)
      if(res.errMsg=='cloud.callFunction:ok'){
        if(res.result && res.result.code ==200){
          const QNConfig = res.result.result
          // console.log('QNConfig=>',QNConfig)
          if(QNConfig.uptoken && QNConfig.origin){
            try {
              Object.assign(this.globalData.QNConfig, QNConfig);
              wx.setStorageSync('QNConfig', this.globalData.QNConfig)
              console.log('uptoken获取成功，并缓存成功')
            } catch (e) {
              console.error(e)
            }
          }
        }else{
          console.error(res.result)
        }
      }else{
        console.error(res.errMsg)
      }
    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 上传七牛返回url
   */
  uploadQiniu(tempFilePaths,callback) {
    const OPENID = this.globalData.WXContext.OPENID;
    const rStr4 =  Math.random().toString(36).substr(2).substring(0,4);
    if(!(ENV&&Version&&OPENID)){
      callback({code:-1,msg:'ENV或Version或OPENID错误'})
      return
    }
    const OPENID8 = OPENID.substring(0,8)
    const key = 'xpc/'+ENV+'/'+Version+'/'+util.formatTime(new Date(),'19')+'/'+OPENID8+'/'+rStr4+'.png';

    const url = this.globalData.QNConfig.upHost;
    const token = this.globalData.QNConfig.uptoken;
    if(!(url&&token)){
      callback({code:-1,msg:'url或token错误'})
      return
    }
    wx.uploadFile({
      url,
      name: 'file',
      filePath: tempFilePaths[0],
      header: {'Content-Type': 'multipart/form-data'},
      formData: {token,key},
      success: (res)=> {
        if(res.errMsg=='uploadFile:ok' && res.data){
          const data = JSON.parse(res.data)
          if(data.key && this.globalData.QNConfig.origin){
            callback({
              code: 200,
              msg: 'success',
              url: this.globalData.QNConfig.origin + data.key
            })
          }else{
            callback({code:-1,msg:'origin或key错误'})
          }
        }else{
          callback({code:-1,msg:res.errMsg})
        }
      },
      fail: (res)=> {
        // console.error(res)
        callback(res)
      }
    })
  },
  // 根据用户名生成用户水印
  generateUserWatermark(imgRelInfo){
    if(imgRelInfo && imgRelInfo.author){
      const original = imgRelInfo.original ? '©' : 'By '
      const mark = original + imgRelInfo.author + '\r\nQulianzi.com'
      const wm = {
        text: util.base64.encodeUnicode(mark)
      }
      return `?imageView2/0/q/75|watermark/2/text/${wm.text}/font/5b6u6L2v6ZuF6buR/fontsize/480/fill/I0ZGRkZGRg==/dissolve/50/gravity/SouthWest/dx/10/dy/10|imageslim`
    }else{
      return this.globalData.QNImgStyle.wmQLZ || ''
    }
  },
  globalData:{
    Version, // 小程序版本号
    ENV, // 小程序当前环境
    db, // 小程序数据库
    WXContext: null, // 含微信OPENID
    WXUserInfo: null, // 微信用户信息（较全）
    InsertUserInfo: null,// 冗余到记录中的用户信息（仅供展示使用）
    QNConfig: {
      upHost: 'https://up.qbox.me', // 七牛云上传域名
    },
    QNImgStyle: {
      wXXS: '-wXXS', // 图片处理样式，下同
      wXS: '-wXS',
      wS: '-wS',
      wM: '-wM',
      wL: '-wL',
      wXL: '-wXL',
      wmQLZ: '-wmQLZ', // 添加水印 qulinazi.com
      wmMps: '-wmMps', // 添加水印 趣练字小程序码
      gsM: '-gsM',
    },
    Timeout: { // 定时器时间
      wx: {
        hideLoading: 5000,
        stopPullDownRefresh: 3000,
      }
    },
    Tips: { // 提示语
      wx: {
        showLoading: '加载中...',
        showSubmiting: '正在提交...',
        showUploading: '上传中...',
        showSaving: '正在保存...',
      }
    }
  }
})



// {
//   "pagePath": "pages/find/index",
//   "iconPath": "images/nav/find-off.png",
//   "selectedIconPath": "images/nav/find-on.png",
//   "text": "发现"
// },



