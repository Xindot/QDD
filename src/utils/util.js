
// 时间格式化
// 数字补0
const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatTime = (date,returnType) => {
  const DATE = date || new Date()

  const year = DATE.getFullYear()
  const month = DATE.getMonth() + 1
  const day = DATE.getDate()
  const hour = DATE.getHours()
  const minute = DATE.getMinutes()
  const second = DATE.getSeconds()
  const ms = DATE.getMilliseconds()
  const week = DATE.getDay()

  if(returnType=='/:'){
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  if(returnType=='-:'){
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  if(returnType=='-'){
    return [year, month, day].map(formatNumber).join('-')
  }
  if(returnType==':4'){
    return [hour, minute].map(formatNumber).join(':')
  }
  if(returnType=='8'){
    return [year, month, day].map(formatNumber).join('')
  }
  if(returnType=='CN'){
    const weeksCN = [ '日', '一', '二', '三', '四', '五', '六' ];
    return year+'.'+month+'.'+day+' 星期'+weeksCN[week];
  }
  if(returnType=='19'){
    return [year, month, day, hour, minute, second, ms].map(formatNumber).join('')
  }
  return [year, month, day].map(formatNumber).join('')
}


// 在JavaScript数组中找到最小元素的位置
const indexOfArrSmallest = (arr,key) => {
 let lowest = 0;
 for (let i = 1; i < arr.length; i++) {
  if(key){
    if (arr[i][key] < arr[lowest][key]){
      lowest = i
    }
  }else{
    if (arr[i] < arr[lowest]){
      lowest = i
    }
  }
 }
 return lowest;
}


// base64 js解码与转码
const CusBase64 = require('base64.js');
const base64 = {
  encodeUnicode: (str) => {
    return CusBase64.CusBASE64.encoder(str)
  },
  decodeUnicode: (str) => {
    return CusBase64.CusBASE64.decoder(str)
  }
}


/**
 * 获取两个经纬度之间的距离
 * @param lng1 第一点的经度
 * @param lat1 第一点的纬度
 * @param lng2 第二点的经度
 * @param lat2 第二点的纬度
 * @returns {Number}
 */
const distanceByLnglat = (lng1, lat1, lng2, lat2) => {
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378137.0; // 取WGS84标准参考椭球中的地球长半径(单位:m)
  s = Math.round(s * 10000) / 10000;
  // alert(s);
  return s
  // //下面为两点间空间距离（非球面体）
  // var value= Math.pow(Math.pow(lng1-lng2,2)+Math.pow(lat1-lat2,2),1/2);
  // alert(value);
}
const Rad = (d) => {
  return d * Math.PI / 180.0;
}


// JS 正则表达式从地址中提取省市县 https://www.jb51.net/article/149398.htm
// const reg = /.+?(省|市|自治区|自治州|县|区)/g;
const extractSSX = (address) => {
  if (address) {
    const reg0 = /\((.+?)\)/g;
    const arr0 = address.match(reg0)
    const str0 = arr0.reverse()[0]

    const reg1 = /.+?(省|市|自治区|自治州)/g;
    const arr1 = address.replace(reg0,'').match(reg1)
    const str1 = arr1.reverse()[0]

    const str = str0 || str1
    console.log(str)
    return str.replace(/(省|市|县|\(|\))/g,'')
  } else {
    return ''
  }
}

module.exports = {
  formatTime,
  indexOfArrSmallest,
  base64,
  distanceByLnglat,
  extractSSX,
}
