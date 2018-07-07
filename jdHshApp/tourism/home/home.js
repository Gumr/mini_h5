/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular','css!./home.css','common/script/lib/swiper.min.js'], function(angular) {
  angular.module('app').controller('homeCtrl', homeCtrl);
  homeCtrl.$inject = ['$scope', '$state', '$verifyService','$timeout','$stateParams','$productService','$userService','$tourismService','$homeService','$window']
  function homeCtrl($scope, $state,$verifyService,$timeout,$stateParams,$productService,$userService,$tourismService,$homeService,$window) {
    $verifyService.SetIOSTitle("旅游-首页");
    var vm = this;
    var mainScroll;
    $scope.region = $window.sessionStorage.getItem("city-orientation");    //定位区域
    $scope.imgServer = imgUrl;                                 //精品路线-自营列表图片服务器
    $scope.searchContent = '';                                 //搜索框文字
    $scope.types = $tourismService.type.slice(0,5);            //产品分类数据
    $scope.bannerList = [];                                    //banner数据
    $scope.hotCityList = [];                                   //热门目的地数据
    $scope.routeGoodsList = [];                                //精品路线产品数据
    $scope.lineLogic = true;                                   //精品路线（true-自营）（false-驴妈妈）
    $scope._class = '';
    $scope._type = '';
    $scope._region = $scope.region;
    init();
    function init(){
      var bannerHeight = $('.bannerSlide').height()-$('.header-bar').height();
      mainScroll = new IScroll(".main-content",{
        probeType : 3,
        preventDefault:false
      })
      mainScroll.on('scroll',function(){
          if (this.y < -1) $('header').css('backgroundColor','rgba(255,96,46,0)');
          if (this.y < -10) $('header').css('backgroundColor','rgba(255,96,46,.2)');
          if (this.y < -bannerHeight*0.5) $('header').css('backgroundColor','rgba(255,96,46,.5)');
          if (this.y < -bannerHeight) $('header').css('backgroundColor','rgba(255,96,46,1)');
      })
      getBanner();
      getHotDestinationList();
      getSelfSupportList();                                   //默认自营            
    }

    //搜索
    $scope.search = function(){
      if ($scope.searchContent) {
        $state.go('tourism-search',{
          searchkeyword : $scope.searchContent
        })
      }else{
        toolTip('请输入搜索内容')
      }
    }

    //精品路线
    $timeout(function(){
      var categorySlide = new Swiper('.route-swiper', {       //精品路线tabs滑动
        slidesPerView: 'auto',
        paginationClickable: true,
        freeMode: true
      });
    },200)
    //自营列表
    $scope.selfSupport = function($event){
      $scope.lineLogic = true;
      $scope.routeGoodsList = []
      getSelfSupportList();
      $($event.target).addClass('active')
      .siblings().removeClass('active');
    }
    //驴妈妈列表
    $scope.qualityRouteTabs = function($event,cls,type){      //精品路线tabs切换
      $scope.lineLogic = false;
      if (cls == '16') {
        $scope._class = '';
        $scope._region = $scope.region;
      }else{
        $scope._class = cls;
        $scope._region = '';
      }
      $scope._type = type;
      $scope.routeGoodsList = []
      getQualityRouteList(cls,type);
      $($event.target).addClass('active')
      .siblings().removeClass('active');
    }

    
    //获取banner数据
    function getBanner(){
      $tourismService.getHomeBanner()
      .success(function(data){
        if(data.resultCode == '0000'){
          if (!isEmptyObject(data.result)) {
            $scope.bannerList = data.result;
            $timeout(function(){
              var bannerSlide = new Swiper('.bannerSlide', {
                loop:true,
                autoplay:4000,
                autoplayDisableOnInteraction : false,
                pagination:'.swiper-pagination'
              });
            },200)
          }
        }else{
          toolTip(data.resultMessage)
        }
      })
    }

    //获取热门目的地数据
    function getHotDestinationList(){
    	
      $tourismService.getHotDestination({
        pageNo : 1 ,
        pageSize : 5
      }).success(function(data){
        if(data.resultCode == '0000'){
          if (!isEmptyObject(data.result)) {
            $scope.hotCityList = data.result;

            $timeout(function(){
              var hotSwiper = new Swiper('.hot-swiper', {
                slidesPerView: 'auto',
                paginationClickable: true,
                freeMode: true
              });
            },200)
          }
        }else{
          toolTip(data.resultMessage)
        }
      })
    }

    //获取精品路线数据
    function getQualityRouteList(){
      var wait = new waiting()
      $tourismService.getTourismSearch({
        pageNo : 1,
        pageSize : 5,
        productClass : $scope._class,
        productType : $scope._type,
        placeStart : $scope._region
      }).success(function(data){
        if(data.resultCode == '0000'){
          if (!isEmptyObject(data.result)) {
            $scope.routeGoodsList = data.result; 
            angular.forEach($scope.routeGoodsList, function(data1){
               angular.forEach($tourismService.type,function(data2){
                  if (data1.productClass == data2.productClass) {
                    data1.productClassName = data2.name == '周边游' ? '' : data2.name + ' | ';
                  }
               })   
            });
          }
          $timeout(function(){
            mainScroll.refresh()
          },200)
        }else{
          toolTip(data.resultMessage)
        }
        wait.hide();
      })
    }

    
    //获取自营旅游产品数据
    function getSelfSupportList(){
      var wait = new waiting()
      $productService.getTravelGoods({
        pageNo:1,
        pageSize:5,
        channelId: $userService.$$channelId
      }).success(function(data){
        if (data.resultCode == '0000') {
          if (!isEmptyObject(data.result) && !isEmptyObject(data.result.goodsInfo)) {
            $scope.routeGoodsList = data.result.goodsInfo.list; 
          }
          $timeout(function(){
            mainScroll.refresh();
          },200)
        }
        wait.hide();
      })
    }


    //城市定位
    var vm = this;
    vm.region = $scope.region;
    vm.regionClick = regionClick;
    vm.closeBtn = closeBtn;
    vm.provinceClick = provinceClick;
    vm.cityClick = cityClick;
    vm.countyClick = countyClick;
    vm.townClick = townClick;
    vm.reBtn = reBtn;
    vm.idList = {
        cityBox:$('#orientation .city-box'),
        countyBox:$('#orientation .county-box'),
        townBox:$('#orientation .town-box')
    };
    vm.provinceScroll = null;
    vm.cityScroll = null;
    vm.countyScroll = null;
    vm.townScroll = null;
    vm.historyScroll = null;
    getProvince();
    function getProvince(){
        $homeService.getProvince().success(function(data){
            vm.provinceList = data.result;
        });
    }

      //点击城市
    function regionClick(){
      vm.orientationModal = new animeModal('#orientation');
      $verifyService.SetIOSTitle("选择城市");
        $timeout(function(){
            vm.provinceScroll = new IScroll(".province-scroll",{
                preventDefault:false
            });
        },300)
    }
    //修改定位
    function modifyLocateAddress(cityName){
          $homeService.modifyLocateAddress({locateCity:encodeURI(cityName)}).success(function(){})
          $window.sessionStorage.setItem("city-orientation",cityName)
    }

    //选择省份后操作
    function provinceClick(id,provinceName){
      vm.idList.cityBox.addClass("active");
      $homeService.getCity({
          provinceId:id
      }).success(function(data){
          vm.cityList = data.result;
          $timeout(function() {
              vm.cityScroll = new IScroll(".city-scroll", {
                  preventDefault: false
              });
              modifyLocateAddress(provinceName);
          },300);
      });
    }

    //选择城市后操作
    function cityClick(name,id){
      vm.idList.countyBox.addClass("active");
      $homeService.getCounty({
          cityId:id
      }).success(function(data){
          if(data.result.length >0){
              vm.countyList = data.result;
              $timeout(function() { 
                  vm.countyScroll = new IScroll(".county-scroll", { 
                      preventDefault: false
                  });
                  
              },200);
          }else{
              hidePage();
              //$scope.region = name;
          }
          vm.region = name;
      });      
    }

    //选择县后操作
    function countyClick(id,name){
      vm.idList.townBox.addClass("active");
      $homeService.getTown({
          countyId:id
      }).success(function(data){
          if(data.result.length > 0){
              vm.townList = data.result;
          }else{
              hidePage();
              //$scope.region = name;
          }
          $timeout(function() {
              vm.townScroll = new IScroll(".town-scroll", {
                  preventDefault: false
              });
          },200);

      });
    }

    //选择镇后操作
    function townClick(){
      hidePage();
    }

    //省列表取消
    function closeBtn(){
        hidePage();
    }
    //城市列表返回
    function reBtn(myevent){
        $(myevent.target).parents('.draw-layer').removeClass('active');
    }
    //关闭省市选择列表
    function hidePage(){
        $scope.region = vm.region;
        $verifyService.SetIOSTitle("首页");
        vm.orientationModal.hide();
        setTimeout(function(){ 
          vm.idList.cityBox.removeClass('active'); 
          vm.idList.countyBox.removeClass('active'); 
          vm.idList.townBox.removeClass('active'); 
        },300);
        location.reload() 
    }


  }
});

