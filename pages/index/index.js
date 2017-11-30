//index.js
// 导入工具包
var util = require('../../utils/util.js')
//获取应用实例，目的是通过app实例获取全局共享数据
var app = getApp()
Page({
  // 页面的数据，类似于Vue中的data属性，注意此处和Vue中不同，不需要返回函数
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    position: {},
    weather: {},
    keys: [],
    carousel: [],
    restaurants: []
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  onLoad: function () {
    this.getPosition();
    this.getWeather();
    this.getHotSearch();
    this.getCarousel();
    this.getRestaurants();
  },
  // 获取地理位置信息https://restapi.ele.me/v2/pois/ww0vsc6q2f8
  getPosition: function () {
    var self = this
    // request()用来发起http请求,method属性默认值为get
    wx.request({
      url: app.globalData.host + "/v2/pois/" + app.globalData.geohash,
      data: {},
      success: function (res) {
        console.log(res)
        if (res.statusCode) {
          // console.log(res.data)
          // 特别注意：直接给data中的数据赋值将不受小程序的控制，必须调用setData()方法
          // self.data.position = res.data
          self.setData({
            position: res.data
          });
        }
      },
      fail: function (res) {
        wx.showModal({
          title: "错误",
          content: "请求出错，错误信息：" + res.errMsg,
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  },
  // 获取天气信息https://restapi.ele.me/bgs/weather/current?latitude=34.727104&longitude=113.75939
  getWeather: function () {
    var self = this
    wx.request({
      url: app.globalData.host + "/bgs/weather/current",
      method: 'get',
      data: {
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude
      },
      success: function (res) {
        if (res.statusCode) {
          // console.log(res.data)
          self.setData({
            weather: {
              code: res.data.code,
              temperature: util.formatTemperature(res.data.temperature),
              description: res.data.description,
              image_hash: util.formatImagePath(res.data.image_hash)
            }
          });
        }
      },
      fail: function (res) {
        wx.showModal({
          title: "错误",
          content: "请求出错，错误信息：" + res.errMsg,
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  },
  // 获取热门关键字信息https://restapi.ele.me/shopping/v3/hot_search_words?latitude=34.727104&longitude=113.75939
  getHotSearch: function () {
    var self = this
    wx.request({
      url: app.globalData.host + "/shopping/v3/hot_search_words",
      method: 'get',
      data: {
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude
      },
      success: function (res) {
        if (res.statusCode) {
          self.setData({
            keys: res.data
          });
        }
      },
      fail: function (res) {
        wx.showModal({
          title: "错误",
          content: "请求出错，错误信息：" + res.errMsg,
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  },
  // 获取导航信息https://restapi.ele.me/shopping/v2/entries?latitude=34.727104&longitude=113.75939&templates[]=main_template
  getCarousel: function () {
    var self = this
    wx.request({
      url: app.globalData.host + "/shopping/v2/entries",
      method: 'get',
      data: {
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude,
        'templates[]': 'main_template'
      },
      success: function (res) {
        if (res.statusCode) {
          // console.log(res.data)
          var list = res.data[0].entries;
          // 分组，每组显示8个
          var group_len = Math.ceil(list.length / 8);
          // console.log(group)
          var carousel = []; 
          for (var i = 0; i < group_len; i++) {
            var group = [];
            var groupitem = list.slice(i * 8, i * 8 + 8);
            if (groupitem.length > 4) {
              var len = Math.ceil(groupitem.length / 4);
              for (var j = 0; j < len; j++) {
                var item = groupitem.slice(j * 4, j * 4 + 4);
                var newItem = item.map(function(item){
                  return { 
                    name: item.name,
                    image: util.formatImagePath(item.image_hash)
                  }
                })
                group.push(newItem);
              }
            } else {
              var newItem = groupitem.map(function (item) {
                return {
                  name: item.name,
                  image: util.formatImagePath(item.image_hash)
                }
              })
              group.push(newItem);
            }
            carousel.push(group);
          }
          self.setData({
            carousel: carousel
          });
          // console.log(self.data.carousel);
        }
      },
      fail: function (res) {
        wx.showModal({
          title: "错误",
          content: "请求出错，错误信息：" + res.errMsg,
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  },
  // 获取商家饭店列表信息https://restapi.ele.me/shopping/restaurants?latitude=34.727104&longitude=113.75939&offset=60&limit=20&extras[]=activities&extra_filters=home&terminal=h5
  getRestaurants: function () {
    var self = this
    wx.request({
      url: app.globalData.host + "/shopping/restaurants",
      method: 'get',
      data: {
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude,
        offset: 60,
        limit: 20,
        'extras[]': 'activities',
        'extra_filters': 'home',
        'terminal': 'h5'
      },
      success: function (res) {
        if (res.statusCode) {
          // console.log(res.data)
          var newArr = res.data.map(function(item){
            item.image_path = util.formatImagePath(item.image_path);
            item.distance = util.formatDistance(item.distance);
            return item;
          })
          self.setData({
            restaurants: newArr
          });
          console.log(self.data.restaurants);
        }
      },
      fail: function (res) {
        wx.showModal({
          title: "错误",
          content: "请求出错，错误信息：" + res.errMsg,
          showCancel: false,
          confirmText: "确定"
        })
      }
    })
  }
})
