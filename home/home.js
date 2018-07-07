/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./home.css', 'common/script/lib/swiper.min.js'], function(angular) {

    var myApp = angular.module('app');
    myApp.controller('HomeController', HomeController);
    myApp.directive('onRepeatFinishedRender', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function() {
                        scope.$emit('ngRepeatFinished', element);
                    });
                }
            }
        };
    });
    HomeController.$inject = ['$scope', '$state', "$stateParams", '$window', '$verifyService', '$homeService', '$timeout', '$productService', '$userService', '$rootScope', '$interval'];

    function HomeController($scope, $state, $stateParams, $window, $verifyService, $homeService, $timeout, $productService, $userService, $rootScope, $interval) {
        $scope.data = {
                hotSearch: ['IPhone 8', 'oppo R11', '华为Mate9 ', '曲面电视', '轻薄本', '黄金吊坠', '护肤套装', '香水', '天梭', '家纺四件套'],
                historySearch: getSearchCookie('searchName')
            }
            /*$scope.onenum = [{name:'IPHONE7'},{name:'OPPO R9'},{name:'三星S8'},{name:'小米6'},{name:'华为'},{name:'OPPO'},{name:'小米'},{name:'IPHONE'},{name:'荣耀'}];
            $scope.twonum = [{name:'IPAD'},{name:'平板电脑'},{name:'联想'},{name:'MACBOOK'},{name:'戴尔'},{name:'THINKPAD'},{name:'华硕'},{name:'台式机'},{name:'笔记本'}];*/
        $scope.region = '北京';
        var vm = this;
        /*vm.provinceList = [];
        vm.cityList = [];
        vm.countyList = [];
        vm.townList = [];
        vm.closeBtn = closeBtn;
        vm.reBtn = reBtn;
        vm.regionClick = regionClick;
        vm.provinceClick = provinceClick;
        vm.cityClick = cityClick;
        vm.countyClick = countyClick;
        vm.townClick = townClick;
        vm.idList = {
            cityBox:$('#orientation .city-box'),
            countyBox:$('#orientation .county-box'),
            townBox:$('#orientation .town-box')
        };
        */
        vm.jdImgServer = $productService.imgUrl[1];
        vm.bannerOption = [];
        vm.limitOptionLeft = [];
        vm.limitOptionRight = [];
        vm.lowOption = {};
        vm.footerList = [];
        vm.typeList = [];
        vm.classList = [];
        vm.url = imgUrl;
        vm.goProductList = goProductList;

        vm.xxhidePage = xxhidePage;
        vm.img = $productService.imgUrl[4];
        //vm.nextpage = nextpage;
        vm.monitor = monitor; //监控点击量
        vm.provinceScroll = null;
        vm.cityScroll = null;
        vm.countyScroll = null;
        vm.townScroll = null;
        vm.historyScroll = null;
        vm.searchFilterScroll = null;
        vm.orientationModal;
        vm.searchGoodsList = [];
        vm.searchCategoryList = [];
        vm.channelId = true;
        vm.spikeActivityId = "";
        $scope.cartNum = 0; //购物车的数量
        $scope.mianxi = false;
        vm.cancel = cancel;
        vm.gain = gain;
        var mainScroll = null;
        var bannerHeight = $('.bannerSlide').height() - $('.header-bar').height();

        // 888弹层
        function cancel(){
            vm.layer = 'false';
        }

        // 带渠道参数进来 带授权码进来 带openid
        if($stateParams.channelId){
            sessionStorage.setItem('channelId',$stateParams.channelId)
        }

        if($stateParams.unionId){
            sessionStorage.setItem('unionId',$stateParams.unionId)
        }

        if($stateParams.openId){
            sessionStorage.setItem('openId',$stateParams.openId)
        }

        if($stateParams.Authorication){
            localStorage.setItem('sinks-token',$stateParams.Authorication)
        }


        //单点登录进来 存$$payload
        $userService.getAllHshCustInfo($userService.getAuthorication)

        function gain(){
            if(localStorage.getItem('sinks-token')){
                location.href = httpsHeader+'/ActivityProject/newbiegift/index.html'
            }else{
                sessionStorage.setItem('hshurl', httpsHeader+'/ActivityProject/newbiegift/index.html');
                $state.go('login', {
                    
                })
            }
        }

        if(getCookie('gift') == false){
            vm.layer = 'true';
            var time = new Date();
            time.setDate(time.getDate() + 365);
            document.cookie = 'gift'+ "=" +'true'+';expires='+time.toGMTString();
        }else{
            vm.layer = 'false'
        }





        pageInit()

        function pageInit() {
            var homeJumpInfo = JSON.parse(sessionStorage.getItem('homeJumpInfo'));
            if (homeJumpInfo) {
                vm.searchShow = true;
                $scope.searchText = homeJumpInfo.searchKey;
                search();
                sessionStorage.removeItem('homeJumpInfo');
            }else{
                $scope.searchText = $scope.data.historySearch[0]
            }

            sessionStorage.removeItem('serchinfo');
            //daojis();
            if ($stateParams.isCredit == 'N') {
                $('#remit').addClass('active');
                $('.shade').addClass('active')
            } else if ($stateParams.isCredit == 'Y') {
                $('.home-remit').addClass('remint');
                $('#remit').addClass('active');
                $('.shade').addClass('active')
            }
            if ($stateParams.Mark == 'part') {
                modal = new animeModal('#search');
                var keywordSlide = new Swiper('.keywordSlide', {
                    slidesPerView: 'auto',
                    paginationClickable: true,
                    freeMode: true
                });
                setTimeout(function() { $('#search .search-input').focus(); }, 300)
                $timeout(function() {
                    vm.historyScroll = new IScroll(".history", {
                        preventDefault: false
                    });
                }, 200);
            }
            getCategory();
            //getUserChannelId();
            //主页面IScroll滚动条
            $verifyService.SetIOSTitle("乐道免息商城");
            /*$homeService.locateAddress().success(function(data){
                $scope.region = data.result.city;
                $window.sessionStorage.setItem('city-orientation', data.result.city)
            });*/
            getHomeList();

            $scope.$on('$includeContentLoaded', function(event) {
                $('.footer-bar .tabs-home').addClass('current')
                    .siblings().removeClass('current');
            });
            //调用获取购物车数量接口
            $productService.getShoppingCartGoodsNum({}, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.cartNum = data.result.goodsNum;
                    if ($scope.cartNum > 0) {
                        $('.cartNum').show().html($scope.cartNum);
                    } else {
                        $('.cartNum').hide()
                    }
                }
            });


            getSpringSale();
            //temp--接口好了再放出来
            //brandSlide();

        };
        //汇理财遮罩层隐藏
        $scope.hlcz = function() {
                $('#remit').removeClass('active');
                $('.shade').removeClass('active')
            }
            //免息品类tab
        $scope.pltab = function(name) {
            $state.go('search', {
                keywords: name
            })
        }
        $scope.pltwotab = function(name) {
            $state.go('search', {
                keywords: name
            })
        }

        /*
  //免息秒杀倒计时
  function daojis(){
    var date = new Date();
      var seperator1 = "-";
      var seperator2 = ":";
      var strDate = date.getDate();
      var a = date.getHours();
      var b = date.getMinutes();
      if(a >=0&&a <10){
        a =a+24;
      }
    var h=33,m=59,s=59;
    h = h- parseInt(a);
    if(h<10){
      h = '0'+h
    }
    m = m- parseInt(date.getMinutes());
    if(m<10){
      m = '0'+m
    }
    s = s- parseInt(date.getSeconds());
        $interval( function run(){
            --s;
            if(s<10&&s>-1){
              s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
              m = '0'+m
            }
            }
            if(m<0){
                --h;
                m=59;
                if(h<10&&h>-1){
                h = '0'+h
              }
            }
            if(h<0){
                h=00;
                s=00;
                m=00;
            }
            $scope.datahs = parseInt(h/10);
            $scope.datahg = (h%10);
            $scope.datams= parseInt(m/10);
            $scope.datamg= (m%10);
            $scope.datass = parseInt(s/10);
            $scope.datasg = (s%10);
        },1000);
    }
    
  
   
    //下一场开始时间  获取商品列表
    getHome()
    
    function getHome(){
      
        
      $homeService.getHomeSpikeInfo().success(function(data){
            var parserDate = function (date) {  
                var t = Date.parse(date);  
                if (!isNaN(t)) {  
                    return new Date(Date.parse(date.replace(/-/g, "/")));  
                } else {  
                    return new Date();  
                }  
            }; 
           var nextBeginTime = parserDate(data.result.nextBeginTime.replace(/-/g,'/'));
//         console.log(nextBeginTime)
          $scope.nextBeginTime = nextBeginTime;
           $scope.month = nextBeginTime.getMonth()+1;
           $scope.day = nextBeginTime.getDate();
           $scope.hour = nextBeginTime.getHours();
           
           //商品列表
           if(data.resultCode == '0000'){
        $scope.getinterest = data.result.goodsList;
        angular.forEach($scope.getinterest, function(data1){
//          console.log(data1)
          if(data1.typeFrom==2){
            data1.img = $productService.imgUrl[1];
          }else if(data1.typeFrom==1){
            data1.img = imgUrl;
          }
            })
        $timeout(function(){
              var hotSwiper = new Swiper('.hot-swiper', {
                slidesPerView: 'auto',
                paginationClickable: true,
                freeModeMomentum : false,
                onReachEnd :function(swiper){
                  $scope.a =  swiper.translate
                },
                onSetTranslate:function(swiper,translate){
                  var a = Math.floor(-translate);
                  var b = Math.floor(-$scope.a)+10;
                  if(a > b){
                    $state.go('interest',{
                    
                    })
                  }
                }
              });
            },200)
        getBrandsByTop();
        
        $scope.mianxi=true;
      }
        });
       
       
    };
    
    // 点击商品进入秒杀专区
    function nextpage(){
        $state.go('interest',{
            
            })
    }
    */

        //获取分类
        function getCategory() {
            /* if($userService.$$channelId == '16993204'){*/
            vm.typeList = $homeService.typeContent;
            vm.classList = $homeService.classContent;
            /*}else{
                for(var i = 0; i < $homeService.typeContent.length;i++){
                    if($homeService.typeContent[i].id != 'lx' && $homeService.typeContent[i].id != 'seg'){
                        vm.typeList[i] = $homeService.typeContent[i];
                    }
                }
            }*/
        }
        /*function getUserChannelId(){
            if(!$window.sessionStorage.getItem('channelId')){
                $userService.$$channelId = $verifyService.getQueryParam("channelId");
                if($userService.$$channelId == null || $userService.$$channelId == ""){
                    $userService.$$channelId = '16993204';
                    vm.typeList = $homeService.typeContent;
                    $rootScope.isHSH = true;
                    $window.sessionStorage.setItem('channelId',$userService.$$channelId);
                }else{
                    if($userService.$$channelId == '16993204'){
                        vm.typeList = $homeService.typeContent;
                        $rootScope.isHSH = true;
                    }else{
                        for(var i = 0; i < $homeService.typeContent.length;i++){
                            if($homeService.typeContent[i].id != 'lx' && $homeService.typeContent[i].id != 'seg'){
                                vm.typeList[i] = $homeService.typeContent[i];
                            }
                        }
                        $rootScope.isHSH = false;
                    }
                    $window.sessionStorage.setItem('channelId',$userService.$$channelId);
                }
            }else{
                var channelId = $window.sessionStorage.getItem('channelId');
                if(channelId == '16993204'){
                    vm.typeList = $homeService.typeContent;
                    $rootScope.isHSH = true;
                }else{
                    for(var i = 0; i < $homeService.typeContent.length;i++){
                        if($homeService.typeContent[i].id != 'lx' && $homeService.typeContent[i].id != 'seg'){
                            vm.typeList[i] = $homeService.typeContent[i];
                        }
                    }
                    $rootScope.isHSH = false;
                }
            }
        }*/
        function monitor(pageModule, pageValue) {
            $productService.doUserTrace({
                channelId: $userService.$$channelId,
                page: 'homePage',
                pageModule: pageModule,
                pageValue: encodeURI(pageValue)
            }).success(function(data) {

            });
        }
        monitor('browse','');

        // 周末展会埋点
        if($stateParams.pagInPosition){
            $productService.doUserTrace({
                channelId: $userService.$$channelId,
                page: 'homePage',
                pageModule: $stateParams.pagInPosition,
                pageValue: ''
            }).success(function(data) {

            });
        }
        
            
        

        function getHomeList() {
            console.log($userService.$$channelId);
            $homeService.getHomeList({
                channelId: $userService.$$channelId,
                bannerPageId: 1000000000
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    console.log(data);
                    data = data.result;
                    if (data) {
                        var ht = '';
                        vm.bannerOption = data.bannerOption;

                        //品牌
                        vm.limitOptionLeft = data.limitOptionLeft;
                        vm.limitOptionRight = data.limitOptionRight;
                        brandSlide();

                        //发现好货
                        vm.lowOption = data.lowOption;
                        vm.lowOptionLeft = [];
                        vm.lowOptionRight = [];
                        angular.forEach(vm.lowOption, function(data, index) {
                            if (index < 2) {
                                vm.lowOptionLeft.push(data);
                            } else {
                                vm.lowOptionRight.push(data);
                            }
                        });

                        if (vm.lowOption && !isEmptyObject(vm.lowOption.url)) {
                            vm.lowOption.url = vm.url + vm.lowOption.url;
                        }
                        $.each(vm.bannerOption, function(i, v) {
                            ht += '<div class="swiper-slide" data-name="' + v.name + '"><a href="' + v.accessAddress + '"><img src=' + vm.url + v.url + '></a></div>';
                        });
                        $('#homeBannerSwiper').html(ht);
                        var bannerSlide = new Swiper('.home-banner', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination',
                            onClick: function(swiper, event) {

                            }
                        });
                        //监控点击量
                        $("#homeBannerSwiper").on("click", ".swiper-slide", function() {
                            var name = $(this).attr("data-name");
                            monitor("topBanner", name);
                        });
                        search();
                        scrollInit();
                        //getBrandsByTop();
                        //getProvince();
                    }
                }
            });
        }
        //获取发现好货
        function getGoodsale() {
            //
        }

        //获取免息
        function getSpringSale() {
            vm.springList = [
                { name: 'iPhoneX', accessAddress: '#/search?keywords=iPhone X', url: 'home/images/temp/springsale_1.png' },
                { name: 'OPPO R15', accessAddress: '#/search?keywords=OPPO R15', url: 'home/images/temp/springsale_2.png' },
                { name: 'VIVO X21', accessAddress: '#/search?keywords=VIVO X21', url: 'home/images/temp/springsale_9.jpg' },
                { name: '华为P20', accessAddress: '#/search?keywords=华为P20', url: 'home/images/temp/springsale_4.png' },
                { name: 'MacBook', accessAddress: '#/search?keywords=MacBook', url: 'home/images/temp/springsale_12.jpg' },
                { name: '联想拯救者', accessAddress: '#/search?keywords=联想拯救者', url: 'home/images/temp/springsale_10.jpg' },
                { name: 'iPad', accessAddress: '#/search?keywords=iPad', url: 'home/images/temp/springsale_11.jpg' },
                { name: '台式电脑', accessAddress: '#/search?keywords=台式电脑', url: 'home/images/temp/springsale_8.png' }
            ];
        }
        //品牌--banner初始化
        function brandSlide() {
            var html = '<div class="swiper-wrapper">';
            $.each(vm.limitOptionLeft, function(i, v) {
                html += '<div class="swiper-slide" data-name="' + v.name + '"><a href="' + v.accessAddress + '"><img src=' + vm.url + v.url + '></a></div>';
            });
            html += '</div>';
            var num = vm.limitOptionLeft.length;
            $('#swiper-brand').html(html);
            var bannerSlide = new Swiper('#swiper-brand', {
                loop: true,
                autoplay: 4000,
                spaceBetween: 5,
                loop: true,
                slidesPerView: 'auto',
                loopedSlides: num, //在loop模式下使用slidesPerview:'auto',还需使用该参数设置所要用到的loop个数(等于原来banner个数)
                autoplayDisableOnInteraction: false
            });

            //监控点击量
            $('#swiper-brand').on("click", ".swiper-slide", function() {
                var name = $(this).attr("data-name");
                monitor("FAN.brand", name);
            });
        }

        //猜你喜欢
        function init_yourlike() {
            vm.youlike = {
                pageNum: 0,
                pageSize: 8,
                list: [],
                data: [],
                loadAll: false,
                isLoad: false
            };

            var id = '7637648033'; //线上
            //var id = '1351857524546'; //测试
            $homeService.getYourlikeInfo(id).success(function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.youlike.data = data.result.goodsList;
                    load_youlike();
                }
            });
        }

        function load_youlike() {
            if (vm.youlike.loadAll) {
                return;
            }

            //正在加载
            if (vm.youlike.isLoad) {
                return;
            }
            vm.youlike.isLoad = true;

            var goodsTotalNum = vm.youlike.data.length;
            var pageSize = vm.youlike.pageSize;
            var pageNum = vm.youlike.pageNum;
            vm.youlike.pageNum++;
            var loadNum = vm.youlike.pageNum * pageSize;

            //判断当前是否为最后一页
            if (loadNum >= goodsTotalNum) {
                vm.youlike.loadAll = true;
                loadNum = goodsTotalNum;
            }

            var num = pageNum * pageSize;
            for (var i = num; i < loadNum; i++) {
                vm.youlike.list.push(vm.youlike.data[i]);
            }
            $timeout(function() { vm.youlike.isLoad = false; }, 100); //刷新滚动条
        }
        //
        /**
         * [description]  当repeat完成时，调用该方法
         * [description]  需要配合directive使用，并在监控对象上加上属性on-repeat-finished-render
         */
        $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
            //console.log(element.parent());
            if (mainScroll) {
                mainScroll.refresh();
            }
        });
        /*
        //今日大牌
        function getBrandsByTop(){
            $homeService.getBrandsByTop({
                top:8,
                isJrdp:1
            }).success(function(data){
                  if(data.resultCode == "0000"){
                      vm.footerList = data.result.brands;
                      
                  }else{
                      toolTip(data.resultMessage);
                  }
            });
        }
        */
        function scrollInit() {
            $timeout(function() {
                mainScroll = new IScroll(".main-content", {
                    probeType: 3,
                    preventDefault: false
                });
                mainScroll.on('scroll', function() {
                    //if (this.y < -0.5) $('header').css('backgroundColor','#fff');
                    if (this.y < -0.5) $('.header-bar').css('backgroundColor', '');
                    if (this.y < -0.5) $('.regions').css('color', '#ff602e');
                    if (this.y < -0.5) $('.icon-arrows').css('border-left', '1px solid #ff602e');
                    if (this.y < -0.5) $('.icon-arrows').css('border-bottom', '1px solid #ff602e');
                    if (this.y < -20) $('.header-bar').css('backgroundColor', 'rgba(255,96,46,.2)');
                    if (this.y < -bannerHeight * 0.5) $('.header-bar').css('backgroundColor', 'rgba(255,96,46,.5)');
                    if (this.y < -bannerHeight) $('.header-bar').css('backgroundColor', '#ff5841');
                    if (this.y < -bannerHeight) $('.regions').css('color', '#fff');
                    if (this.y < -bannerHeight) $('.icon-arrows').css('border-left', '1px solid #fff');
                    if (this.y < -bannerHeight) $('.icon-arrows').css('border-bottom', '1px solid #fff');
                });
                mainScroll.on('scrollEnd', function() {
                    pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                    if (pullDown) {
                        load_youlike();
                    }
                });
                init_yourlike();
            }, 200);
        }



        //类型跳转
        function goProductList() {
            $state.go("productList", null, {
                location: 'replace'
            });
        }

        /*
      //获取城市列表
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
      function modifyLocateAddress(cityName, cityId){
            $homeService.modifyLocateAddress({cityId:cityId}).success(function(){})
            $window.sessionStorage.setItem("city-orientation",cityName)
      }

    //选择省份后操作
    function provinceClick(id){
      vm.idList.cityBox.addClass("active");
      $homeService.getCity({
          provinceId:id
      }).success(function(data){
          vm.cityList = data.result;
          $timeout(function() {
              vm.cityScroll = new IScroll(".city-scroll",{
                  preventDefault: false
              });
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
                  modifyLocateAddress(name, id);
              },200);
          }else{
              hidePage();
              $scope.region = name;
          }
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
              $scope.region = name;
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
        $verifyService.SetIOSTitle("首页");
        vm.orientationModal.hide();
        setTimeout(function(){ 
          vm.idList.cityBox.removeClass('active'); 
          vm.idList.countyBox.removeClass('active'); 
          vm.idList.townBox.removeClass('active'); 
        },300);
    }
    */

        //获取搜索关键词
        function getSearchKeywords() {
            $productService.findGoodsSecondCategory({
                channelId: $userService.$$channelId,
                stringName: encodeURI($scope.searchText)
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result.goodsList)) {
                        vm.searchGoodsList = data.result.goodsList;
                    }
                    if (!isEmptyObject(data.result.secondCategoryList)) {
                        vm.searchCategoryList = data.result.secondCategoryList;
                    }
                }
            })
        }

        //搜索
        function search() {
            if (vm.hasInitSearch) {
                return;
            }
            vm.hasInitSearch = true;
            //var searchOnOff = $('.search-on-off'),
            var searchOnOff = $('.search-container'),
                searchInput = $('#search .search-input'),
                searchBtn = $('#search .search-btn'),
                searchFilter = $('#search .filter-hint');

            var modal, timer;
            searchOnOff.click(function(event, notshow) {
                var text = $(this).children("span").text();
                $verifyService.SetIOSTitle("搜索");
                modal = new animeModal('#search', notshow);
                var keywordSlide = new Swiper('.keywordSlide', {
                    slidesPerView: 'auto',
                    paginationClickable: true,
                    freeMode: true
                });
                timer = setTimeout(function() { searchInput.val(text).focus(); }, 300)
                $timeout(function() {
                    vm.historyScroll = new IScroll(".history", {
                        preventDefault: false
                    });
                }, 200);
            });

            searchInput.on('keypress', function(e) {
                var keycode = e.keyCode;
                if (keycode == '13') {
                    e.preventDefault();
                    $state.go('search', {
                        keywords: $scope.searchText
                    });
                }
            });

            if (vm.searchShow) {
                searchOnOff.trigger("click", true);
                clearTimeout(timer);
                searchInput.focus();
            }
            $("#search").on("click", "a", function() {
                var homeJumpInfo = {
                    searchKey: $(this).text()
                };
                sessionStorage.setItem('homeJumpInfo', JSON.stringify(homeJumpInfo));
            });

            $scope.delSearchCookie = delSearchCookie;

            /*searchInput[0].oninput = function(){
              if ($(this).val().length > 0 && !/^[ ]+$/.test($(this).val())) {
                getSearchKeywords();
                searchFilter.removeClass('hidden');
                
                $timeout(function() {
                  vm.searchFilterScroll = new IScroll(".filter-hint", {
                      preventDefault: false
                  });
                },200);
              }else{
                vm.searchFilterScroll = null;
               searchFilter.addClass('hidden');
              }
            }*/

            searchBtn.click(function() {
                hidePage();

            })

            function hidePage() {
                if ($stateParams.Mark) {
                    $state.go('part', {

                    })
                } else {
                    $verifyService.SetIOSTitle("首页");
                    modal.hide();
                    searchInput[0].value = '';
                }
            }
        }


        //Cookie中获取搜索关键词
        function getSearchCookie(name) {
            var start = document.cookie.indexOf(name + "=");
            if (start != -1) {
                start = start + name.length + 1;
                var end = document.cookie.indexOf(";", start);
                if (end == -1) end = document.cookie.length;
                arr = JSON.parse(unescape(document.cookie.substring(start, end)));

                return arr;
            } else {
                return [];
            }
        }

        //删除Cookie中搜索关键词
        function delSearchCookie(name) {
            var time = new Date();
            time.setDate(time.getDate() - 1);
            var val = getSearchCookie(name);
            if (val.length > 0) {
                document.cookie = name + "=" + escape(JSON.stringify(val)) + ';expires=' + time.toGMTString();
                $scope.data.historySearch = getSearchCookie('searchName');
            }

        }

        //消息中心
        /*  var modal;
        $('.icon-message').click(function() {
              $verifyService.SetIOSTitle("消息");
              modal = new animeModal('#message');
        });*/
        function xxhidePage() {
            $verifyService.SetIOSTitle("首页");
            modal.hide();
        }

    }
});