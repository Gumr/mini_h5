/**
 * app.js
 * @authors Casper 
 * @date    2015/12/14
 * @version 1.0.0
 */
define(['angular', 'app.core'], function(angular) {
  angular.module('app', ['app.core'])
    .config(configure)
    .run(run);

  configure.$inject = [];
  function configure() {}

  run.$inject = ['$rootScope', '$urlRouter','$verifyService','$homeService'];
  function run($rootScope, $urlRouter,$verifyService,$homeService) {
    $rootScope.$on('$stateChangeStart', function(e, nextState, nextStateParams) {
      // console.log("$stateChangeStart", arguments);
      $rootScope.$broadcast('close');
    });
    $rootScope.$on('$locationChangeSuccess', function(e, next, current) {
      // console.log("$locationChangeSuccess", next, current);
      e.preventDefault();
      $urlRouter.sync();
    });
	
    //拿取用户验证串
    var Authcation = $verifyService.getQueryParam("Authorication");
    if(!window.localStorage.getItem("sinks-token")){
      window.localStorage.setItem("sinks-token",Authcation);
    }else{
      if(Authcation){
        window.localStorage.setItem("sinks-token",Authcation);
      }
    }
	
	//登陆注册需要的unionId
	var unionId = $verifyService.getQueryParam("unionId");
    if(unionId){
    	sessionStorage.setItem('unionId',unionId)
    }
    //登陆注册需要的openId
	var openId = $verifyService.getQueryParam("openId");
    if(openId){
    	sessionStorage.setItem('openId',openId)
    }
    
	//刷脸呗app 分享码
	var shareCode = $verifyService.getQueryParam("shareCode");
	if(shareCode){
    	sessionStorage.setItem('shareMakemoneyToken',shareCode)
    }

    //存储渠道id
    if(!window.sessionStorage.getItem('channelId')){
      var channelId = $verifyService.getQueryParam("channelId");
      if(channelId == '196225731' || channelId == '100000000'){
        $rootScope.isHSH = false;
      }else if(channelId == null || channelId == "" || channelId == '16993205'){
        channelId = "1000013001"
        $rootScope.isHSH = true;
      }else{
        $rootScope.isHSH = true;
      }
      window.sessionStorage.setItem('channelId',channelId);
    }else{
      if(window.sessionStorage.getItem('channelId') == '196225731' || window.sessionStorage.getItem('channelId') == '100000000'){
        $rootScope.isHSH = false;
      }else{
        $rootScope.isHSH = true;
      }
    }

    //0元购首次进入引导
    if (getCookie('investGuide')) {
      $rootScope.investUrl = 'investIncome?minInvestMoney='+getCookie('minInvestMoney')+'&maxInvestMoney='+getCookie('maxInvestMoney')+'&investTime='+getCookie('investTime')+'&investTimeTest='+getCookie('investTimeTest')+'&test='+getCookie('test');
      console.log($rootScope.investUrl)
    }else{
      $rootScope.investUrl = 'invest';
    }

    //首次进入城市定位
    $homeService.locateAddress().success(function(data){
        window.sessionStorage.setItem('city-orientation', data.result.city)
        //window.sessionStorage.setItem("city-orientation",decodeURI(data.result.locateCity))
    });

    //同盾设备信息
    (function(){
      var tokenId = '';
      for (var i = 0; i < 6; i++) {
        tokenId+= Math.floor(Math.random()*9+1);
      }
      tokenId+= new Date().getTime();
      window.sessionStorage.setItem('$tokenId',tokenId);

      _fmOpt = {
        partner: 'huilianjr',
        appName: 'huilianjir_web',
        token: tokenId                            
      };
      var cimg = new Image(1,1);
      cimg.onload = function() {
          _fmOpt.imgLoaded = true;
      };
      cimg.src = "https://fp.fraudmetrix.cn/fp/clear.png?partnerCode=huilianjr&appName=huilianjir_web&tokenId=" + _fmOpt.token;
      var fm = document.createElement('script'); fm.type = 'text/javascript'; fm.async = true;
      fm.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'static.fraudmetrix.cn/fm.js?ver=0.1&t=' + (new Date().getTime()/3600000).toFixed(0);
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(fm, s);
    })();

    // 引入iPhone X适配文件
    function includeLinkStyle(url) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = url;
      document.getElementsByTagName("head")[0].appendChild(link);
     }
      
     
    if ((screen.width == 375) && (screen.height == 812)) {
      includeLinkStyle("common/css/iPhone X.css");
    }
	
  }
});