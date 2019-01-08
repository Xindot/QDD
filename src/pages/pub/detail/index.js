const util = require('../../../utils/util')
const app = getApp()
const db = app.globalData.db
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    mapExtra: {
      selectArea: 'A',
      minHeight: 250,
      maxHeight: 600,
      hS: 'min',
    },
    map: {
      center: null,
      polyline: null,
      markers: null,
      includePoints: null,
      scale: 18,
      controls: [{
        id: 1,
        iconPath: '../../../images/common/switch.png',
        position: {
          left: 10,
          top: 10,
          width: 30,
          height: 30
        },
        clickable: true
      }]
    },
    switchTabs: [{
      label: '出发地',
      sign: 'A',
    }, {
      label: 'go',
      sign: 'AB',
    }, {
      label: '目的地',
      sign: 'B',
    }],
    ssTabIndex: 0,
    Me: null,
    Ta: null,
    taUserInfo: null,
    tripPoints: null,
  },
  onLoad(options) {
    const DS = this.data.mapExtra.selectArea || 'A'
    const pubMatchTwo = app.globalData.pubMatchTwo || wx.getStorageSync('pubMatchTwo')
    console.log('pubMatchTwo=>', pubMatchTwo)
    const Me = pubMatchTwo.Me
    const Ta = pubMatchTwo.Ta
    this.setData({
      Me,
      Ta,
    })
    this.setMap(DS)
    this.setTripPoints(DS)

    if (Ta.userInfo && Ta.userInfo.openId){
      this.getTaUserInfo(Ta.userInfo.openId)
    }
    // 获取设备信息
    this.wxGetSystemInfoSync()
  },
  onReadyonLoad() {},
  onShowonLoad() {},
  onHideonLoad() {},
  onUnloadonLoad() {},
  onPullDownRefreshonLoad() {},
  wxGetSystemInfoSync(){
    try {
      const SystemInfo = wx.getSystemInfoSync()
      // console.log(SystemInfo)
      const windowHeight = Number(SystemInfo.windowHeight) || 600
      if (windowHeight>0){
        this.setData({
          'mapExtra.maxHeight': windowHeight - 44
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  getTaUserInfo(openId) {
    if (openId){
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      db.collection('xpc_user').where({
        _openid: openId
      }).get().then(res => {
        console.log(res)
        if (res.errMsg === 'collection.get:ok') {
          const taUserInfo = res.data[0] || ''
          if (taUserInfo){
            this.setData({
              taUserInfo,
            })
          }
        }
        wx.hideLoading()
      })
    }
  },
  selectOneTab(e){
    const idx = e.currentTarget.dataset.idx || 0
    const selectArea = this.data.switchTabs[idx].sign
    this.setData({
      ssTabIndex:idx,
    })
    this.setMap(selectArea)
    this.setTripPoints(selectArea)
  },
  setTripPoints(DS){
    const Me = this.data.Me
    const Ta = this.data.Ta
    if (Me._id && Ta._id){
      const tp4 = (Me.tripType === 1) ? ['Me.A', 'Ta.A', 'Ta.B', 'Me.B'] : ['Ta.A', 'Me.A', 'Me.B', 'Ta.B']
      const tp2 = (DS === 'A') ? tp4.slice(0, 2) : (DS === 'AB') ? tp4.slice(1, 3) : tp4.slice(2, 4)
      const tripPoints = []
      tp2.forEach(sign => {
        const SF = (sign.indexOf('Me') >= 0) ? Me : Ta
        const WHOstr = (sign.indexOf('Me') >= 0) ? '(我)' : ''
        const Icon = (Number(SF.tripType) === 1) ? 'car-1' : 'person-1'
        const SI = sign.split('.')[1]
        tripPoints.push({
          point: SF['point' + SI],
          SF,
          Icon,
          WHOstr,
          // sign,
        })
      })
      // console.log('tripPoints=>',tripPoints)
      this.setData({
        tripPoints,
      })
    }
  },
  setMap(DS){
    this.setData({
      'map.center': null,
      'map.polyline': null,
      'map.markers': null,
      'map.includePoints': null,
      'mapExtra.selectArea': DS,
    })
    const Me = this.data.Me
    const Ta = this.data.Ta
    if (Me._id && Ta._id) {
      let center = {}
      const CK = (Me.tripType === 0) ? Me : Ta
      if (DS === 'A' || DS==='B'){
        center = {
          longitude: (Me['point' + DS].longitude + Ta['point' + DS].longitude) / 2,
          latitude: (Me['point' + DS].latitude + Ta['point' + DS].latitude) / 2,
        }
      }else{
        center = {
          longitude: (CK.pointA.longitude + CK.pointB.longitude) / 2,
          latitude: (CK.pointA.latitude + CK.pointB.latitude) / 2,
        }
      }
      // console.log(center)

      const tp2 = (DS === 'AB') ? ['Ta.A', 'Ta.B'] : ['Me.' + DS, 'Ta.' + DS] 
      const points = []
      tp2.forEach(sign => {
        const SF = (sign.indexOf('Me') >= 0) ? Me : Ta
        const SI = sign.split('.')[1]
        points.push({
          longitude: SF['point' + SI].longitude,
          latitude: SF['point' + SI].latitude,
          point: SF['point' + SI],
          sign,
        })
      })
      const polyline = [{
        points: points,
        color: "#5c95e6FF",
        width: 5,
        dottedLine: false
      }]
      const markers = []
      points.forEach(n => {
        const _SF = (n.sign.indexOf('Me') >= 0) ? Me : Ta
        const _Icon = (Number(_SF.tripType) === 1) ? 'car-1' : 'person-1'
        // const _IconStr = (Number(_SF.tripType) === 1) ? '(司机)' : '(乘客)'
        const _BZ = (n.sign.indexOf('Me') >= 0) ? '(我)' : ''
        const _FLAG = (n.sign.indexOf('.A') >= 0) ? '出发地' : '目的地'
        markers.push({
          // iconPath: _SF.userInfo.avatarUrl || '../../../images/common/' + _Icon + '.png',
          iconPath: '../../../images/common/' + _Icon + '.png',
          id: n.point,
          longitude: n.longitude,
          latitude: n.latitude,
          width: 20,
          height: 20,
          callout: {
            content: _SF.userInfo.nickName + _BZ,
            fontSize: 10,
            color: '#ffffff',
            bgColor: '#666666',
            borderColor: '#666666',
            // borderWidth: 2,
            borderRadius: 50,
            padding: 5,
            display: 'ALWAYS',
          },
          label: {
            content: _FLAG,
            fontSize: 10,
            color: '#ffffff',
            bgColor: '#666666',
            // borderColor: '#666666',
            // borderWidth: 2,
            borderRadius: 2,
            padding: 2,
            textAlign: 'center',
            anchorX: -17,
            anchorY: 1,
          }
        })
      })
      const WHOstr = (Me.tripType===0) ? '我': 'Ta'
      const _DIS = (DS.indexOf('AB') >= 0) ? '同行约' + Ta.disABshow : (DS.indexOf('A') >= 0) ? '接'+WHOstr+'约' + Ta.disAAshow : '送'+WHOstr+'约' +Ta.disBBshow
      markers.push({
        iconPath: '../../../images/common/car-1.png',
        id: center,
        longitude: center.longitude,
        latitude: center.latitude,
        width: 20,
        height: 20,
        callout: {
          content: _DIS,
          fontSize: 10,
          color: '#ffffff',
          bgColor: '#666666',
          borderColor: '#666666',
          // borderWidth: 2,
          borderRadius: 50,
          padding: 5,
          display: 'ALWAYS',
        },
      })
      // console.log(polyline)
      // console.log(markers)
      this.setData({
        'map.center': center,
        'map.polyline': polyline,
        'map.markers': markers,
        'map.includePoints': points,
      })
      // const tips = (DS === 'A') ? '已切换到出发地' : (DS === 'AB') ? '已切换到行程' : '已切换到目的地'
      // wx.showToast({
      //   title: tips
      // })
    }
  },
  // 地图区域发生改变
  regionchange(e) {
    // console.log(e)
    if (e.causedBy === 'drag' && e.type === 'end'){
      const hS = this.data.mapExtra.hS
      if(hS==='min'){
        this.setMapHeight('max')
      }
    }
  },
  // 点击图标
  markertap(e) {
    // console.log(e.markerId)
    const point = e.markerId
    if(point && point.longitude && point.latitude){
      if(point.name){
        this.wxOpenLocation(point)
      }
    }
  },
  // 点击切换按钮
  controltap(e) {
    const selectArea = this.data.mapExtra.selectArea
    const DS = (selectArea === 'A') ? 'AB' : (selectArea === 'AB') ? 'B' : 'A'
    const switchTabs = this.data.switchTabs
    for (let i = 0; i < switchTabs.length;i++){
      const n = switchTabs[i]
      if(n.sign===DS){
        this.setData({
          ssTabIndex: i,
        })
      }
    }
    this.setMap(DS)
    this.setTripPoints(DS)
  },
  // 打电话
  callPhone(e){
    const phoneNumber = e.currentTarget.dataset.phone || ''
    if (phoneNumber){
      wx.makePhoneCall({
        phoneNumber,
      })
    }
  },
  // 复制微信号
  wxSetClipboardData(e){
    const wxh = e.currentTarget.dataset.wxh || ''
    if(wxh){
      wx.setClipboardData({
        data: wxh,
        success:(res)=> {
          wx.getClipboardData({
            success:(res)=> {
              console.log(res.data)
            }
          })
        }
      })
    }
  },
  // 设置地图高度
  setMapHeight(hS){
    this.setData({
      'mapExtra.hS': hS
    })
  },
  // 设置地图大/小屏展示
  setMapUp(){
    const hS = this.data.mapExtra.hS
    // console.log(hS)
    if (hS === 'max') {
      this.setMapHeight('min')
    }
  },
  // 导航
  goNavigation(e){
    const idx = e.currentTarget.dataset.idx
    if(idx>=0){
      const point = this.data.tripPoints[idx].point
      // console.log(point)
      if(point && point.longitude && point.latitude) {
        this.wxOpenLocation(point)
      }
    }
  },
  // 打开位置
  wxOpenLocation(point){
    // console.log(point)
    if (point && point.longitude && point.latitude) {
      wx.showModal({
        title: '温馨提示',
        content: '点击新页面右下角按钮可选择导航方式',
        cancelText: '取消导航',
        cancelColor: '#666666',
        confirmText: '去导航页',
        // confirmColor: '',
        success: (res) => {
          if (res.confirm) {
            wx.openLocation({
              longitude: point.longitude,
              latitude: point.latitude,
              // scale: 18,
              name: point.name,
              address: point.address,
            })
          }
        }
      })
    }
  }
})