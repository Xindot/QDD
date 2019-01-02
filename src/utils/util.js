// 数字补0
const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 时间格式化
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

//文件引用
const CusBase64 = require('base64.js');
// base64 js解码与转码
const base64 = {
  encodeUnicode: (str) => {
    return CusBase64.CusBASE64.encoder(str)
  },
  decodeUnicode: (str) => {
    return CusBase64.CusBASE64.decoder(str)
  }
}

module.exports = {
  formatTime,
  indexOfArrSmallest,
  base64,
}
