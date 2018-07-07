/**
 * app.directive.js
 * @authors Casper 
 * @date    2016/01/03
 * @version 1.0.0
 */

 var tabs,
    tabs2,
     scroll,
     animeModal,
     passwordShow,
     toolTip,
     dialog,
     countDown,
     waiting,
     setCookie,
     getCookie,
     lazyLoading,
     picker,
     mode;

 
define(['angular','common/script/lib/swiper.min.js'], function(angular) {
  angular.module('app.directive', [])
    .directive('alertBox', alertBox);

  function alertBox () {
    return {
      restrict: 'EA',
      template: '<div ng-if="vm.showConfirm" class="confirm-wrapper">' +
                  '<div class="confirm">' +
                    '<div class="confirm-tip">温馨提示</div>' +
                    '<div class="confirm-info" ng-class="{\'confirm-success\': vm.success}"><div>{{vm.msg}}</div></div>' +
                    '<div class="confirm-ok-button" ng-click="vm.closeMsg();">{{vm.btnMsg}}</div>' +
                  '</div>' +
                '</div>',
      replace: true,
      controller: ['$scope', '$rootScope', '$window', function ($scope, $rootScope, $window) {
        var vm = this;
        vm.showConfirm = false;
        vm.msg = '';
        vm.btnMsg = '';
        vm.closeMsg = closeMsg;

        var func;

        var STATUS_MSG = {
              401: {
                msg: '状态失效，请重新登录',
                btnMsg: '重新登录'
              },
              404: {
                msg: '无法连接服务器，请稍后再试'
              }
            },
            DEFAULT = {
              msg: '未知错误',
              btnMsg: '知道了'
            },
            ILLEGAL_BTN_MSG = '立刻登录',
            LOGIN_TIMEOUT_BTN_MSG = '重新登录';

        active();

        function active () {
          $rootScope.$on('alert', function (event, data) {
            data && analyze(data);
          });

          $scope.$on('alert', function (event, data) {
            data && analyze(data);
          });

          $scope.$on('close', function () {
            close();
          });
        }

        function closeMsg () {
          func && func();
          close();
        }

        function close () {
          if (vm.showConfirm) {
            vm.showConfirm = false;
            func = null;
            $(window).unbind('touchmove');
          }
        }

        function open () {
          if (!vm.showConfirm) {
            vm.showConfirm = true;
            $(window).bind('touchmove',function(e){  
              e.preventDefault();  
            });
          }
        }

        function analyze (data) {
          func = data.func;
          vm.success = !!data.success;
          if (!special(data)) {
            vm.msg = data.msg || '';
            vm.btnMsg = data.btnMsg || DEFAULT.btnMsg;
          }
          open();
        }

        function special (config) {
          if (config.status in STATUS_MSG) {
            vm.msg = STATUS_MSG[config.status].msg;
            vm.btnMsg = STATUS_MSG[config.status].btnMsg || DEFAULT.btnMsg;
            return true;
          } else if (config.ret) {
            vm.msg = config.ret.msg || DEFAULT.msg;
            if (config.ret.code === 3) {
              vm.btnMsg = ILLEGAL_BTN_MSG;
            } else if (config.ret.code === 4) {
              vm.btnMsg = LOGIN_TIMEOUT_BTN_MSG;
            } else {
              vm.btnMsg = config.btnMsg || DEFAULT.btnMsg;
            }
            return true;
          }
          return false;
        }
      }],
      controllerAs: 'vm'
    };
  }

  //tabs切换
  tabs = function(myevent,iscroll){
    var me = $(myevent.currentTarget);
    var index = me.index();
    var box = me.parents('.tabs-wrap');
    me.addClass('active').siblings().removeClass('active');
    box.find('.tabs-box').addClass('hidden').eq(index).removeClass('hidden');
    iscroll();
  }
  //默认iscroll
  scroll = function(element){
    return new IScroll(element,{ preventDefault:false });
  }

  //密码显示隐藏
  passwordShow = function(myevent){
    var me = $(myevent.target);
    if (me.hasClass('i-pass-show')) {
      me.removeClass('i-pass-show');
      me.prev().attr('type','password');
    }else{
      me.addClass('i-pass-show');
      me.prev().attr('type','text');
    }     
  }

  //弹出modal层动画
  animeModal = function(element){
    var t = this;
    t.modal = $(element);
    t.shade = t.modal.find('.shade');
    t.modalBox = t.modal.find('.modal-wrapper');
    t.closeBtn = t.modal.find('.modal-close');

    t.show = function(){
      show();
    }

    t.hide = function(){
      hide();
    }

    t.closeBtn.click(function() {
      hide();
    });

    function show(){
      t.modal.addClass('active');
      setTimeout(function(){
        if (t.shade) t.shade.addClass('active');
        t.modalBox.addClass('active')
      },50)
    }

    function hide(){
      if (t.shade) t.shade.removeClass('active'); 
      t.modalBox.removeClass('active');
      setTimeout(function(){
        t.modal.removeClass('active');
      },500)
    }

    return t.show();
  }

  //提示框
  toolTip = function(text){
    var _html = $('<div class="tool-tip"><p>'+text+'</p></div>');
    if (!$('.tool-tip').length) {
      _html.appendTo(document.body); 
      setTimeout(function(){
        _html.addClass('active');
        setTimeout(function(){
          _html.removeClass('active');
            setTimeout(function(){
              _html.remove();
            },300)
        },2000)
      },50)  
    }
  }

  //对话框
  dialog = function(obj){ 
    
    this.port = { 
      content : '内容',
      cancelBtnText  : '取消',
      confirmBtnText : '确认',
      confirmBtn : null,
      cancelBtn : null,
      mask : true
    }
    this.handlers = {};
    this.boudingBox = null;
    this.mask = null;
    this.content = null;

    this.alert = function(obj){ 
      $.extend(this.port,obj,{type:'alert'});
      this._html();
      this._event();
      return this;
    }

    this.confirm = function(obj){ 
      $.extend(this.port,obj,{type:'confirm'});
      this._html();
      this._event();
      return this;
    }     
  }

  dialog.prototype = {

    _html : function(){ 
      var self = this;

      var maskHtml = this.port.mask ? '<div class="dialog-mask"></div>' : ''; 
      var cancelBtn = this.port.type == 'confirm' ? '<a class="flex-1 cancel-btn" href="javascript:void(0)">'+this.port.cancelBtnText+'</a>' : '';

      //弹出框渲染
      self.boudingBox = $(
        '<div class="dialog-wrap">'+
            maskHtml+
          '<div class="dialog-content">'+
            '<div class="content">'+self.port.content+'</div>'+
            '<div class="bottom flex-box">'+
              cancelBtn+
              '<a class="flex-2 confirm-btn" href="javascript:void(0)">'+self.port.confirmBtnText+'</a>'+
            '</div>'+
          '</div>'+
        '</div>'
      ); 
      self.mask = self.boudingBox.find('.dialog-mask');
      self.content = self.boudingBox.find('.dialog-content');
      self.boudingBox.appendTo(document.body); 
      self.boudingBox.css('display','block'); 
      
      setTimeout(function(){
        self.mask.addClass('active');
        self.content.addClass('active');
      },50)
    },

    _event : function(){
      var self = this;

      self.port.cancelBtn && self.on('cancel',self.port.cancelBtn);
      self.port.confirmBtn && self.on('confirm',self.port.confirmBtn);

      self.boudingBox.delegate('.cancel-btn','click',function(){ 
        self.fire('cancel');
        self.destroy();
      }).delegate('.confirm-btn','click',function(){ 
        self.fire('confirm');
        self.destroy();
      })
    },

    destroy : function(){
      var self = this;
      self.mask.removeClass('active');
      self.content.removeClass('active');
      setTimeout(function(){
        self.boudingBox.remove();
      },100)
      
    },

    on : function(element,handler){ 
      if (this.handlers[element] == undefined) { 
        this.handlers[element] = [];
      }
      this.handlers[element].push(handler);
      return this;
    },

    fire : function(element,data){ 
      if (this.handlers[element] instanceof Array) {
        var handlers = this.handlers[element];
        for (var i = 0; i < handlers.length; i++) {
          handlers[i](data);
        };
      };
    }
  }



  //时间倒计时
  countDown = function(element,obj){

    var t = this;
    t.boudingBox = $(element);
    t.port = {
      time : 60,
      callback : null
    };

    t.init = function(obj){
      $.extend(t.port,obj);
      if (t.boudingBox.attr('disabled') ) {
        closeBtn()
        setTime(t.port.time);
      }else{
        openBtn()
      }
    }
    
    t.boudingBox.click(function() {
      closeBtn();
      setTime(t.port.time);
      t.port.callback && t.port.callback();
    });

    function setTime(time){
      t.timer = setInterval(function(){ 
        time--;    
        t.boudingBox.find('span').text(time)
        if (time <= 0) {
          clearInterval(t.timer); 
          openBtn();
        }
      },1000)
    }

    function openBtn(){
      t.boudingBox.text('获取验证码');
      t.boudingBox.attr('disabled',false)
    }

    function closeBtn(){
      t.boudingBox.attr('disabled',true)
      t.boudingBox.html('重新发送<span>'+t.port.time+'</span>(s)');
    }

    t.init(obj);

  }

  //请求等待
  waiting = function(){
    var _html = $('<div class="waiting"><div class="container"><div class="box box1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="box box2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="box box3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div></div>');
    
    this.init = function(){
      _html.appendTo(document.body);  
    }

    this.hide = function(){
      remove();
    }

    function remove(){
      _html.remove(); 
    }

    return this.init();
  }

  //设置/获取cookie
  setCookie = function(name,value,day){
    var expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate()+day); 
    document.cookie = name + '=' + escape(value) + ((day == null) ? '' : ';expiresDate=' + expiresDate.toGMTString());
  }
  getCookie = function(name){
    var cookie = document.cookie;
    if (cookie.length > 0) {
      _start = cookie.indexOf(name + "=");
      if (_start != -1) {
        _start = _start + name.length + 1;
        _end = cookie.indexOf(';',_start);
        if (_end == -1) _end = cookie.length;
        return unescape(cookie.substring(_start,_end));
      }
    }
    return false; 
  }

  //懒加载
  lazyLoading = function(imgELement,myScroll,obj){
    var t = this;
    t.port = {
      trueImgAttr : 'data-src',
      loadImgSrc : 'common/images/lazy-loading.jpg'
    }

    $.extend(t.port,obj);
    var imgArr = [];
    var imgs = $(imgELement);
    var myScroll = myScroll;

    function filterImgs(){
      imgs.each(function(i){
        this.src = t.port.loadImgSrc;
        imgArr[i] = $(this);
        imgArr[i].y = -getY(this);
        imgArr[i].src = $(this).attr(t.port.trueImgAttr);
      })
    }

    function scrollHandler(){
      var windowH = $(window).height();
      myScroll.on('scroll',function(){
        var s = this;
        $.each(imgArr,function(i,el){
          if (el !== undefined){  
            if (s.y < this.y+windowH) {
              this.attr('src',this.src);
              delete imgArr[i];
            }
          }
        })
      })
    }

    function getY(el){
      return $(el).offset().top;
    }

    filterImgs();
    scrollHandler();
  }



  picker = function(element,obj){
    this.handlers = {};
    this.port = {
      title : '请选择',
      separator : ' ',
      confirmBtn : null
    }
 
    this.init = function(){
      $.extend(this.port,obj);
      this.el = $(element);
      this.selectArr = [];
      this._html();
      this._event();

      return this;
    }
    this.init();
  }

  picker.prototype = {

    _html : function(){
      var self = this;
      self.boudingBox = $('<div class="picker-wrapper">'
                            +'<div class="picker-mask"></div>'
                            +'<div class="picker-main">'
                                +'<div class="picker-top-bar">'
                                    +'<h2 class="picker-tit">'+self.port.title+'</h2>'
                                    +'<div class="picker-close">确认</div>'
                                +'</div> '
                                +'<div class="picker-content">'
                                    +'<div class="center-highlight"></div>'
                                +'</div>'
                           +'</div>'
                        +'</div>')

      var pickerContent = self.boudingBox.find('.picker-content');
      var defaultArr =  self.el.val().split(self.port.separator);
      var index = 0;
      for (var i = 0; i < self.port.cols.length; i++) {
        var content = '<div class="swiper-container swiper-container-vertical picker-swiper'+i+'"><div class="swiper-wrapper">';
        for (var n = 0; n < self.port.cols[i].values.length; n++) {
          content += '<div class="swiper-slide">'+self.port.cols[i].values[n]+'</div>';
          index = defaultArr[i] == self.port.cols[i].values[n] ? n : index;
        }
        content += '</div></div>';
        $(content).appendTo(pickerContent);
       
        (function(num,id){
          setTimeout(function(){
            mySwiper = new Swiper('.picker-swiper'+num, {
              initialSlide : id,
              slidesPerView: 'auto',
              centeredSlides: true,
              direction: 'vertical',
              onInit : function(swiper){
                self.selectArr[num] = self.port.cols[num].values[swiper.activeIndex];
              },
              onSlideChangeEnd: function(swiper){
                 self.selectArr[num] = self.port.cols[num].values[swiper.activeIndex];
              }
            });
          },50)
        })(i,index);   
      }
      
      self.mask = self.boudingBox.find('.picker-mask');
      self.content = self.boudingBox.find('.picker-main');
      self.boudingBox.appendTo(document.body); 

      setTimeout(function(){
        self.mask.addClass('active');
        self.content.addClass('active');
      },50)
    },

    _event : function(){
      var self = this;
      self.port.confirmBtn && self.on('confirm',self.port.confirmBtn);

      self.boudingBox.delegate('.picker-close','click',function(){  
        self.el.val(self.selectArr.join(self.port.separator));
        self.destroy();
        self.fire('confirm');
      })
    },

    destroy : function(){
      var self = this;
      self.mask.removeClass('active');
      self.content.removeClass('active');
      setTimeout(function(){
        self.boudingBox.remove();
      },500)
      
    },

    on : function(element,handler){ 
      if (this.handlers[element] == undefined) { 
        this.handlers[element] = [];
      }
      this.handlers[element].push(handler);
      return this;
    },

    fire : function(element,data){ 
      if (this.handlers[element] instanceof Array) {
        var handlers = this.handlers[element];
        for (var i = 0; i < handlers.length; i++) {
          handlers[i](data);
        };
      };
    }
  }
	
  mode = function(element,obj){
    this.handlers = {};
    this.port = {
      title : '请选择',
      separator : ' ',
      confirmBtn : null
    }
 
    this.init = function(){
      $.extend(this.port,obj);
      this.el = $(element);
      this.selectArr = [];
      this._html();
      this._event();
	  this._delete();
      return this;
    }
    this.init();
  }

  mode.prototype = {

    _html : function(){
      var self = this;
      self.boudingBox = $('<div class="picker-wrapper">'
                            +'<div class="picker-mask"></div>'
                            +'<div class="picker-main">'
                                +'<div class="picker-top-bar">'
                                    +'<h2 class="picker-tit">'+self.port.title+'</h2>'
                                    +'<div class="picker-mode">确认</div>'
                                    +'<div class="picker-delete">&times;</div>'
                                +'</div> '
                                +'<div class="picker-content">'
                                    +'<div class="center-hight"></div>'
                                +'</div>'
                           +'</div>'
                        +'</div>')

      var pickerContent = self.boudingBox.find('.picker-content');
      var defaultArr =  self.el.val().split(self.port.separator);
      var index = 0;
      for (var i = 0; i < self.port.cols.length; i++) {
        var content = '<div class="swiper-contenter swiper-container-vertical picker-swiper'+i+'"><div class="swiper-wrapper">';
        for (var n = 0; n < self.port.cols[i].values.length; n++) {
          content += '<div class="swiper-slide">'+self.port.cols[i].values[n]+'</div>';
          index = defaultArr[i] == self.port.cols[i].values[n] ? n : index;
        }
        content += '</div></div>';
        $(content).appendTo(pickerContent);
       
        (function(num,id){
          setTimeout(function(){
            mySwiper = new Swiper('.picker-swiper'+num, {
              initialSlide : id,
              slidesPerView: 'auto',
              centeredSlides: true,
              direction: 'vertical',
              onInit : function(swiper){
                self.selectArr[num] = self.port.cols[num].values[swiper.activeIndex];
              },
              onSlideChangeEnd: function(swiper){
                 self.selectArr[num] = self.port.cols[num].values[swiper.activeIndex];
              }
            });
          },50)
        })(i,index);   
      }
      
      self.mask = self.boudingBox.find('.picker-mask');
      self.content = self.boudingBox.find('.picker-main');
      self.boudingBox.appendTo(document.body); 

      setTimeout(function(){
        self.mask.addClass('active');
        self.content.addClass('active');
      },50)
    },

    _event : function(){
      var self = this;
      self.port.confirmBtn && self.on('confirm',self.port.confirmBtn);

      self.boudingBox.delegate('.picker-mode','click',function(){  
        self.el.val(self.selectArr.join(self.port.separator));
        self.destroy();
        self.fire('confirm');
      })
    },
    
    _delete : function(){
      var self = this;
      self.boudingBox.delegate('.picker-delete','click',function(){  
        self.destroy();
      })
    },

    destroy : function(){
      var self = this;
      self.mask.removeClass('active');
      self.content.removeClass('active');
      setTimeout(function(){
        self.boudingBox.remove();
      },500)
      
    },

    on : function(element,handler){ 
      if (this.handlers[element] == undefined) { 
        this.handlers[element] = [];
      }
      this.handlers[element].push(handler);
      return this;
    },

    fire : function(element,data){ 
      if (this.handlers[element] instanceof Array) {
        var handlers = this.handlers[element];
        for (var i = 0; i < handlers.length; i++) {
          handlers[i](data);
        };
      };
    }
  }
});

