//app.js 应用程序的入口
// 读取应用程序配置文件，并获取接口服务器地址，发起请求时会使用
const host = require('./config').host
App({
  // 应用程序启动时执行的业务逻辑，一般常用来获取一些配置信息，获取缓存，获取登录状态等。
  onLaunch: function () {
  },
  // 应用程序的全局共享数据，在每个页面中通过获取app的实例去调用。
  globalData: {
    geohash: "ww0vsc6q2f8",
    latitude: 34.72475,
    longitude: 113.76655,
    host: host
  }
})
