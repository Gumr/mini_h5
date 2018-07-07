/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./beauty.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('beautyController', beautyController)
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

    //美妆个护
    beautyController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$homeService', '$productService', '$userService', '$address', '$window'];

    function beautyController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $homeService, $productService, $userService, $address, $window) {
        $scope.search = {
            hotArr: ['IPhone 8', 'oppo R11', '华为Mate9 ', '曲面电视', '轻薄本', '黄金吊坠', '护肤套装', '香水', '天梭', '家纺四件套'], //热门搜索
            historyArr: getSearchCookie('searchName'), //历史搜索
        };
        var mainScroll = null;
        var wHeight = $(window).height();
        var vm = this;
        vm.jdUrl = $productService.imgUrl[1];
        vm.selfUrl = imgUrl;
        vm.bannerImgUrl = imgUrl;
        vm.tabTop = $('.phoneType').offset().top; //吸顶使用
        vm.Identification = '0';
        vm.secondActive = '0';
        vm.findGoods = findGoods;
        vm.findList = findList;
        vm.jdUrl = $productService.imgUrl[1];  
        vm.url = imgUrl;
        vm.pageNo = 0;
        vm.pageSize = 4;
        vm.isHide = true;
        var mainScroll = "",
            pullDown = false,
            productBool = true;
        var jdImgServer = $productService.imgUrl[1]; //jd图片服务器地址
        $scope.data = {
            phoneType: [],
            loadIcon: true, //加载loading  true显示 false隐藏
        };
        $scope.listfour = false;
        $scope.listThree = false;
        sessionStorage.setItem('firstTrue',true);
        

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'Beautymakeup',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        } 

        monitor('browse','')

        //分类
        vm.categoryList = [
            { name: "面膜", url: "productInner/beauty/images/category_1.png", accessAddress: "#/search?keywords=面膜" },
            { name: "乳液面霜", url: "productInner/beauty/images/category_2.png", accessAddress: "#/search?keywords=乳液面霜" },
            { name: "护肤套装", url: "productInner/beauty/images/category_3.png", accessAddress: "#/search?keywords=护肤套装" },
            { name: "眼霜", url: "productInner/beauty/images/category_4.png", accessAddress: "#/search?keywords=眼霜" },
            { name: "BB霜", url: "productInner/beauty/images/category_5.png", accessAddress: "#/search?keywords=BB霜" },
            { name: "洁面", url: "productInner/beauty/images/category_6.png", accessAddress: "#/search?keywords=洁面" },
            { name: "身体乳", url: "productInner/beauty/images/category_7.png", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792645386&title=身体乳" },
            { name: "精油", url: "productInner/beauty/images/category_8.png", accessAddress: "#/search?keywords=精油" },
            { name: "男士护肤", url: "productInner/beauty/images/category_9.png", accessAddress: "#/search?keywords=男士护肤" },
            { name: "香水", url: "productInner/beauty/images/category_10.png", accessAddress: "#/search?keywords=香水" },
        ];

        // 种草区
        vm.grassLeft = { url: "productInner/beauty/images/grass_1.png", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792643620&bannerUrl=https://www.funsales.com/mallh5/productInner/beauty/images/grass_1.png&title=欧美馆" };

        vm.grassRight = [
            { url: "productInner/beauty/images/grass_2.png", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792643634&bannerUrl=https://www.funsales.com/mallh5/productInner/beauty/images/grass_2.png&title=日韩馆" },
            { url: "productInner/beauty/images/grass_3.png", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792643648&bannerUrl=https://www.funsales.com/mallh5/productInner/beauty/images/grass_3.png&title=中国馆" },
        ];

        //品牌街

        vm.brand = [
            {name:"雅诗兰黛", url: "productInner/beauty/images/brand_01.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=雅诗兰黛" },
            {name:"sk-11", url: "productInner/beauty/images/brand_02.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=SK-II" },
        ];
        vm.brandList = [
            {name:"后hoo", url: "productInner/beauty/images/brand_1.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=后Whoo" },
            {name:"兰芝", url: "productInner/beauty/images/brand_2.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=兰芝" },
            {name:"雪花秀", url: "productInner/beauty/images/brand_3.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E9%9B%AA%E8%8A%B1%E7%A7%80" },
            {name:"韩后", url: "productInner/beauty/images/brand_4.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E9%9F%A9%E5%90%8E" },
            {name:"百雀羚", url: "productInner/beauty/images/brand_5.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E7%99%BE%E9%9B%80%E7%BE%9A" },
            {name:"欧莱雅", url: "productInner/beauty/images/brand_6.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E6%AC%A7%E8%8E%B1%E9%9B%85" },
            {name:"御泥坊", url: "productInner/beauty/images/brand_7.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E5%BE%A1%E6%B3%A5%E5%9D%8A" },
            {name:"阿芙", url: "productInner/beauty/images/brand_8.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E9%98%BF%E8%8A%99AFU" },
            {name:"蜜丝佛陀", url: "productInner/beauty/images/brand_9.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E8%9C%9C%E4%B8%9D%E4%BD%9B%E9%99%80" },
        ];

        // banner图
        vm.bannerList = [
            {name:'兰蔻', bannerUrl: "productInner/beauty/images/banner.png", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792644039&bannerUrl="+httpsHeader+"/mallh5/productInner/beauty/images/banner.png&title=兰蔻 " },
            {name:'悦诗风吟', bannerUrl: "productInner/beauty/images/banner02.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=72792644046&bannerUrl="+httpsHeader+"/mallh5/productInner/beauty/images/banner02.jpg&title=悦诗风吟 " },
        ];
        
        init();

        function init() {

            $scope.listmack = $stateParams.listMark;
            action();
           
        }

        function action() {
            $verifyService.SetIOSTitle($stateParams.listMark);
            sellWellInit();
            scrollInit();
            setChartNum();
            search();
        }

      

        function scrollInit(){
            
                mainScroll = new IScroll(".main-content",{
                    probeType : 3,
                    preventDefault:false
                });

                mainScroll.on('scroll', function(){
                    scroll_one(this.y);
                });



                mainScroll.on('scrollEnd', function() {
                    pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                    if (pullDown && productBool) {
                        pullDown = false;
                        vm.pageNo++;
                        getProductList();
                    }
                });

            // },200);
        }


        function scroll_one(top){
            //吸顶
            var tabTop = -$('.phoneType').offset().top;
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
            $('.goTop').fadeOut(0);
            mainScroll.scrollTo(0, 0, 0);
        }

        function ajax(id, callBack) {
            $.ajax({
                type: "get",
                url: httpsHeader+"/mall/activityGoodsCommonApi/getActivityGoodsList.action?activityId=" + id,
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
        


        


        function findList($event,categoryId,parentId,name){
            
            monitor('secondtable',name)
            
            vm.pageNo = 0;
            productBool = true;
            vm.productList = [];
            vm.categoryId = categoryId;
            vm.parentId = parentId;
            vm.secondActive = $($event.target).index();
            if($event == ''){
                vm.secondActive = 0;
            }
            getProductList();

            // $('#tabBox').css("top", "");
            // $('#tabBox').css('marginTop','')

        }


        function getProductList() {
            if (vm.backLoad) return;
    
            loadEnd = false;
            $productService.searchGoods({
                pageNo: vm.pageNo, //当前页数
                pageSize: 4, //每页商品数
                goodsCategories: $stateParams.oneLevelId + ';' + vm.parentId + ';' + vm.categoryId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    var goodsList = data.result.goodsList; //商品
                    var goodsTotalNum = data.result.total; //商品数量
                    //判断当前是否为最后一页
                    if (goodsTotalNum - vm.pageNo * 4 <= 4) {
                        loadGoods = false;
                        $scope.data.loadIcon = false;
                    }
                    
                    //判断搜索结果是否有商品
                    if (goodsList.length) {
                        
                        //判断是否第一页，非第一页数据合并
                        if (vm.pageNo === 0) {
                            $scope.data.phoneType = goodsList;
                        } else {
                            $scope.data.phoneType = $scope.data.phoneType.concat(goodsList);
                        }
                    } else {
                        if (vm.pageNo === 0 && sessionStorage.getItem('firstTrue')) {
                            $scope.data.phoneType = [];
                            $scope.data.loadIcon = false;
                            sessionStorage.removeItem('firstTrue');
                        }else if(vm.pageNo === 0 && !sessionStorage.getItem('firstTrue')){
                            $scope.data.phoneType = [];
                            $scope.data.loadIcon = false;
                            toolTip("商品暂未上架，敬请期待！");
                        }
                    }
                    $timeout(function() { mainScroll.refresh() }, 300) //刷新滚动条
                } else {
                    $scope.data.loadIcon = false;
                    toolTip(data.resultMessage)
                }
                loadEnd = true;
            })
            $timeout(function() {
                mainScroll.refresh();
            }, 200);
        }



        // 分类
        $cardService.getGoodsCategoryList({
            channelId : sessionStorage.channelId,
            categoryId : $stateParams.oneLevelId
        }).success(function(data){
            if(data.resultCode == '0000'){
                vm.classifyList = data.result.categoryList;
                angular.forEach(vm.classifyList, function(data, index) {
                    if (data.type == '02') {
                        vm.classifyList.splice(index, 1);
                    }
                })
                if (!isEmptyObject(vm.classifyList) && !vm.isBack) {
                    vm.secondType = vm.classifyList[0];
                    findList('',vm.secondType.categoryList[0].categoryId,vm.secondType.categoryList[0].parentId);
                    // getProductList();
                }
                // tab宽度自适应
                if (vm.classifyList.length == 4) {
                    $scope.listfour = true;
                } else if (vm.classifyList.length == 3) {
                    $scope.listThree = true;
                }

                $timeout(function() {
                    var categorySlide = new Swiper('.category-slide', {
                        slidesPerView: 'auto',
                        paginationClickable: true,
                        freeMode: false
                    });

                    if (vm.bannerList.length > 1) {
                        var bannerSlide = new Swiper('.bannerSlide', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination'
                        });
                    }
                    
                }, 300)
            }
        })

        function findGoods($event,secondLevelId,parentId,name) {
            monitor('table',name)
            if(sessionStorage.getItem('firstTrue')){
                sessionStorage.removeItem('firstTrue')
            };
            // vm.secondActive = '0';
            vm.goodsType = secondLevelId;
            vm.Identification = $($event.target).index();
            vm.secondType = vm.classifyList[Number(vm.Identification)];
            // console.log(vm.secondType.categoryList[0])
            findList('',vm.secondType.categoryList[0].categoryId,vm.secondType.categoryList[0].parentId);

            // $('#tabBox').css("top", "");
            // $('#tabBox').css('marginTop','');    
        }
        // vm.secondType = vm.classifyList[Number(vm.Identification)]
        





        
        
        
           
            

        

        //热销单品
        function sellWellInit() {
            var id = '72792643653';
            ajax(id, function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.sellWellList = data.result.goodsList;

                    //老人机
                    $("#tabBox").children("li:eq(0)").trigger("click");
                }
            });
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
                vm.tabTop = $('#tabTop').height();
                mainScroll.refresh();
            }

            if($(element).parent().hasClass("secondlist")){
                var height = $("#tabBox").height();
                var rem = height*10/$(window).width()+0.13333;
                $(".phoneType .content").css({"padding-top": rem+"rem"}); 
            }


            //下方分类--切换内容后触发滚动
            if($(element).hasClass("product")){
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