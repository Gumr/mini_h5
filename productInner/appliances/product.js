/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./product.css', 'common/script/lib/swiper.min.js'], function(angular) {

  

    /*-------------------- 家电商品列表 --------------------*/
    angular.module('app')
    .controller('appliancesProductListController', appliancesProductListController)
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
    appliancesProductListController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$productService', '$timeout', '$homeService', '$userService', '$cardService'];

    function appliancesProductListController($scope, $state, $stateParams, $q, $verifyService, $productService, $timeout, $homeService, $userService, $cardService) {
        var vm = this;
        vm.productList = [];
        vm.products = [];
        vm.product = null;
        vm.typeId = "";
        vm.jdUrl = $productService.imgUrl[1];  
        vm.url = imgUrl;
        vm.typeList = [];
        vm.typeContent = [];
        vm.classContent = [];
        vm.moodsContent = [];
        vm.brandContent = [];
        vm.bannerImgUrl = imgUrl;
        vm.typeImgUrl = imgUrl;
        vm.bannerList = [];
        vm.categoryList = [];
        vm.findGoods = findGoods;
        vm.monitor = monitor; //监控点击量
        vm.goodsType = "";
        vm.pageNo = 0;
        vm.pageSize = 4;
        vm.isHide = true;
        vm.docart = docart;
        vm.Identification = '0';
        var bannerHeight = $('.bannerSlide').height()-$('.header-bar').height();
        vm.tabTop = $('.category-slide').offset().top; //吸顶使用
        $scope.listfour = false;
        $scope.listThree = false;
        var mainScroll = "",
            pullDown = false,
            productBool = true;
        var jdImgServer = $productService.imgUrl[1]; //jd图片服务器地址
        $scope.data = {
            goodsList: [],
            loadIcon: true, //加载loading  true显示 false隐藏
        }
        $scope.delSearchCookie = delSearchCookie;
        if ($stateParams.fromPage == 'a') {
            vm.Identification = '2'
        } else if ($stateParams.fromPage == 'b') {
            vm.Identification = '1'
        } else if ($stateParams.fromPage == 'c') {
            vm.Identification = '3'
        }

        $scope.dataWord = {
            hotSearch : ['IPhone 8','oppo R11','华为Mate9 ','曲面电视','轻薄本','黄金吊坠','护肤套装','香水','天梭','家纺四件套'],
            historySearch: getSearchCookie('searchName')
          };

        $scope.content = {
            typeContent: [
                { name: "电视", src: "productInner/appliances/images/icon-1.png", href: "#/search?keywords=电视" },
                { name: "空调", src: "productInner/appliances/images/icon-2.png",  href: "#/search?keywords=空调" },
                { name: "冰箱", src: "productInner/appliances/images/icon-3.png",  href: "#/search?keywords=冰箱" },
                { name: "洗衣机", src: "productInner/appliances/images/icon-4.png", href: "#/search?keywords=洗衣机" },
                { name: "厨卫大电", src: "productInner/appliances/images/icon-5.png", href: "#/search?keywords=厨卫大电" }
            ],
            classContent: [
                { name: "厨房小电", src: "productInner/appliances/images/icon-6.png", href: "#/search?keywords=厨房小电" },
                { name: "生活电器", src: "productInner/appliances/images/icon-7.png", href: "#/search?keywords=生活电器" },
                { name: "家庭影音", src: "productInner/appliances/images/icon-8.png", href: "#/search?keywords=家庭影音" },
                // { name: "美的馆", src: "productInner/appliances/images/icon-9.png", href: httpsHeader+"/ActivityProject/mallactivities/#/mall/beauty" },
                { name: "美的馆", src: "productInner/appliances/images/icon-9.png", href: "#/search?keywords=美的" },
                { name: "个护健康", src: "productInner/appliances/images/icon-10.png", href: "#/search?keywords=个护健康" },
            ],
            moodsContent: [
                {name:'7131785743', src: "productInner/appliances/images/moods1.png", href: httpsHeader+"/mallh5/#/productDetails?goodsId=7131785743" },
                {name:'214347157025', src: "productInner/appliances/images/moods2.png", href: httpsHeader+"/mallh5/#/productDetails?goodsId=214347157025" },
                {name:'214347248579', src: "productInner/appliances/images/moods3.png", href: httpsHeader+"/mallh5/#/productDetails?goodsId=214347248579" },
                {name:'71317830306', src: "productInner/appliances/images/moods4.png",  href: httpsHeader+"/mallh5/#/productDetails?goodsId=71317830306" },
                {name:'416448102087', src: "productInner/appliances/images/moods5.png", href: httpsHeader+"/mallh5/#/productDetails?goodsId=416448102087" },
                {name:'725263110236', src: "productInner/appliances/images/moods6.png",  href: httpsHeader+"/mallh5/#/productDetails?goodsId=725263110236" },
            ],
            brandContent: [
                {name:'乐视', src: "productInner/appliances/images/brand1.png", href: httpsHeader+"/mallh5/#/productDetails?goodsId=727900122931" },
                {name:'美的', src: "productInner/appliances/images/brand2.png", href: httpsHeader+"/mallh5/#/search?keywords=%E7%BE%8E%E7%9A%84" },
                {name:'格力', src: "productInner/appliances/images/brand3.png", href: httpsHeader+"/mallh5/#/search?keywords=%E6%A0%BC%E5%8A%9B" },
                {name:'西门子', src: "productInner/appliances/images/brand4.png",  href: httpsHeader+"/mallh5/#/search?keywords=%E8%A5%BF%E9%97%A8%E5%AD%90" },
                {name:'松下', src: "productInner/appliances/images/brand5.png", href: httpsHeader+"/mallh5/#/search?keywords=%E6%9D%BE%E4%B8%8B" },
                {name:'苏泊尔', src: "productInner/appliances/images/brand6.png",  href: httpsHeader+"/mallh5/#/search?keywords=%E8%8B%8F%E6%B3%8A%E5%B0%94" },
                {name:'海尔', src: "productInner/appliances/images/brand7.png", href: httpsHeader+"/mallh5/#/search?keywords=%E6%B5%B7%E5%B0%94" },
                {name:'老板', src: "productInner/appliances/images/brand8.png",  href: httpsHeader+"/mallh5/#/search?keywords=%E8%80%81%E6%9D%BF" },
            ],
        }  


        // banner图
        vm.bannerList = [
            { bannerUrl: "productInner/appliances/images/banner.jpg ", accessAddress: httpsHeader+"/ActivityProject/luxury2017/inner.html?id=30930170302&title=%E5%B0%8F%E7%B1%B3%E6%99%BA%E8%83%BD%E5%AE%B6%E5%B1%85",name:'家电顶部banner' },
        ];


        init();

        function init() {
            var jumpInfo = JSON.parse(sessionStorage.getItem('jumpInfo'));
            if (jumpInfo) {
                var scrollTop = jumpInfo.scrollTop;
                vm.pageNo = jumpInfo.pageNo;
                vm.goodsType = jumpInfo.goodsType;
                vm.Identification = jumpInfo.Identification;
                $scope.data.goodsList = jumpInfo.goodsList;
                $stateParams = jumpInfo.stateParams;
                loadGoods = true;
                vm.backLoad = true;
                vm.isBack = true;
                $(".main-content").css("visibility", "hidden");
                $timeout(function() {
                    mainScroll.scrollTo(0, scrollTop, 0);
                    mainScroll.refresh();
                    loadEnd = true;
                    $scope.data.loadIcon = false;
                    vm.backLoad = false;
                    $(".main-content").css("visibility", "");
                }, 50);
                sessionStorage.removeItem('jumpInfo');
            }

            $scope.listmack = $stateParams.listMark;
            action();
        }

        function action() {
            vm.typeId = $verifyService.getQueryParam("typeId");
            $verifyService.SetIOSTitle($scope.listmack);
            // bannerList();
            findSecondCategory();
            scrollInit();
            search();
            getCategory();
            setChartNum();
        }

        monitor('browse','')
        // 监控点击量
        function monitor(pageModule, pageValue){
            $productService.doUserTrace({
                channelId : $userService.$$channelId,
                page : 'Electricalappliances',
                pageModule : pageModule,
                pageValue : encodeURI(pageValue)
            }).success(function(data){
                
            });
        }

        function scrollInit(){
            // $timeout(function(){
                mainScroll = new IScroll(".main-content",{
                    probeType : 3,
                    preventDefault:false
                });
                mainScroll.on('scroll',function(){

                    var top = -this.y - vm.tabTop;
                    if(top>0){
                        $('.category-slide').css("top", top + "px");
                        $('.category-slide').css('marginTop','-1px')
                        $('.appliancesProductList .list-wrap').css('marginTop','0')
                    }else{
                        $('.category-slide').css("top", '');
                        $('.appliancesProductList .list-wrap').css('marginTop','')
                    }
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

        

        $scope.go = function(goodsId) {
            var jumpInfo = {
                total: $scope.data.total,
                goodsList: $scope.data.goodsList,
                goodsType: vm.goodsType,
                pageNo: vm.pageNo,
                stateParams: $stateParams,
                Identification: vm.Identification,
                scrollTop: mainScroll.y
            };
            sessionStorage.setItem('jumpInfo', JSON.stringify(jumpInfo));
            monitor('tableproduct',goodsId)
        };


        // 热销单品

        var id = '71894562527'; //线上
        $homeService.getYourlikeInfo(id).success(function (data) {
        
            if(data.resultCode == "0000"){
                vm.sellList = data.result.goodsList;
            }
        });  


        // 加入购物车
        function docart(typeFrom,goodsId,e){
            e.stopPropagation();
	        e.preventDefault();
            var wait = new waiting();
            $productService.doAddShoppingCartGoods({
                typeFrom: typeFrom,
                sign: "1", //数量加减的标志：1.数量添加   0.数量减少
                goodsId: goodsId,
                goodsNum: 1,
                loanPeriods: 12,
                goodsAttrInfo: [],
            }).success(function(data) {
              
                wait.hide();
                if (data.resultCode == '0000') {

                        toolTip('添加购物车成功');
                        setChartNum();

                    //调用获取购物车数量接口
                    // getCartnum();
                    // var cartList = JSON.parse(localStorage.getItem('cartList'));
                }
            })
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

        
        

        function findGoods($event, secondLevelId,name) {
            $('.category-slide').css("top", '');
            $('.appliancesProductList .list-wrap').css('marginTop','')
            vm.pageNo = 0;
            productBool = true;
            vm.productList = [];
            $($event.target).addClass('active')
                .siblings().removeClass('active');
            vm.goodsType = secondLevelId;
            vm.Identification = $($event.target).index()
            getProductList();
            monitor('table',name)
        }

        function findSecondCategory() {
            $cardService.getGoodsCategoryList({
                channelId: sessionStorage.channelId,
                categoryId: $stateParams.oneLevelId
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.categoryList = data.result.categoryList;
                    angular.forEach(vm.categoryList, function(data, index) {
                        if (data.type == '02') {
                            vm.categoryList.splice(index, 1);
                        }
                    })
                    if (!isEmptyObject(vm.categoryList) && !vm.isBack) {
                        vm.goodsType = vm.categoryList[0].categoryId;
                        getProductList();
                    }
                    //tab宽度自适应
                    // if (vm.categoryList.length == 4) {
                    //     $scope.listfour = true;
                    // } else if (vm.categoryList.length == 3) {
                    //     $scope.listThree = true;
                    // }
                    // 列表分类滑块
                    $timeout(function() {
                        var categorySlide = new Swiper('.category-slide', {
                            slidesPerView: 'auto',
                            paginationClickable: true,
                            freeMode: false
                        });
                    }, 300)
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        function bannerList() {
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
                                ht += '<a href='+v.accessAddress+' class="swiper-slide"><img src=' + imgUrl + v.bannerUrl + '></a>';
                            } else {
                                ht += '<a href='+v.accessAddress+' class="swiper-slide"><img src=' + vm.bannerImgUrl + v.bannerUrl + '></a>';
                            }
                        });
                        $('#bannerSwiper').html(ht);
                        if(data.result.bannerList.length>1){
                            // banner 轮播
                            var bannerSlide = new Swiper('.bannerSlide', {
                                loop: true,
                                autoplay: 4000,
                                autoplayDisableOnInteraction: false,
                                pagination: '.swiper-pagination'
                            });
                        }
                    }
                }
            });
        }

        //获取分类
      function getCategory(){
             vm.typeContent = $scope.content.typeContent;
             vm.classContent = $scope.content.classContent;
             vm.moodsContent = $scope.content.moodsContent;
             vm.brandContent = $scope.content.brandContent;
       } 




            /**
     * [description]  当repeat完成时，调用该方法
     * [description]  需要配合directive使用，并在监控对象上加上属性on-repeat-finished-render
     */
    $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
        if (mainScroll) {
            vm.tabTop = $('.topHeight').height();
            mainScroll.refresh();
        }
    });



        //获取搜索关键词
        function getSearchKeywords(){
            $productService.findGoodsSecondCategory({
              channelId:$userService.$$channelId,
              stringName:encodeURI($scope.searchText)
            }).success(function(data){
              if (data.resultCode == '0000') {
                  if(!isEmptyObject(data.result.goodsList)){
                      vm.searchGoodsList = data.result.goodsList;
                  }
                  if(!isEmptyObject(data.result.secondCategoryList)){
                      vm.searchCategoryList = data.result.secondCategoryList;
                  }
              }  
            })
          }



            //搜索
    function search(){
        if(vm.hasInitSearch){
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
            timer = setTimeout(function(){searchInput.val(text).focus();},300)
            $timeout(function() {
              vm.historyScroll = new IScroll(".history", {
                  preventDefault: false
              });
            },200);
        });
  
        searchInput.on('keypress',function(e) {  
          var keycode = e.keyCode;  
          if(keycode=='13') {  
            e.preventDefault(); 
            $state.go('search',{
              keywords : $scope.searchText
            }); 
          } 
        });
  
        if(vm.searchShow){
            searchOnOff.trigger("click", true);
            clearTimeout(timer);
            searchInput.focus();
        }
        $("#search").on("click","a",function(){
            var homeJumpInfo = {
                searchKey: $(this).text()
            };
            sessionStorage.setItem('homeJumpInfo',JSON.stringify(homeJumpInfo));
        }); 
  
        
  
     
        searchBtn.click(function(){
          hidePage();
          
        })
  
        function hidePage(){
          if($stateParams.Mark){
            $state.go('part',{
            })
          }else{
            $verifyService.SetIOSTitle($scope.listmack);
            modal.hide();
            searchInput[0].value = '';
          }
        }
      }

      

        //Cookie中获取搜索关键词
        function getSearchCookie(name){
            var start = document.cookie.indexOf(name + "=");
            if(start!=-1){ 
                start  = start + name.length+1;
                var end = document.cookie.indexOf(";",start);
                if (end==-1) end = document.cookie.length;
                arr = JSON.parse(unescape(document.cookie.substring(start,end)));
                
                return arr;
            }else{
                return [];
            }
        }

        //删除Cookie中搜索关键词
    function delSearchCookie(name){
        var time = new Date();
        time.setDate(time.getDate() - 1);
        var val = getSearchCookie(name);
        if(val.length>0){
          document.cookie = name+ "=" +escape(JSON.stringify(val))+';expires='+time.toGMTString();
          $scope.dataWord.historySearch = getSearchCookie('searchName');
        } 
        
      }

      function getProductList() {
        if (vm.backLoad) return;

        loadEnd = false;
        $productService.searchGoods({
            pageNo: vm.pageNo, //当前页数
            pageSize: 4, //每页商品数
            goodsCategories: $stateParams.oneLevelId + ';' + vm.goodsType
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
                    angular.forEach(goodsList, function(data) {

                        //图片地址拼接
                        data.imageUrl = data.typeFrom == '1' ? imgUrl + data.imageUrl : jdImgServer + data.imageUrl;

                        //优惠文字拼接
                        if (data.freePeriods) {
                            data.activityWords = '分期可免利息';
                        } else if (data.chargeFee) {
                            data.activityWords = '分期可免手续费';
                        } else {
                            data.activityWords = '';
                        }

                        if (data.couponMoney) {
                            if (data.activityWords) data.activityWords += ',';
                            data.activityWords += '送' + data.couponMoney + '现金券';
                        }

                    });
                    //判断是否第一页，非第一页数据合并
                    if (vm.pageNo === 0) {
                        $scope.data.goodsList = goodsList;
                    } else {
                        $scope.data.goodsList = $scope.data.goodsList.concat(goodsList);
                    }
                } else {
                    if (vm.pageNo === 0) {
                        $scope.data.goodsList = [];
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
      

    }



});