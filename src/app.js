const util = require('utils/util')

const ENV = ['dev-e2a464','prod-e2a464'][1]
console.log('ENV=>',ENV)

const Version = 'v1.0.1'
console.log('Version=>', Version)

// console.log('wx.cloud=>',wx.cloud)
wx.cloud.init({
  ENV,
  traceUser: true,
})
const db = wx.cloud.database()

//app.js
App({
  onLaunch: function () {
    // 获取用户OPENID
    this.getWXOPENID()
    // 获取七牛配置项
    this.getQNConfig()
    // 获取距离参考费率
    this.getDisABrate()
  },
  // 获取用户OPENID by缓存
  getWXOPENID(){
    try {
      const WXContext = wx.getStorageSync('WXContext')
      if (WXContext && WXContext.OPENID) {
        console.log('OPENID缓存中存在')
        this.globalData.WXContext = WXContext
        const OPENID = WXContext.OPENID
        this.checkDBUser(OPENID)
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
      name: 'getWXContext',
      data: {}
    }).then(res => {
      const WXContext = res.result
      if(WXContext && WXContext.OPENID){
        this.globalData.WXContext = WXContext
        const OPENID = WXContext.OPENID
        this.checkDBUser(OPENID)
        try {
          wx.setStorageSync('WXContext', WXContext)
        } catch (e) {
          console.error(e)
        }
      }
    }).catch(err => {
      console.error(err)
    })
  },
  // 判断当前用户是否在库中
  checkDBUser(OPENID){
    if (OPENID){
      db.collection('xpc_user').where({
        _openid: OPENID
      }).get({
        success: (res)=> {
          if(res.errMsg=='collection.get:ok'){
            if(res.data && res.data instanceof Array && res.data.length>0){
              console.log('判断当前用户：在库中')
              const dbUserInfo = res.data[0]
              this.setDBUserInfo(dbUserInfo)
            }else{
              console.log('判断当前用户：不在库中')
              this.setDBUserInfo(null)
            }
          }else{
            console.error(res.errMsg)
          }
        }
      })
    }
  },
  // 设置用户信息
  setDBUserInfo(dbUserInfo){
    if (dbUserInfo && dbUserInfo._openid && dbUserInfo.nickName){
      const insertUserInfo = {
        openId: dbUserInfo._openid,
        nickName: dbUserInfo.nickName,
        avatarUrl: dbUserInfo.avatarUrl,
        gender: dbUserInfo.gender,
      }
      this.globalData.dbUserInfo = dbUserInfo
      this.globalData.insertUserInfo = insertUserInfo
      try {
        wx.setStorageSync('dbUserInfo', dbUserInfo)
        wx.setStorageSync('insertUserInfo', insertUserInfo)
      } catch (e) {
        console.error(e)
      }
    }else{
      this.globalData.dbUserInfo = null
      this.globalData.insertUserInfo = null
      try {
        wx.removeStorageSync('dbUserInfo')
        wx.removeStorageSync('insertUserInfo')
      } catch (e) {
        console.error(e)
      }
    }
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
      name: 'getQnUptoken',
      data: {}
    }).then(res => {
      if(res.errMsg=='cloud.callFunction:ok'){
        if(res.result && res.result.code ==200){
          const QNConfig = res.result.result
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
    const WXContext = wx.getStorageSync('WXContext')
    const OPENID = WXContext.OPENID;
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
        callback(res)
      }
    })
  },
  // 获取小程序配置项
  getGlobalConfig(category,callback){
    db.collection('xpc_config').where({
      category,
    }).get().then(res => {
      if (res.errMsg === 'collection.get:ok' && res.data && res.data[0].content) {
        const content = res.data[0].content
        callback(content[category])   
      }
    })
  },
  // 获取距离参考费率
  getDisABrate(){
    this.getGlobalConfig('disABrate',res=>{
      const disABrate = Number(res) || 0.5
      if (disABrate > 0) {
        wx.setStorageSync('disABrate', disABrate)
      }else{
        wx.removeStorageSync('disABrate')
      }
    })
  },
  // 监听网络状态变化事件
  // getNetWork(){
  //   wx.getNetworkType({
  //     success:(res)=> {
  //       console.log(res)
  //       const networkType = res.networkType
  //     }
  //   })
  //   wx.onNetworkStatusChange((res)=> {
  //     console.log(res)
  //     console.log(res.isConnected)
  //     console.log(res.networkType)
  //   })
  // },
  globalData:{
    Version,
    ENV,
    db,
    WXContext: null,
    dbUserInfo: null,
    insertUserInfo: null,
    myPubOneDetail: null,
    pubMatchTwo: null,
    showRefresh: false,
    QNConfig: {
      upHost: 'https://up.qbox.me',
    },
    Timeout: {
      wx: {
        hideLoading: 5000,
        stopPullDownRefresh: 3000,
      }
    },
    Tips: {
      wx: {
        showLoading: '加载中...',
        showSubmiting: '正在提交...',
        showUploading: '上传中...',
        showSaving: '正在保存...',
      }
    }
  }
})




