/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./computer.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('innerBrainController', innerBrainController)
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

    //电脑办公
    innerBrainController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$homeService', '$productService', '$userService', '$address', '$window'];

    function innerBrainController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $homeService, $productService, $userService, $address, $window) {
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
                page: 'office',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        monitor('browse','')

        //分类
        vm.categoryList = [
            { name: "笔记本", url: "productInner/computer/images/category_1.png", accessAddress: "#/search?keywords=笔记本" },
            { name: "游戏本", url: "productInner/computer/images/category_2.png", accessAddress: "#/search?keywords=游戏本" },
            { name: "台式机", url: "productInner/computer/images/category_3.png", accessAddress: "#/search?keywords=台式机" },
            { name: "一体机", url: "productInner/computer/images/category_4.png", accessAddress: "#/search?keywords=一体机" },
            { name: "平板电脑", url: "productInner/computer/images/category_5.png", accessAddress: "#/search?keywords=平板电脑" },
            { name: "电脑配件", url: "productInner/computer/images/category_6.png", accessAddress: "#/search?keywords=电脑配件" },
            { name: "外设产品", url: "productInner/computer/images/category_7.png", accessAddress: "#/search?keywords=外设产品" },
            { name: "网络产品", url: "productInner/computer/images/category_8.png", accessAddress: "#/search?keywords=网络产品" },
            { name: "游戏设备", url: "productInner/computer/images/category_9.png", accessAddress: "#/search?keywords=游戏设备" },
            { name: "办公设备", url: "productInner/computer/images/category_10.png", accessAddress: "#/search?keywords=办公设备" },
        ];

      

        //品牌街
        vm.brandList = [
            {name: "macbook", url: "productInner/computer/images/brand_1.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=APPLE%20MACBOOK" },
            {name: "thinkpad", url: "productInner/computer/images/brand_2.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=THINKPAD%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "dell", url: "productInner/computer/images/brand_3.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=dell%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "huawei", url: "productInner/computer/images/brand_4.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E5%8D%8E%E4%B8%BA%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "hp", url: "productInner/computer/images/brand_5.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E6%83%A0%E6%99%AE%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "asus", url: "productInner/computer/images/brand_6.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E5%AE%8F%E7%A2%81%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "hasee", url: "productInner/computer/images/brand_7.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E7%A5%9E%E8%88%9F%E7%AC%94%E8%AE%B0%E6%9C%AC" },
            {name: "lenovo", url: "productInner/computer/images/brand_8.png", accessAddress: httpsHeader+"/mallh5/#/search?keywords=%E8%81%94%E6%83%B3%E7%AC%94%E8%AE%B0%E6%9C%AC" },
        ];

        // banner图
        vm.bannerList = [
            // { bannerUrl: "productInner/computer/images/banner.jpg", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426490477&bannerUrl="+httpsHeader+"/mallh5/productInner/computer/images/banner.png&title=新年大狂欢 " },
            { bannerUrl: "productInner/computer/images/banner2.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=71426490756&bannerUrl="+httpsHeader+"/mallh5/productInner/computer/images/banner2.jpg&title=IPAD ",name:'ipad' },
        ];

        init();

        function init() {

            $scope.listmack = $stateParams.listMark;
            action();
           
        }

        function action() {
            $verifyService.SetIOSTitle($stateParams.listMark);
            bannerInit();
            everydayInit();
            interstInit();
            scrollInit();
            
        }

        //banner
        function bannerInit() {   

            // $timeout(function(){
            //     var bannerSlide = new Swiper('.bannerSlide', {
            //         loop: true,
            //         autoplay: 4000,
            //         autoplayDisableOnInteraction: false,
            //         pagination: '.swiper-pagination'
            //     });
            // },300)
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


                // var wHeight = $(window).height();
                // mainScroll.on('scroll',function(){
                //     var top = -this.y - vm.tabTop;
                //     if (top > 0) {
                //         $('#tabBox').css("top", top + "px");
                //         $('#tabBox').css('marginTop','-0.143333rem')
                //     } else {
                //         $('#tabBox').css("top", "");
                //         $('#tabBox').css('marginTop','')
                //     }

                //     var top = -this.y;
                //     if( top > wHeight ){
                //         $('.goTop').fadeIn(0);
                //     }else{
                //         $('.goTop').fadeOut(0);
                //     }
                // });

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
        //每日精选
        function everydayInit() {
            var id = '71426491183';
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


        // 免息专区

        function interstInit(){
            var id = '71426491152';
            ajax(id, function(data) {
                if (data.resultCode == "0000") {
                        vm.interstList = data.result.goodsList;
                    } 
                    
                    })
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
                        if (vm.pageNo === 0 && sessionStorage.getItem('firstTrue'))  {
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
        





        // 免息专区

        $('.interst_tab li').click(function(){

            var _this = $(this);
            _this.addClass("active").siblings(".active").removeClass("active");
            monitor('secondtable',_this.text())
            var id= _this.attr("data-id");
            ajax(id, function(data) {
                if (data.resultCode == "0000") {
                    vm.interstList = data.result.goodsList;  
                }
            });
        }) 
        
        
           
            

        

        //热销单品
        function sellWellInit() {
            var id = '71426491194';
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