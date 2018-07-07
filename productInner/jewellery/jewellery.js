/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./jewellery.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('innerJewelleryController', innerJewelleryController)
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
    innerJewelleryController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$homeService', '$productService', '$userService', '$address', '$window'];

    function innerJewelleryController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $homeService, $productService, $userService, $address, $window) {
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

        //下方分类数据
        $scope.data = {
            goodsList: [],
            pageNo: 0, //页数
            pageSize: 4, //每页数量
            loadAll: false, //是否加载完所有
            loading: true, //加载loading  true显示 false隐藏
        };

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'jewelry',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        } 

        monitor('browse','')

        //上方分类按钮
        vm.topCategoryList = [
            { name: "黄金", url: "productInner/jewellery/images/category_1.png", accessAddress: "#/search?keywords=%E9%BB%84%E9%87%91" },
            { name: "铂金", url: "productInner/jewellery/images/category_2.png", accessAddress: "#/search?keywords=%E9%93%82%E9%87%91" },
            { name: "钻石", url: "productInner/jewellery/images/category_3.png", accessAddress: "#/search?keywords=%E9%92%BB%E7%9F%B3" },
            { name: "银饰", url: "productInner/jewellery/images/category_4.png", accessAddress: "#/search?keywords=%E9%93%B6%E9%A5%B0" },
            { name: "K金饰品", url: "productInner/jewellery/images/category_5.png", accessAddress: "#/search?keywords=K%E9%87%91%E9%A5%B0%E5%93%81" },
            { name: "木饰", url: "productInner/jewellery/images/category_6.png", accessAddress: "#/search?keywords=%E6%9C%A8%E9%A5%B0" },
            { name: "玉石", url: "productInner/jewellery/images/category_7.png", accessAddress: "#/search?keywords=%E7%8E%89%E7%9F%B3" },
            { name: "时尚饰品", url: "productInner/jewellery/images/category_8.png", accessAddress: "#/search?keywords=%E6%97%B6%E5%B0%9A%E9%A5%B0%E5%93%81" },
            { name: "水晶玛瑙", url: "productInner/jewellery/images/category_9.png", accessAddress: "#/search?keywords=%E6%B0%B4%E6%99%B6%E7%8E%9B%E7%91%99" },
            { name: "彩宝", url: "productInner/jewellery/images/category_10.png", accessAddress: "#/search?keywords=%E5%BD%A9%E5%AE%9D" },
        ];

        //主题导航
        vm.themeList_left = [
            {name:'新婚贺礼', url: "productInner/jewellery/images/theme_left_1.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426489087&title=%E6%96%B0%E5%A9%9A%E8%B4%BA%E7%A4%BC" },
        ];
        vm.themeList_right = [
            {name:"贺年生肖", url: "productInner/jewellery/images/theme_right_1.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426489381&title=%E8%B4%BA%E5%B9%B4%E7%94%9F%E8%82%96" },
            {name:"祝福长辈", url: "productInner/jewellery/images/theme_right_2.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426490058&title=%E7%A5%9D%E7%A6%8F%E9%95%BF%E8%BE%88"  },
        ];

        //大牌推荐
        vm.brandList_top = [
            {name:"周生生", url: "productInner/jewellery/images/brand_b1.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426495358&title=%E5%91%A8%E7%94%9F%E7%94%9F"  },
            {name:"蒂蔻", url: "productInner/jewellery/images/brand_b2.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426488364&title=%E8%92%82%E8%94%BB%E7%8F%A0%E5%AE%9D"  },
        ];
        vm.brandList_bottom = [
            {name:"赛菲尔", url: "productInner/jewellery/images/brand_1.jpg", accessAddress: "#/search?keywords=%E8%B5%9B%E8%8F%B2%E5%B0%94" },
            {name:"施华洛世奇", url: "productInner/jewellery/images/brand_2.jpg", accessAddress: "#/search?keywords=%E6%96%BD%E5%8D%8E%E6%B4%9B%E4%B8%96%E5%A5%87" },
            {name:"T400", url: "productInner/jewellery/images/brand_3.jpg", accessAddress: "#/search?keywords=T400" },
            {name:"雅宝福", url: "productInner/jewellery/images/brand_4.jpg", accessAddress: "#/search?keywords=%E9%9B%85%E5%AE%9D%E7%A6%8F" },
            {name:"周大福", url: "productInner/jewellery/images/brand_5.jpg", accessAddress: "#/search?keywords=%E5%91%A8%E5%A4%A7%E7%A6%8F" },
            {name:"百年宝诚", url: "productInner/jewellery/images/brand_6.jpg", accessAddress: "#/search?keywords=%E7%99%BE%E5%B9%B4%E5%AE%9D%E8%AF%9A" },
        ];

        // banner图
        vm.bannerList = [
            {name:'蒂蔻珠宝', bannerUrl: "productInner/jewellery/images/banner.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426488364&bannerUrl="+httpsHeader+"/mallh5/productInner/jewellery/images/banner.jpg&title=蒂蔻珠宝 " },
            // { bannerUrl: "productInner/jewellery/images/banner2.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792643052&bannerUrl="+httpsHeader+"/mallh5/productInner/jewellery/images/banner2.jpg&title=斯沃琪 " },
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
        // function bannerInit() {
        //     $productService.getPageBanner({
        //         channelId: $userService.$$channelId,
        //         bannerPageId: '3000000000',
        //         bannerOptionId: $stateParams.oneLevelId
        //     }).success(function(data) {
        //         var ht = "";
        //         if (data.resultCode == "0000") {
        //             vm.bannerList = data.result.bannerList;
        //             if (JSON.stringify(data.result) != "{}") {
        //                 $.each(vm.bannerList, function(i, v) {
        //                     if (v.typeFrom == "1") {
        //                         ht += '<div class="swiper-slide"><a href="' + v.accessAddress + '"><img src=' + imgUrl + v.bannerUrl + '></a></div>';
        //                     } else {
        //                         ht += '<div class="swiper-slide"><a href="' + v.accessAddress + '"><img src=' + vm.bannerImgUrl + v.bannerUrl + '></a></div>';
        //                     }
        //                 });
        //                 $('#banner_product_inner').html(ht);

        //                 if (vm.bannerList.length > 1) {
        //                     // banner 轮播
        //                     var bannerSlide = new Swiper('.bannerSlide', {
        //                         loop: true,
        //                         autoplay: 4000,
        //                         autoplayDisableOnInteraction: false,
        //                         pagination: '.swiper-pagination'
        //                     });
        //                 }
        //             }

        //             search();
        //         }
        //     });
        // }
        
        function bannerInit() {
                if (vm.bannerList.length > 1) {
                    // banner 轮播
                    $timeout(function() { 
                        var bannerSlide = new Swiper('.bannerSlide', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination'
                        });
                    }, 300)
                }
            

            search();
        }

        //每日特惠
        function everydayInit() {
            var id = '71426490351';
            $homeService.getYourlikeInfo(id).success(function (data) {
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
            var id = '71426490366';
            $homeService.getYourlikeInfo(id).success(function (data) {
                if (data.resultCode == "0000") {
                    vm.sellWellList = data.result.goodsList;

                    findSecondCategory();
                }
            });
        }

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
            monitor('table',name)
        }
        vm.subTabClick = function(index,name) {
            vm.subTabIndex = index;
            vm.goodsCategories = $stateParams.oneLevelId + ';' + vm.tabList[vm.tabIndex].categoryId + ';' + vm.subTabList[vm.subTabIndex].categoryId;
            productInit();
            getProductList();
            monitor('secondtable',name)
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
                if(vm.tabWrap.outerWidth() < $("#tabBox").width()){
                    //宽度不够，均分
                    vm.tabWrap.addClass("swiper-wrapper-between");
                } else {
                    console.log(2);
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