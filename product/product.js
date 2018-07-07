/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./product.css', 'common/script/lib/swiper.min.js'], function(angular) {

    /*-------------------- 商品列表 --------------------*/
    angular.module('app').controller('productListController', productListController);
    productListController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$productService', '$timeout', '$homeService', '$userService', '$cardService'];

    function productListController($scope, $state, $stateParams, $q, $verifyService, $productService, $timeout, $homeService, $userService, $cardService) {
        var vm = this;
        vm.productList = [];
        vm.products = [];
        vm.product = null;
        vm.typeId = "";
        vm.jdUrl = $productService.imgUrl[4];
        vm.typeList = [];
        vm.bannerImgUrl = imgUrl;
        vm.typeImgUrl = imgUrl;
        vm.bannerList = [];
        vm.categoryList = [];
        vm.findGoods = findGoods;
        vm.goodsType = "";
        vm.pageNo = 0;
        vm.pageSize = 10;
        vm.isHide = true;
        vm.Identification = '0';
        $scope.listfour = false;
        $scope.listThree = false;
        var mainScroll = "",
            pullDown = false,
            productBool = true;
        var jdImgServer = $productService.imgUrl[4]; //jd图片服务器地址
        $scope.data = {
            goodsList: [],
            loadIcon: true, //加载loading  true显示 false隐藏
        }
        if ($stateParams.fromPage == 'a') {
            vm.Identification = '2'
        } else if ($stateParams.fromPage == 'b') {
            vm.Identification = '1'
        } else if ($stateParams.fromPage == 'c') {
            vm.Identification = '3'
        }

        vm.monitor = monitor; //埋点

        // 埋点
        if($stateParams.listMark == '家居厨具'){
            vm.page = 'household'
        }else if($stateParams.listMark == '数码'){
            vm.page = 'digitalc'
        }
        monitor(vm.page,'browse','')
        function monitor(page,pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: page,
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }


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
            myIscroll();
            bannerList();
            getBrandsByTop();
            findSecondCategory();
        }

        function myIscroll() {
            mainScroll = new IScroll('.main-content', {
                preventDefault: false
            });
            mainScroll.on('scrollEnd', function() {
                pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                if (pullDown && productBool) {
                    pullDown = false;
                    vm.pageNo++;
                    getProductList();
                }
            });
        }

        $scope.go = function(pageValue) {
            monitor(vm.page,'secondtableproduct',pageValue)
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
        };

        function findGoods($event, secondLevelId,pageValue) {
            vm.pageNo = 0;
            productBool = true;
            vm.productList = [];
            $($event.target).addClass('active')
                .siblings().removeClass('active');
            vm.goodsType = secondLevelId;
            vm.Identification = $($event.target).index()
            getProductList();
            monitor(vm.page,'secondtable',pageValue)
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
                    if (vm.categoryList.length == 4) {
                        $scope.listfour = true;
                    } else if (vm.categoryList.length == 3) {
                        $scope.listThree = true;
                    }
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
                                ht += '<div class="swiper-slide"><img src=' + imgUrl + v.bannerUrl + '></div>';
                            } else {
                                ht += '<div class="swiper-slide"><img src=' + vm.bannerImgUrl + v.bannerUrl + '></div>';
                            }
                        });
                        $('#bannerSwiper').html(ht);
                        // banner 轮播
                        var bannerSlide = new Swiper('.bannerSlide', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination'
                        });
                    }
                }
            });
        }

        //今日大牌
        function getBrandsByTop() {
            $homeService.getBrandsByTop({
                oneLevelId: $stateParams.oneLevelId,
                top: 10,
                isJrdp: 1
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.typeList = data.result.brands;
                    angular.forEach(vm.typeList, function(data) {
                        if ($userService.$$channelId == '2989235520') {
                            data.href = 'javascript:void(0)';
                        } else {
                            data.href = '#/todayList?brandName=' + data.brandName + '&brandId=' + data.brandId + '&brandPoster=' + data.brandPoster;
                        }
                    })
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        function getProductList() {
            if (vm.backLoad) return;

            loadEnd = false;
            $productService.searchGoods({
                pageNo: vm.pageNo, //当前页数
                pageSize: 10, //每页商品数
                goodsCategories: $stateParams.oneLevelId + ';' + vm.goodsType
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    var goodsList = data.result.goodsList; //商品
                    var goodsTotalNum = data.result.total; //商品数量
                    //判断当前是否为最后一页
                    if (goodsTotalNum - vm.pageNo * 10 <= 10) {
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

    /*-------------------- 商品详情 --------------------*/
    angular.module('app').controller('productDetailsController', productDetailsController);
    productDetailsController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$productService', '$timeout', '$sce', '$userService', '$common', '$easyPayService', '$address', '$customerService', '$window', '$interval'];

    function productDetailsController($scope, $state, $stateParams, $q, $verifyService, $productService, $timeout, $sce, $userService, $common, $easyPayService, $address, $customerService, $window, $interval) {
        var vm = this;
        vm.goodsNum = $stateParams.goodsnum != null && $stateParams.goodsnum >0 ? parseInt($stateParams.goodsnum) : 1;
        vm.product = "";
        vm.goodsId = $stateParams.goodsId;

        vm.startTime = new Date();
        vm.productImgList = [];
        vm.jdUrl = $productService.imgUrl[0];
        vm.activityName = '';
        vm.productInfo = "";
        vm.tjProductList = [];
        vm.installment = installment;
        vm.basicPrice = 0;
        vm.attrDefaultText = '';
        vm.attrCheckedObj = [];
        vm.attrClick = attrClick;
        vm.attrModal = attrModal;
        vm.goodsNumMinus = goodsNumMinus;
        vm.goodsNumAdd = goodsNumAdd;
        // 重新存入channelId
        if($stateParams.channelId){
            sessionStorage.setItem('channelId',$stateParams.channelId)
        }
        if($stateParams.pagInPosition){
            var pagInPosition = $stateParams.pagInPosition;
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'productDetails',
                pageModule: pagInPosition,
                pageValue: vm.goodsId
            }).success(function(data) {

            })
        }

        vm.channelId = $userService.$$channelId;
        vm.provinceScroll = null;
        vm.showSelect = showSelect;
        vm.hideSelect = hideSelect;
        vm.selectTabClick = selectTabClick;
        vm.addressActive = { rightCity: $('.city-box'), rightCounty: $('.county-box'), rightStreet: $('.street-box') };
        vm.selectAddress = '请选择所在地区';
        vm.address1 = '请选择';
        vm.address2 = '';
        vm.address3 = '';
        vm.address4 = '';
        vm.provinceList = [];
        vm.cityList = [];
        vm.countyList = [];
        vm.townList = [];
        vm.trueProvince = {};
        vm.trueCity = {};
        vm.trueCounty = {};
        vm.trueTown = {};
        $scope.number = '';
        $scope.addToCartNum = 1;
        $scope.cartNum = 0; //购物车数量
        vm.monitor = monitor; //客服埋点
        $scope.businessType = $stateParams.businessType || sessionStorage.getItem('businessType');
        $scope.utmterm = $stateParams.utm_term || sessionStorage.getItem('utmterm');
        $scope.utm_source = $stateParams.utm_source || sessionStorage.getItem('utm_source');
        $scope.utm_medium = $stateParams.utm_medium || sessionStorage.getItem('utm_medium');
        vm.consigneeAddress = '';
        var myIscroll = scroll('.rightProvince');
        var myIscroll1 = scroll('.city-box');
        var myIscroll2 = scroll('.county-box');
        var myIscroll3 = scroll('.street-box');

        $scope.judge = $scope.businessType == null || $scope.businessType == 'null' ? true : false;
        $scope.tiem = '';
        $scope.colour = false;
        vm.id = '';
        vm.mobile = '';
        vm.isOK = false;
        vm.pro = false;
        $scope.isCart = false;
        $scope.jueok = true;
        $scope.isCart = false //是否加入购物车
        $scope.driver = true; //驾校商品
        $scope.is7ToReturn = true; //是否支持7天无理由退货标识
        $scope.grandeditiongtdi = $stateParams.grandeditiongtdi; //充值送壕礼活动
        sessionStorage.setItem('vendScanCodeParams', $stateParams.vendParam); //在贩卖机扫码进入商品详情页，带一个贩卖机参数。
        vm.group = false;//拼团


        var mainScroll = null;
        $scope.selectAddress = '';
        mainScroll = new IScroll(".main-content", { probeType: 3, preventDefault: false });
        mainScroll.on('scrollEnd', function() {
            var endY = (this.y - this.maxScrollY)
            if (endY < 100) {
                $timeout(function() {
                    mainScroll.refresh();
                }, 300)
            }
        });
        $scope.data = {
            area: '',
            provinceId: '',
            cityId: '',
            roll: false, //领卷弹层
            couponType: '',
            rollname: "点击领取",
            pageNo: 1,
            activityCouponList: {}, //优惠券数据
            copn: true,
            mj: ''
        }

        $scope.force=function(){
            if(vm.goodsNum == null || vm.goodsNum == '' || vm.goodsNum == 0){
                vm.goodsNum = 1
            }
        }

        action();

        function action() {
            if ($stateParams.shareCode) {
                sessionStorage.setItem('shareMakemoneyToken', $stateParams.shareCode) //存放在session里面，方便下单使用
            }
            $('.picker-wrapper').remove();
            if ($stateParams.businessType) {
                sessionStorage.setItem('businessType', $scope.businessType);
                sessionStorage.setItem('utmterm', $scope.utmterm);
                sessionStorage.setItem('utm_source', $scope.utm_source);
                sessionStorage.setItem('utm_medium', $scope.utm_medium);

            } else {
                sessionStorage.removeItem('businessType');
            }
            if ($stateParams.goodsId == 21434745848) {
                $scope.driver = false;
            }
            getDetails();
            coupon();
            //getPeriodPrice();
            // 详情tbas
            vm.tabs = tabss;

            function tabss(myevent,pageModule) {
                tabs(myevent, function() {
                    $timeout(function() {
                        mainScroll.refresh();
                    }, 300)
                })

                // 图文详情
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'productDetails',
                    pageModule: pageModule,
                    pageValue: ''
                }).success(function(data) {
    
                })
            }
            //调用获取购物车数量接口
            getCartnum();
            // add the plugin to the jQuery.fn object
            $.fn.fly = function(options) {
                return this.each(function() {
                    if (undefined == $(this).data('fly')) {
                        $(this).data('fly', new fly(this, options));
                    }
                });
            };

            // 0元购
            if($stateParams.goodsId == 302462437588||$stateParams.goodsId == 302462437569||$stateParams.goodsId == 302462437548||$stateParams.goodsId == 302462437527){
               vm.show = false 
            }else{
                vm.show = true;
            }

            // 拼团
            if($stateParams.goodsId == 72307473007||$stateParams.goodsId == 3023597417261||$stateParams.goodsId == 73137128830||$stateParams.goodsId == 3023597416921||$stateParams.goodsId == 72307463347){
                vm.group = true;
            }else{
                vm.group = false;
            }

        }

        //调用获取购物车数量接口
        function getCartnum() {
            $productService.getShoppingCartGoodsNum({}, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.cartNum = data.result.goodsNum;
                }
            });
        }
        //促销点击事件
        $scope.promotion = function() {
                vm.pro = true;
                $('.modal-layer,.shade').addClass('active');
                // 促销埋点
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'productDetails',
                    pageModule: 'promotion',
                    pageValue: '促销'
                }).success(function(data) {
    
                })
            }
            //领卷点击事件
        $scope.roll = function() {
                $scope.data.roll = true;
                $('.modal-layer,.shade').addClass('active');
                mainScroll = new IScroll(".roll", { probeType: 1, preventDefault: false });
            }
            //促销领卷弹层关闭事件
        $scope.hide = function() {
            vm.pro = false;
            $scope.data.roll = false;
            $('.modal-layer,.shade').removeClass('active');
        }

        //跳转去购物车页面
        $scope.goMyCart = function(pageModule) {
            $state.go('myCart');
            monitor(pageModule);
        }

        //减少商品数量-购物车
        $scope.cutNum = function() {
                if ($scope.addToCartNum != 1) {
                    $scope.addToCartNum--;
                }
            }
            //增加商品数量-购物车
        $scope.addNum = function() {
            if ($scope.addToCartNum < 50) {
                $scope.addToCartNum++;
            }
        }

        //领取卡卷点击事件
        $scope.handover = function(num, activityNum, receiveCoupon, index) {

            if (localStorage.getItem('sinks-token')) {
                if (receiveCoupon == 0) {
                    $productService.getCouponToUser({
                        couponNum: num,
                        activityNum: activityNum
                    }, localStorage.getItem("sinks-token")).then(function(data) {
                        if (data.data.resultCode == '0000') {
                            toolTip('卡券领取成功');
                            $scope.data.activityCouponList[index].receiveCoupon = 1;
                        } else if (data.data.resultCode == '1000') {
                            sessionStorage.setItem('hshurl', location.href);
                            $state.go('login', {

                            })
                        }else if (data.data.resultCode == '0033') {
                            toolTip('此券是新用户专享哦');
                        }
                    })
                }
            } else {
                sessionStorage.setItem('hshurl', location.href);
                $state.go('login', {

                })
            }
        }


        //搜索用户行为
        function doUserTrace() {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'productDetails',
                pageModule: 'browse',
                pageValue: $stateParams.goodsId
            }).success(function(data) {

            })
        }

         /*导航*/
        $('.side_btn1').click(function(){
            $('.shade').show();
            $('.sidebar').animate({right:"0px"},200,function(){
                $('.side_btn1').hide();
                $('.side_btn2').show();
                $('.side_btn2').addClass('active');   
            });
        });
        $('.side_btn2').click(function(){
            $('.shade').hide();
            $('.sidebar').animate({right:"-5.2rem"},200,function(){
                $('.side_btn2').removeClass('active')
                $('.side_btn2').hide();
                $('.side_btn1').show(); 
            });
        });
        $('.shade').click(function(){
            $('.shade').hide();
            $('.sidebar').animate({right:"-5.2rem"},200,function(){
                $('.side_btn2').removeClass('active')
                $('.side_btn2').hide();
                $('.side_btn1').show(); 
            });
        })

        $scope.nav=function(name){
            if(name == 'home'){
                $state.go('home', {})
            }else if(name == 'search'){
                $state.go('search', {})
            }else if(name == 'my'){
                $state.go('myCenter', {})
            }
        }


        //获取优惠券
        function coupon() {
            $productService.findActivityCouponByGoodPoolId({
                goodsId: $stateParams.goodsId
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    if (isEmptyObject(data.result) || data.result.activityCouponList.length == 0) {
                        $scope.data.copn = false;
                    } else {
                        angular.forEach(data.result.activityCouponList, function(data) {
                            data.couponContent = parseInt(data.couponContent);
                            data.couponName = data.couponName.replace("(贷款)", "")
                        })
                        $scope.data.activityCouponList = data.result.activityCouponList;
                        console.log($scope.data.activityCouponList)
                        if ($scope.data.activityCouponList.length == 1) {
                            $scope.data.mj = '满' + $scope.data.activityCouponList[0].couponUseCondition + '减' + $scope.data.activityCouponList[0].couponContent;
                        } else if ($scope.data.activityCouponList.length == 2) {
                            $scope.data.mj = '满' + $scope.data.activityCouponList[0].couponUseCondition + '减' + $scope.data.activityCouponList[0].couponContent + ' 满' + $scope.data.activityCouponList[1].couponUseCondition + '减' + $scope.data.activityCouponList[1].couponContent;
                        } else {
                            $scope.data.mj = '满' + $scope.data.activityCouponList[0].couponUseCondition + '减' + $scope.data.activityCouponList[0].couponContent + ' 满' + $scope.data.activityCouponList[1].couponUseCondition + '减' + $scope.data.activityCouponList[1].couponContent + ' 满' + $scope.data.activityCouponList[2].couponUseCondition + '减' + $scope.data.activityCouponList[2].couponContent;
                        }
                    }
                } else {
                    $scope.data.copn = false;
                }
            })
        }



        //收藏
        $scope.setcollection = function() {
                //    console.log($userService.getAuthorication)
                $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
                    if (data.resultCode == "0000") {
                        if ($scope.isCollect == 'other') {
                            $productService.saveGoodsCollect({
                                goodsId: vm.product.goodsId
                            }).success(function(data) {
                                if (data.resultCode == '0000') {
                                    $scope.colour = true;
                                    $scope.isCollect = 'collect'
                                    toolTip('收藏成功')
                                }
                            })
                        } else if ($scope.isCollect = 'collect') {
                            $productService.cancelGoodsCollect({
                                goodsId: vm.product.goodsId
                            }).success(function(data) {
                                if (data.resultCode == '0000') {
                                    $scope.colour = false;
                                    $scope.isCollect = 'other'
                                    toolTip('取消收藏')
                                }
                            })
                        }
                    } else {
                        var attributes = getAttributes();
                        var place = {
                            sku: vm.sku,
                            goodsId: vm.goodsId,
                            addressId: $stateParams.addressId,
                            goodsnum: vm.goodsNum,
                            channelId: $userService.$$channelId,
                            salePrice: vm.product.salePrice,
                            attributes: JSON.stringify(attributes),
                            basicSoluPrice: vm.basicSoluPrice
                        }
                        sessionStorage.setItem('place', JSON.stringify(place))
                        $common.goUser({
                            state: 'productDetails',
                            param1: vm.product.goodsId,
                            businessType: 'faceTake',
                            utm_term: $stateParams.utm_term,
                            utm_medium: $scope.utm_medium,
                            utm_source: $scope.utm_source
                        }, '/productDetails');
                    }
                })
            }
            //获取当前时间
        function getNowFormatDate() {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            $scope.tiem = date.getFullYear() + seperator1 + month + seperator1 + strDate +
                " " + date.getHours() + seperator2 + date.getMinutes() +
                seperator2 + date.getSeconds();
        }

        function getGoodsIsCollect() {

            $productService.getGoodsIsCollect({

                goodsId: vm.product.goodsId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.isCollect = data.result.isCollect;
                    if ($scope.isCollect == 'collect') {
                        $scope.colour = true;
                    } else if ($scope.isCollect == 'other') {
                        $scope.colour = false;
                    }
                }
            })
        }

        function getDetails() {
            vm.province = sessionStorage.getItem('city-orientation');
            doUserTrace(); //用户行为
            if (!$stateParams.addressId) {
                $stateParams.addressId = "";
            }
            //var wait = new waiting();
            $productService.getDetails(vm.goodsId, $stateParams.addressId, vm.channelId, $scope.businessType).success(function(data) {
                console.log(data);
                console.log("时间:" + parseInt(new Date() - vm.startTime));
                //      console.log(data.result.spikeEndTime)
                //wait.hide();
                vm.spikeStatus = data.result.spikeStatus;
                //    vm.storageRate=data.result.storageRate;

                //转换成标准时间
                var nowdate = new Date().getTime()

                if (data.result.spikeStatus == 1) {
                    //秒杀商品不能领券
                    $scope.data.copn = false;

                    var spikeBeginTime = new Date(data.result.spikeBeginTime.replace(/-/g, '/')).getTime();
                    var spikeEndTime = new Date(data.result.spikeEndTime.replace(/-/g, '/')).getTime();
                    var num = (spikeEndTime - nowdate) / 1000;
                    var h = parseInt(num / 3600);
                    var m = parseInt((num % 3600) / 60);
                    var s = parseInt((num % 3600) % 60);
                    if (h < 10 && h > -1) {
                        h = '0' + h
                    }
                    if (m < 10 && m > -1) {
                        m = '0' + m
                    }
                    $interval(function run() {
                        --s;
                        if (s < 10 && s > -1) {
                            s = "0" + s
                        }
                        if (s < 0) {
                            --m;
                            s = 59;
                            if (m < 10 && m > -1) {
                                m = '0' + m
                            }
                        }
                        if (m < 0) {
                            --h;
                            m = 59;
                            if (h < 10 && h > -1) {
                                h = '0' + h
                                console.log(111)
                            }
                        }
                        if (h < 0) {
                            h = 00;
                            s = 00;
                            m = 00;
                        }
                        $scope.datah = h;
                        $scope.datam = m;
                        $scope.datas = s;

                    }, 1000);
                } else if (data.result.spikeStatus == 2) {
                    var spikeBeginTime = new Date(data.result.spikeBeginTime.replace(/-/g, '/')).getTime();
                    var spikeEndTime = new Date(data.result.spikeEndTime.replace(/-/g, '/')).getTime();
                    var num = (spikeBeginTime - nowdate) / 1000;
                    //        var h=parseInt(num/3600);
                    //        var m=parseInt((num%3600)/60);
                    //        var s=parseInt((num%3600)%60);
                    var d = parseInt(num / 86400);
                    var h = parseInt((num % 86400) / 3600);
                    var m = parseInt(((num % 86400) % 3600) / 60);
                    var s = parseInt(((num % 86400) % 3600) % 60);

                    //      if(d<10&&d>-1){
                    //          d = '0'+d
                    //        }

                    if (h < 10 && h > -1) {
                        h = '0' + h
                    }
                    if (m < 10 && m > -1) {
                        m = '0' + m
                    }
                    $interval(function run() {
                        --s;
                        if (s < 10 && s > -1) {
                            s = '0' + s
                        }
                        if (s < 0) {
                            --m;
                            s = 59;
                            if (m < 10 && m > -1) {
                                m = '0' + m
                            }
                        }
                        if (m < 0) {
                            --h;
                            m = 59;
                            if (h < 10 && h > -1) {
                                h = '0' + h
                            }
                        }
                        if (h < 0) {
                            --d;
                            h = 23;
                            //                          if(d<10&&d>-1){
                            //                      d = '0'+d
                            //                    }
                        }
                        if (d < 0) {
                            d = 0;
                            h = 00;
                            s = 00;
                            m = 00;
                        }
                        $scope.datad = d;
                        $scope.datah = h;
                        $scope.datam = m;
                        $scope.datas = s;

                    }, 1000);
                }
                var ht = "";
                if (data.resultCode == "0000") {
                    vm.product = data.result;
                    sessionStorage.setItem('goodsType',data.result.goodsType)
                    if(vm.product.details){
                        vm.product.details = data.result.details.replace(/src/g, 'src="common/images/lazy-loading.jpg" data-src');
                        vm.product.details = $sce.trustAsHtml(vm.product.details);
                        vm.productInfo = $sce.trustAsHtml(data.result.param);
                        $timeout(function() {
                            new lazyLoading('.details-content img', mainScroll);
                            mainScroll.refresh();
                        }, 200)
                    }
                    if ($window.localStorage.getItem("$$payload")) {
                        var get = $window.localStorage.getItem("$$payload")
                        $verifyService.getGrowing(JSON.parse(get).hlejCustId, JSON.parse(get).mobile);
                        getGoodsIsCollect();
                    }
                    sessionStorage.setItem('freePeriods', vm.product.freePeriods);
                    if (vm.product.freePeriods == undefined) {
                        vm.product.freePeriods = 0;
                    } else if (vm.product.freePeriods == 3) {
                        $scope.number = '3';
                    } else if (vm.product.freePeriods == 6) {
                        $scope.number = '3/6';
                    } else if (vm.product.freePeriods == 9) {
                        $scope.number = '3/6/9';
                    } else if (vm.product.freePeriods == 12) {
                        $scope.number = '3/6/9/12';
                    }
                    if (vm.product.couponMoney == undefined) {
                        vm.product.couponMoney = 0;
                    }
                    if ((vm.product.chargeFee == 0 && vm.product.freePeriods == 0 && vm.product.couponMoney == 0)) {
                        $scope.jueok = false;
                    }
                    getNowFormatDate();
                    //$verifyService.setGrowing('商品详情',vm.product.goodsId,vm.product.brandName,vm.product.salePrice,$scope.tiem)
                    vm.sku = data.result.sku;
                    //         console.log(vm.sku)
                    if (vm.product.spikeStatus == 1) {
                        $verifyService.SetIOSTitle(vm.product.goodsName + '￥' + vm.product.spikePirce);
                    } else {
                        $verifyService.SetIOSTitle(vm.product.goodsName + '￥' + vm.product.salePrice);
                    }
                    if (!isEmptyObject(vm.product)) {
                        vm.basicPrice = parseFloat(vm.product.salePrice);
                        vm.attrList = vm.product.arrtInfo;
                        vm.productImgList = data.result.goodsImages;
                        //vm.province = data.result.provinceName + data.result.cityName;
                        vm.basicSoluPrice = data.result.basicSoluPrice;
                        vm.typeFrom = data.result.typeFrom;

                        $scope.couponGoodsFlag = vm.product.couponGoodsFlag;

                        if (vm.product.typeFrom == "1") {
                            if (vm.product.is7ToReturn != undefined) {
                                if (vm.product.is7ToReturn == 1) {
                                    $scope.is7ToReturn = true;
                                } else {
                                    $scope.is7ToReturn = false;
                                }
                            } else {
                                $scope.is7ToReturn = true;
                            }
                        }
                        if (vm.attrList.length > 0) {
                            vm.isAttr = true;
                        } else {
                            vm.isAttr = false;
                        }
                        /*if(vm.product.activityList.length){
              angular.forEach(vm.product.activityList,function(data){
                vm.activityName += data.activityName+'，';
                vm.freePeriods = data.periods;
              })
            }*/

                        angular.forEach(vm.attrList, function(data, index) {
                            vm.attrCheckedObj[index] = {};
                            vm.attrCheckedObj[index]['attrTypeName'] = data.attrTypeName;
                            vm.attrCheckedObj[index]['attrInfo'] = data.attrInfo[0];
                            vm.attrDefaultText += data.attrInfo[0].attributeValue + ' ';
                            vm.product.salePrice += data.attrInfo[0].attributePrice;
                        })
                        if (vm.product.spikeStatus != 1) {
                            vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(2);
                        } else {
                            vm.product.periodPrice = (vm.product.spikePirce / 12).toFixed(2);
                        }

                        var a = parseInt(vm.product.periodPrice.charAt(vm.product.periodPrice.length - 1));
                        if (a > 0 && a < 5) {
                            vm.product.periodPrice = (parseFloat(vm.product.periodPrice) + 0.01).toFixed(2);
                        } else {
                            if (vm.product.spikeStatus != 1) {
                                vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(2);
                            } else {
                                vm.product.periodPrice = (vm.product.spikePirce / 12).toFixed(2);
                            }
                        }
                        if (vm.product.typeFrom == "1") {
                            vm.sxImg = imgUrl + vm.product.thumbImgUrl
                        } else {
                            vm.sxImg = $productService.imgUrl[4] + vm.product.thumbImgUrl
                        }
                        if (vm.productImgList) {
                            $.each(vm.productImgList, function(i, v) {
                                if (vm.product.typeFrom == "1") {
                                    ht += '<div class="swiper-slide"><img src=' + imgUrl + v + '></div>';
                                } else {
                                    ht += '<div class="swiper-slide"><img src=' + vm.jdUrl + v + '></div>';
                                }
                            });
                            $('#bannerSwiper').html(ht);
                            // banner 轮播
                            var bannerSlide = new Swiper('.bannerSlide', {
                                loop: true,
                                autoplay: 4000,
                                autoplayDisableOnInteraction: false,
                                pagination: '.swiper-pagination'
                            });

                            if (vm.product.typeFrom == "2") {
                                vm.product.state = 1;
                                getJdDetail();
                            }
                            recommendGoods();
                            getNextInfo();
                            //getPeriodPrice();
                            $timeout(function() {
                                vm.isOK = true;
                            }, 300)
                        } else {
                            vm.isOK = false;
                        }
                    }

                }
            })
        }

        function getJdDetail() {
            $productService.getGoodsDetailByJD({
                goodsId: vm.goodsId
            }).success(function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.attrDefaultText = data.result.selectSpuName;
                    vm.product.state = data.result.state;
                    vm.product.stockStateDesc = data.result.stockStateDesc;
                    vm.product.stockStateld = data.result.stockStateld;

                    var is7ToReturn = data.result.is7ToReturn;
                    if (is7ToReturn != undefined) {
                        if (is7ToReturn == 1) {
                            $scope.is7ToReturn = true;
                        } else {
                            $scope.is7ToReturn = false;
                        }
                    } else {
                        $scope.is7ToReturn = true;
                    }
                }
            })
        }

        //获取下方其他内容（图文详情，产品规格）
        function getNextInfo() {
            $productService.getNextInfo({
                sku: vm.sku
            }).success(function(data) {
                console.log(data);
                if (data.resultCode == "0000") {
                    vm.product.details = data.result.details.replace(/src/g, 'src="common/images/lazy-loading.jpg" data-src');
                    vm.product.details = $sce.trustAsHtml(vm.product.details);
                    vm.productInfo = $sce.trustAsHtml(data.result.param + data.result.wareQD);
                    $timeout(function() {
                        new lazyLoading('.details-content img', mainScroll);
                        mainScroll.refresh();
                    }, 200)
                }
            });
        }

        //spu商品属性获取
        function getSpu(str) {
            var wait = new waiting();
            $productService.getProductSpu({
                goodsId: vm.goodsId,
                dim: $scope.data.dim
            }).success(function(data) {
                console.log(data);
                wait.hide();
                if (data.resultCode == '0000') {
                    $scope.attrList = data.result.spu;
                    spuInit();
                    $scope.spuSelect = true;
                    attrShowModal(str);
                }
            })
        }

        function spuInit() {
            vm.hasSpuInit = true;
            //获取其他attr选中对象的ids的集合
            function getSiblingsArr(_siblings) {
                var siblingsArr = [];;
                _siblings.find(".current").each(function() {
                    var ids = $(this).attr("data-ids");
                    if (ids) {
                        var idsArr = ids.split(",");
                        siblingsArr.push(idsArr);
                    }
                });

                return siblingsArr;
            }

            function getCommon(arr1, arr2) {
                var newArr = [];
                for (var i = 0; i < arr1.length; i++) {
                    for (var j = 0; j < arr2.length; j++) {
                        if (arr1[i] == arr2[j]) {
                            newArr.push(arr1[i]);
                        }
                    }
                }

                return newArr;
            }

            function getCommons(arr) {
                if (arr.length == 0) {
                    return [];
                }
                var common = arr[0];
                for (var i = 1; i < arr.length; i++) {
                    common = getCommon(common, arr[i]);
                    if (common.length == 0) {
                        return [];
                    }
                }

                return common;
            }


            /** 当前条件(_attr)和其他条件集合匹配，确认是否可选  **/
            function compare_one(_attr, obj) {
                var _obj = obj ? obj : _attr.find("li");

                var siblingsArr = getSiblingsArr(_attr.siblings());
                if (siblingsArr.length > 0) {
                    /**-- 其他条件有ids集合时  --**/
                    var common = getCommons(siblingsArr);
                    _obj.each(function() {
                        var _this = $(this);
                        var idsArr = _this.attr("data-ids").split(",");
                        var commonArr = getCommon(idsArr, common);
                        if (commonArr.length > 0) {
                            _this.removeClass("unSelect");
                        } else {
                            _this.addClass("unSelect");
                        }
                    });
                } else {
                    /**-- 其他条件都未选中时，当前条件都可选  --**/
                    _attr.find("li").removeClass("unSelect");
                }
            }

            //所有条件都匹配一次
            function compare_group() {
                $(".attr-condition").each(function() {
                    compare_one($(this));
                });
            }

            function compare_groups(_attr) {
                var otherAttrs = _attr.siblings();
                otherAttrs.each(function() {
                    compare_one($(this));
                });
                otherAttrs.find(".current").each(function() {
                    if ($(this).hasClass("unSelect")) {
                        $(this).removeClass("current");
                        compare_groups(_attr);
                    }
                });
            }

            function getSelectInfo() {
                var arr = [];
                var name;
                $(".attr-condition .current").each(function() {
                    var ids = $(this).attr("data-ids");
                    var idsArr = ids.split(",");
                    arr.push(idsArr);

                    var text = $(this).text();
                    if (!name) {
                        name = text;
                    } else {
                        name += " " + text;
                    }

                });
                var selectInfo = {
                    id: getCommons(arr)[0],
                    name: name
                };

                return selectInfo;
            }

            function getGoodsSpecInfo() {
                if (!$stateParams.addressId) {
                    $stateParams.addressId = "";
                }
                // spu埋点
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'productDetails',
                    pageModule: 'spu',
                    pageValue: vm.goodsId
                }).success(function(data) {
    
                });

                var wait = new waiting();
                $productService.getGoodsSpecInfo({
                    goodsId: vm.goodsId,
                    consigneeId: $stateParams.addressId,
                    channelId: vm.channelId,
                    businessType: $scope.businessType
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        vm.product.thumbImgUrl = data.result.thumbImgUrl;
                        vm.product.stockStateld = data.result.stockStateld;
                        vm.product.state = data.result.state;
                        vm.product.salePrice = data.result.salePrice;
                        vm.sxImg = $productService.imgUrl[4] + vm.product.thumbImgUrl;
                        wait.hide();
                    }
                });
            }
            $scope.reloadBySpu = reloadBySpu;

            function reloadBySpu(pageModule){
                monitor(pageModule);
                getDetails()
            }

            setTimeout(function() {
                var data = $scope.attrList;
                var length = $(".attr-condition").length;

                function initRun() {
                    compare_group();
                    var selectInfo = getSelectInfo();
                    $scope.data.selected = selectInfo.name;
                    $scope.$apply();
                }
                initRun();

                $(".attr-condition").on("click", "li", function() {
                    var _this = $(this);
                    var _attr = _this.closest(".attr-condition");
                    if (_this.hasClass("current")) {
                        _this.removeClass("current");

                        //其他不可选的循环测试,部分改为可选(其他选中状态不会变)
                        _attr.siblings().each(function() {
                            var _unSelect = $(this).find("unSelect");
                            if (_unSelect.length > 0) {
                                compare_one(attr, _unSelect);
                            }
                        });
                        $scope.spuSelect = false;
                    } else {
                        _this.addClass("current").siblings(".current").removeClass("current");
                        if (_this.hasClass("unSelect")) {
                            _this.removeClass("unSelect");

                            //与其他current匹配，判断是否可选
                            var idsArr = _this.attr("data-ids").split(",");
                            _attr.siblings().find(".current").each(function() {

                                var arr = $(this).attr("data-ids").split(",");
                                var common = getCommon(arr, idsArr);
                                if (common.length == 0) {
                                    $(this).removeClass("current").addClass("unSelect");
                                }
                            });
                        }
                        compare_groups(_attr);

                        if ($(".attr-condition .current").length == length) {
                            $scope.spuSelect = true;
                            var selectInfo = getSelectInfo();
                            var selectId = selectInfo.id;
                            vm.attrDefaultText = selectInfo.name;
                            if (selectId != vm.goodsId) {
                                vm.goodsId = selectId;
                                $scope.data.selected = selectInfo.name;
                                //getDetails();

                                getGoodsSpecInfo();

                            }
                        } else {
                            $scope.spuSelect = false;
                            $scope.$apply();
                        }
                    }
                });
            }, 50);
        }

        function recommendGoods() {
            //var wait = new waiting();
            $productService.recommendGoods({
                goodsId: $stateParams.goodsId,
                channelId: $userService.$$channelId
            }).success(function(data) {
                //wait.hide();
                if (data.resultCode == "0000") {
                    if (!isEmptyObject(data.result) && data.result.length > 0) {
                        vm.tjProductList = data.result;
                        for (var i = 0; i < vm.tjProductList.length; i++) {
                            if (vm.tjProductList[i].typeFrom == "1") {
                                vm.tjProductList[i].thumbImgUrl = imgUrl + vm.tjProductList[i].thumbImgUrl;
                            } else {
                                vm.tjProductList[i].thumbImgUrl = vm.jdUrl + vm.tjProductList[i].thumbImgUrl;
                            }
                        }
                        $timeout(function() {
                            var hotSwiper = new Swiper('.hot-swiper', {
                                slidesPerView: 'auto',
                                paginationClickable: true,
                                freeModeMomentum: false,
                                autoplay: 3000
                            });
                        }, 200)
                    }
                    $timeout(function() {
                        new lazyLoading('.details-content img', mainScroll);
                        mainScroll.refresh();
                    }, 200)
                }
            });
        }

        //选择省份
        $scope.provinceClick = function(id, name) {
            vm.provinceId = id;
            vm.trueProvince.id = id;
            vm.trueProvince.name = name;
            vm.address1 = name;
            vm.address2 = '请选择';
            vm.address3 = '';
            vm.address4 = '';
            vm.addressActive.rightCity.addClass('active');
            $('.select-tab span').removeClass('active').eq(0).addClass('active');
            $address.getCity({
                provinceId: id
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.cityList = data.result;
                    $timeout(function() {
                        myIscroll.refresh();
                        myIscroll1.refresh();
                    }, 200)
                } else {

                }
            })
        };
        //选择城市
        $scope.cityClick = function(id, name) {
            vm.cityId = id;
            vm.trueCity.id = id;
            vm.trueCity.name = name;
            vm.address2 = name;
            vm.address3 = '请选择';
            vm.address4 = '';
            vm.addressActive.rightCounty.addClass('active');
            $('.select-tab span').removeClass('active').eq(1).addClass('active');
            $address.getCounty({
                cityId: id
            }).success(function(data) {
                if (data.result.length > 0) {
                    vm.countyList = data.result;
                    $timeout(function() {
                        myIscroll2.refresh();
                    }, 200)
                } else {
                    vm.select3d = false;
                    $('.modal-layer,.shade').removeClass('active');
                    hidePage();
                    vm.countyId = 0;
                    vm.townId = 0;
                    vm.selectAddress = vm.trueProvince.name + name;
                    vm.address2 = name;
                }
            })
        };
        //选择县
        $scope.countyClick = function(id, name) {
                vm.countyId = id;
                vm.trueCounty.id = id;
                vm.trueCounty.name = name;
                vm.address3 = name;
                vm.address4 = '请选择';
                vm.addressActive.rightStreet.addClass('active');
                $('.select-tab span').removeClass('active').eq(2).addClass('active');
                $address.getTown({
                    countyId: id
                }).success(function(data) {
                    if (data.result.length > 0) {
                        vm.townList = data.result;
                        $timeout(function() {
                            myIscroll3.refresh();
                        }, 200)
                    } else {
                        vm.select3d = false;
                        $('.modal-layer,.shade').removeClass('active');
                        hidePage();
                        vm.townId = 0;
                        vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + name;
                        vm.province = vm.trueProvince.name + vm.trueCity.name + name;
                        vm.address4 = '';
                    }
                })
                if (vm.typeFrom == 2) {
                    newAjaxCheckJDStock(vm.provinceId, vm.cityId, vm.countyId)
                }

            }
            //选择镇
        $scope.townClick = function(id, name) {
                vm.townId = id;
                vm.trueTown.name = name;
                vm.address4 = name;
                console.log(vm.townId = id);
                vm.select3d = false;
                $('.modal-layer,.shade').removeClass('active');
                hidePage();
                vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + vm.trueCounty.name + name;
                vm.province = vm.trueProvince.name + vm.trueCity.name + vm.trueCounty.name + name;
                $('.select-tab span').removeClass('active').eq(3).addClass('active');
                if (vm.typeFrom == 2) {
                    newAjaxCheckJDStock(vm.provinceId, vm.cityId, vm.countyId, vm.townId)
                }
            }
            //验证是否有货
        function newAjaxCheckJDStock(provinceid, cityid, countyid, townid) {
            $customerService.newAjaxCheckJDStock({
                skuId: vm.sku,
                num: vm.goodsNum,
                province: provinceid,
                city: cityid,
                county: countyid,
                town: townid || 0
            }).success(function(data) {
                if (data.result.hasStock == true) {
                    vm.product.stockStateDesc = '有货';
                    vm.product.stockStateld = 35;
                    vm.product.state = 1;
                } else {
                    vm.product.stockStateDesc = '无货';
                    vm.product.stockStateld = 34;
                    vm.product.state = 1;
                }
            })
        }
        //关闭
        function hidePage() {
            setTimeout(function() {
                vm.addressActive.rightCity.removeClass('active');
                vm.addressActive.rightCounty.removeClass('active');
                vm.addressActive.rightStreet.removeClass('active');
            }, 300);
        }
        //地址选择系列
        function selectTabClick(str) {
            switch (str) {
                case "province":
                    if (vm.address1 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(0).addClass('active');
                    vm.addressActive.rightCity.removeClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "city":
                    if (vm.address2 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(1).addClass('active');
                    vm.addressActive.rightCity.addClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "county":
                    if (vm.address3 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(2).addClass('active');
                    vm.addressActive.rightCounty.addClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "town":
                    if (vm.address4 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(3).addClass('active');
                    vm.addressActive.rightStreet.addClass('active');
                    break;
            }
        }
        //地址选择系列
        function showSelect() {
            if (vm.provinceList.length == 0) {
                //填写新地址
                var wait = new waiting();
                $address.getProvince({}).success(function(data) {
                    wait.hide();
                    if (data.resultCode == "0000") {
                        vm.provinceList = data.result;

                        vm.select3d = true;
                        $('.modal-layer,.shade').addClass('active');
                        $timeout(function() {
                            myIscroll.refresh();
                        }, 200)
                    } else {
                        toolTip(data.resultMessage);
                    }
                });
                return;
            } else {
                vm.select3d = true;
                $('.modal-layer,.shade').addClass('active');
            }



            if (vm.cityId) {
                $('.select-tab span').removeClass('active').eq(1).addClass('active');
                vm.addressActive.rightCity.addClass('active');
            }
            if (vm.countyId) {
                $('.select-tab span').removeClass('active').eq(2).addClass('active');
                vm.addressActive.rightCounty.addClass('active');
            }
            if (vm.townId) {
                $('.select-tab span').removeClass('active').eq(3).addClass('active');
                vm.addressActive.rightStreet.addClass('active');
            }
        }

        function hideSelect() {
            vm.select3d = false;
            $('.modal-layer,.shade').removeClass('active');
        }

        //分期购
        function installment(price,pageModule) {
            //    console.log(vm.product.spikePirce)
            monitor(pageModule);
            var attributes = getAttributes();
            //清楚购物车的数据储存，防止出错
            sessionStorage.removeItem('cartList');
            sessionStorage.removeItem('couponList');
            var wait = new waiting();
            $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
                console.log("时间:" + parseInt(new Date() - vm.startTime));
                wait.hide();
                if (data.resultCode == "0000") {
                   if($stateParams.goodsId == 302462437588||$stateParams.goodsId == 302462437569||$stateParams.goodsId == 302462437548||$stateParams.goodsId == 302462437527){
                        if(data.result.lines.status != 1){
                            new dialog().confirm({
                                content: '活动仅限未激活额度用户专享，您的额度已激活，快去参加其他活动吧。',
                                confirmBtnText: "好的",
                                confirmBtn: function() {
                                    var wait = new waiting();
                                    location.href = httpsHeader+'/mallh5/#/';
                                    wait.hide();
                                }
                            })
                            $('.content').css('text-align', 'center')
                            $('.content').css('font-size', '0.4rem')
                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                            $('.dialog-wrap .dialog-content').css('width', '70%')
                            $('.dialog-wrap .dialog-content').css('left', '15%')
                            $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('display', 'none')
                        }else{
                            var addressId = $stateParams.addressId;
                            sessionStorage.setItem('$$couponMoney', JSON.stringify(vm.product.couponMoney));
                            price = parseInt(vm.goodsNum) * price;
                            $state.go('confirm', {
                                sku: vm.sku,
                                goodsId: vm.goodsId,
                                addressId: $stateParams.addressId,
                                goodsnum: vm.goodsNum,
                                channelId: $userService.$$channelId,
                                salePrice: vm.product.salePrice,
                                spikePirce: vm.product.spikePirce,
                                spikeStatus: vm.product.spikeStatus,
                                attributes: JSON.stringify(attributes),
                                basicSoluPrice: vm.basicSoluPrice
                            });
                        }
                   }else{
                        var addressId = $stateParams.addressId;
                        sessionStorage.setItem('$$couponMoney', JSON.stringify(vm.product.couponMoney));
                        price = parseInt(vm.goodsNum) * price;
                        $state.go('confirm', {
                            sku: vm.sku,
                            goodsId: vm.goodsId,
                            addressId: $stateParams.addressId,
                            goodsnum: vm.goodsNum,
                            channelId: $userService.$$channelId,
                            salePrice: vm.product.salePrice,
                            spikePirce: vm.product.spikePirce,
                            spikeStatus: vm.product.spikeStatus,
                            attributes: JSON.stringify(attributes),
                            basicSoluPrice: vm.basicSoluPrice
                        });
                   }
                } else {
                    var place = {
                        sku: vm.sku,
                        goodsId: vm.goodsId,
                        addressId: $stateParams.addressId,
                        goodsnum: vm.goodsNum,
                        channelId: $userService.$$channelId,
                        salePrice: vm.product.salePrice,
                        attributes: JSON.stringify(attributes),
                        basicSoluPrice: vm.basicSoluPrice
                    }
                    sessionStorage.setItem('place', JSON.stringify(place))
                    $common.goUser({
                        state: 'productDetails',
                        param1: vm.product.goodsId,
                        businessType: 'faceTake',
                    }, '/productDetails');
                }
            })
        }


        // 埋点
        function monitor(pageModule) {
            
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'productDetails',
                pageModule: pageModule,
                pageValue: ''
            }).success(function(data) {

            })
            
        }

        //tab选择分期数
        $scope.Obtain = function(periods, loanRate, feeRate, monthRepayPrincipalAmount, freeServerFee) {
            $scope.periodsValue = periods;
            $scope.monthRepayPrincipalAmount = monthRepayPrincipalAmount;
        }

        //加入购物车确认按钮
        $scope.addToCart = function() {
            console.log($scope.isCart);
            if ($scope.isCart) { //判断是否是要加入到购物车  
                //加入购物车
                doAddShoppingCartGoods();
            }
        }

        //加入购物车
        function doAddShoppingCartGoods() {

            var attributes = getAttributes();
            // if(vm.product.typeFrom=='2'){
            $scope.addToCartNum = parseInt(vm.goodsNum);
            // }

            var wait = new waiting();
            $productService.doAddShoppingCartGoods({
                typeFrom: vm.typeFrom,
                sign: "1", //数量加减的标志：1.数量添加   0.数量减少
                goodsId: vm.goodsId,
                goodsNum: $scope.addToCartNum,
                loanPeriods: 12,
                goodsAttrInfo: JSON.stringify(attributes)
            }).success(function(data) {
                console.log("时间:" + parseInt(new Date() - vm.startTime));
                wait.hide();
                if (data.resultCode == '0000') {
                    if ($scope.isCart) {
                        toolTip('添加购物车成功');
                    }
                    //调用获取购物车数量接口
                    getCartnum();
                    var cartList = JSON.parse(localStorage.getItem('cartList'));
                }
            })
        }




        //商品属性
        /*function attrModal(str){
      if(vm.product.typeFrom=='1'){
        var modal = new animeModal('#select-norms');
        $timeout(function(){ scroll('.center'); },300);
          if(str=='cart'){//是否是点击了加入购物车
              $scope.isCart=true;
          }else{
              $scope.isCart=false;
          }
      }else{
        animation()
      }
    }*/
        function attrShowModal(str) {
            var modal = new animeModal('#select-norms');
            $timeout(function() { scroll('.center'); }, 300);
            if (str == 'cart') { //是否是点击了加入购物车
                $scope.isCart = true;
            } else {
                $scope.isCart = false;
            }
        }

        function attrModal(str,pageModule) {
            if(vm.group == false){
                if (vm.typeFrom == '1') {
                    attrShowModal(str);
                } else {
                    if (vm.hasSpuInit) {
                        monitor(pageModule);
                        attrShowModal(str);
                    } else {
                        getSpu(str);
                    }
                }
            }else{
                toolTip('拼团商品不能加入购物车')
            }
        }

        //购物车动画
        $scope.animation = function animation(pageModule) {
            monitor(pageModule);
            var b = '<img class="u-flyer" src=' + vm.jdUrl + vm.productImgList[0] + ' >';
            var offset = $('#produthe').offset(),
                flyer = $(b);
            flyer.fly({
                start: {
                    left: event.pageX - 5,
                    top: event.pageY - 60
                },
                end: {
                    left: offset.left,
                    top: offset.top,
                    width: 20,
                    height: 20,

                }
            });
            doAddShoppingCartGoods();
        }

        function attrClick(myevent, type, obj) {
            if ($scope.isCart == true) {
                vm.attrDefaultText = '';
                vm.product.salePrice = vm.basicPrice;
                vm.attrIdArr = [];
                $(myevent.currentTarget).addClass('current').siblings().removeClass('current');
                angular.forEach(vm.attrCheckedObj, function(data) {
                        console.log(data);
                        console.log(vm.product.salePrice);
                        if (data.attrTypeName == type) {
                            data.attrInfo = obj;
                        }
                        vm.product.salePrice += parseFloat(data.attrInfo.attributePrice);
                        //vm.attrDefaultText += data.attrInfo.attributeValue +' ';    
                    })
                    //getPeriodPrice();
                vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(2);
                vm.product.salePrice = vm.product.salePrice.toFixed(2);
                //vm.product.periodPrice = toDecimal(vm.product.salePrice/12);
            } else {
                vm.attrDefaultText = '';
                vm.product.salePrice = vm.basicPrice;
                vm.attrIdArr = [];
                $(myevent.currentTarget).addClass('current').siblings().removeClass('current');
                angular.forEach(vm.attrCheckedObj, function(data) {
                        console.log(data);
                        console.log(vm.product.salePrice);
                        if (data.attrTypeName == type) {
                            data.attrInfo = obj;
                        }
                        vm.product.salePrice += parseFloat(data.attrInfo.attributePrice);
                        vm.attrDefaultText += data.attrInfo.attributeValue + ' ';
                    })
                    //getPeriodPrice();
                vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(2);
                vm.product.salePrice = vm.product.salePrice.toFixed(2);
                //vm.product.periodPrice = toDecimal(vm.product.salePrice/12);
            }

        }

        //获取选中的属性
        function getAttributes() {
            var attributes = [];
            angular.forEach(vm.attrCheckedObj, function(data) {
                var obj = {};
                obj.goodsAttribute = data.attrTypeName;
                obj.goodsAttValue = data.attrInfo.attributeValue;
                obj.goodsAttributeId = data.attrInfo.attributeId;
                attributes.push(obj)
            })
            return attributes;
        }

        //商品数量加减
        function goodsNumMinus() {
            if (vm.goodsNum > 1) {
                vm.goodsNum = parseInt(vm.goodsNum) - 1;
                //getPeriodPrice();
            }
        }

        function goodsNumAdd() {
            vm.goodsNum = parseInt(vm.goodsNum) + 1;
            //getPeriodPrice();   
        }

        /*//获取分期价格
        function getPeriodPrice(){
          $easyPayService.getPeriodPrice({
            channelId:$userService.$$channelId,
            goodsId:vm.goodsId,
            sailPrice:vm.product.salePrice*vm.goodsNum
          }).success(function(data){
            if (data.resultCode == '0000') {
              if (!isEmptyObject(data.result)) {
                vm.product.periodPrice = data.result.monthPay;
              }
            }
          })
        }*/



    }
    /*-------------------- 今日大牌 --------------------*/
    angular.module('app').controller('todayListController', todayListController);
    todayListController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$timeout', '$sce', '$productService', '$userService'];

    function todayListController($scope, $state, $stateParams, $q, $verifyService, $timeout, $sce, $productService, $userService) {
        $scope.bubbling = false;
        $scope.Rotate = false;
        $scope.desc = '';
        var vm = this;
        vm.productList = [];
        vm.pageNo = 1;
        vm.pageSize = 10;
        vm.isHide = false;
        //$scope.select = false;
        $scope.z = false;
        $scope.periods = '';
        $scope.counter = '';
        $scope.now = '';
        $scope.query = [
            { name: '3期', code: 3 },
            { name: '6期', code: 6 },
            { name: '9期', code: 9 },
            { name: '12期', code: 12 },
        ];
        $scope.querym = [
            { name: '免手续费' },
        ];
        $scope.queryf = [
            { name: '返现金券' },
        ]
        vm.img = imgUrl + $stateParams.brandPoster
        var productBool = true,
            pullDown = false,
            mainScroll = "";
        active();

        function active() {
            mainScroll = new IScroll('.main-content', {
                preventDefault: false
            });
            mainScroll.on('scrollEnd', function() {
                pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                if (pullDown && productBool) {
                    pullDown = false;
                    vm.pageNo++;
                    getProductList();
                }
            });

            var jumpInfo = JSON.parse(sessionStorage.getItem('jumpInfo'));
            if (jumpInfo) {
                var scrollTop = jumpInfo.scrollTop;
                var index = jumpInfo.tabNumber;
                $scope.counter = jumpInfo.chargeFee;
                $scope.now = jumpInfo.backCoupon;
                $scope.periods = jumpInfo.period;
                vm.pageSize = jumpInfo.pageSize;
                vm.pageNo = jumpInfo.ageNo;
                vm.productList = jumpInfo.productList;

                vm.backLoad = true;
                $(".main-content").css("visibility", "hidden");
                $timeout(function() {
                    $(".tabs-btn").eq(index).trigger("click");
                    mainScroll.scrollTo(0, scrollTop, 0);
                    mainScroll.refresh();
                    $(".main-content").css("visibility", "");
                    vm.backLoad = false;
                }, 50);
                sessionStorage.removeItem('jumpInfo');
            } else {
                getProductList();
            }
        }

        //重置
        $scope.reset = function() {
                $scope.periods = '';
                $scope.counter = '';
                $scope.now = '';
            }
            //免息分类里的期数
        $scope.querylist = function(code) {
                if ($scope.periods === code) {
                    $scope.periods = '';
                    return false;
                }
                $scope.periods = code;
            }
            //免息分类的免手续费
        $scope.querymlist = function() {
                $scope.counter = $scope.counter ? '' : 'Y';
            }
            //免息分类的返现
        $scope.queryflist = function() {
                $scope.now = $scope.now ? '' : 'Y';
            }
            //免息
        $scope.free = function() {
                if (vm.backLoad) return;
                $(".today-select").slideToggle();
                $("#one").fadeToggle();
            }
            //免息确定
        $scope.freeclose = function() {
                $(".today-select").slideUp();
                vm.pageNo = 1;
                getProductList();
                $("#one").fadeOut();
            }
            /*//筛选
            $scope.screen = function(){
              $scope.select = true;
            }
            //筛选确定
            $scope.close = function(){
              $scope.select = false;
            }*/
        $scope.go = function() {
            var jumpInfo = {
                ageNo: vm.pageNo,
                pageSize: vm.pageSize,
                period: $scope.periods,
                backCoupon: $scope.now,
                chargeFee: $scope.counter,
                scrollTop: mainScroll.y,
                productList: vm.productList,
                tabNumber: vm.tabNumber
            };
            sessionStorage.setItem('jumpInfo', JSON.stringify(jumpInfo));
        };

        function getProductList() {
            $productService.findGoodsByBrand({
                channelId: $userService.$$channelId,
                pageNo: vm.pageNo,
                pageSize: vm.pageSize,
                brandId: $stateParams.brandId,
                brandName: $stateParams.brandName,
                period: $scope.periods,
                backCoupon: $scope.now,
                chargeFee: $scope.counter,
            }).success(function(data) {
                productBool = true;
                if (data.resultCode = "0000") {
                    if (!isEmptyObject(data.result) && data.result.list.length > 0) {
                        if (vm.pageNo === 1) {
                            vm.productList = data.result.list;
                            angular.forEach(vm.productList, function(data1) {
                                if (data1.couponMoney == undefined) {
                                    data1.couponMoney = 0;
                                }
                                if (data1.freePeriods == undefined) {
                                    data1.freePeriods = 0;
                                }
                            })
                            if (data.result.totalCount <= 10) {
                                productBool = false;
                                vm.isHide = false;
                            }
                            for (var i = 0; i < vm.productList.length; i++) {
                                if (vm.productList[i].typeFrom == "1") {
                                    vm.productList[i].thumbImgUrl = imgUrl + vm.productList[i].thumbImgUrl;
                                } else {
                                    vm.productList[i].thumbImgUrl = $productService.imgUrl[4] + vm.productList[i].thumbImgUrl;
                                }
                            }
                        } else {
                            for (var i = 0; i < data.result.list.length; i++) {
                                if (data.result.list[i].typeFrom == "1") {
                                    data.result.list[i].thumbImgUrl = imgUrl + data.result.list[i].thumbImgUrl;
                                } else {
                                    data.result.list[i].thumbImgUrl = $productService.imgUrl[3] + data.result.list[i].thumbImgUrl;
                                }
                                vm.productList.push(data.result.list[i]);
                            }
                        }
                        // vm.isHide = true;
                    } else {
                        if (vm.pageNo == 1) {
                            vm.isHide = false;
                            productBool = false;
                            vm.productList = data.result.list;
                            toolTip("暂无商品,去看看其他的品牌吧")
                        } else {
                            productBool = false;
                            vm.isHide = false;
                            //toolTip("商品已全部加载")
                        }
                    }
                }
                $timeout(function() {
                    mainScroll.refresh();
                }, 200)

            });
        }
        //tabs切换
        $verifyService.SetIOSTitle("今日大牌");
        vm.handover = function(myevent) {
            vm.tabNumber = $(myevent.currentTarget).index();
            $(myevent.currentTarget).addClass('active')
                .siblings().removeClass('active');

            if ($(myevent.currentTarget).attr("class") != "tabs-btn two active" && !vm.backLoad) {
                $(".today-select").slideUp();
                $("#one").fadeOut();
            }
        }

        /*$scope.saleNum = function(){
          $scope.vm.productList.sort(function(a, b){
            if($scope.desc){
              if (a.saleNum < b.saleNum) {
                return -1;
              }
              if (a.saleNum === b.saleNum) {
                return 0;
              }
              return 1;
            }
            if (a.saleNum > b.saleNum) {
              return -1;
            }
            if (a.saleNum === b.saleNum) {
              return 0;
            }
            return 1;
          });
        }*/
        //价格排序
        /*$scope.price = function () {
          $scope.Rotate = !$scope.Rotate;
          $scope.vm.productList.sort(function(a, b){
              if($scope.Rotate){
                if (a.salePrice < b.salePrice) {
                  return -1;
                }
                if (a.salePrice === b.salePrice) {
                  return 0;
                }
                return 1;
              }
              if (a.salePrice > b.salePrice) {
                return -1;
              }
              if (a.salePrice === b.salePrice) {
                return 0;
              }
              return 1;
          });
        };*/


        //商品分类
        $scope.classify = function() {
            $scope.bubbling = !$scope.bubbling;
        };
    }

    /*-------------------- 限时特惠 --------------------*/
    angular.module('app').controller('springSaleController', springSaleController);
    springSaleController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$timeout', '$productService', '$userService'];

    function springSaleController($scope, $state, $stateParams, $q, $verifyService, $timeout, $productService, $userService) {
        $verifyService.SetIOSTitle("限时特惠");
        var vm = this;
        vm.imgServer = imgUrl;
        vm.imgUrl = $productService.imgUrl[1];
        vm.tabsBar = $('.tabs-bar');
        vm.tabsWrap = $('.tabs-wrap');
        vm.floorWrap = $('.floor-wrap');
        vm.bannerHeight = $('.bannerSlide').height();
        vm.tabsBarHeight = $(vm.tabsWrap[1]).height();
        vm.floorOffsetArr = null;
        vm.mobileTypeList = [];
        vm.pcTypeList = [];
        vm.homeAppliancesTypeList = [];
        vm.tourismTypeList = [];
        var bannerSlide = null;
        var mainScroll = new IScroll(".main-content", {
            probeType: 3,
            preventDefault: false
        });


        //轮播

        active();

        function active() {
            tabControl();
        }

        function tabControl() {
            $productService.findFourCategory({ channelId: $userService.$$channelId }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.mobileTypeList = data.result.mobileCategory;
                    vm.pcTypeList = data.result.pcCategory;
                    vm.homeAppliancesTypeList = data.result.homeAppliancesCategory;
                    vm.tourismTypeList = data.result.tourismCategory;
                    getTravelGoods();
                    $timeout(function() {
                        mainScroll.refresh();
                        vm.floorOffsetArr = getOffset(vm.floorWrap);
                        vm.handover = function(myevent) {
                            var index = $(myevent.currentTarget).index();
                            mainScroll.scrollTo(0, -vm.floorOffsetArr[index] + vm.tabsBarHeight, 200);
                        }
                        bannerSlide = new Swiper('.bannerSlide', {
                            loop: true,
                            autoplay: 4000,
                            autoplayDisableOnInteraction: false,
                            pagination: '.swiper-pagination'
                        });
                        mainScroll.on('scroll', function() {
                            this.y <= -vm.bannerHeight ? vm.tabsBar.removeClass('hidden') : vm.tabsBar.addClass('hidden');
                            for (var i = 0; i <= vm.floorOffsetArr.length; i++) {
                                if (this.y < -(vm.floorOffsetArr[i] - vm.tabsBarHeight - 2)) {
                                    vm.tabsWrap.each(function() {
                                        $(this).find('.tabs-btn').removeClass('active').eq(i).addClass('active');
                                    });
                                }
                            }
                        })
                    }, 200)
                } else {
                    console.log(data);
                }
            });
        }

        //获取旅游产品
        function getTravelGoods() {
            $productService.getTravelGoods({
                pageNo: 1,
                pageSize: 10,
                channelId: $userService.$$channelId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result) && !isEmptyObject(data.result.goodsInfo)) {
                        vm.travelGoodsList = data.result.goodsInfo.list;
                        $timeout(function() {
                            mainScroll.refresh();
                        }, 200)
                    }
                }

            })
        }

        function getOffset(el) {
            var arr = [];
            el.each(function() {
                arr.push($(this).offset().top)
            })
            return arr;
        }

    }


});