/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./product.css', 'common/script/lib/swiper.min.js'], function(angular) {

    /*-------------------- 商品列表 --------------------*/
    angular.module('app').controller('productListController', productListController);
    productListController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$productService', '$timeout', '$homeService', '$userService'];

    function productListController($scope, $state, $stateParams, $q, $verifyService, $productService, $timeout, $homeService, $userService) {
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
        vm.pageNo = 1;
        vm.pageSize = 10;
        vm.isHide = false;
        vm.Identification = '0';
        $scope.listmack = $stateParams.listMark;
        var mainScroll = "",
            pullDown = false,
            productBool = true;;
        if ($stateParams.fromPage == 'a') {
            vm.Identification = '2'
        } else if ($stateParams.fromPage == 'b') {
            vm.Identification = '1'
        } else if ($stateParams.fromPage == 'c') {
            vm.Identification = '3'
        }
        action();

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

        function findGoods($event, secondLevelId) {
            vm.pageNo = 1;
            productBool = true;
            vm.productList = [];
            $($event.target).addClass('active')
                .siblings().removeClass('active');
            vm.goodsType = secondLevelId;
            getProductList();
        }

        function findSecondCategory() {
            $productService.findSecondCategory({
                oneLevelId: $stateParams.oneLevelId
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.categoryList = data.result;
                    if (!isEmptyObject(vm.categoryList)) {
                        vm.goodsType = vm.categoryList[0].secondLevelId;
                        for (var i = 0; i < vm.categoryList.length; i++) {
                            if (vm.categoryList[i].secondLevelId == 1277) {
                                vm.categoryList.splice([i], 1);
                            }
                        }
                        getProductList();
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
            var bannerPageId = "";
            if ($stateParams.oneLevelId == "737" || $stateParams.oneLevelId == '1000001') {
                bannerPageId = 1000000001;
            } else if ($stateParams.oneLevelId == "652") {
                bannerPageId = 1000000002;
            } else if ($stateParams.oneLevelId == "670") {
                bannerPageId = 1000000003;
            } else if ($stateParams.oneLevelId == "1318") {
                bannerPageId = 72390323872;
            } else if ($stateParams.oneLevelId == "9987") {
                bannerPageId = 1000000033;
            }
            $homeService.getHomeList({
                channelId: $userService.$$channelId,
                bannerPageId: bannerPageId
            }).success(function(data) {
                var ht = "";
                if (data.resultCode == "0000") {
                    if (data.result) {
                        vm.bannerList = data.result.bannerOption;
                        if (vm.bannerList.length > 0) {
                            $.each(vm.bannerList, function(i, v) {
                                if (v.typeFrom == "1") {
                                    ht += '<div class="swiper-slide"><img src=' + imgUrl + v.url + '></div>';
                                } else {
                                    ht += '<div class="swiper-slide"><img src=' + vm.bannerImgUrl + v.url + '></div>';
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
            $productService.getProductList({
                channelId: $userService.$$channelId,
                secondLevelId: vm.goodsType,
                pageNo: vm.pageNo,
                pageSize: vm.pageSize
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.product = data.result;
                    angular.forEach(vm.product.list, function(data1) {
                        if (data1.couponMoney == undefined) {
                            data1.couponMoney = 0;
                        }
                        if (data1.freePeriods == undefined) {
                            data1.freePeriods = 0;
                        }
                        //优惠文字拼接
                        if (data1.freePeriods) {
                            data1.activityWords = '分期可免利息';
                        } else if (data1.chargeFee) {
                            data1.activityWords = '分期可免手续费';
                        } else {
                            data1.activityWords = '';
                        }

                        if (data1.couponMoney) {
                            if (data1.activityWords) data1.activityWords += ',';
                            data1.activityWords += '送' + data1.couponMoney + '现金券';
                        }
                    })
                    if (!isEmptyObject(data.result.list) && data.result.list.length > 0) {
                        if (vm.pageNo === 1) {
                            vm.productList = data.result.list;
                            if (data.result.totalCount <= 10) {
                                productBool = false;
                                vm.isHide = false;
                            } else {
                                vm.isHide = true;
                            }
                            for (var i = 0; i < vm.productList.length; i++) {
                                if (vm.productList[i].typeFrom == "1") {
                                    vm.productList[i].thumbImgUrl = imgUrl + vm.productList[i].thumbImgUrl;
                                } else {
                                    vm.productList[i].thumbImgUrl = vm.jdUrl + vm.productList[i].thumbImgUrl;
                                }
                            }
                        } else {
                            for (var i = 0; i < data.result.list.length; i++) {
                                if (data.result.list[i].typeFrom == "1") {
                                    data.result.list[i].thumbImgUrl = imgUrl + data.result.list[i].thumbImgUrl;
                                } else {
                                    data.result.list[i].thumbImgUrl = vm.jdUrl + data.result.list[i].thumbImgUrl;
                                }
                                vm.productList.push(data.result.list[i]);
                            }
                        }
                        //vm.isHide = true;
                    } else {
                        if (vm.pageNo == 1) {
                            vm.isHide = false;
                            productBool = false;
                        } else {
                            productBool = false;
                            vm.isHide = false;
                            //toolTip("商品已全部加载")
                        }
                    }
                } else {
                    vm.isHide = false;
                    toolTip(data.resultMessage)
                }
                $timeout(function() {
                    mainScroll.refresh();
                }, 200);
            })
        }

    }

    /*-------------------- 商品详情 --------------------*/
    angular.module('app').controller('productDetailsController', productDetailsController);
    productDetailsController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$productService', '$timeout', '$sce', '$userService', '$common', '$easyPayService', '$address', '$customerService', '$window'];

    function productDetailsController($scope, $state, $stateParams, $q, $verifyService, $productService, $timeout, $sce, $userService, $common, $easyPayService, $address, $customerService, $window) {
        var vm = this;
        vm.goodsNum = $stateParams.goodsnum != null ? parseInt($stateParams.goodsnum) : 1;
        vm.product = "";
        vm.goodsId = $stateParams.goodsId;
        vm.productImgList = [];
        vm.jdUrl = $productService.imgUrl[0];
        vm.activityName = '';
        vm.productInfo = "";
        vm.tjProductList = [];
        vm.investment = investment;
        vm.installment = installment;
        vm.basicPrice = 0;
        vm.attrDefaultText = '';
        vm.attrCheckedObj = [];
        vm.attrClick = attrClick;
        vm.attrModal = attrModal;
        vm.goodsNumMinus = goodsNumMinus;
        vm.goodsNumAdd = goodsNumAdd;
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
        $scope.jueok = true;
        $scope.driver = true; //驾校商品
        var mainScroll = null;
        mainScroll = new IScroll(".main-content", { probeType: 3, preventDefault: false });
        mainScroll.on('scrollEnd', function() {
            var endY = (this.y - this.maxScrollY)
            if (endY < 100) {
                $timeout(function() {
                    mainScroll.refresh();
                }, 300)
            }
        });


        action();

        function action() {
            $('.picker-wrapper').remove();
            if ($stateParams.businessType) {
                sessionStorage.setItem('businessType', $scope.businessType);
                sessionStorage.setItem('utmterm', $scope.utmterm);
                sessionStorage.setItem('utm_source', $scope.utm_source);
                sessionStorage.setItem('utm_medium', $scope.utm_medium);
            } else {
                sessionStorage.removeItem('businessType');
            }
            if ($stateParams.goodsId == 7666363232) {
                $scope.driver = false;
            }
            getDetails();
            //getPeriodPrice();
            // 详情tbas
            vm.tabs = tabss;

            function tabss(myevent) {
                tabs(myevent, function() {
                    $timeout(function() {
                        mainScroll.refresh();
                    }, 300)
                })
            }
        }
        $scope.promotion = function() {
            vm.pro = true;
            $('.modal-layer,.shade').addClass('active');
        }
        $scope.hide = function() {
            vm.pro = false;
            $('.modal-layer,.shade').removeClass('active');
        }

        $scope.setcollection = function() {
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
            if (!$stateParams.addressId) {
                $stateParams.addressId = "";
            }
            var wait = new waiting();
            $productService.getDetails(vm.goodsId, $stateParams.addressId, vm.channelId, $scope.businessType).success(function(data) {
                var ht = "";
                wait.hide();
                if (data.resultCode == "0000") {
                    vm.product = data.result;
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
                    $verifyService.setGrowing('商品详情', vm.product.goodsId, vm.product.brandName, vm.product.salePrice, $scope.tiem)
                    vm.sku = data.result.sku;
                    if (typeof mapp != 'undefined' && typeof mapp.device != 'undefined') {
                        $verifyService.SetIOSTitle('商品详情');
                    } else {
                        $verifyService.SetIOSTitle(vm.product.goodsName + '￥' + vm.product.salePrice);
                    }
                    if (!isEmptyObject(vm.product)) {
                        vm.basicPrice = parseFloat(vm.product.salePrice);
                        vm.attrList = vm.product.arrtInfo;
                        vm.productInfo = $sce.trustAsHtml(vm.product.param);
                        vm.product.details = vm.product.details.replace(/src/g, 'src="common/images/lazy-loading.jpg" data-src')
                        vm.product.details = $sce.trustAsHtml(vm.product.details);
                        vm.productImgList = data.result.goodsImages;
                        vm.province = data.result.provinceName + data.result.cityName;
                        vm.basicSoluPrice = data.result.basicSoluPrice;
                        vm.typeFrom = data.result.typeFrom;
                        if (vm.attrList.length > 0) {
                            vm.isAttr = true;
                        } else {
                            vm.isAttr = false;
                        }
                        /*if (vm.product.activityList.length) {
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
                        vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(3);
                        var a = parseInt(vm.product.periodPrice.charAt(vm.product.periodPrice.length - 1));
                        if (a > 0 && a < 5) {
                            vm.product.periodPrice = (parseFloat(vm.product.periodPrice) + 0.01).toFixed(2);
                        } else {
                            vm.product.periodPrice = (vm.product.salePrice / 12).toFixed(2);
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
                            recommendGoods();
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

        function recommendGoods() {
            var wait = new waiting();
            $productService.recommendGoods({
                goodsId: $stateParams.goodsId,
                channelId: $userService.$$channelId
            }).success(function(data) {
                wait.hide();
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
                    }
                    $timeout(function() {
                        new lazyLoading('.details-content img', mainScroll);
                        mainScroll.refresh();
                    }, 200)
                }
            });
        }
        //填写新地址
        $address.getProvince({}).success(function(data) {
            if (data.resultCode == "0000") {
                vm.provinceList = data.result;
                $timeout(function() {
                    myIscroll.refresh();
                }, 200)

            } else {
                toolTip(data.resultMessage);
            }
        });
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
            //
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
        //
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
        //
        function showSelect() {
            vm.select3d = true;
            $('.modal-layer,.shade').addClass('active');
            //{
            //    $('.select-tab span').removeClass('active').eq(0).addClass('active');
            //    vm.addressActive.rightCity.removeClass('active');
            //    vm.addressActive.rightCounty.removeClass('active');
            //    vm.addressActive.rightStreet.removeClass('active');
            //}
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

        //0元购
        function investment(goodsId, price, basicSoluPrice) {
            basicSoluPrice += price - vm.basicPrice;
            var attributes = getAttributes();
            console.log(attributes)
            var wait = new waiting();
            $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
                if (data.resultCode == "0000") {
                    var addressId = $stateParams.addressId;
                    /* if (!addressId) {
                       $state.go('addAddress',{
                         goodsId:vm.product.goodsId,
                         fromPage:"productDetails"
                       },{
                         location:'replace'
                       })
                     }else{*/
                    price = parseInt(vm.goodsNum) * price;
                    location.href = httpsHeader + '/mall/investmentAction/bidList.action?payWay=10000000&channelId=' + $userService.$$channelId +
                        '&cityId=0&goodsId=' + goodsId + '&goodsNum=' + vm.goodsNum + '&goodsMoney=' + price + '&basicSoluMoney=' + basicSoluPrice + '&consigneeId=' + addressId + '&attributes=' + encodeURI(JSON.stringify(attributes))
                        // }
                } else {
                    $common.goUser({
                        state: 'productDetails',
                        param1: vm.product.goodsId
                    }, '/productDetails');
                }
                wait.hide();
            })
        }
        //分期购
        function installment(price) {
            var attributes = getAttributes();
            var wait = new waiting();
            $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
                if (data.resultCode == "0000") {
                    var addressId = $stateParams.addressId;
                    /*if (!addressId) {
                      $state.go('addAddress',{
                        goodsId:vm.product.goodsId,
                        fromPage:"productDetails",
                        goodsnum : vm.goodsNum,
                        attrDefaultText : vm.attrDefaultText
                      },{
                        location:'replace'
                     // })    
                    }else{*/
                    price = parseInt(vm.goodsNum) * price;
                    /*location.href=httpsHeader+"/mall/newHirePurchaseAction/confirmPayment.action?channelId=" + $userService.$$channelId + "&goodsNum=" + vm.goodsNum + "&goodsMoney=" + price + "&goodsId=" + vm.goodsId + "&attributes="+encodeURI(JSON.stringify(attributes))+"&consigneeId="+addressId*/
                    $state.go('confirm', {
                        sku: vm.sku,
                        goodsId: vm.goodsId,
                        addressId: $stateParams.addressId,
                        goodsnum: vm.goodsNum,
                        channelId: $userService.$$channelId,
                        salePrice: vm.product.salePrice,
                        attributes: JSON.stringify(attributes),
                        basicSoluPrice: vm.basicSoluPrice
                    });



                    //price = parseInt(vm.goodsNum) * price;
                    //location.href=httpsHeader+"/mall/hirePurchaseAction/confirmPayment.action?channelId=" + $userService.$$channelId + "&goodsNum=" + vm.goodsNum + "&goodsMoney=" + price + "&goodsId=" + vm.goodsId + "&attributes="+encodeURI(JSON.stringify(attributes))+"&consigneeId="+addressId


                    //var turnForm = document.createElement("form");
                    ////一定要加入到body中！！
                    //document.body.appendChild(turnForm);
                    //turnForm.method = 'post';
                    //turnForm.action = httpsHeader+'/mall/newHirePurchaseAction/confirmPayment.action?channelId=' + $userService.$$channelId + "&goodsNum=" + vm.goodsNum + "&goodsMoney=" + price + "&goodsId=" + vm.goodsId + "&attributes="+encodeURI(JSON.stringify(attributes))+"&consigneeId="+addressId;
                    //turnForm.innerHTML = "";
                    ////turnForm.target = '_blank';
                    //var newElement = document.createElement("input");
                    //var list = [
                    //  {id:"channelId",value:$userService.$$channelId},
                    //  {id:"goodsNum",value:vm.goodsNum},
                    //  {id:"goodsMoney",value:price},
                    //  {id:"goodsId",value:vm.goodsId},
                    //  {id:"attributes",value:encodeURI(JSON.stringify(attributes))},
                    //  {id:"consigneeId",value:addressId}
                    //];
                    //for(var i = 0;i<list.length;i++){
                    //  var newElement = document.createElement("input");
                    //  newElement.setAttribute("name",list[i].id);
                    //  newElement.setAttribute("type","hidden");
                    //  newElement.setAttribute("value",list[i].value);
                    //  turnForm.appendChild(newElement);
                    //}
                    //$timeout(function(){
                    //  turnForm.submit();
                    //},200)



                    //location.href=httpsHeader+"/mall/hirePurchaseAction/confirmPayment.action?channelId=" + $userService.$$channelId +
                    //    "&goodsNum=" + vm.goodsNum + "&goodsMoney=" + price + "&goodsId=" + vm.goodsId + "&attributes="+encodeURI(JSON.stringify(attributes))+"&consigneeId="+addressId
                    // }
                } else {
                    $common.goUser({
                        state: 'productDetails',
                        param1: vm.product.goodsId,
                        businessType: 'faceTake',
                        utm_term: $stateParams.utm_term,
                        utm_medium: $scope.utm_medium,
                        utm_source: $scope.utm_source
                    }, '/productDetails');
                }
                //wait.hide();
                //if(data.resultCode == "0000"){
                //  price = parseInt(vm.goodsNum) * price;
                //  location.href = httpsHeader + "/mall/hirePurchaseAction/confirmPayment.action?channelId=" + $userService.$$channelId + "&goodsNum=" + vm.goodsNum + "&goodsMoney=" + price + "&goodsId=" + vm.goodsId + "&attributes=" + encodeURI(JSON.stringify(attributes));
                //}else{
                //  $common.goUser({
                //    state: 'productDetails',
                //    param1:vm.product.goodsId
                //  },'/productDetails');
                //}
                wait.hide();
            })
        }

        //商品属性
        function attrModal() {
            var modal = new animeModal('#select-norms');
        }

        function attrClick(myevent, type, obj) {
            vm.attrDefaultText = '';
            vm.product.salePrice = vm.basicPrice;
            vm.attrIdArr = [];
            $(myevent.currentTarget).addClass('current').siblings().removeClass('current');
            angular.forEach(vm.attrCheckedObj, function(data) {
                    if (data.attrTypeName == type) {
                        data.attrInfo = obj;
                    }
                    vm.product.salePrice += parseFloat(data.attrInfo.attributePrice);
                    vm.attrDefaultText += data.attrInfo.attributeValue + ' ';
                })
                //getPeriodPrice();
            vm.product.salePrice = vm.product.salePrice.toFixed(2);
            vm.product.periodPrice = toDecimal(vm.product.salePrice / 12);
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
                vm.goodsNum = vm.goodsNum - 1;
                //getPeriodPrice();
            }
        }

        function goodsNumAdd() {
            vm.goodsNum = vm.goodsNum + 1;
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
                console.log(this.y - this.maxScrollY)
                pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                if (pullDown && productBool) {
                    pullDown = false;
                    vm.pageNo++;
                    getProductList();
                }
            });
            getProductList();
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
            $(myevent.currentTarget).addClass('active')
                .siblings().removeClass('active');
            if ($(myevent.currentTarget).attr("class") != "tabs-btn two active") {
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