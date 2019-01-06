const util = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    mapExtra: {
      selectArea: 'A',
      points: []
    },
    map: {
      center: null,
      scale: 18,
      polyline: null,
      markers: null,
      includePoints: null,
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
    }
  },
  onLoad(options) {
    const PubMatchTwo = wx.getStorageSync('PubMatchTwo')
    console.log(PubMatchTwo)
    const Me = PubMatchTwo.Me
    const Ta = PubMatchTwo.Ta
    if (Me._id && Ta._id) {
      const center = {
        longitude: (Me.pointA.longitude + Ta.pointA.longitude)/2,
        latitude: (Me.pointA.latitude + Ta.pointA.latitude)/2,
      }
      // console.log(center)
      // 司机为起点 
      const tp4 = (Me.tripType === 1) ? ['Me.A','Ta.A','Ta.B','Me.B'] : ['Ta.A','Me.A','Me.B','Ta.B']
      const points = []
      tp4.forEach(sige=>{
        const SF = (sige.indexOf('Me')>=0) ? Me : Ta
        const SI = sige.split('.')[1]
        points.push({
          longitude: SF['point'+SI].longitude,
          latitude: SF['point'+SI].latitude,
          sige: sige
        })
      })
      console.log(points)
      const polyline = [{
        points: points,
        color: "#5c95e6FF",
        width: 5,
        dottedLine: false
      }]
      const markers = []
      const includePoints = []
      points.forEach(n=>{
        const DOTS = '.A'
        if (n.sige.indexOf(DOTS)>=0){
          includePoints.push(n)
        }
        const _SF = (n.sige.indexOf('Me')>=0) ? Me: Ta
        const Icon = (Number(_SF.tripType) === 1) ? 'car-1' : 'person-1'

        const _BZ = (n.sige.indexOf('Me') >= 0) ? '(我)' : (n.sige.indexOf(DOTS) >= 0) ? '(距我' + Ta.disAAshow + ')' : '(距我'+Ta.disBBshow+')'
        const _FLAG = (n.sige.indexOf(DOTS) >= 0) ? '出发地' : '目的地'

        markers.push({
          // iconPath: _SF.userInfo.avatarUrl,
          iconPath: '../../../images/common/' + Icon+'.png',
          id: _SF._id,
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
            anchorY: 2,
          }
        })
      })
      // console.log(polyline)
      // console.log(markers)
      // console.log('includePoints=>',includePoints)
      this.setData({
        'map.center': center,
        'map.polyline':polyline,
        'map.markers': markers,
        'map.includePoints': includePoints,
        'mapExtra.points': points,
      })
    }
  },
  onReadyonLoad() { },
  onShowonLoad() { },
  onHideonLoad() { },
  onUnloadonLoad() { },
  onPullDownRefreshonLoad() { },
  regionchange(e) {
    console.log(e)
  },
  markertap(e) {
    // console.log(e.markerId)
  },
  controltap(e) {
    // console.log(e.controlId)
    const PubMatchTwo = wx.getStorageSync('PubMatchTwo')
    // console.log(PubMatchTwo)
    const Me = PubMatchTwo.Me
    const Ta = PubMatchTwo.Ta
    if (Me._id && Ta._id){
      const selectArea = this.data.mapExtra.selectArea
      const S = (selectArea === 'A') ? 'B' : 'A'
      // console.log(S)
      const includePoints = []
      const points = this.data.mapExtra.points
      points.forEach(n=>{
        if(n.sige.indexOf(S)>=0){
          includePoints.push(n)
        }
      })
      const center = {
        longitude: (Me['point' + S].longitude + Ta['point' + S].longitude) / 2,
        latitude: (Me['point' + S].latitude + Ta['point' + S].latitude) / 2,
      }
      // console.log('includePoints=>', includePoints)
      this.setData({
        'map.center': center,
        'map.includePoints': includePoints,
        'mapExtra.selectArea': S,
      })
      const scale = this.data.map.scale
      console.log('scale=>', scale)
    }
  }
})