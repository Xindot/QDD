const app = getApp()
const Version = app.globalData.Version

Page({
  data: {
    map: {
      center: null,
      scale: 18,
      polyline: null,
      markers: null,
      includePoints: null,
    }
  },
  onLoad(options) {
    const PubMatchTwo = wx.getStorageSync('PubMatchTwo')
    console.log(PubMatchTwo)
    const Me = PubMatchTwo.Me
    const Ta = PubMatchTwo.Ta
    if (Me._id && Ta._id) {
      const center = {
        longitude: Me.pointA.longitude,
        latitude: Me.pointA.latitude,
      }
      const points = [{
        longitude: Me.pointA.longitude,
        latitude: Me.pointA.latitude,
        sige: 'Me.A',
      }, {
        longitude: Ta.pointA.longitude,
        latitude: Ta.pointA.latitude,
        sige: 'Ta.A',
      }, {
        longitude: Ta.pointB.longitude,
        latitude: Ta.pointB.latitude,
        sige: 'Ta.B',
      }, {
        longitude: Me.pointB.longitude,
        latitude: Me.pointB.latitude,
        sige: 'Me.B',
      }]
      // const includePoints = points.slice(0,1)
      const polyline = [{
        points: points,
        color: "#5c95e6FF",
        width: 5,
        dottedLine: false
      }]
      const markers = []
      points.forEach(n=>{
        const PUB = (n.sige.indexOf('Me')>=0) ? Me: Ta
        const RM = (n.sige.indexOf('Me') >= 0) ? '(我)' : (n.sige.indexOf('.A') >= 0) ? '(' + Ta.disAAshow + ')' : '('+Ta.disBBshow+')'
        const Icon = (Number(PUB.tripType) === 1) ? 'car-1' : 'person-1'
        markers.push({
          // iconPath: PUB.userInfo.avatarUrl,
          iconPath: '../../../images/common/' + Icon+'.png',
          id: PUB._id,
          longitude: n.longitude,
          latitude: n.latitude,
          width: 15,
          height: 15,
          callout: {
            content: PUB.userInfo.nickName + RM,
            fontSize: 10,
            color: '#666666',
            bgColor:'#ffffff',
            borderRadius: 50,
            padding: 5,
            display: 'ALWAYS',
          }
        })
      })
      // console.log(polyline)
      // console.log(markers)
      this.setData({
        'map.center': center,
        'map.polyline':polyline,
        'map.markers': markers,
        // 'map.includePoints': includePoints,
      })
    }
  },
  onReadyonLoad() { },
  onShowonLoad() { },
  onHideonLoad() { },
  onUnloadonLoad() { },
  onPullDownRefreshonLoad() { },
  regionchange(e) {
    // console.log(e.type)
  },
  markertap(e) {
    // console.log(e.markerId)
  },
})