const util=require('../../utils/util')

//获取应用实例
const app = getApp()
const db = app.globalData.db
const QNImgStyle = app.globalData.QNImgStyle
const Timeout = app.globalData.Timeout
const Tips = app.globalData.Tips

Page({
  data: {
    QNImgStyle,
    header: {
      tabs: ['今日','往日','作品'],
      selectIndex: 0
    },
    workList: null,
    workSubmitList: null,
    waterfall: {
      imgWidth: 0,
      loadingCount: 0,
      column: [{height: 0,list: []},{height: 0,list: []}]
    },
  },
  onLoad() {
    // console.log('onLoad')
    wx.getSystemInfo({
      success: (res) => {
        const ww = res.windowWidth;
        const column = this.data.waterfall.column.length
        const imgWidth = ww * (1/column);
        this.setData({
          'waterfall.imgWidth': imgWidth
        });
      }
    })
  },
  onShow(){
    this.getWorkList()
  },
  // 提示
  tips: function(text){
    wx.showModal({
      title: '',
      content: text,
      showCancel:false,
    })
  },
  // 选择tab
  selectTab(e){
    // console.log(e)
    this.setData({
      'header.selectIndex': e.currentTarget.dataset.index,
      workList: null,
      workSubmitList: null,
      'waterfall.loadingCount': 0,
      'waterfall.column': [{height: 0,list: []},{height: 0,list: []}]
    })
    if(e.currentTarget.dataset.index==0 || e.currentTarget.dataset.index==1){
      this.getWorkList()
    }
    if(e.currentTarget.dataset.index==2){
      this.getAllSubmitList()
    }
  },
  // 下拉刷新
  onPullDownRefresh(){
    this.setData({
      workList: null,
      workSubmitList: null,
      'waterfall.loadingCount': 0,
      'waterfall.column': [{height: 0,list: []},{height: 0,list: []}]
    })
    if(this.data.header.selectIndex==0 || this.data.header.selectIndex==1){
      this.getWorkList()
    }
    if(this.data.header.selectIndex==2){
      this.getAllSubmitList()
    }
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },Timeout.wx.stopPullDownRefresh)
  },
  // 获取作业
  getWorkList(){
    if(this.data.header.selectIndex==0 || this.data.header.selectIndex==1){
      let query = {
        created_at: db.RegExp({
          regexp: util.formatTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), '-'),
          options: 'i',
        }),
        status: 1
      }
      if(this.data.header.selectIndex==0){
        query = {
          created_at: db.RegExp({
            regexp: util.formatTime(new Date(),'-'),
            options: 'i',
          }),
          status: 1
        }
      }
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      console.log('getWorkList query=>',query)
      db.collection('qlz_work').where(query).get().then(res => {
        // console.log('qlz_work res',res.data)
        if(res.data instanceof Array){
          let workList = res.data || []
          this.setData({
            workList,
          })
        }
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
    }
  },
  // 获取提交的作业列表
  getAllSubmitList(){
    if(this.data.header.selectIndex==2){
      wx.showLoading({
        title: Tips.wx.showLoading,
      })
      setTimeout(function () {
        wx.hideLoading()
      }, Timeout.wx.hideLoading)
      db.collection('qlz_submit').where({}).orderBy('created_at','desc').get().then(res => {
        // console.log('qlz_submit res',res.data)
        if(res.data && res.data instanceof Array){
          let workSubmitList = res.data || []
          if(workSubmitList.length>0){
            workSubmitList.forEach(n=>{
              if(n.img && n.img.indexOf('img.6h5.cn')>=0){
                n.imgStyle = 'QN'
              }
            })
          }
          this.setData({
            workSubmitList,
            'waterfall.loadingCount': workSubmitList.length
          })
        }
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
    }
  },
  // 作业详情
  targetDetail(e){
    // console.log(e)
    const wid = e.currentTarget.id
    if(wid){
      wx.navigateTo({
        url: '../submit/targetDetail/index?wid='+wid
      })
    }
  },
  oneDetial(e){
    // console.log(e)
    const sid = e.currentTarget.id
    if (sid) {
      wx.navigateTo({
        url: '../submit/oneDetail/index?sid=' + sid
      })
    }
  },
  // 提交我的作业
  workSubmit(e){
    // console.log(e)
    const wid = e.currentTarget.dataset.id
    if(wid){
      wx.navigateTo({
        url: '../submit/index?wid='+wid
      })
    }
  },
  // 查看大图
  lookBigImg(e){
    var url = e.currentTarget.dataset.imgurl || ''
    if(url){
      wx.previewImage({
        current: url, // 当前显示图片的http链接
        urls: [url] // 需要预览的图片http链接列表
      })
    }
  },
  // 图片加载 瀑布流功能
  onImageLoad(e){ 
    // console.log(e)
    // 获取需要的数据
    let idx = e.currentTarget.dataset.idx; // 当前图片索引 // console.log(idx)
    let oImgW = e.detail.width;         //图片原始宽度
    let oImgH = e.detail.height;        //图片原始高度
    let imgWidth = this.data.waterfall.imgWidth;  //图片设置的宽度
    let scale = imgWidth / oImgW;        //比例计算
    let imgHeight = oImgH * scale;      //自适应高度 // console.log('imgHeight=>',imgHeight)
    
    // 获取图片
    let imageObj = this.data.workSubmitList[idx]; // console.log(imageObj)
    imageObj.height = imgHeight;

    // 往高度最低的列中放图片 在数组中找到最小元素的位置
    let mIdx = util.indexOfArrSmallest(this.data.waterfall.column,'height')
    // console.log(mIdx)
    // let column = this.data.waterfall.column.sort((a, b) => { return a.height - b.height; })  // height从小到大排序 废弃
    let column = this.data.waterfall.column
    column[mIdx].height += imgHeight
    column[mIdx].list.push(imageObj)
    let loadingCount = this.data.loadingCount - 1;

    console.log('column=>',column)
    // 赋值
    this.setData({
      'waterfall.loadingCount': loadingCount,
      'waterfall.column': column
    });

    //当前这组图片已加载完毕，则清空图片临时加载区域的内容
    if (loadingCount==0) {
      this.setData({
        workSubmitList: null
      })
    }
  },
  // 布置作业
  createOneWork(){
    wx.navigateTo({
      url: 'add/index'
    })
  },
});


