const util = require('../../../utils/util')

const app = getApp()
const db = app.globalData.db

Page({
  data: {
    pid: null,
    nowTime: util.formatTime(new Date(), '-:4'),
    YEAR_: new Date().getFullYear() + '-',
    disABrate: app.globalData.disABrate || 0.5,
    tripTypes: [{
      label: '人找车',
      person: '有几个人'
    },{
      label: '车找人',
      person: '有几个座'
    }],
    pointList: [{
      sign: 'A',
      label: '出发地',
      placeholder: '从哪走',
      point: {},
    }, {
      sign: 'B',
      label: '目的地',
      placeholder: '到哪去',
      point: {},
    }],
    pubForm: {
      pointA: null,
      pointB: null,
      disAB: null,
      disABmoney: null,
      userInfo: null,
      tripTime: '',
      tripType: 0, //0人找车 1车找人
      tripPerson: 1,
      remark: '',
      status: 1,
    },
    disABShow: null,
    pickerList: [{
      mode: 'input',
      label: '行程费用',
      labels: '/人(可自定)',
      placeholder: '行程费'
    },{
      mode: 'date',
      value: '',
      start: util.formatTime(new Date(), '-') || '',
      end: util.formatTime(new Date(new Date().getTime() + 30 * 24 * 3600 * 1000),'-')||'',
      label: '行程日期',
      labels: '/近30天',
      placeholder: '哪天走'
    }, {
      mode: 'time',
      value: '',
      start: '',
      end: '',
      label: '行程时间',
      labels: '/避开夜间',
      placeholder: '啥时走'
    }],
    distanceMin: 5000,
    distanceMinShow: '5km',
    distanceV: false,
    submitBtn: {
      clickable: true,
      tips: '提交',
      del: '删除',
    },
  },
  onLoad(options) {
    const pid = options.pid || ''
    if(pid){
      this.setData({
        pid,
      })
      this.getPubDetail(pid)
    }
    this.getDisABrate()

    this.setData({
      distanceMinShow: util.distanceFormat(this.data.distanceMin)
    })
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  getDisABrate(){
    app.getGlobalConfig('disABrate', res => {
      // console.log(res)
      const disABrate = Number(res) || 0.5
      if (disABrate > 0) {
        console.log('disABrate=>', disABrate)
        this.setData({
          disABrate,
        })
        app.globalData.disABrate = disABrate
        wx.setStorageSync('disABrate', disABrate)
      }
    })
  },
  // 获取行程详情
  getPubDetail(pid){
    const myPubOneDetail = app.globalData.myPubOneDetail || wx.getStorageSync('myPubOneDetail')
    if (myPubOneDetail._id) {
      this.setDetail(myPubOneDetail)
    } else {
      db.collection('xpc_pub').doc(pid).get().then(res => {
        // console.log(res)
        if (res.errMsg === 'document.get:ok') {
          const detail = res.data
          this.setDetail(detail)
        } else {
          wx.showModal({
            title: '',
            content: '获取详情错误',
            showCancel: false,
          })
        }
      })
    }
  },
  // 设置详情
  setDetail(detail){
    const pubForm = this.data.pubForm
    for (var key in pubForm) {
      if (pubForm.hasOwnProperty(key) === true) {
        pubForm[key] = detail[key]
      }
    }
    // console.log(pubForm)
    const pointList = this.data.pointList
    pointList.forEach(n => {
      n.point = pubForm['point' + n.sign]
    })
    const pickerList = this.data.pickerList
    pickerList.forEach(n => {
      if (n.mode === 'date') {
        n.value = pubForm.tripTime.split(' ')[0]
        n.showValue = n.value.replace(this.data.YEAR_, '')
      }
      if (n.mode === 'time') {
        n.value = pubForm.tripTime.split(' ')[1]
      }
    })
    this.setData({
      pubForm,
      pointList,
      pickerList,
    })
    this.getDistance()
  },
  // 选择行程类型
  selectTripType(e){
    // console.log(e)
    const idx = e.currentTarget.dataset.idx || 0
    this.setData({
      'pubForm.tripType': idx
    })
  },
  // 选择人的数量
  selectTripPerson(e){
    // console.log(e)
    const idx = e.currentTarget.dataset.idx || 0
    this.setData({
      'pubForm.tripPerson': idx
    })
  },
  // 选择地点
  getPoint(e){
    const sign = e.currentTarget.dataset.sign || ''
    // console.log('sign=>', sign)
    if (sign){
      this.wxChooseLocation(sign)
    }
  },
  // 选择地点
  wxChooseLocation(sign){
    wx.chooseLocation({
      type: 'wgs84',
      success:(res)=> {
        // console.log(res)
        if(res.errMsg==="chooseLocation:ok"){
          const point = {
            name: res.name,
            address: res.address,
            ssx: util.extractSSX(res.address),
            longitude: res.longitude,
            latitude: res.latitude,
          }
          const pubForm = this.data.pubForm
          const pointList = this.data.pointList
          pointList.forEach(n=>{
            if(n.sign===sign){
              n.point = point
              if (sign === 'A') {
                pubForm.pointA = point
              }
              if (sign === 'B') {
                pubForm.pointB = point
              }
            }
          })
          this.setData({
            pointList,
            pubForm,
          })
          this.getDistance()
        }
      },
      fail:(err)=>{
        // console.log(err)
        wx.showModal({
          title: '您已设置【不允许使用我的地理位置】',
          content: '如果需要开启，可以在小程序设置界面（「右上角」-「关于」-「右上角」-「设置」）中控制对该小程序的授权状态',
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
      }
    })
  },
  // 根据经纬度获取两点之间的距离
  getDistance(){
    let lngA = ''
    let latA = ''
    let lngB = ''
    let latB = ''
    const pointList = this.data.pointList
    pointList.forEach(n => {
      if (n.sign === 'A') {
        lngA = n.point.longitude || ''
        latA = n.point.latitude || ''
      }
      if (n.sign === 'B') {
        lngB = n.point.longitude || ''
        latB = n.point.latitude || ''
      }
    })
    if (lngA && latA && lngB && latB){
      const disAB = util.distanceByLnglat(lngA, latA, lngB, latB) || 0
      console.log('disAB=>',disAB)
      if(Number(disAB)===0){
        wx.showModal({
          title: '',
          content: '目的地和出发地不能是一个位置, 请重新选择目的地',
          showCancel: false,
        })
        return
      }
      let distanceV = false
      if (Number(disAB) >= Number(this.data.distanceMin)){
        distanceV = true
      }
      const pubForm = this.data.pubForm
      pubForm.disAB = disAB

      let disABShow = util.distanceFormat(disAB)

      const disABrate = app.globalData.disABrate || 0.5
      pubForm.disABmoneyVary = ((Number(disAB / 1000) * disABrate).toFixed(0))
      if(!(pubForm.disABmoney>0)){
        pubForm.disABmoney = pubForm.disABmoneyVary
      }

      this.setData({
        pubForm,
        disABShow,
        distanceV,
      })
    }
  },
  // 选择日期 或 选择时间
  bindPickerChange(e){
    // console.log(e)
    const mode = e.currentTarget.dataset.mode || ''
    const pickerList = this.data.pickerList
    pickerList.forEach(n=>{
      if(n.mode===mode){
        n.value = e.detail.value
        if(n.mode==='date'){
          n.showValue = n.value.replace(this.data.YEAR_, '')
        }
      }
    })
    this.setData({
      pickerList,
    })
  },
  // 备注改变
  remarkChange(e){
    // console.log(e)
    this.setData({
      'pubForm.remark': e.detail.value
    })
  },
  disABmoneyChange(e){
    // console.log(e)
    this.setData({
      'pubForm.disABmoney': e.detail.value
    })
  },
  // 提交
  pubSubmit(){
    if (!this.data.distanceV){
      return
    }
    if(!this.data.submitBtn.clickable){
      return
    }
    const pubForm = this.data.pubForm
    if (!(pubForm.pointA && pubForm.pointA.name)){
      // console.log('请选择从哪走')
      wx.showModal({
        title: '',
        content: '请选择从哪走',
        showCancel: false,
      })
      return
    }
    if (!(pubForm.pointB && pubForm.pointB.name)) {
      // console.log('请选择去哪儿')
      wx.showModal({
        title: '',
        content: '请选择去哪儿',
        showCancel: false,
      })
      return
    }
    if (!(pubForm.tripType >=0 )) {
      // console.log('请选择行程类型')
      wx.showModal({
        title: '',
        content: '请选择行程类型',
        showCancel: false,
      })
      return
    }
    const pickerList = this.data.pickerList
    let arr = []
    for (let i = 0;i < pickerList.length;i++){
      const n = pickerList[i]
      if (n.mode === 'date' || n.mode === 'time'){
        if (n.value == '') {
          // console.log('请选择'+n.placeholder)
          wx.showModal({
            title: '',
            content: '请选择' + n.placeholder,
            showCancel: false,
          })
          return
        }
        if (n.value) {
          arr.push(n.value)
        }
      }
    }
    const tripTime = arr.join(' ')
    // console.log('tripTime=>', tripTime)
    pubForm.tripTime = tripTime

    if (!(pubForm.disABmoney >= 0)) {
      wx.showModal({
        title: '',
        content: '请填写人均费用',
        showCancel: false,
      })
      return
    }

    const userInfo = app.globalData.insertUserInfo || wx.getStorageSync('insertUserInfo')
    // console.log('userInfo=>', userInfo)
    if (!(userInfo && userInfo.nickName)){
      // console.log('用户信息获取错误')
      wx.showModal({
        title: '',
        content: '用户信息获取错误',
        showCancel: false,
      })
      return
    }
    pubForm.userInfo = userInfo
    const sForm = {
      created_at: util.formatTime(new Date(), '-:'),
      updated_at: util.formatTime(new Date(), '-:'),
      ...pubForm,
    }
    console.log('sForm=>',sForm)
    this.setData({
      'submitBtn.clickable': false,
      'submitBtn.tips': '提交中...'
    })
    const pid = this.data.pid || null
    if(pid){
      console.log('更新行程')
      db.collection('xpc_pub').doc(pid).update({
        data: sForm
      }).then(res => {
        // console.log(res)
        if (res.errMsg == 'document.update:ok') {
          wx.showModal({
            title: '',
            content: '行程更新成功',
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
        }
      }).catch(err => {
        console.error(err)
      })
    }else{
      console.log('新增行程')
      db.collection('xpc_pub').add({
        data: sForm
      }).then(res => {
        // console.log(res)
        if (res.errMsg == 'collection.add:ok') {
          wx.showModal({
            title: '',
            content: '行程发布成功',
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
        }
      }).catch(err => {
        console.error(err)
      })
    }
  },
  pubDel(e){
    // console.log(e)
    const pid = e.currentTarget.id || null
    if(pid){
      if (!this.data.submitBtn.clickable) {
        return
      }
      wx.showModal({
        title: '确定删除？',
        content: '此操作不可恢复',
        success:(res)=> {
          if (res.confirm) {
            console.log('用户点击确定')
            this.setData({
              'submitBtn.clickable': false,
              'submitBtn.del': '删除中...'
            })
            db.collection('xpc_pub').doc(pid).remove().then(res=>{
              // console.log(res)
              if (res.errMsg=== 'document.remove:ok'){
                wx.showModal({
                  title: '',
                  content: '删除成功',
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
              }
            }).catch(err=>{
              console.error(err)
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  }
})
