/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./phone.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('innerPhoneController', innerPhoneController)
        .directive('onRepeatFinishedRender', function($timeout) {
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

    //我的购物车
    innerPhoneController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$homeService', '$productService', '$userService', '$address', '$window'];

    function innerPhoneController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $homeService, $productService, $userService, $address, $window) {
        $scope.search = {
            hotArr: ['IPhone 8', 'oppo R11', '华为Mate9 ', '曲面电视', '轻薄本', '黄金吊坠', '护肤套装', '香水', '天梭', '家纺四件套'], //热门搜索
            historyArr: getSearchCookie('searchName'), //历史搜索
        };
        var wHeight = $(window).height();
        var mainScroll = null;
        var vm = this;
        vm.jdUrl = $productService.imgUrl[1];
        vm.selfUrl = imgUrl;
        vm.bannerImgUrl = imgUrl;

        vm.monitor = monitor; //埋点
        
        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'phone',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        $timeout(function() {
            var bannerSlide = new Swiper('.bannerSlide', {
                loop: true,
                autoplay: 4000,
                autoplayDisableOnInteraction: false,
                pagination: '.swiper-pagination'
            });
        }, 300)

        //下方分类数据
        $scope.data = {
            goodsList: [],
            pageNo: 0, //页数
            pageSize: 4, //每页数量
            loadAll: false, //是否加载完所有
            loading: true, //加载loading  true显示 false隐藏
        };

        //分类
        vm.categoryList = [
            { name: "iPhone", url: "productInner/phone/images/category_1.png", accessAddress: "#/search?keywords=iphone" },
            { name: "华为", url: "productInner/phone/images/category_2.png", accessAddress: "#/search?keywords=%E5%8D%8E%E4%B8%BA" },
            { name: "OPPO", url: "productInner/phone/images/category_3.png", accessAddress: "#/search?keywords=oppo" },
            { name: "VIVO", url: "productInner/phone/images/category_4.png", accessAddress: "#/search?keywords=vivo" },
            { name: "蓝牙耳机", url: "productInner/phone/images/category_5.png", accessAddress: "#/search?keywords=%E8%93%9D%E7%89%99%E8%80%B3%E6%9C%BA" },
            { name: "手机壳", url: "productInner/phone/images/category_6.png", accessAddress: "#/search?keywords=%E6%89%8B%E6%9C%BA%E5%A3%B3" },
            { name: "手机耳机", url: "productInner/phone/images/category_7.png", accessAddress: "#/search?keywords=%E6%89%8B%E6%9C%BA%E8%80%B3%E6%9C%BA" },
            { name: "移动电源", url: "productInner/phone/images/category_8.png", accessAddress: "#/search?keywords=%E7%A7%BB%E5%8A%A8%E7%94%B5%E6%BA%90" }
        ];

        //人气新品
        vm.popularList = [
            {name:'iPhone X', url: "productInner/phone/images/popular_1.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=721782147368" },
            {name:'iPhone 8', url: "productInner/phone/images/popular_2.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=721782148175" },
            {name:'iPhone 8 Plus', url: "productInner/phone/images/popular_3.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=7599538650" },
            {name:'华为mate10', url: "productInner/phone/images/popular_4.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=73275247770" },
            {name:'oppo A79', url: "productInner/phone/images/popular_5.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=7537167394" },
            {name:'小米note 3', url: "productInner/phone/images/popular_6.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=7802371451" },
            {name:'vivo x20', url: "productInner/phone/images/popular_7.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=7770961229" },
            {name:'美图M8s', url: "productInner/phone/images/popular_8.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=71459377265" },
            {name:'oppo R11s', url: "productInner/phone/images/popular_9.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=73058920048" },
            {name:'三星s8', url: "productInner/phone/images/popular_10.png", accessAddress: "https://www.funsales.com/mallh5/#/productDetails?goodsId=73068366867" }
        ];

        //品牌街
        vm.brandList = [
            {name:'iphone', url: "productInner/phone/images/brand_1.png", accessAddress: "#/search?keywords=iPhone%E6%89%8B%E6%9C%BA",name:'iphone' },
            {name:'huawei', url: "productInner/phone/images/brand_2.png", accessAddress: "#/search?keywords=huawei%E6%89%8B%E6%9C%BA",name:'nova2' },
            {name:'oppo', url: "productInner/phone/images/brand_3.png", accessAddress: "#/search?keywords=OPPO%E6%89%8B%E6%9C%BA",name:'oppo' },
            {name:'vivo', url: "productInner/phone/images/brand_4.png", accessAddress: "#/search?keywords=VIVO%E6%89%8B%E6%9C%BA",name:'vivo' },
            {name:'小米', url: "productInner/phone/images/brand_5.png", accessAddress: "#/search?keywords=%E5%B0%8F%E7%B1%B3%E6%89%8B%E6%9C%BA",name:'mi' },
            {name:'三星', url: "productInner/phone/images/brand_6.png", accessAddress: "#/search?keywords=%E4%B8%89%E6%98%9F%E6%89%8B%E6%9C%BA",name:'sanxing' },
            {name:'荣耀', url: "productInner/phone/images/brand_7.png", accessAddress: "#/search?keywords=%E8%8D%A3%E8%80%80%E6%89%8B%E6%9C%BA",name:'荣耀9' },
            {name:'诺基亚', url: "productInner/phone/images/brand_8.png", accessAddress: "#/search?keywords=%E8%AF%BA%E5%9F%BA%E4%BA%9A%E6%89%8B%E6%9C%BA",name:'nokia' },
            {name:'美图', url: "productInner/phone/images/brand_9.png", accessAddress: "#/search?keywords=%E7%BE%8E%E5%9B%BE%E6%89%8B%E6%9C%BA",name:'meitu' },
            {name:'努比亚', url: "productInner/phone/images/brand_10.png", accessAddress: "#/search?keywords=%E5%8A%AA%E6%AF%94%E4%BA%9A%E6%89%8B%E6%9C%BA",name:'nuoio' }
        ];
        init();

        function init() {
            //$stateParams.oneLevelId
            $verifyService.SetIOSTitle($stateParams.listMark);
            scrollInit();
            bannerInit();
            everydayInit();
            monitor('browse','')
        }

        //banner
        function bannerInit() {
            $productService.getPageBanner({
                channelId: $userService.$$channelId,
                bannerPageId: '3000000000',
                bannerOptionId: $stateParams.oneLevelId
            }).success(function(data) {
                var ht = "";
                if (data.resultCode == "0000") {
                    vm.bannerList = data.result.bannerList;
                    if (JSON.stringify(data.result) != "{}") {
                        $.each(vm.bannerList, function(i, v) {
                            if (v.typeFrom == "1") {
                                ht += '<div class="swiper-slide" ng-click="vm.monitor("topBanner",v.name)"><a href="'+v.accessAddress+'"><img src=' + imgUrl + v.bannerUrl + '></a></div>';
                            } else {
                                ht += '<div class="swiper-slide" ng-click="vm.monitor("topBanner",v.name)"><a href="'+v.accessAddress+'"><img src=' + vm.bannerImgUrl + v.bannerUrl + '></a></div>';
                            }
                        });
                        $('#banner_product_inner').html(ht);

                        if (vm.bannerList.length > 1) {
                            // banner 轮播
                            var bannerSlide = new Swiper('.bannerSlide', {
                                loop: true,
                                autoplay: 4000,
                                autoplayDisableOnInteraction: false,
                                pagination: '.swiper-pagination'
                            });
                        }
                    }

                    search();
                }
            });
        }

        function ajax(id, callBack) {
            $.ajax({
                type: "get",
                url: "https://www.funsales.com/mall/activityGoodsCommonApi/getActivityGoodsList.action?activityId=" + id,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data) {
                    callBack(data);
                    $scope.$apply();
                },
                error: function(data) {
                    toolTip('系统异常，请稍后再试！');
                }
            });
        }
        //每日特惠
        function everydayInit() {
            var id = '71729040873';
            ajax(id, function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    //最多显示3条
                    if( data.result.goodsList.length < 4 ){
                        vm.everydayList = data.result.goodsList;
                    } else {
                        vm.everydayList = [];
                        for( var i=0; i<3; i++ ){
                            vm.everydayList.push(data.result.goodsList[i]);
                        }
                    }
                    
                    sellWellInit();
                    setChartNum();
                }
            });
        }

        //热销单品
        function sellWellInit() {
            var id = '71729040913';
            ajax(id, function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.sellWellList = data.result.goodsList;

                    findSecondCategory();
                }
            });
        }

        /**分类商品列表**/
        //根据分类选择查找商品
        function findGoods() {
            if (!isEmptyObject(vm.subTabList)) {
                vm.goodsCategories = vm.categoryPrefix + ';' + vm.tabList[vm.tabIndex].categoryId + ';' + vm.subTabList[vm.subTabIndex].categoryId;
                getProductList();
            } else if (!isEmptyObject(vm.tabList)) {
                vm.goodsCategories = vm.categoryPrefix + ';' + vm.tabList[vm.tabIndex].categoryId;
                getProductList();
            }
        }

        function findSecondCategory() {
            vm.tabWrap = $("#tabBox .swiper-wrapper");
            vm.tabWrap.css({"visibility": "hidden"});

            $cardService.getGoodsCategoryList({
                channelId: sessionStorage.channelId,
                categoryId: $stateParams.oneLevelId
            }).success(function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.tabList = data.result.categoryList;
                    angular.forEach(vm.tabList, function(data, index) {
                        //热门品牌根据品牌搜素，不是根据分类搜素,移除
                        if (data.type == '02') {
                            vm.tabList.splice(index, 1);
                        }
                    });

                    vm.tabIndex = 0;
                    if( vm.tabList.length == 1 ){
                        vm.categoryPrefix = $stateParams.oneLevelId + ';' + vm.tabList[vm.tabIndex].categoryId;
                        vm.tabList = vm.tabList[0].categoryList;
                    } else {
                        vm.categoryPrefix = $stateParams.oneLevelId;
                        vm.subTabIndex = 0;
                        vm.subTabList = vm.tabList[vm.tabIndex].categoryList;
                    }
                    productInit();
                    findGoods();

                    $timeout(function() {
                        //滚动加载
                        mainScroll.on('scrollEnd', function() {
                            pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                            if (pullDown) {
                                getProductList();
                            }
                        });
                    }, 300);
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        vm.tabClick = function(index,pageModule,pageValue) {
            vm.tabIndex = index;
            vm.subTabIndex = 0;
            vm.subTabList = vm.tabList[vm.tabIndex].categoryList;
            productInit();
            findGoods();
            monitor(pageModule,pageValue)
        }
        vm.subTabClick = function(index,pageModule,pageValue) {
            vm.subTabIndex = index;
            vm.goodsCategories = $stateParams.oneLevelId + ';' + vm.tabList[vm.tabIndex].categoryId + ';' + vm.subTabList[vm.subTabIndex].categoryId;
            productInit();
            getProductList();
            monitor(pageModule,pageValue)
        }

        function productInit() {
            $scope.data.pageNo = 0;
            $scope.data.loadAll = false;
            $scope.data.loading = false;
        }

        function getProductList() {
            if($scope.data.loading || $scope.data.loadAll){
                return;
            }

            $scope.data.loading = true;
            $productService.searchGoods({
                pageNo: $scope.data.pageNo, //当前页数
                pageSize: $scope.data.pageSize, //每页商品数
                goodsCategories: vm.goodsCategories
            }).success(function(data) {
                console.log(data);
                if (data.resultCode == '0000') {
                    var goodsList = data.result.goodsList; //商品
                    var goodsTotalNum = data.result.total; //商品数量
                    //判断当前是否为最后一页
                    if (goodsTotalNum - $scope.data.pageNo * $scope.data.pageSize <= $scope.data.pageSize) {
                        $scope.data.loadAll = true;
                    }

                    //判断搜索结果是否有商品
                    if (goodsList.length) {
                        angular.forEach(goodsList, function(data) {
                            //图片地址拼接
                            data.imageUrl = data.typeFrom == '1' ? vm.selfUrl + data.imageUrl : vm.jdUrl + data.imageUrl;
                        });

                        if ($scope.data.pageNo === 0) {
                            $scope.data.goodsList = goodsList;
                        } else {
                            $scope.data.goodsList = $scope.data.goodsList.concat(goodsList);
                        }
                        $scope.data.pageNo++;
                    } else {
                        if ($scope.data.pageNo === 0) {
                            $scope.data.goodsList = [];
                            toolTip("商品暂未上架，敬请期待！");
                        }
                    }
                } else {
                    toolTip(data.resultMessage)
                }
                $scope.data.loading = false;
            })
            $timeout(function() {
                mainScroll.refresh();
            }, 200);
        }

        //滚动轴初始化
        function scrollInit() {
            $(document).ready(function() {
                mainScroll = new IScroll(".main-content", {
                    probeType: 3,
                    preventDefault: false
                });
                
                mainScroll.on('scroll', function(){
                    scroll_one(this.y);
                });
            });
        }

        function scroll_one(top){
            //吸顶
            var tabTop = -$('.list-wrap').offset().top;
            if (tabTop > 0) {
                $('#tabBox').css("top", tabTop + "px");
            } else {
                $('#tabBox').css("top", "");
            }

            top = -top;
            if( top > wHeight ){
                $('.goTop').fadeIn(500);
            }else{
                $('.goTop').fadeOut(500);
            }
        }

        //回到顶部
        $scope.getTop = function(){
            mainScroll.scrollTo(0, 0, 0);
        }

        function setChartNum(){
            //调用获取购物车数量接口
            $productService.getShoppingCartGoodsNum({},localStorage.getItem("sinks-token")).success(function(data){
                if(data.resultCode=='0000'){
                    $scope.cartNum=data.result.goodsNum;
                    if($scope.cartNum>0){
                        $('.cartNum').show().html($scope.cartNum);
                    }else{
                        $('.cartNum').hide()
                    }
                }
            });
        }

        /**
         * [description]  当repeat完成时，调用该方法
         * [description]  需要配合directive使用，并在监控对象上加上属性on-repeat-finished-render
         */
        $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
            if (mainScroll) {
                mainScroll.refresh();
            }
            //下方分类--二级菜单高度变化
            if($(element).parent().hasClass("swiper-wrapper-sub")){
                var height = $("#tabBox").height();
                var rem = height*10/$(window).width()+0.13333;
                $(".g-list").css({"padding-top": rem+"rem"});
            }

            //下方分类--一级菜单
            if( $(element).parent().hasClass("swiper-wrapper") ){
                console.log(vm.tabWrap.outerWidth());
                console.log($("#tabBox").width());
                if(vm.tabWrap.outerWidth() < $("#tabBox").width()){
                    //宽度不够，均分
                    vm.tabWrap.addClass("swiper-wrapper-between");
                } else {
                    // 宽度超过，滑块
                    var categorySlide = new Swiper('.category-slide', {
                        slidesPerView: 'auto',
                        paginationClickable: true,
                        freeMode: false
                    });
                }

                vm.tabWrap.css({"visibility": ""});
            }

            //下方分类--切换内容后触发滚动
            if($(element).hasClass("appliance-item")){
                scroll_one(mainScroll.y);
            }
        });

        //搜索历史
        //Cookie中获取搜索关键词
        function getSearchCookie(name) {
            var start = document.cookie.indexOf(name + "=");
            if (start != -1) {
                start = start + name.length + 1;
                var end = document.cookie.indexOf(";", start);
                if (end == -1) end = document.cookie.length;
                arr = JSON.parse(unescape(document.cookie.substring(start, end)));

                console.log(arr);
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
                $scope.search.historyArr = getSearchCookie('searchName');
            }
        }

        //搜索
        function search() {
            if (vm.hasInitSearch) {
                return;
            }
            vm.hasInitSearch = true;
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

    }
});