define(['angular', 'css!./user.css'], function(angular) {
    angular.module('app')
        .controller('deliveryController', deliveryController)
        .controller('addController', addController);
    deliveryController.$inject = ['$scope', '$state', '$stateParams', '$address', '$verifyService', '$homeService', '$timeout', '$http', 'userInfo', '$common','$productService'];

    function deliveryController($scope, $state, $stateParams, $address, $verifyService, $homeService, $timeout, $http, userInfo, $common,$productService) {
        var vm = this;
        vm.provinceScroll = null;
        vm.showSelect = showSelect;
        vm.hideSelect = hideSelect;
        vm.checkbox = checkbox;
        vm.selectTabClick = selectTabClick;
        vm.addAddressOpen = addAddressOpen;
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
        vm.name = '';
        vm.phone = '';
        vm.eml = '';
        vm.consigneeAddress = '';
        vm.defaultAddress = 0;
        vm.trueProvince = {};
        vm.trueCity = {};
        vm.trueCounty = {};
        vm.trueTown = {};
        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'sureorder',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        var myIscroll = scroll('.rightProvince');
        var myIscroll1 = scroll('.city-box');
        var myIscroll2 = scroll('.county-box');
        var myIscroll3 = scroll('.street-box');
        if ($stateParams.consigneeId) {
            $verifyService.SetIOSTitle("编辑收货地址");
        } else {
            $verifyService.SetIOSTitle("新增收货地址");
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
                        vm.address4 = '';
                    }
                })
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
                $('.select-tab span').removeClass('active').eq(3).addClass('active');
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

        function checkbox() {
            if (vm.defaultAddress == 0) {
                console.log(vm.defaultAddress = 1);
            } else {
                console.log(vm.defaultAddress = 0);
            }
        }
        //保存到查询地址
        function verify() {
            var phoneReg = /^1(3[0-9]|4[57]|5[0-35-9]|7[678]|8[0-9])\d{8}$/;
            var eml = /^\w+@[a-z0-9\-]+(\.[a-z]{2,6}){1,2}$/i;
            if (vm.name == '') {
                toolTip("姓名不能为空");
                return false;
            }
            if (vm.phone == "") {
                toolTip("联系电话不能为空！");
                return false;
            }
            if (!$verifyService.isPhoneNum(vm.phone)) {
                toolTip("请输入正确的手机号码！");
                return false;
            }
            if (vm.selectAddress == "请选择所在地区") {
                toolTip("请选择所在地区");
                return false;
            }
            if (vm.consigneeAddress == "" || vm.consigneeAddress.length < 5) {
                toolTip("详细地址不能少于5个字!");
                return false;
            }
            return true;
        }

        function addAddressOpen() {
            if (!verify()) {
                return false
            }
            //------------添加新地址------------//

            if (userInfo.data.resultCode == "0000") {
                if (!$stateParams.consigneeId) {
                    $address.getdelivery({
                        custId: userInfo.data.result.userInfo.id,
                        consigneeName: vm.name,
                        consigneeMobile: vm.phone,
                        consigneeEmail: vm.eml,
                        consigneeAddress: vm.consigneeAddress,
                        provinceId: vm.provinceId,
                        cityId: vm.cityId,
                        countyId: vm.countyId,
                        townId: vm.townId,
                        defaultAddress: vm.defaultAddress
                    }).success(function(data) {
                        console.log(JSON.stringify(data));
                        if (data.resultCode == "0000") {
                            toolTip('添加成功');
                            if ($stateParams.zet) {
                                setTimeout(function() {
                                    $state.go($stateParams.zet, {
                                        id: $stateParams.id,
                                        goodsId: $stateParams.goodsId,
                                        fromPage: $stateParams.fromPage,
                                        stages: $stateParams.stages,
                                        orderstate: $stateParams.orderstate,
                                        ordertext: $stateParams.ordertext,
                                        goodsnum: $stateParams.goodsnum,
                                        salePrice: $stateParams.salePrice,
                                        attributes: $stateParams.attributes,
                                        sku: $stateParams.sku,
                                        invoiceTitle: $stateParams.invoiceTitle,
                                        invoiceContent: $stateParams.invoiceContent,
                                        invoiceIsCompany: $stateParams.invoiceIsCompany,
                                        remark: $stateParams.remark,
                                        invoiceType: $stateParams.invoiceType,
                                        payment: $stateParams.payment,
                                        basicSoluPrice: $stateParams.basicSoluPrice,
                                        couponCode: $stateParams.couponCode,
                                        couponContent: $stateParams.couponContent
                                    }, {
                                        location: 'replace'
                                    })
                                }, 2000);
                            } else {
                                setTimeout(function() {
                                    $state.go('addAddress', {
                                        id: $stateParams.id,
                                        goodsId: $stateParams.goodsId,
                                        fromPage: $stateParams.fromPage,
                                        stages: $stateParams.stages,
                                        orderstate: $stateParams.orderstate,
                                        ordertext: $stateParams.ordertext,
                                        goodsnum: $stateParams.goodsnum,
                                        salePrice: $stateParams.salePrice,
                                        attributes: $stateParams.attributes,
                                        sku: $stateParams.sku,
                                        invoiceTitle: $stateParams.invoiceTitle,
                                        invoiceContent: $stateParams.invoiceContent,
                                        invoiceIsCompany: $stateParams.invoiceIsCompany,
                                        remark: $stateParams.remark,
                                        invoiceType: $stateParams.invoiceType,
                                        payment: $stateParams.payment,
                                        basicSoluPrice: $stateParams.basicSoluPrice,
                                        couponCode: $stateParams.couponCode,
                                        couponContent: $stateParams.couponContent,
                                        flagbit : $stateParams.flagbit
                                    }, {
                                        location: 'replace'
                                    })
                                }, 2000);
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }
                    })
                } else {
                    //保存更新地址
                    $address.getdoUpdate({
                        custId: userInfo.data.result.userInfo.id,
                        consigneeId: $stateParams.consigneeId,
                        consigneeName: vm.name,
                        consigneeMobile: vm.phone,
                        consigneeEmail: vm.eml,
                        consigneeAddress: vm.consigneeAddress,
                        provinceId: vm.provinceId,
                        cityId: vm.cityId,
                        countyId: vm.countyId,
                        townId: vm.townId,
                        defaultAddress: vm.defaultAddress
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            toolTip('修改成功');
                            setTimeout(function() {
                                $state.go('addAddress', {
                                    id: $stateParams.id,
                                    goodsId: $stateParams.goodsId,
                                    fromPage: $stateParams.fromPage,
                                    stages: $stateParams.stages,
                                    orderstate: $stateParams.orderstate,
                                    ordertext: $stateParams.ordertext,
                                    goodsnum: $stateParams.goodsnum,
                                    salePrice: $stateParams.salePrice,
                                    attributes: $stateParams.attributes,
                                    sku: $stateParams.sku,
                                    invoiceTitle: $stateParams.invoiceTitle,
                                    invoiceContent: $stateParams.invoiceContent,
                                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                                    remark: $stateParams.remark,
                                    invoiceType: $stateParams.invoiceType,
                                    payment: $stateParams.payment,
                                    basicSoluPrice: $stateParams.basicSoluPrice,
                                    couponCode: $stateParams.couponCode,
                                    couponContent: $stateParams.couponContent,
                                    flagbit : $stateParams.flagbit
                                }, {
                                    location: 'replace'
                                })
                            }, 2000);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    });
                }

            } else {
                $common.goUser({
                    state: 'order',
                    param1: orderId
                }, '/order');
            }
        }
        //根据ID获取收货地址
        if ($stateParams.consigneeId) {
            Obtain();
        }

        function Obtain() {
            $address.getObtain({
                consigneeId: $stateParams.consigneeId
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    var list = data.result;
                    console.log(list);
                    vm.name = list.consigneeName;
                    vm.phone = list.consigneeMobile;
                    vm.eml = list.consigneeEmail;
                    list.cityName = list.cityName ? list.cityName : '';
                    list.countyName = list.countyName ? list.countyName : '';
                    list.townName = list.townName ? list.townName : '';
                    vm.selectAddress = list.provinceName + list.cityName + list.countyName + list.townName;
                    vm.consigneeAddress = list.consigneeAddress;
                    vm.defaultAddress = list.defaultAddress;
                    vm.provinceId = list.provinceId;
                    vm.cityId = list.cityId;
                    vm.countyId = list.countyId;
                    vm.townId = list.townId;
                    vm.address1 = list.provinceName;
                    vm.address2 = list.cityName;
                    vm.address3 = list.countyName;
                    vm.address4 = list.townName;
                    vm.townList['townName'] = list.townName;
                    if (vm.address2) {
                        //$scope.cityClick(vm.cityId,vm.address2);
                        $address.getCity({
                            provinceId: list.provinceId
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
                    }
                    if (vm.address3) {
                        //$scope.countyClick(vm.countyId,vm.address3);
                        $address.getCounty({
                            cityId: list.cityId
                        }).success(function(data) {
                            if (data.result.length > 0) {
                                vm.countyList = data.result;
                                $timeout(function() {
                                    myIscroll2.refresh();
                                }, 200)
                            }
                        })
                    }
                    if (vm.address4) {
                        $address.getTown({
                                countyId: list.countyId
                            }).success(function(data) {
                                if (data.result.length > 0) {
                                    vm.townList = data.result;
                                    $timeout(function() {
                                        myIscroll3.refresh();
                                    }, 200)
                                }
                            })
                            //$scope.townClick(vm.townId,vm.address4);
                    }
                } else {
                    toolTip(data.resultMessage);
                }
            })
        }
    }
    //-----------------------------------------查询地址
    addController.$inject = ['$address', '$scope', '$state', '$stateParams', '$q', '$verifyService', '$rootScope', '$timeout', '$http', '$userService', '$common', 'userInfo','$productService'];

    function addController($address, $scope, $state, $stateParams, $q, $verifyService, $rootScope, $timeout, $http, $userService, $common, userInfo,$productService) {
        var vm = this;
        vm.name = '';
        vm.phone = '';
        vm.eml = '';
        vm.defaultAddress = '';
        vm.consigneeAddress = '';
        vm.address = [];
        vm.addressList = [];
        vm.goodsId = "";
        vm.name = $stateParams.name;
        vm.mobile = $stateParams.mobile;
        vm.email = $stateParams.email;
        vm.ename = $stateParams.ename;
        vm.emobile = $stateParams.emobile;
        vm.deliveryAddressOpen = deliveryAddressOpen;
        vm.deleteAddress = deleteAddress;
        vm.selectAddress = selectAddress;
        vm.editAddress = editAddress;
        vm.goodsId = $stateParams.goodsId;
        var href = location.href;
        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'sureorder',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }
        console.log($stateParams)
        if ($stateParams.goodsId) {
            vm.goodsId = $stateParams.goodsId;
        }
        if (href.indexOf("orderId") != -1) {
            var orderInfo = {
                orderId: $verifyService.getQueryParam("orderId"),
                goodsMoney: $verifyService.getQueryParam("goodsMoney"),
                fromPage: $verifyService.getQueryParam("fromPage"),
                typeFrom: $verifyService.getQueryParam("typeFrom")
            };
            sessionStorage.setItem("orderInfo", JSON.stringify(orderInfo));
        }
        //      console.log(orderInfo.goodsMoney)
        var myIscroll = scroll('.main-content');
        $verifyService.SetIOSTitle("收货地址");
        getAddress();


        //获取收货地址列表
        function getAddress() {
            var orderId = $verifyService.getQueryParam("orderId");
            if (userInfo.data.resultCode == "0000") {
                $address.getAddress({
                    custId: userInfo.data.result.userInfo.id,
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        vm.addressList = data.result;
                        $timeout(function() {
                            myIscroll.refresh();
                        }, 200)
                    } else {
                        toolTip(data.resultMessage);
                    }
                });
            } else {
                $common.goUser({
                    state: 'order',
                    param1: orderId
                }, '/order');
            }
        }

        //编辑按钮点击事件
        function editAddress(id, $event) {
            $event.stopPropagation();
            $state.go('deliveryAddress', {
                consigneeId: id,
                goodsId: $stateParams.goodsId,
                fromPage: $stateParams.fromPage,
                stages: $stateParams.stages,
                orderstate: $stateParams.orderstate,
                ordertext: $stateParams.ordertext,
                goodsnum: $stateParams.goodsnum,
                salePrice: $stateParams.salePrice,
                spikePirce: $stateParams.spikePirce,
                spikeStatus: $stateParams.spikeStatus,
                attributes: $stateParams.attributes,
                sku: $stateParams.sku,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                remark: $stateParams.remark,
                invoiceType: $stateParams.invoiceType,
                payment: $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                couponCode: $stateParams.couponCode,
                couponContent: $stateParams.couponContent,
                flagbit : $stateParams.flagbit
            }, {
                location: 'replace'
            })
        };

        //---------------添加新地址--------//
        function deliveryAddressOpen() {
            $state.go('deliveryAddress', {
                id: $stateParams.id,
                goodsId: vm.goodsId,
                fromPage: $stateParams.fromPage,
                stages: $stateParams.stages,
                orderstate: $stateParams.orderstate,
                ordertext: $stateParams.ordertext,
                goodsnum: $stateParams.goodsnum,
                salePrice: $stateParams.salePrice,
                attributes: $stateParams.attributes,
                sku: $stateParams.sku,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                remark: $stateParams.remark,
                invoiceType: $stateParams.invoiceType,
                payment: $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                couponCode: $stateParams.couponCode,
                couponContent: $stateParams.couponContent,
                flagbit : $stateParams.flagbit
            }, {
                location: 'replace'
            })
        }

        //选择地址
        function selectAddress(id) {
            var orderInfo = $.parseJSON(sessionStorage.getItem("orderInfo"));
            var href = location.href;
            if (orderInfo) {
                var orderId = orderInfo.orderId;
                var goodsMoney = orderInfo.goodsMoney;
                var fromPage = orderInfo.fromPage;
                var typeFrom = orderInfo.typeFrom;
                var targetHref = null;
                if (fromPage && fromPage == "tzsOrderList") { // 来自0元购订单列表
                    targetHref = httpsHeader + "/mall/orderAction/doDetail.action?orderId=" + orderId + "&fromPage=" + fromPage;
                } else if (fromPage && fromPage == "fqfOrderList") { // 来自分期购订单列表
                    targetHref = httpsHeader + "/mall/orderAction/orderDetail.action?orderId=" + orderId + "&fromPage=" + fromPage;
                } else if (fromPage && fromPage == "fqfConfirmOrder") { // 来自确认订单
                    targetHref = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + orderId + "&fromPage=" + fromPage;
                }
                $http.post(httpsHeader + "/mall/consigneeAction/modifyAddress.action?orderId=" + orderId + "&consigneeId=" + id, {}).success(function(data) {
                    if (typeFrom) {
                        if (typeFrom == 1) {
                            sessionStorage.removeItem("orderInfo")
                            location.href = targetHref;
                        } else if (typeFrom == 2) {
                            $http.post(httpsHeader + "/mall/jdOrderUtilAction/checkHasStock.action?orderId=" + orderId, {}).success(function(data) {
                                if (data.resultCode == 0000) {
                                    sessionStorage.removeItem("orderInfo")
                                    location.href = targetHref;
                                } else {
                                    toolTip('发往此地区的商品无库存，请选择别的收货地址。');
                                }
                            });
                        }
                    } else if (sessionStorage.getItem('hshurl')) {
                        location.href = sessionStorage.getItem('hshurl') + '&addressId=' + id;
                    } else {
                        sessionStorage.removeItem("orderInfo")
                        location.href = targetHref;
                    }
                });
            } else {
                if ($stateParams.goodsId && $stateParams.fromPage && $stateParams.fromPage == "productDetails") { //来自0元购，判断是否选择收货地址
                    $state.go('productDetails', {
                        goodsId: $stateParams.goodsId,
                        addressId: id,
                        goodsnum: $stateParams.goodsnum,
                        attrDefaultText: $stateParams.attrDefaultText
                    }, {
                        location: 'replace'
                    })
                } else if (sessionStorage.getItem('hshurl')) {
                    location.href = sessionStorage.getItem('hshurl');
                } else if ($stateParams.fromPage == "tourism-invoice") {
                    $state.go('tourism-invoice', {
                        addressId: id,
                        id: $stateParams.id,
                        stages: $stateParams.stages,
                        orderstate: $stateParams.orderstate,
                        ordertext: $stateParams.ordertext
                    }, {
                        location: 'replace'
                    })
                } else if ($stateParams.fromPage == "confirm") {
                    $state.go('confirm', {
                        addressId: id,
                        goodsId: $stateParams.goodsId,
                        stages: $stateParams.stages,
                        goodsnum: $stateParams.goodsnum,
                        salePrice: $stateParams.salePrice,
                        spikePirce: $stateParams.spikePirce,
                        spikeStatus: $stateParams.spikeStatus,
                        attributes: $stateParams.attributes,
                        sku: $stateParams.sku,
                        invoiceTitle: $stateParams.invoiceTitle,
                        invoiceContent: $stateParams.invoiceContent,
                        invoiceIsCompany: $stateParams.invoiceIsCompany,
                        remark: $stateParams.remark,
                        invoiceType: $stateParams.invoiceType,
                        payment: $stateParams.payment,
                        basicSoluPrice: $stateParams.basicSoluPrice,
                        couponCode: $stateParams.couponCode,
                        couponContent: $stateParams.couponContent,
                        flagbit : $stateParams.flagbit
                    }, {
                        location: 'replace'
                    })
                } else if ($stateParams.zet) {
                    $state.go($stateParams.zet, {
                        addressId: id,
                        goodsId: $stateParams.goodsId,
                        stages: $stateParams.stages,
                        goodsnum: $stateParams.goodsnum,
                        salePrice: $stateParams.salePrice,
                        spikePirce: $stateParams.spikePirce,
                        spikeStatus: $stateParams.spikeStatus,
                        attributes: $stateParams.attributes,
                        sku: $stateParams.sku,
                        invoiceTitle: $stateParams.invoiceTitle,
                        invoiceContent: $stateParams.invoiceContent,
                        invoiceIsCompany: $stateParams.invoiceIsCompany,
                        remark: $stateParams.remark,
                        invoiceType: $stateParams.invoiceType,
                        payment: $stateParams.payment,
                        basicSoluPrice: $stateParams.basicSoluPrice,
                        couponCode: $stateParams.couponCode,
                        couponContent: $stateParams.couponContent
                    }, {
                        location: 'replace'
                    })
                }
            }
        }
        console.log($stateParams.fromPage)
            //------------删除地址//
        function deleteAddress(consigneeId, index, $event) {
            $event.stopPropagation();
            var deletediaolg = new dialog().confirm({
                content: '是否删除地址？',
                cancelBtn: function() {},
                confirmBtn: function() {
                    $address.getDelete({
                        consigneeId: consigneeId,
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            toolTip("删除成功");
                            //var deleteTip = new dialog().confirm({
                            //    content: '删除成功',
                            //    cancelBtn: function () {
                            //    },
                            //})
                            $('.addAddress>ul>li').eq(index).remove();

                        } else {
                            toolTip(data.resultMessage);
                        }
                    })
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }
    }
});