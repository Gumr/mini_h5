/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./home.css', 'common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app').controller('HomeController', HomeController);
    HomeController.$inject = ['$scope', '$state', "$stateParams", '$window', '$verifyService', '$homeService', '$timeout', '$productService', '$userService', '$rootScope', '$http'];

    function HomeController($scope, $state, $stateParams, $window, $verifyService, $homeService, $timeout, $productService, $userService, $rootScope, $http) {
        $scope.data = {
            hotSearch: ['iphone7', 'iphone7plus', 'oppo9s', 'iPad air2', '华为P9', '乐视超4 X50', '科沃斯扫地机器人', '联想小新700', '卡西欧EX-TR550', '佳能EOS 80D'],
            historySearch: getSearchCookie('searchName')
        }
        $scope.region = '北京';
        var vm = this;
        vm.provinceList = [];
        vm.cityList = [];
        vm.countyList = [];
        vm.townList = [];
        vm.bannerOption = [];
        vm.limitOptionLeft = [];
        vm.limitOptionRight = [];
        vm.lowOption = {};
        vm.footerList = [];
        vm.typeList = [];
        vm.url = imgUrl;
        vm.todayBigOption = [];
        vm.regionClick = regionClick;
        vm.goProductList = goProductList;
        vm.closeBtn = closeBtn;
        vm.provinceClick = provinceClick;
        vm.cityClick = cityClick;
        vm.countyClick = countyClick;
        vm.townClick = townClick;
        vm.reBtn = reBtn;
        vm.xxhidePage = xxhidePage;
        vm.img = $productService.imgUrl[4];
        vm.idList = {
            cityBox: $('#orientation .city-box'),
            countyBox: $('#orientation .county-box'),
            townBox: $('#orientation .town-box')
        };

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
        var myScroll = null;
        var bannerHeight = $('.bannerSlide').height() - $('.header-bar').height();
        $scope.data = {};

        active()

        function active() {
            app();
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
            $verifyService.SetIOSTitle("免息商城");
            $homeService.locateAddress().success(function(data) {
                $scope.region = $window.sessionStorage.getItem('city-orientation')
            });
            getHomeList();
            getinterest();
            $scope.$on('$includeContentLoaded', function(event) {
                $('.footer-bar .tabs-home').addClass('current')
                    .siblings().removeClass('current');
            });
        };
        //汇理财遮罩层隐藏
        $scope.hlcz = function() {
            $('#remit').removeClass('active');
            $('.shade').removeClass('active')
        }

        //金地app
        function app(config) {
            if (typeof mapp != 'undefined' && typeof mapp.device != 'undefined') {
                mapp.device.getUserInfo(function(data) {
                    $scope.data = data;
                    sessionStorage.setItem('uId', $scope.data.userId);
                    sessionStorage.setItem('projectCode', $scope.data.projectCode);
                    sessionStorage.setItem('channelId', 50000000)
                    $http.get(httpsHeader + "/mall/goldGroundAction/goldGroundLoginInterface.action?goldUserId=" + $scope.data.userId + "&projectCode=" + $scope.data.projectCode).success(function(data, status, headers, config) {
                        if (data.resultCode == '0000') {
                            $window.localStorage.setItem($AuthTokenName, headers('Authorication'));
                        }
                    })
                })
            }
        }

        //免息分期
        function getinterest() {
            $homeService.getInterestFreeGoodsList({
                channelId: $userService.$$channelId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.getinterest = data.result.goodsList;
                    angular.forEach($scope.getinterest, function(data1) {
                        if (data1.freePeriods == undefined) {
                            data1.freePeriods = 0;
                        }
                        if (data1.couponMoney == undefined) {
                            data1.couponMoney = 0;
                        }
                        if (data1.otherPrice == undefined) {
                            data1.otherPrice = 0;
                        }
                        if (data1.typeFrom == 2) {
                            data1.img = $productService.imgUrl[4];
                        } else if (data1.typeFrom == 1) {
                            data1.img = imgUrl;
                        }
                    })
                    $timeout(function() {
                        var hotSwiper = new Swiper('.hot-swiper', {
                            slidesPerView: 'auto',
                            paginationClickable: true,
                            freeModeMomentum: false,
                            /*onReachEnd :function(swiper){
                            	$scope.a =  swiper.translate
                            },
                            onSetTranslate:function(swiper,translate){
                            	var a = Math.floor(-translate);
                            	var b = Math.floor(-$scope.a)+10;
                            	if(a > b){
                            		$state.go('interest',{
                            		
                            		})
                            	}
                            }*/
                        });
                    }, 200)
                }
            })
        }


        //获取分类
        function getCategory() {
            if ($userService.$$channelId == '16993205') {
                vm.typeList = $homeService.typeContent;
            } else {
                for (var i = 0; i < $homeService.typeContent.length; i++) {
                    if ($homeService.typeContent[i].id != 'lx' && $homeService.typeContent[i].id != 'seg') {
                        vm.typeList[i] = $homeService.typeContent[i];
                    }
                }
            }
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

        function getHomeList() {
            $homeService.getHomeList({
                channelId: $userService.$$channelId,
                bannerPageId: 1000000000
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    data = data.result;
                    if (data) {
                        var ht = '';
                        vm.bannerOption = data.bannerOption;
                        vm.limitOption = data.limitOptionLeft;
                        vm.limitOptionLeft = data.limitOptionLeft;
                        vm.limitOptionRight = data.limitOptionRight;
                        vm.lowOption = data.lowOption;
                        if (vm.lowOption && !isEmptyObject(vm.lowOption.accessAddress)) {
                            vm.lowOption.href = vm.lowOption.accessAddress;
                        }
                        if (vm.limitOptionLeft && !isEmptyObject(vm.limitOptionLeft)) {
                            vm.limitOptionLeft.url = vm.url + vm.limitOptionLeft.url
                        }
                        if (vm.lowOption && !isEmptyObject(vm.lowOption.url)) {
                            vm.lowOption.url = vm.url + vm.lowOption.url;
                        }
                        $.each(vm.bannerOption, function(i, v) {
                            ht += '<div class="swiper-slide"><a href="' + v.accessAddress + '"><img src=' + vm.url + v.url + '></a></div>';
                        });
                        $('#bannerSwiper').html(ht);
                        var bannerSlide = new Swiper('.bannerSlide', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination',
                            onClick: function(swiper, event) {

                            }
                        });
                        search();
                        getBrandsByTop();
                        getProvince();
                    }
                }
            });
        }

        function getProvince() {
            $homeService.getProvince().success(function(data) {
                vm.provinceList = data.result;
            });
        }
        //今日大牌
        function getBrandsByTop() {
            $homeService.getBrandsByTop({
                top: 8,
                isJrdp: 1
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.footerList = data.result.brands;
                    $timeout(function() {
                        myScroll = new IScroll(".main-content", {
                            probeType: 3,
                            preventDefault: false
                        });
                        myScroll.on('scroll', function() {
                            if (this.y < -1) $('header').css('backgroundColor', 'rgba(255,96,46,0)');
                            if (this.y < -10) $('header').css('backgroundColor', 'rgba(255,96,46,.2)');
                            if (this.y < -bannerHeight * 0.5) $('header').css('backgroundColor', 'rgba(255,96,46,.5)');
                            if (this.y < -bannerHeight) $('header').css('backgroundColor', 'rgba(255,96,46,1)');
                        })

                    }, 200);
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        //类型跳转
        function goProductList() {
            $state.go("productList", null, {
                location: 'replace'
            });
        }
        //点击城市
        function regionClick() {
            vm.orientationModal = new animeModal('#orientation');
            $verifyService.SetIOSTitle("选择城市");
            $timeout(function() {
                vm.provinceScroll = new IScroll(".province-scroll", {
                    preventDefault: false
                });
            }, 300)
        }
        //修改定位
        function modifyLocateAddress(cityName) {
            $homeService.modifyLocateAddress({ locateCity: encodeURI(cityName) }).success(function() {})
            $window.sessionStorage.setItem("city-orientation", cityName)
        }

        //选择省份后操作
        function provinceClick(id) {
            vm.idList.cityBox.addClass("active");
            $homeService.getCity({
                provinceId: id
            }).success(function(data) {
                vm.cityList = data.result;
                $timeout(function() {
                    vm.cityScroll = new IScroll(".city-scroll", {
                        preventDefault: false
                    });
                }, 300);
            });
        }

        //选择城市后操作
        function cityClick(name, id) {
            vm.idList.countyBox.addClass("active");
            $homeService.getCounty({
                cityId: id
            }).success(function(data) {
                if (data.result.length > 0) {
                    vm.countyList = data.result;
                    $timeout(function() {
                        vm.countyScroll = new IScroll(".county-scroll", {
                            preventDefault: false
                        });
                        modifyLocateAddress(name);
                    }, 200);
                } else {
                    hidePage();
                    $scope.region = name;
                }
            });
        }

        //选择县后操作
        function countyClick(id, name) {
            vm.idList.townBox.addClass("active");
            $homeService.getTown({
                countyId: id
            }).success(function(data) {
                if (data.result.length > 0) {
                    vm.townList = data.result;
                } else {
                    hidePage();
                    $scope.region = name;
                }
                $timeout(function() {
                    vm.townScroll = new IScroll(".town-scroll", {
                        preventDefault: false
                    });
                }, 200);

            });
        }

        //选择镇后操作
        function townClick() {
            hidePage();
        }

        //省列表取消
        function closeBtn() {
            hidePage();
        }
        //城市列表返回
        function reBtn(myevent) {
            $(myevent.target).parents('.draw-layer').removeClass('active');
        }
        //关闭省市选择列表
        function hidePage() {
            $verifyService.SetIOSTitle("首页");
            vm.orientationModal.hide();
            setTimeout(function() {
                vm.idList.cityBox.removeClass('active');
                vm.idList.countyBox.removeClass('active');
                vm.idList.townBox.removeClass('active');
            }, 300);
        }

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
            var searchOnOff = $('.search-on-off'),
                searchInput = $('#search .search-input'),
                searchBtn = $('#search .search-btn'),
                searchFilter = $('#search .filter-hint');

            var modal;
            searchOnOff.click(function() {
                $verifyService.SetIOSTitle("搜索");
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
        /*  var modal
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