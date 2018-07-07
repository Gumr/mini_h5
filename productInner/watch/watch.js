/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./watch.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('innerWatchController', innerWatchController)
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
    innerWatchController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$homeService', '$productService', '$userService', '$address', '$window'];

    function innerWatchController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $homeService, $productService, $userService, $address, $window) {
        $scope.search = {
            hotArr: ['IPhone 8', 'oppo R11', '华为Mate9 ', '曲面电视', '轻薄本', '黄金吊坠', '护肤套装', '香水', '天梭', '家纺四件套'], //热门搜索
            historyArr: getSearchCookie('searchName'), //历史搜索
        };
        var wHeight = $(window).height();
        var mainScroll = null;
        var vm = this;
        vm.jdUrl = $productService.imgUrl[1]; //京东图片前缀
        vm.selfUrl = imgUrl; //自营图片前缀
        vm.bannerImgUrl = imgUrl; //顶部banner图前缀
        vm.httpsHeader = httpsHeader; //环境地址


        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'Watches',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        monitor('browse','')

        //下方分类数据
        $scope.data = {
            goodsList: [],
            pageNo: 0, //页数
            pageSize: 4, //每页数量
            loadAll: false, //是否加载完所有
            loading: true, //加载loading  true显示 false隐藏
        };

        //上方分类按钮
        vm.topCategoryList_1 = [
            { name: "瑞士名表", url: "productInner/watch/images/category_1.png", accessAddress: "#/search?keywords=%E7%91%9E%E8%A1%A8" },
            { name: "欧美腕表", url: "productInner/watch/images/category_2.png", accessAddress: "#/search?keywords=%E6%AC%A7%E7%BE%8E%E8%A1%A8&goodsCategories=5025;5026;13668" },
            { name: "日韩潮表", url: "productInner/watch/images/category_3.png", accessAddress: "#/search?keywords=%E6%97%A5%E9%9F%A9%E8%A1%A8&goodsCategories=5025;5026;13669" },
            { name: "品质国表", url: "productInner/watch/images/category_4.png", accessAddress: "#/search?keywords=%E5%9B%BD%E8%A1%A8&goodsCategories=5025;5026;13674" }
        ];
        vm.topCategoryList_2 = [
            { name: "男表", url: "productInner/watch/images/category_5.png", accessAddress: "#/search?keywords=%E7%94%B7%E8%A1%A8" },
            { name: "女表", url: "productInner/watch/images/category_6.png", accessAddress: "#/search?keywords=%E5%A5%B3%E8%A1%A8" },
            { name: "运动智能", url: "productInner/watch/images/category_7.png", accessAddress: "#/search?keywords=%E6%99%BA%E8%83%BD%E6%89%8B%E8%A1%A8&goodsCategories=5025;5026;12417" },
            { name: "万表网", url: "productInner/watch/images/category_8.png", accessAddress: httpsHeader+"/ActivityProject/wanclock/index.html" },
        ];

        //大牌推荐
        vm.brandList_top = [
            {name: "浪琴", url: "productInner/watch/images/brand_b1.jpg", accessAddress: "#/search?keywords=%E6%B5%AA%E7%90%B4"  },
            {name: "天梭", url: "productInner/watch/images/brand_b2.jpg", accessAddress: "#/search?keywords=%E5%A4%A9%E6%A2%AD" },
        ];
        vm.brandList_bottom = [
            {name: "欧米茄", url: "productInner/watch/images/brand_1.jpg", accessAddress: "#/search?keywords=%E6%AC%A7%E7%B1%B3%E8%8C%84" },
            {name: "卡地亚", url: "productInner/watch/images/brand_2.jpg", accessAddress: "#/search?keywords=%E5%8D%A1%E5%9C%B0%E4%BA%9A" },
            {name: "万国", url: "productInner/watch/images/brand_3.jpg", accessAddress: "#/search?keywords=%E4%B8%87%E5%9B%BD" },
            {name: "卡西欧", url: "productInner/watch/images/brand_4.jpg", accessAddress: "#/search?keywords=%E5%8D%A1%E8%A5%BF%E6%AC%A7%E6%89%8B%E8%A1%A8" },
            {name: "ck", url: "productInner/watch/images/brand_5.jpg", accessAddress: "#/search?keywords=CK%E6%89%8B%E8%A1%A8" },
            {name: "dw", url: "productInner/watch/images/brand_6.jpg", accessAddress: "#/search?keywords=DW%E6%89%8B%E8%A1%A8" },
        ];

        // banner图
        vm.bannerList = [
            {name:'西铁城', bannerUrl: "productInner/watch/images/banner_default.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792642733&title=西铁城 " },
            {name:'斯沃琪', bannerUrl: "productInner/watch/images/banner2.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792643052&bannerUrl="+httpsHeader+"/mallh5/productInner/watch/images/banner2.jpg&title=斯沃琪 " },
        ];


        init();

        function init() {
            //$stateParams.oneLevelId
            $verifyService.SetIOSTitle($stateParams.listMark);
            scrollInit();
            bannerInit();
            everydayInit();
        }

        //banner
        function bannerInit() {
            // $productService.getPageBanner({
            //     channelId: $userService.$$channelId,
            //     bannerPageId: '3000000000',
            //     bannerOptionId: $stateParams.oneLevelId
            // }).success(function(data) {
            //     var ht = "";
            //     if (data.resultCode == "0000") {
            //         vm.bannerList = data.result.bannerList;
            //         if (JSON.stringify(data.result) != "{}") {
            //             $.each(vm.bannerList, function(i, v) {
            //                 if (v.typeFrom == "1") {
            //                     ht += '<div class="swiper-slide"><a href="' + v.accessAddress + '"><img src=' + imgUrl + v.bannerUrl + '></a></div>';
            //                 } else {
            //                     ht += '<div class="swiper-slide"><a href="' + v.accessAddress + '"><img src=' + vm.bannerImgUrl + v.bannerUrl + '></a></div>';
            //                 }
            //             });
            //             $('#banner_product_inner').html(ht);

            //             if (vm.bannerList.length > 1) {
            //                 // banner 轮播
            //                 var bannerSlide = new Swiper('.bannerSlide', {
            //                     loop: true,
            //                     autoplay: 4000,
            //                     autoplayDisableOnInteraction: false,
            //                     pagination: '.swiper-pagination'
            //                 });
            //             }
            //         }
            $timeout(function() {
                if (vm.bannerList.length > 1) {
                    var bannerSlide = new Swiper('.bannerSlide', {
                        loop: true,
                        autoplay: 4000,
                        autoplayDisableOnInteraction: false,
                        pagination: '.swiper-pagination'
                    });
                }
            }, 300)

            search();
            //     }
            // });
        }

        //每日特惠
        function everydayInit() {
            var id = '72792641745';//线上
            $homeService.getYourlikeInfo(id).success(function (data) {
                console.log(data);
                if(data.resultCode == "0000"){
                    //最多显示3条
                    if (data.result.goodsList.length < 4) {
                        vm.everydayList = data.result.goodsList;
                    } else {
                        vm.everydayList = [];
                        for (var i = 0; i < 3; i++) {
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
            var id = '72792641789';//线上
            $homeService.getYourlikeInfo(id).success(function (data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.sellWellList = data.result.goodsList;

                    $scope.freeClick(0);
                    findSecondCategory();
                }
            });
        }

        /**免息专区**/
        var idArr = ['72792641994', '72792642009', '72792642012'];//线上
        $scope.freeClick = function(index,name){
            var id = idArr[index];
            $homeService.getYourlikeInfo(id).success(function (data) {
                if (data.resultCode == "0000") {
                    vm.freeGoodsList = data.result.goodsList;
                }
            });

            vm.freeIndex = index;
            monitor('Interest-freeinstalmentstable',name)
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

        vm.tabClick = function(index,name) {
            vm.tabIndex = index;
            vm.subTabIndex = 0;
            vm.subTabList = vm.tabList[vm.tabIndex].categoryList;
            productInit();
            findGoods();
            monitor('categorytable',name)
        }
        vm.subTabClick = function(index,name) {
            vm.subTabIndex = index;
            vm.goodsCategories = $stateParams.oneLevelId + ';' + vm.tabList[vm.tabIndex].categoryId + ';' + vm.subTabList[vm.subTabIndex].categoryId;
            productInit();
            getProductList();
            monitor('table',name)
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

        function setChartNum() {
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