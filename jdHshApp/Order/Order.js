/**
 * home.js
 * @authors Casper 
 * @date    2016/09/01
 * @version 1.0.0
 */

define(['angular', 'css!./Order.css', 'common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller('TrackController', TrackController)
        .controller('DeliverController', DeliverController)
        .controller('MyorderController', MyorderController)
        .controller('confirmController', confirmController)
        .controller('invoController', invoController)
        .controller('scancodeController', scancodeController)
        .controller('successController', successController)
        .controller('stagingController', stagingController)
        .controller('confricardController', confricardController)

    /*--------------------卡卷信息-------------------*/
    confricardController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address', '$cardService'];

    function confricardController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address, $cardService) {
        var vm = this;
        $verifyService.SetIOSTitle("卡卷信息");
        vm.pageNo = 1;
        vm.loadIcon = true; //加载loading
        vm.loadGoods = true;
        vm.loadEnd = true;
        vm.couponCode = '' || $stateParams.couponCode;
        vm.couponContent = '' || $stateParams.couponContent;
        vm.pricenum = $stateParams.pricenum;
        vm.stages = parseInt($stateParams.stages);
        $scope.couponCode = $stateParams.couponCode;
        vm.off = '';
        vm.item = '';
        $scope.freePeriods = parseInt(sessionStorage.getItem('freePeriods'));
        $scope.endname = '';
        if ($stateParams.couponCode) {
            vm.item = $stateParams.couponCode;
        }

        //跳转回确认订单
        $scope.Place = function() {
            $state.go('confirm', {
                invoiceType: $stateParams.invoiceType,
                sku: $stateParams.sku,
                goodsId: $stateParams.goodsId,
                stages: $stateParams.stages,
                remark: $stateParams.remark,
                goodsnum: $stateParams.goodsnum,
                salePrice: $stateParams.salePrice,
                attributes: $stateParams.attributes,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                payment: $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent
            })
        }

        //tabs切换
        vm.handover = function(e, userConponNum, couponContent, couponType) {
            if (couponType == '10020003') {
                vm.couponContent = couponContent;
            } else {
                vm.couponContent = '';
                $stateParams.couponContent = '';
            }
            if (vm.item === userConponNum) {
                vm.item = '';
                vm.couponContent = '';
                vm.couponCode = '';
                return false;
            } else {
                vm.couponCode = userConponNum;
            }
            vm.item = userConponNum;
        }

        //初始化
        init();

        function init() {
            getGoodsList();

            vm.mainScroll = scroll('.main-content');
            vm.mainScroll.on('scrollEnd', function() {
                if (this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd) {
                    vm.loadEnd = false;
                    vm.pageNo++;
                    getGoodsList();
                    $timeout(function() {
                        vm.mainScroll.refresh();
                    }, 200)
                }
            })
        }

        function getGoodsList() {
            //获取可用优惠卷数量
            $cardService.getGoodsCoupon({
                period: vm.stages,
                goodsAmount: vm.pricenum,
                goodsId: $stateParams.goodsId,
                pageNo: vm.pageNo,
                pageSize: 10
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result.userCouponList)) {
                        vm.fiction = false;
                        $scope.list = data.result.userCouponList;
                        angular.forEach($scope.list, function(data1) {
                            if (data1.useLimit == '') {
                                data1.useLimit = 0;
                            }
                            if ((data1.couponType == '10020003' && parseFloat(data1.useLimit) <= parseFloat(vm.pricenum)) || (data1.couponType == '10020001' && parseFloat(data1.useLimit) <= parseFloat(vm.pricenum) && vm.stages == data1.couponContent)) {
                                data1.orderStatus = true;
                            } else {
                                data1.orderStatus = false;
                            }
                            if ((data1.couponType == '10020003' && parseFloat(data1.useLimit) <= parseFloat(vm.pricenum)) || (data1.couponType == '10020001' && (parseFloat(data1.useLimit) <= parseFloat(vm.pricenum)) && data1.couponContent == vm.stages)) {
                                data1.orderAmount = false;
                            } else {
                                data1.orderAmount = true;
                            }
                        })
                        if (vm.pageNo == 1) {
                            vm.goodsList = data.result.userCouponList;
                            if (data.result.total <= 10) {
                                vm.loadGoods = false;
                                vm.loadIcon = false;
                            }
                        } else {
                            angular.forEach(data.result.userCouponList, function(data) {
                                vm.goodsList.push(data);
                            })
                        }

                        vm.loadEnd = true;
                    } else {
                        if (data.result.total == 0) {
                            vm.fiction = true;
                            vm.goodsList = data.result.userCouponList;
                        }
                        vm.loadIcon = false;
                        vm.loadGoods = false;
                    }
                    $timeout(function() {
                        vm.mainScroll.refresh();
                    }, 200)
                } else {
                    vm.loadIcon = false;
                    toolTip(data.resultMessage)
                }
            })
        }
    }

    /*--------------------分期协议-------------------*/
    stagingController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address'];

    function stagingController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address) {
        var vm = this;
        $verifyService.SetIOSTitle("分期协议");
        var mainScroll = new IScroll(".main-content", {
            probeType: 3,
            preventDefault: false
        });
        $scope.Return = function() {
            $state.go('confirm', {
                goodsId: $stateParams.goodsId,
                goodsnum: $stateParams.goodsnum,
                salePrice: $stateParams.salePrice,
                attributes: $stateParams.attributes,
                sku: $stateParams.sku,
                basicSoluPrice: $stateParams.basicSoluPrice,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                invoiceType: $stateParams.invoiceType,
                payment: $stateParams.payment,
                remark: $stateParams.remark,
                couponCode: $stateParams.couponCode,
                couponContent: $stateParams.couponContent,
                stages: $stateParams.stages
            })
        }
    }

    /*--------------------付款成功-------------------*/
    successController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address'];

    function successController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address) {
        var vm = this;
        $verifyService.SetIOSTitle("付款成功");
        $('.main-content').css('background', '#fff');
        vm.goodsMoney = $stateParams.goodsMoney
            //跳转商品详情
        $scope.gomyorder = function() {
                $state.go('productDetails', {
                    goodsId: $stateParams.goodsId
                }, {
                    location: 'replace'
                })
            }
            //跳转订单详情
        $scope.goorder = function() {
                $state.go('Deliver', {
                    orderId: $stateParams.orderId
                }, {
                    location: 'replace'
                })
            }
            //跳转首页
        $scope.gohome = function() {
            $state.go('home', {

            }, {
                location: 'replace'
            })
        }
    }

    /*--------------------二维码-------------------*/
    scancodeController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address'];

    function scancodeController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address) {
        var vm = this;
        $verifyService.SetIOSTitle("扫码支付");
        vm.qrCodePath = imgUrl + $stateParams.qrCodePath;
        vm.orderNum = $stateParams.orderNum;
        $('.main-content').css('background', '-webkit-linear-gradient(top, #fb9370, #f7766a)')
        $timeout(function() {
            scroll('.main-content');
        }, 300);
        //支付完成
        $scope.complete = function(data) {
                $customerService.executePos({
                    orderNum: $stateParams.orderNum
                }).success(function(data) {
                    if (data.resultCode == '0000') {
                        if (data.result.posStatus == -1) {
                            new dialog().alert({
                                content: "请在POS机上刷卡支付！",
                                confirmBtnText: '我知道了！',
                                confirmBtn: function() {

                                }
                            })
                        } else if (data.result.posStatus == 1) {
                            $state.go('success', {
                                goodsId: $stateParams.goodsId,
                                orderId: $stateParams.orderId,
                                goodsMoney: $stateParams.goodsMoney
                            }, {
                                location: 'replace'
                            })
                        } else if (data.result.posStatus == 0) {
                            $state.go('myCenter', {

                            }, {
                                location: 'replace'
                            })
                        }
                    } else {
                        toolTip(data.resultMessage)
                    }
                    $('.content').css('text-align', 'center')
                    $('.content').css('font-size', '0.4rem')
                })
            }
            //取消支付
        $scope.cancel = function(data) {
            $customerService.executePos({
                orderNum: $stateParams.orderNum
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (data.result.posStatus == -1) {
                        new dialog().confirm({
                            content: "确认取消支付",
                            confirmBtn: function() {
                                $state.go('myCenter', {

                                }, {
                                    location: 'replace'
                                })
                            }
                        })
                    } else if (data.result.posStatus == 1) {
                        toolTip(data.result.posResult)
                    } else if (data.result.posStatus == 0) {
                        $state.go('myCenter', {

                        }, {
                            location: 'replace'
                        })
                    }
                } else {
                    toolTip(data.resultMessage)
                }
                $('.content').css('text-align', 'center')
                $('.content').css('font-size', '0.4rem')
            })
        }

    }

    /*--------------------发票信息-------------------*/
    invoController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address'];

    function invoController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address) {
        var vm = this;
        vm.text = "";
        vm.go = $stateParams.flag
        $verifyService.SetIOSTitle("发票信息");
        var a = $stateParams.invoiceTitle;
        $timeout(function() {
            scroll('.main-content');
        }, 300);

        if ($stateParams.invoiceContent == '明细') {
            $('.f3').addClass('active');
            vm.invoiceContent = "明细";
        } else if ($stateParams.invoiceContent == '办公用品') {
            $('.f4').addClass('active')
            vm.invoiceContent = "办公用品";
        } else if ($stateParams.invoiceContent == '电脑配件') {
            $('.f5').addClass('active')
            vm.invoiceContent = "电脑配件";
        } else if ($stateParams.invoiceContent == '耗材') {
            $('.f6').addClass('active')
            vm.invoiceContent = "耗材";
        }
        if ($stateParams.invoiceIsCompany == 0) {
            vm.invoiceTitle = "个人";
            vm.invoiceIsCompany = 0;
            vm.placeholder = "";
            $('.f1').addClass('active')
            $('.invoice-text').prop("readonly", true);
        } else if ($stateParams.invoiceIsCompany == 1) {
            vm.invoiceIsCompany = 1;
            $('.f2').addClass('active')
            if ($stateParams.invoiceTitle != '个人') {
                vm.text = $stateParams.invoiceTitle;
            }
        }
        vm.handover = function(myevent) {
            $(myevent.currentTarget).addClass('active')
                .siblings().removeClass('active');
            if ($(myevent.currentTarget).attr("class") == 'f1 active') {
                vm.invoiceTitle = "个人";
                vm.invoiceIsCompany = 0
                vm.placeholder = "";
                vm.text = "";
                $('.invoice-text').prop("readonly", true);
            } else {
                vm.invoiceTitle = "";
                vm.invoiceIsCompany = 1
                vm.placeholder = "请输入公司名称";
                if ($stateParams.invoiceTitle != '个人') {
                    vm.text = $stateParams.invoiceTitle;
                }
                $('.invoice-text').prop("readonly", false);
            }
        }
        vm.handoverd = function(myevent) {
            $(myevent.currentTarget).addClass('active')
                .siblings().removeClass('active');
            if ($(myevent.currentTarget).attr("class") == 'f3 active') {
                vm.invoiceContent = "明细";
            } else if ($(myevent.currentTarget).attr("class") == 'f4 invoice-info active') {
                vm.invoiceContent = "办公用品";
            } else if ($(myevent.currentTarget).attr("class") == 'f5 active') {
                vm.invoiceContent = "电脑配件";
            } else if ($(myevent.currentTarget).attr("class") == 'f6 invoice-info active') {
                vm.invoiceContent = "耗材";
            }
        }

        $scope.gocomfirm = function() {
            if (vm.invoiceIsCompany == 1 && (vm.text == '' || vm.text == null)) {
                toolTip('请填写公司名称')
            } else if (vm.invoiceContent == undefined) {
                toolTip('请填写发票内容')
            } else if (vm.invoiceIsCompany == undefined) {
                toolTip('请填写发票抬头')
            } else {
                $state.go('confirm', {
                    invoiceType: '0',
                    invoiceTitle: vm.invoiceTitle || vm.text,
                    invoiceContent: vm.invoiceContent,
                    invoiceIsCompany: vm.invoiceIsCompany,
                    goodsId: $stateParams.goodsId,
                    addressId: $stateParams.addressId,
                    goodsnum: $stateParams.goodsnum,
                    salePrice　: $stateParams.salePrice,
                    remark: $stateParams.remark,
                    attributes: $stateParams.attributes,
                    sku: $stateParams.sku,
                    payment: $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    couponCode: $stateParams.couponCode,
                    couponContent: $stateParams.couponContent,
                    stages: $stateParams.stages
                })
            }
        }
    }

    /*--------------------确认订单-------------------*/
    confirmController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address', '$productService', '$window', '$cardService', 'userInfo'];

    function confirmController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address, $productService, $window, $cardService, userInfo) {
        var vm = this;
        $verifyService.SetIOSTitle("确认订单");
        vm.goodsid = $stateParams.goodsId;
        vm.goodsNum = $stateParams.goodsnum;
        $scope.salePrice = $stateParams.salePrice;
        vm.Choice = '未选择'
        vm.fromPage = 1;
        vm.theDialog = theDialog;
        vm.setmonth = setmonth;
        vm.jd = "";
        vm.total = 0;
        vm.mode = $stateParams.payment || '选择支付方式';
        vm.bystages = false;
        vm.remark = '' || $stateParams.remark;
        vm.couponCode = $stateParams.couponCode;
        vm.couponContent = parseFloat($stateParams.couponContent) || 0;
        $scope.periodsValue = '';
        $scope.monthRepayPrincipalAmount = '';
        $scope.mark = '';
        $scope.freeServerFee = '';
        $scope.written = '第一期服务费包含手续费';
        $scope.token = localStorage.getItem('sinks-token');
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
        $scope.sign = '';
        $scope.townName = '';
        $scope.freePeriods = parseInt(sessionStorage.getItem('freePeriods'));
        $scope.url = window.location.href;
        $scope.businessType = sessionStorage.getItem('businessType');
        $scope.judge = $scope.businessType == null || $scope.businessType == 'null' ? true : false;
        $scope.selectionperiod = '选择分期数';
        $scope.rent = '月供';
        $scope.grossrent = '商品总额';
        $scope.accountPayable = '';
        $scope.isAgreement = true;
        $scope.utmterm = sessionStorage.getItem('utmterm');
        $scope.utm_source = sessionStorage.getItem('utm_source');
        $scope.utm_medium = sessionStorage.getItem('utm_medium');
        $scope.yhj = '分期购可用';
        $scope.Repaymentplan = '还款计划';
        $scope.Formonth = '月供';
        $scope.driver = true; //驾校商品
        /*$scope.agreementClick = function(){
            $scope.isAgreement  = !$scope.isAgreement;
        };*/

        if ($stateParams.couponCode) {
            vm.Choice = '已选择';
        }
        //tab选择分期数
        $scope.Obtain = function(periods, loanRate, feeRate, monthRepayPrincipalAmount, freeServerFee) {
            if ($stateParams.stages != periods) {
                if ($stateParams.couponContent) {
                    vm.Choice = '已选择';
                    vm.paid = vm.pricenum - vm.couponContent;
                } else {
                    vm.Choice = '未选择';
                    vm.couponCode = null;
                    vm.couponContent = null;
                }
            }
            if (periods > $scope.freePeriods) {
                var obnumber = periods - $scope.freePeriods;
                if (freeServerFee == '1') {
                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * obnumber);
                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                } else {
                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * obnumber) + $scope.serverFee;
                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                }
            } else {
                if (freeServerFee == '1') {
                    vm.paid = vm.pricenum - vm.couponContent
                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                } else {
                    vm.paid = vm.pricenum - vm.couponContent + $scope.serverFee;
                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                }
            }
            $scope.periodsValue = periods;
            $scope.monthRepayPrincipalAmount = monthRepayPrincipalAmount;
            vm.stages = periods;
            vm.loanRate = loanRate;
            vm.feeRate = feeRate;
            //getMonth();
            getGoodsCoupon();
        }

        var h = $(window).height();
        $(window).resize(function() {
            if ($(window).height() < h) {
                $('.confirm-bot').hide();
                $('.has-footer').addClass('buttom');
            }
            if ($(window).height() >= h) {
                $('.confirm-bot').show();
                $('.has-footer').removeClass('buttom');
                $timeout(function() {
                    scroll('.main-content');
                }, 300)
            }
        });

        var EL = {
            voucher: $('.confirm-zhifu')
        }

        //订单所有参数
        function session() {
            var a = {
                invoiceType: $stateParams.invoiceType,
                sku: $stateParams.sku,
                goodsId: $stateParams.goodsId,
                stages: vm.stages,
                remark: vm.remark,
                goodsnum: $stateParams.goodsnum,
                salePrice: $stateParams.salePrice,
                attributes: $stateParams.attributes,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                payment: EL.voucher.val() || $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                pricenum: vm.pricenum,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent
            }
            sessionStorage.setItem('confirm', JSON.stringify(a))
        }

        //弹出框
        $scope.method = function(myevent) {
            var myPicker = new mode(myevent.currentTarget, {
                title: "请选择支付方式",
                cols: [{ values: vm.payWays }]
            }).on('confirm', function() {
                $scope.$apply(function() {
                    vm.mode = EL.voucher.val();
                    if (EL.voucher.val() == '分期购') {
                        vm.bystages = true;
                        $timeout(function() {
                            scroll('.main-content');
                        }, 300)
                    } else {
                        vm.bystages = false;
                        $timeout(function() {
                            scroll('.main-content');
                        }, 300)
                    }
                })
            })
        }

        //跳转到卡卷信息
        $scope.card = function() {
            if (vm.mode != '分期购') {
                toolTip('优惠卷暂时只支持分期购!谢谢')
            } else {
                $state.go('confricard', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    goodsId: $stateParams.goodsId,
                    stages: vm.stages,
                    remark: vm.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: EL.voucher.val() || $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    pricenum: vm.pricenum,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent
                })
            }
        }

        //跳转到收货地址
        $scope.goaddAddress = function() {
                $state.go('addAddress', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    fromPage: 'confirm',
                    goodsId: $stateParams.goodsId,
                    stages: vm.stages,
                    remark: vm.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: EL.voucher.val() || $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent
                })
            }
            //获取商品价格
        function getprice() {
            $customerService.getGoodsPrice({
                channelId: sessionStorage.channelId,
                couponCode: vm.couponCode,
                goodsId: $stateParams.goodsId,
                attributes: $stateParams.attributes,
                goodsNum: $stateParams.goodsnum
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.accountPayable = data.result.goodsPrice;
                }
            })
        }

        function setmonth() {
            //获取分期购的月供数据接口
            $customerService.getMonthPaymentList({
                totalMoney: $scope.accountPayable,
                periods: vm.stages,
                loanRate: vm.loanRate,
                feeRate: vm.feeRate,
                goodsId: $stateParams.goodsId,
                channelId: sessionStorage.channelId,
                couponCode: vm.couponCode,
                businessType: $scope.businessType
            }).success(function(data) {
                vm.repayment = data.result.preRepayPlan.repayPlanList;
                $scope.freeServerFee = data.result.preRepayPlan.freeServerFee;
                $scope.mark = vm.repayment[0].freeInterest;
                $scope.serverFee = data.result.preRepayPlan.serverFee;
                if ($scope.freeServerFee != 1) {
                    var a = vm.repayment[0].interestFee + $scope.serverFee
                    data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                }
                if ($scope.freeServerFee == 1 && $scope.mark == 1) {
                    var a = vm.repayment[0].interestFee + $scope.serverFee
                    data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                }
                if ($scope.mark == 1 && $scope.freeServerFee == 1) {
                    $scope.written = '第一期服务费包含手续费';
                } else if ($scope.mark != 1 && $scope.freeServerFee == 1) {
                    $scope.written = '免手续费';
                }
            })
        }

        /*function getMonth(){
	        //获取月供金额
	        $customerService.ajaxGetMonthPayMoney({
        		totalMoney : $scope.accountPayable,
        		periods : vm.stages,
        		loanRate : vm.loanRate,
        		goodsId : $stateParams.goodsId,
        		channelId : sessionStorage.channelId,
        		couponCode : vm.couponCode
        	}).success(function(data){
        		if(data.resultCode == '0000'){
        			vm.monthPayMoney = data.result.monthPayMoney
        		}
        	})
        }*/

        function address() {
            //根据ID获取收货地址
            $address.getObtain({
                consigneeId: $stateParams.addressId
            }).success(function(data) {
                if (!isEmptyObject(data.result)) {
                    $scope.provinceId = data.result.provinceId;
                    $scope.cityId = data.result.cityId;
                    $scope.countyId = data.result.countyId;
                    $scope.townId = data.result.townId;
                    $scope.townName = data.result.townName || '';
                    $scope.list = data.result.consigneeName + ' ' + data.result.consigneeMobile + ' ' + data.result.provinceName + data.result.cityName + data.result.countyName + $scope.townName + ' ' + data.result.consigneeAddress;
                } else {
                    if (!$scope.goodid) {
                        $scope.list = '请选择收货地址';
                    }
                }
            })
        }

        function getGoodsCoupon() {
            //获取可用优惠卷数量
            $cardService.getGoodsCoupon({
                period: vm.stages,
                goodsAmount: vm.pricenum,
                goodsId: $stateParams.goodsId,
                pageNo: 1,
                pageSize: 10
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    vm.total = data.result.total || 0;
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

        //初始化
        getdoGoodsDetail();

        function getdoGoodsDetail() {
            if (vm.mode == '分期购') {
                vm.bystages = true;
            }
            if ($stateParams.invoiceIsCompany == null) {
                vm.invoice = '不开发票'
            } else {
                vm.invoice = '开发票'
            }
            session();
            getprice();
            sign();
            //获取商品详情
            var wait = new waiting();
            $customerService.getdoGoodsDetail({
                goodsId: $stateParams.goodsId,
                consigneeId: $stateParams.addressId,
                channelId: sessionStorage.channelId
            }).success(function(data) {
                if (data.resultCode = "0000") {
                    getNowFormatDate()
                    vm.type = data.result.typeFrom
                    if (data.result.typeFrom == 2) {
                        vm.thumbImgUrl = $productService.imgUrl[4] + data.result.thumbImgUrl;
                        vm.jd = "京东";
                        vm.express = '京东快递'
                    } else if (data.result.typeFrom == 1) {
                        vm.thumbImgUrl = imgUrl + data.result.thumbImgUrl;
                        vm.jd = '自营';
                        vm.express = '快递包邮'
                    }
                    vm.goodsName = data.result.goodsName;
                    vm.pricenum = $stateParams.salePrice * vm.goodsNum;

                    //$verifyService.setGrowing('订单详情',data.result.goodsId,data.result.brandName,vm.pricenum,$scope.tiem)        		
                    //获取分期
                    $customerService.confirmOrder({
                        channelId: sessionStorage.channelId,
                        goodsId: $stateParams.goodsId,
                        couponCode: vm.couponCode,
                        totalMoney: $scope.accountPayable,
                        businessType: $scope.businessType,
                        attributes: $stateParams.attributes,
                        goodsNum: $stateParams.goodsnum
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == '0000') {
                            $scope.item = data.result.periodsFeeList;
                            vm.value = data.result.periodsFeeList[data.result.periodsFeeList.length - 1].periods;
                            $scope.monthRepayPrincipalAmount = data.result.periodsFeeList[data.result.periodsFeeList.length - 1].monthRepayPrincipalAmount;
                            vm.stages = $stateParams.stages || vm.value;
                            if ($stateParams.goodsId == 7666363232) {
                                vm.stages = 3;
                                $scope.monthRepayPrincipalAmount = data.result.periodsFeeList[0].monthRepayPrincipalAmount;
                                $scope.driver = false;
                            }
                            $scope.periodsValue = vm.stages;
                            vm.payWays = data.result.payWays;
                            angular.forEach(data, function(data1) {
                                angular.forEach(vm.payWays, function(data2) {
                                    if (data2[0] == '10000000') {
                                        data1.payWays.splice(0, 1)
                                    }
                                })
                            })
                            angular.forEach($scope.item, function(data1) {
                                data1.driver = true;
                                if ($stateParams.goodsId == 7666363232) {
                                    if (data1.periods == 3) {
                                        data1.driver = true;
                                    } else {
                                        data1.driver = false
                                    }
                                }
                                if ($scope.judge == false) {
                                    if (data1.periods == 12 && $scope.judge == false) {
                                        data1.judge = true;
                                        data1.looming = false;
                                    } else {
                                        data1.judge = false;
                                        data1.looming = true;
                                    }
                                } else {
                                    data1.judge = true;
                                    data1.looming = true;
                                }
                            })
                            var number = 0;
                            var freeServerFee = data.result.periodsFeeList[0].freeServerFee;
                            var serverFee = data.result.periodsFeeList[0].serverFee;
                            $scope.serverFee = data.result.periodsFeeList[0].serverFee;
                            if ($scope.periodsValue > $scope.freePeriods) {
                                number = $scope.periodsValue - $scope.freePeriods;
                                if (freeServerFee == '1') {
                                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * number);
                                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                                } else {
                                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * number) + serverFee;
                                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                                }
                            } else {
                                if (freeServerFee == '1') {
                                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * number);
                                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                                } else {
                                    vm.paid = vm.pricenum - vm.couponContent + ($scope.item[0].interestFee * number) + serverFee;
                                    vm.paid = vm.paid <= 0 ? 0 : vm.paid;
                                }
                            }
                            vm.periodsList = data.result.periodsFeeList;
                            vm.loanRate = vm.periodsList[vm.periodsList.length - 1].loanRate;
                            vm.feeRate = vm.periodsList[vm.periodsList.length - 1].feeRate
                            var b = [];
                            for (var i = 0; i < vm.payWays.length; i++) {
                                var a = vm.payWays[i][1];
                                b[i] = a;
                            }
                            vm.payWays = b;
                            if (vm.payWays.length == 1) {
                                if ($scope.businessType && $scope.businessType != 'null') {
                                    vm.mode = vm.payWays[0] = '租用';
                                    $scope.selectionperiod = '商品租金';
                                    $scope.rent = '每月租金';
                                    $scope.grossrent = '租金总额';
                                    $scope.yhj = '分期租用可用';
                                    $scope.Repaymentplan = '租用计划';
                                    $scope.Formonth = '月租';
                                } else {
                                    vm.mode = vm.payWays[0];
                                }
                            }
                            if (data.result.consignee) {
                                vm.provinceId = data.result.consignee.provinceId;
                                vm.cityId = data.result.consignee.cityId;
                                vm.countyId = data.result.consignee.countyId;
                                vm.townId = data.result.consignee.townId;
                                $scope.list = data.result.consignee.consigneeName + ' ' + data.result.consignee.consigneeMobile + ' ' + data.result.consignee.consigneeAddress;
                                $scope.goodid = data.result.consignee.consigneeAddress;
                                vm.consigneeId = data.result.consignee.consigneeId;
                                if ($stateParams.addressId != undefined) {
                                    vm.consigneeId = $stateParams.addressId;
                                }
                            }
                            //获取分期购的月供数据接口
                            address();
                            getGoodsCoupon();
                            $timeout(function() {
                                scroll('.main-content');
                            }, 300)
                        }
                    })
                } else {
                    toolTip(data.resultMessage)
                }

            });
        }
        //自定义分期协议alert
        $scope.alert = function() {
                $state.go('staging', {
                    goodsId: $stateParams.goodsId,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    attributes: $stateParams.attributes,
                    sku: $stateParams.sku,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    invoiceType: $stateParams.invoiceType,
                    payment: EL.voucher.val() || $stateParams.payment,
                    remark: vm.remark,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent,
                    stages: vm.stages
                })
            }
            //自定义alert弹框
        function theDialog() {
            $(".dialog-wrap1").fadeIn();
            setmonth();
        }
        $scope.Close = function() {
            $(".dialog-wrap1").fadeToggle()
        }

        $scope.goinvoice = function() {
            $state.go('invoice', {
                salePrice: $stateParams.salePrice,
                goodsId: $stateParams.goodsId,
                addressId: $stateParams.addressId,
                goodsnum: $stateParams.goodsnum,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                remark: vm.remark,
                sku: $stateParams.sku,
                attributes: $stateParams.attributes,
                payment: EL.voucher.val() || $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                couponCode: $stateParams.couponCode,
                couponContent: $stateParams.couponContent,
                stages: vm.stages
            })
        }

        //获取sign
        function sign() {
            $customerService.getSign({
                mobile: $scope.mobile.mobile
            }).success(function(data) {
                if (data.resultCode == '00') {
                    $scope.sign = data.sign;
                }
            })
        }

        //绑卡
        function Card() {
            new dialog().confirm({
                content: "您还尚未绑定银行卡，赶紧去绑卡吧！",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y' + '&businessType=' + $scope.businessType + '&gold=y';;
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }
        //提交订单
        function order() {
            location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId
        }

        //激活
        function activation() {
            new dialog().confirm({
                content: "您的信用额度尚未激活，赶紧去激活吧！",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType + '&gold=y';
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //额度不够跳转
        function goactivation() {
            new dialog().confirm({
                content: '您的可用额度不足,补充房产或社保信息可提高额度.',
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType + '&gold=y';
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }
        //下单
        function btn() {
            var wait = new waiting();
            $customerService.submitOrder({
                channelId: sessionStorage.channelId,
                attributes: $stateParams.attributes,
                goodsNum: $stateParams.goodsnum,
                goodsId: $stateParams.goodsId,
                consigneeId: $stateParams.addressId　 || vm.consigneeId,
                totalMoney: $scope.accountPayable,
                fromPage: vm.fromPage,
                periods: vm.stages,
                loanRate: vm.loanRate,
                feeRate: vm.feeRate,
                remark: vm.remark,
                invoiceType: $stateParams.invoiceType,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                attributes: $stateParams.attributes,
                couponCode: $stateParams.couponCode,
                businessType: $scope.businessType,
                projectCode: sessionStorage.getItem('projectCode')
            }).success(function(data) {
                wait.hide();
                if (data.resultCode == '0000') {
                    vm.channelId = data.result.channelId;
                    vm.flag = data.result.flag;
                    vm.orderId = data.result.orderId;
                    vm.typeFrom = data.result.typeFrom
                    if (vm.flag == "orderConfirm") {
                        order()
                    } else if (vm.flag == "bindCard") {
                        Card()
                    } else if (vm.flag == "userBase") {
                        activation()
                    }
                }
            })
        }

        //验证有无货的alert
        function conalert() {
            new dialog().confirm({
                content: "选购的商品无货,请更改地址",
                cancelBtnText: "返回商品详情",
                confirmBtnText: "更改收货地址",
                confirmBtn: function() {
                    $state.go('addAddress', {
                        sku: $stateParams.sku,
                        fromPage: 'confirm',
                        goodsId: $stateParams.goodsId,
                        stages: vm.stages,
                        goodsnum: $stateParams.goodsnum,
                        salePrice: $stateParams.salePrice,
                        attributes: $stateParams.attributes,
                        invoiceTitle: $stateParams.invoiceTitle,
                        invoiceContent: $stateParams.invoiceContent,
                        invoiceIsCompany: $stateParams.invoiceIsCompany,
                        payment: EL.voucher.val() || $stateParams.payment
                    }, {
                        location: 'replace'
                    })
                },
                cancelBtn: function() {
                    $state.go('productDetails', {
                        goodsId: $stateParams.goodsId
                    }, {
                        location: 'replace'
                    })
                }
            })
        }

        //0元购
        function purchase(provinceid, cityid, countyid, townid) {
            //验证所选收货地址是否有足够的库存
            $customerService.newAjaxCheckJDStock({
                skuId: $stateParams.sku,
                num: vm.goodsNum,
                province: provinceid,
                city: cityid,
                county: countyid,
                town: townid
            }).success(function(data) {
                if (data.result.hasStock == true) {
                    location.href = httpsHeader + '/mall/investmentAction/bidList.action?payWay=10000000&channelId=' + sessionStorage.channelId + '&cityId=0&goodsId=' + $stateParams.goodsId + '&goodsNum=' + $stateParams.goodsnum + '&goodsMoney=' + vm.salePrice * vm.goodsNum + '&basicSoluMoney=' + $stateParams.basicSoluPrice + '&consigneeId=' + vm.consigneeId + '&attributes=' + $stateParams.attributes;
                } else {
                    conalert()
                }
            })
        }


        //刷卡支付
        function Verification(provinceid, cityid, countyid, townid) {
            //验证所选收货地址是否有足够的库存
            $customerService.newAjaxCheckJDStock({
                skuId: $stateParams.sku,
                num: vm.goodsNum,
                province: provinceid,
                city: cityid,
                county: countyid,
                town: townid
            }).success(function(data) {
                if (data.result.hasStock == true) {
                    var wait = new waiting();
                    $customerService.directPurchaseAction({
                        channelId: sessionStorage.channelId,
                        goodsMoney: $scope.accountPayable,
                        goodsNum: $stateParams.goodsnum,
                        goodsId: $stateParams.goodsId,
                        attributes: $stateParams.attributes,
                        consigneeId: $stateParams.addressId　 || vm.consigneeId,
                        remark: vm.remark,
                        totalMoney: $scope.accountPayable,
                        periods: vm.stages,
                        loanRate: vm.loanRate,
                        feeRate: vm.feeRate,
                        invoiceType: $stateParams.invoiceType,
                        invoiceTitle　: 　$stateParams.invoiceTitle,
                        invoiceContent　: 　$stateParams.invoiceContent,
                        invoiceIsCompany　: 　$stateParams.invoiceIsCompany
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == '0000') {
                            $scope.qrCodePath = data.result.qrCodePath;
                            $scope.orderNum = data.result.orderNum;
                            $scope.orderId = data.result.orderId;
                            $state.go('scancode', {
                                qrCodePath: $scope.qrCodePath,
                                orderNum: $scope.orderNum,
                                orderId: $scope.orderId,
                                goodsId: $stateParams.goodsId,
                                goodsMoney: $scope.accountPayable,
                            })
                        }
                    })
                } else {
                    conalert()
                }
            })
        }

        //分期购
        function CheckJDStock(provinceid, cityid, countyid, townid) {
            //验证所选收货地址是否有足够的库存
            $customerService.newAjaxCheckJDStock({
                skuId: $stateParams.sku,
                num: vm.goodsNum,
                province: provinceid,
                city: cityid,
                county: countyid,
                town: townid
            }).success(function(data) {
                if (data.result.hasStock == true) {
                    //验证是否有额度,判断是否已激活授信接口
                    $customerService.newAjaxCheckUserQuota({
                        goodsMoney: $scope.accountPayable
                    }).success(function(data) {
                        if (data.result.flag == "1") {
                            btn()
                        } else if (data.result.flag == "2") {
                            vm.fromPage = 2;
                            btn()
                        } else if (data.result.flag == "3") {
                            goactivation()
                        } else {
                            toolTip(data.result.message);
                        }
                    })
                } else {
                    conalert()
                }
            })
        }

        //确定下单
        $scope.Place = function() {
            if ($scope.list == '请选择收货地址') {
                toolTip('收货地址不能为空')
            } else if (vm.mode == '选择支付方式') {
                toolTip('请选择支付方式')
            } else {
                if (vm.mode == '0元购') {
                    if (vm.type == 2) {
                        if ($stateParams.addressId) {
                            purchase($scope.provinceId, $scope.cityId, $scope.countyId, $scope.townId)
                        } else {
                            purchase(vm.provinceId, vm.cityId, vm.countyId, vm.townId)
                        }
                    } else if (vm.type == 1) {
                        location.href = httpsHeader + '/mall/investmentAction/bidList.action?payWay=10000000&channelId=' + sessionStorage.channelId + '&cityId=0&goodsId=' + $stateParams.goodsId + '&goodsNum=' + $stateParams.goodsnum + '&goodsMoney=' + vm.salePrice * vm.goodsNum + '&basicSoluMoney=' + $stateParams.basicSoluPrice + '&consigneeId=' + vm.consigneeId + '&attributes=' + $stateParams.attributes;
                    }
                } else if (vm.mode == '刷卡支付') {
                    if (vm.type == 2) {
                        if ($stateParams.addressId) {
                            Verification($scope.provinceId, $scope.cityId, $scope.countyId, $scope.townId)
                        } else {
                            Verification(vm.provinceId, vm.cityId, vm.countyId, vm.townId)
                        }
                    } else if (vm.type == 1) {
                        var wait = new waiting();
                        $customerService.directPurchaseAction({
                            channelId: sessionStorage.channelId,
                            goodsMoney: $scope.accountPayable,
                            goodsNum: $stateParams.goodsnum,
                            goodsId: $stateParams.goodsId,
                            attributes: $stateParams.attributes,
                            consigneeId: $stateParams.addressId　 || vm.consigneeId,
                            remark: vm.remark,
                            totalMoney: $scope.accountPayable,
                            periods: vm.stages,
                            loanRate: vm.loanRate,
                            feeRate: vm.feeRate,
                            invoiceType: $stateParams.invoiceType,
                            invoiceTitle　: 　$stateParams.invoiceTitle,
                            invoiceContent　: 　$stateParams.invoiceContent,
                            invoiceIsCompany　: 　$stateParams.invoiceIsCompany
                        }).success(function(data) {
                            wait.hide();
                            if (data.resultCode == '0000') {
                                $scope.qrCodePath = data.result.qrCodePath;
                                $scope.orderNum = data.result.orderNum;
                                $scope.orderId = data.result.orderId;
                                $state.go('scancode', {
                                    qrCodePath: $scope.qrCodePath,
                                    orderNum: $scope.orderNum,
                                    orderId: $scope.orderId,
                                    goodsId: $stateParams.goodsId,
                                    goodsMoney: $scope.accountPayable,
                                })
                            }
                        })
                    }
                } else if (vm.mode == '分期购' || vm.mode == '租用') {
                    //验证是否满足下单条件
                    $customerService.newAjaxCheckUserOrder({

                    }).success(function(data) {
                        if (data.resultCode == '0000') {
                            if (data.result.success == true) {
                                if (vm.type == 2) {
                                    if ($stateParams.addressId) {
                                        CheckJDStock($scope.provinceId, $scope.cityId, $scope.countyId, $scope.townId)
                                    } else {
                                        CheckJDStock(vm.provinceId, vm.cityId, vm.countyId, vm.townId)
                                    }
                                } else if (vm.type == 1) {
                                    //验证是否有额度,判断是否已激活授信接口
                                    $customerService.newAjaxCheckUserQuota({
                                        goodsMoney: $scope.accountPayable
                                    }).success(function(data) {
                                        if (data.result.flag == "1") {
                                            btn();
                                        } else if (data.result.flag == "2") {
                                            vm.fromPage = 2;
                                            btn();
                                        } else if (data.result.flag == "3") {
                                            goactivation()
                                        } else {
                                            toolTip(data.result.message);
                                        }
                                    })
                                }
                            } else if (data.result.code == 'noCredit') {
                                activation();
                            } else if (data.result.code == 'noBankCard') {
                                Card();
                            } else {
                                toolTip(data.result.message);
                            }
                        }
                    })
                }
            }
        }
    }

    /*--------------------订单跟踪-------------------*/
    TrackController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams'];

    function TrackController($scope, $state, $verifyService, $timeout, $customerService, $stateParams) {
        var vm = this;
        vm.jdOrderId = $stateParams.jdOrderId;
        vm.list = []
        $verifyService.SetIOSTitle("订单跟踪");
        $timeout(function() {
            scroll('.main-content');
        }, 300)
        getTrack();

        function getTrack() {
            var wait = new waiting()
            $customerService.orderTrack({
                orderId: vm.jdOrderId
            }).success(function(data) {
                wait.hide();
                if (data.resultCode == "0000") {
                    vm.list = data.result.list.reverse();
                    vm.one = data.result.list[0].msgTime;
                } else {
                    toolTip(data.resultMessage)
                }
            })
        }

    }

    /*--------------------订单详情-------------------*/
    DeliverController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$userService', '$productService', '$window'];

    function DeliverController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $userService, $productService, $window) {
        $verifyService.SetIOSTitle("订单详情");
        var vm = this;
        vm.orderId = $stateParams.orderId;
        vm.voucher = '未发送';
        vm.Send = ''
        vm.Agreement = Agreement;
        $scope.mark = '';
        $scope.freeServerFee = '';
        $scope.serverFee = '';
        vm.businessType = '';
        $scope.julle = true;
        $scope.rent = '月供金额';
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
        $scope.token = localStorage.getItem('sinks-token');
        //获取sign
        function sign() {
            $customerService.getSign({
                mobile: $scope.mobile.mobile
            }).success(function(data) {
                if (data.resultCode == '00') {
                    $scope.sign = data.sign;
                }
            })
        }

        init();

        function init() {
            sign();
            getDetail();
            $scope.toggle = function() {
                $scope.myVar = !$scope.myVar;
            };
            //订单信息
            $customerService.orderTrack({
                orderId: $stateParams.orderId
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.list = data.result.list[0].content;
                } else {
                    vm.list = data.resultMessage
                }
            })
            $timeout(function() { scroll('.main-content'); }, 300);
        }
        //去支付
        vm.goPay = function() {
            if (vm.goodsState == '0' || vm.goodsState == '3') { //判断商品是否下架
                new dialog().alert({
                    content: '商品已下架！'
                })
            } else {

                if (vm.payway == '20000000') { //分期购
                    var wait = new waiting();
                    $customerService.checkUserQuota({
                        salePrice: vm.salePrice
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            if (data.result.res == "one") { // 已绑卡且额度高于商品价格，跳到订单确认
                                location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                            } else if (data.result.res == "two") { //未激活
                                new dialog().alert({
                                    content: data.result.message,
                                    confirmBtn: function() {
                                        location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&totalMoney=' + vm.price;
                                    }
                                })
                            } else if (data.result.res == "three") { //商品价格高于授信额度
                                new dialog().alert({
                                    content: data.result.message
                                })
                            } else if (data.result.res == "four") { //未绑卡
                                new dialog().alert({
                                    content: data.result.message,
                                    confirmBtn: function() {
                                        location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y' + '&order=y' + '&totalMoney=' + vm.price;
                                    }
                                })
                            }
                        } else {
                            toolTip(data.resultMessage)
                        }
                        wait.hide();
                    })
                } else if (vm.payway == '10000000') { //投资送
                    $customerService.toContiInvest({
                        channelId: $userService.$$channelId,
                        orderId: vm.orderId,
                        goodsTypeId: vm.goodsTypeId
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            location.href = httpsHeader + "/mall/investmentAgainAction/bidList.action?channelId=" + $userService.$$channelId + "&orderId=" + vm.orderId + "&goodsTypeId=" + vm.goodsTypeId + "&cityId=" + data.result.cityId;
                            wait.hide();
                        } else {
                            toolTip(data.resultMessage)
                        }
                    })

                } else if (vm.payway == '30000000') {
                    $customerService.getPosRecordByOrderId({
                        orderId: vm.orderId
                    }).success(function(data) {
                        if (data.resultCode == '0000') {
                            $scope.qrCodePath = data.result.qrCodePath;
                            $scope.orderNum = data.result.orderNum;
                            $scope.orderId = data.result.orderId;
                            $state.go('scancode', {
                                qrCodePath: $scope.qrCodePath,
                                orderNum: $scope.orderNum,
                                orderId: $scope.orderId
                            })
                        }
                    })
                }
            }
        }

        //再次购买
        vm.goBuy = function() {
            if (vm.goodsState == '0' || vm.goodsState == '3') {
                new dialog().alert({
                    content: '商品已下架！'
                })
            } else {
                if (vm.typeFrom == 3) {
                    $state.go('tourism-goodsDetail', {
                        id: vm.goodsId
                    })
                } else if (vm.businessType == 'faceTake') {
                    location.href = httpsHeader + '/ActivityProject/faceSwipping/face.html'
                } else {
                    $state.go('productDetails', {
                        goodsId: vm.goodsId
                    })
                }
            }
        }

        //取消订单
        vm.handCancel = function() {
            new dialog().confirm({
                content: "您确认要取消订单",
                confirmBtn: function() {
                    var wait = new waiting();
                    $customerService.cancelOrder({
                        orderId: vm.orderId,
                        payway: vm.payway,
                        typeFrom: vm.typeFrom
                    }).success(function(data) {
                        wait.hide();
                        toolTip(data.resultMessage);
                        location.reload()
                    })
                }
            })
        }

        //确认收货
        vm.updateOrder = function() {
            var wait = new waiting();
            $customerService.updateOrder({
                orderId: vm.orderId,
                payway: vm.payway,
                orderState: vm.orderState
            }).success(function(data) {
                wait.hide();
                toolTip(data.resultMessage);
                location.reload()
            })
        }

        //申请售后
        $scope.Application = function() {
            if (vm.typeFrom == 2) {
                $customerService.checkJDOrderAfterSale({
                    orderId: $stateParams.orderId
                }).success(function(data) {
                    if (data.resultCode == '0000') {
                        $state.go('Apply', {
                            orderId: $stateParams.orderId
                        })
                    } else {
                        toolTip(data.resultMessage)
                    }
                })
            } else if (vm.typeFrom == 1) {
                $state.go('Apply', {
                    orderId: $stateParams.orderId
                })
            }
        }

        function getmonth() {
            //获取分期购的月供数据接口
            $customerService.getMonthPaymentList({
                totalMoney: vm.salePrice,
                periods: vm.periods,
                loanRate: vm.loanRate,
                feeRate: vm.feeRate,
                goodsId: vm.goodsId,
                channelId: sessionStorage.channelId,
                couponCode: vm.couponCode,
                couponStatus: true,
                orderId: $stateParams.orderId
            }).success(function(data) {
                vm.repayment = data.result.preRepayPlan.repayPlanList;
                $scope.freeServerFee = data.result.preRepayPlan.freeServerFee;
                $scope.mark = vm.repayment[0].freeInterest;
                $scope.serverFee = data.result.preRepayPlan.serverFee;
                if ($scope.freeServerFee != 1) {
                    var a = vm.repayment[0].interestFee + $scope.serverFee
                    data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                }
                if ($scope.freeServerFee == 1 && $scope.mark == 1) {
                    var a = vm.repayment[0].interestFee + $scope.serverFee
                    data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                }
                if ($scope.mark == 1 && $scope.freeServerFee == 1) {
                    $scope.written = '第一期服务费包含手续费';
                } else if ($scope.mark != 1 && $scope.freeServerFee == 1) {
                    $scope.written = '免手续费';
                } else {
                    $scope.written = '第一期服务费包含手续费';
                }
            })
        }

        function getMonth() {
            //获取分期购的正式还款计划接口
            $customerService.getRePaymentPlanList({
                orderId: vm.orderId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    vm.total = data.result.total;
                    vm.notYetTotal = data.result.notYetTotal;
                    vm.repaymentDate = data.result.repaymentDate;
                    vm.repaymentPlans = data.result.repaymentPlans;
                }
            })
        }

        //自定义alert弹框
        $scope.toDialog = function() {
            if (vm.orderStateDesc == '已完成' || vm.orderStateDesc == '待收货') {
                $(".dialog-wrap2").fadeIn();
                getMonth()
            } else {
                $(".dialog-wrap1").fadeIn();
                getmonth()
            }
        }
        $scope.Close = function() {
            if (vm.orderStateDesc == '已完成' || vm.orderStateDesc == '待收货') {
                $(".dialog-wrap2").fadeToggle()
            } else {
                $(".dialog-wrap1").fadeToggle()
            }
        }

        //分期协议
        function Agreement() {
            location.href = httpsHeader + "/mall/orderApi/createSign.action?orderId=" + $stateParams.orderId;
        }

        //重发凭证
        $scope.chongfa = function(orderId, typeFrom, index) {
            $customerService.resendCode({
                orderId: $stateParams.orderId
            }).success(function(data) {
                toolTip(data.resultMessage);
            })
        }

        //获取订单信息
        function getDetail() {
            var wait = new waiting()
            $customerService.orderDetail({
                orderId: vm.orderId
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.thumbImgUrl = data.result.thumbImgUrl;
                    vm.consigneeAddress = data.result.consigneeAddress;
                    vm.consigneeName = data.result.consigneeName;
                    vm.consigneeMobile = data.result.consigneeMobile;
                    vm.createTime = data.result.createTime;
                    vm.goodsName = data.result.goodsName;
                    vm.goodsNum = data.result.goodsNum;
                    vm.invoiceInfo = data.result.invoiceInfo;
                    vm.invoiceTitle = data.result.invoiceTitle;
                    vm.invoiceType = data.result.invoiceType;
                    vm.monthPay = data.result.monthPay;
                    vm.orderId = data.result.orderId;
                    vm.orderNum = data.result.orderNum;
                    vm.orderState = data.result.orderState;
                    vm.orderStateDesc = data.result.orderStateDesc;
                    vm.periods = data.result.periods;
                    vm.salePrice = data.result.salePrice;
                    vm.typeFrom = data.result.typeFrom;
                    vm.payway = data.result.payway;
                    vm.goodsTypeId = data.result.goodsTypeId;
                    vm.goodsId = data.result.goodsId;
                    vm.hideAfsBtn = data.result.hideAfsBtn;
                    vm.goodsState = data.result.goodsState;
                    vm.pricenum = vm.salePrice * vm.goodsNum;
                    vm.adult = data.result.adult;
                    vm.child = data.result.child;
                    vm.goodsId = data.result.goodsId;
                    vm.loanRate = data.result.loanRate;
                    vm.feeRate = data.result.feeRate;
                    vm.isFile = data.result.isFile;
                    vm.amount = data.result.amount;
                    vm.couponCode = data.result.couponCode;
                    vm.businessType = data.result.businessType;
                    if (vm.businessType == 'faceTake') {
                        $scope.julle = false;
                        $scope.rent = '每期租金'
                    } else {
                        $scope.julle = true;
                    }
                    if (vm.typeFrom == 3) {
                        vm.visitDate = data.result.visitDate.split(' ')[0];
                    }
                    if (vm.payway == '20000000') {
                        vm.price = vm.amount;
                    } else {
                        vm.price = vm.salePrice;
                    }
                    vm.bookerName = data.result.bookerName;
                    vm.bookerMobile = data.result.bookerMobile;
                    if (vm.typeFrom == 1) {
                        vm.thumbImgUrl = imgUrl + vm.thumbImgUrl
                    } else if (vm.typeFrom == 2) {
                        vm.thumbImgUrl = $productService.imgUrl[4] + vm.thumbImgUrl
                    }
                    $timeout(function() { scroll('.main-content'); }, 300);
                }
                wait.hide();
            })
        }
    }
    /*--------------------我的订单-------------------*/
    MyorderController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$window', '$stateParams', '$userService', '$productService', '$common', 'userInfo'];

    function MyorderController($scope, $state, $verifyService, $timeout, $customerService, $window, $stateParams, $userService, $productService, $common, userInfo) {
        $verifyService.SetIOSTitle("我的订单")
        var vm = this;
        $scope.list = "qb";
        vm.tab = $stateParams.state || 'qb';
        vm.pageNo = 1;
        vm.pageSize = 10;
        vm.loadIcon = true; //加载loading
        vm.loadGoods = true;
        vm.loadEnd = false;
        vm.goodsList = [];
        vm.searchText = '';
        vm.orderNum = '';
        vm.stages = 'qb';
        $scope.payway = '';
        //获取相应的订单列表
        if ($stateParams.state == 'dfk') {
            vm.stages = 'dfk'
            $scope.list = "dfk";
            getOrder();
        } else if ($stateParams.state == 'audit') {
            vm.stages = 'audit'
            $scope.list = "audit";
            getOrder();
        } else if ($stateParams.state == 'dfh') {
            vm.stages = 'audit'
            $scope.list = "dfh";
            getOrder();
        } else if ($stateParams.state == 'dsh') {
            vm.stages = 'audit'
            $scope.list = "dsh";
            getOrder();
        } else if ($stateParams.state == 'ywc') {
            vm.stages = 'audit'
            $scope.list = "ywc";
            getOrder();
        }
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
        $scope.token = localStorage.getItem('sinks-token');
        //获取sign
        function sign() {
            $customerService.getSign({
                mobile: $scope.mobile.mobile
            }).success(function(data) {
                if (data.resultCode == '00') {
                    $scope.sign = data.sign;
                }
            })
        }

        //tabs切换
        $scope.handove = function(state, name) {
                vm.stages = state;
                $scope.list = state;
                $state.go('Myorder', {
                    state: state
                }, {
                    location: 'replace'
                })
            }
            //tabs列表数据
        $scope.myorder = [
            { name: '全部订单', state: 'qb' },
            { name: '待付款', state: 'dfk' },
            { name: '待审核', state: 'audit' },
            { name: '待发货', state: 'dfh' },
            { name: '待收货', state: 'dsh' },
            { name: '已完成', state: 'ywc' },
        ]
        init()

        function init() {
            $timeout(function() {
                var categorySlide = new Swiper('.Myorder-nav', {
                    slidesPerView: 'auto',
                    paginationClickable: true,
                    freeMode: true
                });
            }, 200)
            if (userInfo.data.resultCode != "0000") {
                $common.goUser({
                    state: 'Myorder'
                }, '/Myorder?state');
            }
            sign();
            getOrder();
            vm.mainScroll = scroll('.main-content');
            vm.mainScroll.on('scrollEnd', function() {
                if (this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd) {
                    /*  vm.loadEnd = false;*/
                    vm.pageNo++;
                    getOrder();
                }
            })
        }

        //搜索
        vm.searchSub = function(myevent) {
            $('.myorder-yc').css('display', 'none')
            vm.orderNum = encodeURI(vm.searchText);
            vm.pageNo = 1;
            vm.pageSize = 10;
            $scope.list = "qb";
            $('.Myorder-nav a').removeClass('active').eq(0).addClass('active');
            getOrder();
        }

        //申请售后
        $scope.Application = function(id, typeFrom) {
                if (typeFrom == 2) {
                    $customerService.checkJDOrderAfterSale({
                        orderId: id
                    }).success(function(data) {
                        if (data.resultCode == '0000') {
                            $state.go('Apply', {
                                orderId: id
                            }, {
                                location: 'replace'
                            })
                        } else {
                            toolTip(data.resultMessage)
                        }
                    })
                } else if (typeFrom == 1) {
                    $state.go('Apply', {
                        orderId: id
                    })
                }
            }
            //去支付
        vm.goPay = function(price, id, typeId, payway, state) {
                if (state == '0' || state == '3') { //判断商品是否下架 
                    new dialog().alert({
                        content: '商品已下架！'
                    })
                } else {
                    if (payway == '20000000') { //分期购
                        var wait = new waiting();
                        $customerService.checkUserQuota({
                            salePrice: price
                        }).success(function(data) {
                            if (data.resultCode == "0000") {
                                wait.hide();
                                if (data.result.res == "one") { // 已绑卡且额度高于商品价格，跳到订单确认
                                    location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + id;
                                } else if (data.result.res == "two") { //未激活
                                    new dialog().alert({
                                        content: data.result.message,
                                        confirmBtn: function() {
                                            location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&totalMoney=' + price;
                                        }
                                    })
                                } else if (data.result.res == "three") { //商品价格高于授信额度
                                    new dialog().alert({
                                        content: data.result.message
                                    })
                                } else if (data.result.res == "four") { //未绑卡
                                    new dialog().alert({
                                        content: data.result.message,
                                        confirmBtn: function() {
                                            location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y' + '&order=y' + '&totalMoney=' + price;
                                        }
                                    })
                                }
                            } else {
                                toolTip(data.resultMessage)
                            }

                        })
                    } else if (payway == '10000000') { //投资送
                        $customerService.toContiInvest({
                            channelId: $userService.$$channelId,
                            orderId: id,
                            goodsTypeId: typeId
                        }).success(function(data) {
                            wait.hide();
                            if (data.resultCode == "0000") {
                                location.href = httpsHeader + "/mall/investmentAgainAction/bidList.action?channelId=" + $userService.$$channelId + "&orderId=" + id + "&goodsTypeId=" + typeId + "&cityId=" + data.result.cityId;
                            } else {
                                toolTip(data.resultMessage)
                            }
                        })
                    } else if (payway == '30000000') {
                        $customerService.getPosRecordByOrderId({
                            orderId: id
                        }).success(function(data) {
                            if (data.resultCode == '0000') {
                                $scope.qrCodePath = data.result.qrCodePath;
                                $scope.orderNum = data.result.orderNum;
                                $scope.orderId = data.result.orderId;
                                $state.go('scancode', {
                                    qrCodePath: $scope.qrCodePath,
                                    orderNum: $scope.orderNum,
                                    orderId: $scope.orderId
                                })
                            }
                        })
                    }
                }
            }
            //重发凭证
        $scope.chongfa = function(orderId, typeFrom, index) {
            $customerService.resendCode({
                orderId: orderId
            }).success(function(data) {
                toolTip(data.resultMessage);
            })
        }

        //再次购买
        vm.goBuy = function(goodsState, goodsId, typeFrom, businessType) {
            if (goodsState == '0' || goodsState == '3') {
                new dialog().alert({
                    content: '商品已下架！'
                })
            } else {
                if (typeFrom == 3) {
                    $state.go('tourism-goodsDetail', {
                        id: goodsId
                    })
                } else if (businessType == 'faceTake') {
                    location.href = httpsHeader + '/ActivityProject/faceSwipping/face.html'
                } else {
                    $state.go('productDetails', {
                        goodsId: goodsId
                    })
                }
            }
        }

        //取消订单
        vm.handCancel = function(id, way, from, index) {
            new dialog().confirm({
                content: "您确认要取消此订单",
                confirmBtn: function() {
                    var wait = new waiting();
                    $customerService.cancelOrder({
                        orderId: id,
                        payway: way,
                        typeFrom: from
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == '0000') {
                            location.reload()
                            toolTip('取消订单成功');
                        } else {
                            toolTip(data.resultMessage);
                        }
                    })
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //确认收货
        vm.updateOrder = function(id, way, state, index) {
            var wait = new waiting();
            $customerService.updateOrder({
                orderId: id,
                payway: way,
                orderState: state
            }).success(function(data) {
                wait.hide();
                if (data.resultCode == '0000') {
                    location.reload()
                    toolTip('确认收货成功');
                } else {
                    toolTip(data.resultMessage);
                }
            })
        }

        function getOrder() {
            vm.loadEnd = true;
            vm.loadIcon = true;
            vm.loadGoods = true;
            $customerService.findOrder({
                pageNo: vm.pageNo,
                pageSize: vm.pageSize,
                orderState: $scope.list,
                orderNum: vm.orderNum
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result)) {
                        $scope.routeGoodsList = data.result.list;
                        angular.forEach($scope.routeGoodsList, function(data1) {
                            if (data1.typeFrom == 1) {
                                data1.thumbImgUrl = imgUrl + data1.thumbImgUrl
                            } else if (data1.typeFrom == 2) {
                                data1.thumbImgUrl = $productService.imgUrl[4] + data1.thumbImgUrl
                            }
                        })
                        angular.forEach($scope.routeGoodsList, function(data1) {
                            if (data1.payway == '20000000') {
                                data1.price = data1.amount;
                            } else {
                                data1.price = data1.salePrice;
                            }
                        })
                        if (vm.pageNo == 1) {
                            vm.goodsList = data.result.list;
                            angular.forEach(vm.goodsList, function(data1) {
                                if (data1.payway == '20000000') {
                                    data1.name = '分期购订单编号';
                                    data1.odername = '分期购';
                                    if (data1.businessType == 'faceTake') {
                                        data1.name = '刷脸拿订单编号';
                                        data1.odername = '租金';
                                    }
                                } else if (data1.payway == '10000000') {
                                    data1.name = '投资送订单编号';
                                    data1.odername = '投资送';
                                } else if (data1.payway == '30000000') {
                                    data1.name = '直接付订单编号';
                                    data1.odername = '直接付';
                                }
                            })
                            if (data.result.totalCount <= 10) {
                                vm.loadGoods = false;
                                vm.loadIcon = false;
                            } else {
                                vm.loadEnd = true;
                                vm.loadIcon = true;
                                vm.loadGoods = true;
                            }
                        } else {
                            angular.forEach(data.result.list, function(data1) {
                                if (data1.payway == '20000000') {
                                    data1.name = '分期购订单编号';
                                    data1.odername = '分期购';
                                    if (data1.businessType == 'faceTake') {
                                        data1.name = '刷脸拿订单编号';
                                        data1.odername = '租金';
                                    }
                                } else if (data1.payway == '10000000') {
                                    data1.name = '投资送订单编号';
                                    data1.odername = '投资送';
                                } else if (data1.payway == '30000000') {
                                    data1.name = '直接付订单编号';
                                    data1.odername = '直接付';
                                }
                                vm.goodsList.push(data1);
                            });
                        }
                    } else {
                        $scope.routeGoodsList = data.result.list;
                        vm.loadIcon = false;
                        vm.loadGoods = false;
                        if (vm.pageNo == 1 && isEmptyObject(data.result.list)) {
                            $('.myorder-yc').css('display', 'block')
                            vm.goodsList = [];
                        }
                    }
                    $timeout(function() {
                        vm.mainScroll.refresh();
                    }, 200)
                } else {
                    vm.loadIcon = false;
                }
            })

        }
    }
})