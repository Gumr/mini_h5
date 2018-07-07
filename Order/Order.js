/**
 * order.js
 * @authors Casper 
 * @date    2017/08/19
 * @version 1.0.0
 */

define(['angular', 'css!./Order.css','css!./giftcard.css', 'css!./forgetBalancePassword.css', 'common/script/lib/swiper.min.js'], function(angular) {
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
        .controller('giftcardController', giftcardController)
        .controller('confirmpayController', confirmpayController)


    /*--------------------确认支付-------------------*/
    confirmpayController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$stateParams', '$customerService', '$productService', '$window'];

    function confirmpayController($scope, $state, $verifyService, $timeout, $stateParams, $customerService, $productService, $window) {
        var vm = this;
        $scope.flag = 1;
        $verifyService.SetIOSTitle("确认支付");
        $scope.isAgreement = true;
        $scope.paswd = ''; //支付密码
        $scope.balance = ''; //账户余额
        $scope.info = {
            payment: false, //弹层标识
            total: '',
            Price: '', //价格
            name: '分期支付',
            shareMakemoneyToken: sessionStorage.getItem('shareMakemoneyToken'), //从C端过来的标识
            code: '101', //支付方式
            tal: '', //合计应还
            fee: '',
            channelId: sessionStorage.channelId,
            // spikePirce: ''
        }

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'surepayment',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        monitor('enter','')


        $scope.sum = 0;


        // 余额支付可用余额
        $customerService.accountMount({}, localStorage.getItem("sinks-token")).success(function(data) {
            if (data.resultCode == '0000' || data.resultCode == '001') {
                $scope.balance = data.result.accountAmount
            } else {
                $scope.balance = 0
            }
        })

        $scope.periodsValue = ''; //期数
        $scope.isCart = JSON.parse(sessionStorage.getItem('cartList')); //获取购物车过来存的列表数据
        if($stateParams.flagbit == 'car'){
            $scope.isCart = false
        }
        $scope.businessType = sessionStorage.getItem('businessType'); //刷脸拿标识
        $scope.judge = $scope.businessType == null || $scope.businessType == 'null' ? true : false;
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload')); //用户信息
        $scope.confirm = JSON.parse(sessionStorage.getItem('confirm')); //订单信息
        $scope.mode = [/*{ name: '余额支付', code: '204', img: 'Order/images/tub3.png', balance: true },*/ { name: '微信支付', code: '201', img: 'Order/images/tub1.png' } /*,{name:'银联支付',code:'203'}*/ /*, { name: '分期支付', code: '101', img: 'Order/images/tub4.png' }*/]; //支付方式
        //vm.spikeStatus = JSON.parse(sessionStorage.getItem('confirm')).spikeStatus; //秒杀状态
        // $scope.spikePirce = JSON.parse(sessionStorage.getItem('confirm')).spikePirce;
        $scope.goodsNum = JSON.parse(sessionStorage.getItem('confirm')).goodsnum;
        // $scope.spikeAllPirce = $scope.spikePirce * $scope.goodsNum;
        //同意协议按钮
        $scope.agreementClick = function() {
                $scope.isAgreement = !$scope.isAgreement;
            }
            //  
        console.log($scope.confirm)
            //tabs
        $scope.method = function(code) {
            $scope.info.code = code;
            if (code == '101') {
                if($scope.info.total < 1000){
                    $scope.info.code = ''
                }else{
                    vm.show = true;
                    $('.stages').show();
                    $timeout(function() {
                        scroll('.main-content');
                    }, 300);
                    monitor('Installmentpayment','')
                }
            } else {
                $('.stages').hide();
                $timeout(function() {
                    scroll('.main-content');
                }, 300);
                if(code == '204'){
                    monitor('balancepayment','')
                }else if(code == '201'){
                    monitor('wechatpayment','')
                }
            }
        }

        
        // 汽车定金屏蔽分期支付
        if($stateParams.flagbit == 'car' || sessionStorage.getItem('goodsType') == 2){
            $scope.info.code = '204';
            vm.car = false;
            $scope.mode = [{ name: '余额支付', code: '204', img: 'Order/images/tub3.png', balance: true }, { name: '微信支付', code: '201', img: 'Order/images/tub1.png' }]; //支付方式
        }else{
            vm.car = true;
        }


        //tab选择分期数
        $scope.Obtain = function(periods, loanRate, feeRate, monthRepayPrincipalAmount, freeServerFee, index, e) {
            $scope.periodsValue = periods;
            $scope.info.Price = monthRepayPrincipalAmount;

            $scope.sum = 0;
            interest();
            // 获取优惠金额

            $customerService.getBillOrderMonthPaymentList({
                shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                loanPeriods: $scope.periodsValue,
                goodsOrderId: $scope.confirm.orderId
            },localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.repayment = data.result.preRepayPlan.repayPlanList;
                    $scope.freeServerFee = data.result.preRepayPlan.freeServerFee;
                    $scope.mark = $scope.repayment[0].freeInterest;
                    $scope.serverFee = data.result.preRepayPlan.serverFee;

                    angular.forEach($scope.repayment, function(array, index) {

                        $scope.sum += (array.repayAmount - array.principalAmount);

                    });
                    // console.log($scope.sum + $scope.serverFee)
                    $scope.reduced = $scope.info.total * (0.06 + 0.01 * $scope.periodsValue) - $scope.sum;
                    if($scope.reduced < 0){
                        $scope.reduced = 0
                    }

                }
            })

            if(periods == 3){
                monitor('Stage3','')
            }else if(periods == 6){
                monitor('Stage6','')
            }else if(periods == 9){
                monitor('Stage9','')
            }else if(periods == 12){
                monitor('Stage12','')
            }

            // $(e.currentTarget).addClass('current')
            // .siblings().removeClass('current');
        }
        $scope.alert = function() {
                $state.go('contract', {

                })
            }
            //自定义alert弹框
        $scope.theDialog = function(data) {
            repayment();

            $(".dialog-wrap1").fadeIn();
        }
        $scope.Close = function() {
                $(".dialog-wrap1").fadeToggle()
            }
            //分期协议跳转
        $scope.gostages = function() {
            $state.go('staging', {
                goodsId: $stateParams.goodsId,
                attributes: $stateParams.attributes,
                sku: $stateParams.sku,
                basicSoluPrice: $stateParams.basicSoluPrice,
                remark: vm.remark,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent,
                stages: vm.stages
            })
        }

        //初始化
        init()

        function init() {
            //			console.log(vm.spikeStatus)
            getConfirmOrder();
            sign();
             // 0元购
            if($scope.confirm.goodsId == 302462437588 || $scope.confirm.goodsId == 302462437569 || $scope.confirm.goodsId == 302462437548 || $scope.confirm.goodsId == 302462437527){
                $scope.method("101");
                $scope.mode = [{ name: '分期支付', code: '101', img: 'Order/images/tub4.png' }]; //支付方式
                vm.show = true
            }else if($scope.info.total < 1000){
                $scope.method("204")
                vm.show = false;
            }else{
                $scope.method("201");
                vm.show = false
            }
            
            if ($scope.info.total == 0) {
                if($scope.confirm.goodsId == 302462437588 || $scope.confirm.goodsId == 302462437569 || $scope.confirm.goodsId == 302462437548 || $scope.confirm.goodsId == 302462437527){
                    $scope.method("101")
                }else{
                    $scope.method("201")
                } 
            }
            // if ($scope.info.channelId != 16993204 && $scope.info.channelId != 16993205 && $scope.info.channelId != 1000010402) {
            //     $scope.mode = [{ name: '分期支付', code: '101', img: 'Order/images/tub4.png' }];
            // }

            if ($scope.info.channelId == 10000103 || $scope.info.channelId == 10000111 || $scope.info.channelId == 10000101 || $scope.info.channelId == 50000000 || $scope.info.channelId == 16426162741 || $scope.info.channelId == 1643230465057 || $scope.info.channelId == 100000000) {
                $scope.mode = [{ name: '分期支付', code: '101', img: 'Order/images/tub4.png' }];
            }

            // if ($stateParams.payType == '201' && $stateParams.payOpenId) {
            //     $scope.info.code = $stateParams.payType;
            //     wxzf();
            // }
            if ($scope.info.code == '101') {
                $('.stages').slideDown("slow");
            } else {
                $('.stages').slideUp("slow");
            }
        }




        function interest() {

            $customerService.getOrderActualFee({
                shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                goodsOrderId: $scope.confirm.orderId,
                loanPeriods: $scope.periodsValue,
                channelId: sessionStorage.channelId
            },localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode = '0000') {
                    $scope.info.tal = data.result.orderActualFee;
                    $scope.info.fee = $scope.info.tal - $scope.info.total;
                } /*else if (data.resultCode = '0000' && vm.spikeStatus == 1) {
                    console.log(data)
                    $scope.info.tal = data.result.orderActualFee;
                    $scope.info.fee = $scope.info.tal - $scope.spikePirce * $scope.goodsNum;
                }*/
            })
        }

        function ajax(callBack) {
            var form = new FormData();
            form.append("shoppingCartOrderId", sessionStorage.getItem('shoppingCartOrderId'));
            form.append("goodsOrderId", $scope.confirm.orderId ? $scope.confirm.orderId : '');
            form.append("openid", sessionStorage.getItem('openId'));
            alert("shoppingCartOrderId------"+sessionStorage.getItem('shoppingCartOrderId'));
            alert("goodsOrderId------"+$scope.confirm.orderId);
            alert("openid------"+sessionStorage.getItem('openId'));
            console.log(form)
            $.ajax({
                type: "POST",
                url: httpsHeader+"/mall/weixin/api/wxpayMiniProgramAction/wxPay.action",
                data : form,
                beforeSend: function(request) {
                  request.setRequestHeader("Authorication", localStorage.getItem("sinks-token"));
                },
                processData:false,
                contentType:false,
                success: function(data) {
                    callBack(data);
                },
                error: function(data) {
                    toolTip('系统异常，请稍后再试！');
                }
            });
        }

        //微信支付
        function wxzf() {
            ajax(function(data) {
                    console.log(JSON.parse(data).resultCode)
                    if (JSON.parse(data).resultCode == '1') {
                    let list = JSON.parse(data).resultData
                    if (list) {
                        let prepay_id = list.package.substring(10);
                        let params_str =
                          "nonceStr=" +
                          list.nonceStr +
                          "&timeStamp=" +
                          list.timeStamp +
                          "&prepay_id=" +
                          prepay_id +
                          "&paySign=" +
                          list.paySign +
                          "&signType=MD5";
                        console.log("params_str==" + params_str);
                        var path = '/pages/pay/pay?'+params_str;
                        // parms=={"appId":"wxbb2c62290840d0f0","partnerId":"1494376712","prepayId":"wx2018011819471290919bf3aa0411555226","nonceStr":"4c9d2ba1160f63bb9a816a49a6b4bd2d","timeStamp":"1516276032","packageValue":"Sign=WXPay","sign":"ECFC234ED5794FEC5C10B62304FE8AF1"}
                        console.log(wx)
                        wx.miniProgram.navigateTo({ url: path });
                      }
                } else {
                    toolTip(JSON.parse(data).errorDesc)
                }
            })
        }
        

        //获取还款计划
        function repayment() {
            $customerService.getBillOrderMonthPaymentList({
                shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                loanPeriods: $scope.periodsValue,
                goodsOrderId: $scope.confirm.orderId
            },localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.repayment = data.result.preRepayPlan.repayPlanList;
                    $scope.freeServerFee = data.result.preRepayPlan.freeServerFee;
                    $scope.mark = $scope.repayment[0].freeInterest;
                    $scope.serverFee = data.result.preRepayPlan.serverFee;
                    if ($scope.freeServerFee != 1) {
                        var a = $scope.repayment[0].interestFee + $scope.serverFee
                        data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                    }
                    if ($scope.freeServerFee == 1 && $scope.mark == 1) {
                        var a = $scope.repayment[0].interestFee + $scope.serverFee
                        data.result.preRepayPlan.repayPlanList[0].interestFee = a.toFixed(2);
                    }
                    if ($scope.mark == 1 && $scope.freeServerFee == 1) {
                        $scope.written = '第一期服务费包含手续费';
                    } else if ($scope.mark != 1 && $scope.freeServerFee == 1) {
                        $scope.written = '免手续费';
                    } else {
                        $scope.written = '第一期服务费包含手续费';
                    }
                    $(".dialog-wrap1").fadeIn();
                }
            })
        }

        //获取分期
        function getConfirmOrder() {
            $scope.info.total = $scope.confirm.paid;
            var wait = new waiting();
            $customerService.getLoanFeeInfo({
                shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                goodsOrderId: $scope.confirm.orderId
            },localStorage.getItem('sinks-token')).success(function(data) {
                wait.hide();
                if (data.resultCode == '0000') {
                    $scope.item = data.result.periodsFeeList;
                    angular.forEach($scope.item, function(data, index) {
                        if (data.freeInterest == '1') {
                            $scope.periodsValue = $scope.item[index].periods;
                            $scope.info.Price = $scope.item[index].monthRepayPrincipalAmount;
                        }
                    })

                    if ($scope.periodsValue == null || $scope.periodsValue == 0 || $scope.periodsValue == '' || $scope.periodsValue == undefined) {
                        $scope.periodsValue = 12;
                    }

                    if (data.result.couponGoodsFlag == 1) {
                        $scope.mode = [{ name: '微信支付', code: '201', img: 'Order/images/tub1.png' }];
                        $('.stages').hide();
                        $scope.info.code = '201';
                    }



                    // 获取优惠金额
                    $customerService.getBillOrderMonthPaymentList({
                        shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                        loanPeriods: $scope.periodsValue,
                        goodsOrderId: $scope.confirm.orderId
                    },localStorage.getItem('sinks-token')).success(function(data) {
                        if (data.resultCode == '0000') {
                            $scope.repayment = data.result.preRepayPlan.repayPlanList;
                            $scope.freeServerFee = data.result.preRepayPlan.freeServerFee; //手续费
                            $scope.mark = $scope.repayment[0].freeInterest;
                            $scope.serverFee = data.result.preRepayPlan.serverFee;

                            angular.forEach($scope.repayment, function(array, index) {



                                $scope.sum += (array.repayAmount - array.principalAmount);


                            });
                            // console.log($scope.sum + $scope.serverFee)

                            $scope.reduced = $scope.info.total * (0.06 + 0.01 * $scope.periodsValue) - $scope.sum
                            if($scope.reduced < 0){
                                $scope.reduced = 0
                            }

                        }
                    })
                }
                interest();
                $timeout(function() {
                    scroll('.main-content');
                }, 300);
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
                content: "您还尚未绑定银行卡，去绑卡或改用其他支付方式！",
                cancelBtnText: "取消",
                confirmBtnText: "去绑卡",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + localStorage.getItem('sinks-token') + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y' + '&businessType=' + $scope.businessType;
                    wait.hide();
                },
                cancelBtn:function(){
                    monitor('bindCardCancel','')
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //激活
        function activation() {
            new dialog().confirm({
                content: "您的信用额度尚未激活，去激活或改用其他支付方式！",
                cancelBtnText: "取消",
                confirmBtnText: "去激活",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + localStorage.getItem('sinks-token') + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType;
                    wait.hide();
                },
                cancelBtn:function(){
                    monitor('activateCancel','')
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //额度不够跳转
        function goactivation() {
            new dialog().confirm({
                content: '您的可用额度不足,补充房产或社保信息可提高额度或改用其他支付方式.',
                cancelBtnText: "取消",
                confirmBtnText: "去授信",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + localStorage.getItem('sinks-token') + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType;
                    wait.hide();
                },
                cancelBtn:function(){
                    monitor('goactivationCancel','')
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }




        //确认支付

        $scope.promotion = function() {
                if ($scope.info.code == '201') {
                    wxzf()
                } else if ($scope.info.code == '203') {
                    var wait = new waiting();
                    $customerService.doOrderBill({
                        shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                        payType: $scope.info.code,
                        goodsOrderId: $scope.confirm.orderId
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == '0000') {
                            location.href = data.result.payResult;
                        } else {
                            toolTip(data.resultMessage)
                        }
                    })
                } else if ($scope.info.code == '101') {
                        $customerService.checkUserQuota({
                            orderAmount: $scope.info.total
                        }).success(function(data) {
                            if (data.resultCode == "0000") {
                                if($scope.confirm.goodsId == 302462437588 || $scope.confirm.goodsId == 302462437569 || $scope.confirm.goodsId == 302462437548 || $scope.confirm.goodsId == 302462437527){
                                    var wait = new waiting();
                                    $customerService.doOrderBill({
                                        shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                                        payType: 204,
                                        goodsOrderId: $scope.confirm.orderId,
                                    }).success(function(data) {
                                        wait.hide();
                                        if (data.resultCode == '0000') {
                                            location.href = httpsHeader + '/ActivityProject/opurchase/success.html'
                                        } else {
                                            toolTip(data.resultMessage)
                                        }
                                    })
                                }else{
                                    $customerService.judgePassword({
    
                                    }, localStorage.getItem("sinks-token")).success(function(data) {
        
                                        if (data.resultCode == '0000') {
                                            new dialog().confirm({
                                                content: '<div class="ment" style="margin-top:-1rem;height:1.3rem;line-height:1.3rem;border-bottom:1px solid #dcdcdc;margin-left:-0.8rem;width:124%;color:#000;">分期支付</div><div style="padding:0.3rem 0;display:flex;display:-webkit-flex;justify-content:space-between;"><span>请输入支付密码</span><a class="forget" ui-sref="forgetBalancePassword" style="color: #007AFF;" ng-if="info.code==101">忘记密码</a></div><input class="tel" type="password" maxlength="6" class="pwd-input" id="pwd-input" ng-model="paswd" placeholder="请输入支付密码" style="border:1px solid #dcdcdc;text-align:left;width:99%;border-radius:0.15rem;">',
                                                cancelBtnText: "取消",
                                                confirmBtnText: "确定",
                                                confirmBtn: function() {
                                                    var value = $('#pwd-input').val();
                                                    if (value) {
                                                        var wait = new waiting();
                                                        $customerService.doOrderBill({
                                                            shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                                                            payType: $scope.info.code,
                                                            loanPeriods: $scope.periodsValue,
                                                            goodsOrderId: $scope.confirm.orderId,
                                                            payCode: value
                                                        }).success(function(data) {
                                                            wait.hide();
                                                            if (data.resultCode == '0000') {
                                                                monitor('installPaySuccess','')
                                                                $state.go('success', {
                                                                    goodsId:$stateParams.goodsId ? $stateParams.goodsId : ''
                                                                }, {
                                                                    location: 'replace'
                                                                })
                                                            }else if(data.resultCode == '01'){
                                                                toolTip('无法支付，请关注【乐道免息商城】公众号，咨询客服')
                                                            } else {
                                                                toolTip(data.resultMessage)
                                                            }
                                                        })
                                                    } else {
                                                        toolTip('请填写支付密码');
                                                    }
                                                },
                                                cancelBtn:function(){
                                                    monitor('InstallCancelmentpay','')
                                                }
                                            });
                                            $('.content').css('text-align', 'center');
                                            $('.content').css('font-size', '0.375rem');
                                            $('.ment').html('分期支付' + $scope.info.tal + '元');
                                            $('.content .forget').click(function() {
    
                                                $('.dialog-wrap').css('display', 'none')
                                                $state.go('forgetBalancePassword', {
    
                                                })
                                            })
                                        } else if (data.resultCode == '002') {
                                            sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href))
                                            $state.go('balancePassword', {
                                                code: 1
                                            }, {
                                                location: 'replace'
                                            })
                                        } else {
                                            toolTip(data.resultMessage)
                                        }
                                    })
                                }
                                
                            } else if (data.resultCode == "2000") { //未激活
                                activation();
                                monitor('nonactivated','')
                            } else if (data.resultCode == "2001") { //未绑卡，未设置密码
                                Card();
                                monitor('noOnCard','')
                            } else if (data.resultCode == "2002") { //商品价格高于授信额度
                                goactivation();
                                monitor('priceOverCredit','')
                            } else {
                                toolTip(data.resultMessage)
                            }
                        })
                } else if ($scope.info.code == '204') {
                    if ($scope.info.total == 0) {
                        var wait = new waiting();
                        $customerService.doOrderBill({
                            shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                            payType: $scope.info.code,
                            goodsOrderId: $scope.confirm.orderId,
                        }).success(function(data) {
                            wait.hide();
                            if (data.resultCode == '0000') {
                                $state.go('success', {
                                    payType: $scope.info.code,
                                }, {
                                    location: 'replace'
                                })
                            } else {
                                toolTip(data.resultMessage)
                            }
                        })
                    } else {
                        $customerService.accountMount({}, localStorage.getItem("sinks-token")).success(function(data) {
                            if (data.resultCode == '0000' || data.resultCode == '001') {
                                if (data.result.accountAmount >= $scope.info.total) {
                                    $customerService.judgePassword({

                                    }, localStorage.getItem("sinks-token")).success(function(data) {
                                        // alert(data.resultCode)
                                        if (data.resultCode == '0000') {
                                            new dialog().confirm({
                                                content: '<div class="ment" style="margin-top:-1rem;height:1.3rem;line-height:1.3rem;border-bottom:1px solid #dcdcdc;margin-left:-0.8rem;width:124%;color:#000;">余额支付</div><div style="padding:0.3rem 0;display:flex;display:-webkit-flex;justify-content:space-between;"><span>请输入支付密码</span><a class="forget" ui-sref="forgetBalancePassword" style="color: #007AFF;" ng-if="info.code==204">忘记密码</a></div><input class="tel" type="password" maxlength="6" class="pwd-input" id="pwd-input" ng-model="paswd" placeholder="请输入支付密码" style="border:1px solid #dcdcdc;text-align:left;width:99%;border-radius:0.15rem;">',
                                                cancelBtnText: "取消",
                                                confirmBtnText: "确定",
                                                confirmBtn: function() {
                                                    var value = $('#pwd-input').val();
                                                    console.log(value)
                                                    if (value) {
                                                        var wait = new waiting();
                                                        $customerService.doOrderBill({
                                                            shoppingCartOrderId: sessionStorage.getItem('shoppingCartOrderId'),
                                                            payType: $scope.info.code,
                                                            goodsOrderId: $scope.confirm.orderId,
                                                            payCode: value
                                                        }).success(function(data) {
                                                            wait.hide();
                                                            if (data.resultCode == '0000') {
                                                                monitor('balancePaySuccess','')
                                                                $state.go('success', {
                                                                    payType: $scope.info.code,
                                                                    goodsId:$stateParams.goodsId ? $stateParams.goodsId : ''
                                                                }, {
                                                                    location: 'replace'
                                                                })
                                                            } else if (data.resultCode == '003') {
                                                                toolTip('支付密码错误')
                                                            } else if (data.resultCode == '001') {
                                                                toolTip('账号不存在,订单结算失败')
                                                            } else if (data.resultCode == '004') {
                                                                toolTip(data.resultMessage)
                                                            }
                                                        })
                                                    } else {
                                                        toolTip('请填写支付密码');
                                                    }
                                                },
                                                cancelBtn:function(){
                                                    monitor('balanceCancelpay','')
                                                }
                                            });
                                            $('.content').css('text-align', 'center');
                                            $('.content').css('font-size', '0.375rem');
                                            $('.ment').html('余额支付' + $scope.info.total + '元');
                                            $('.content .forget').click(function() {

                                                $('.dialog-wrap').css('display', 'none')
                                                $state.go('forgetBalancePassword', {

                                                })
                                            })
                                        } else if (data.resultCode == '002') {
                                            sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href))
                                            $state.go('balancePassword', {
                                                code: 1
                                            }, {
                                                location: 'replace'
                                            })
                                        } else {
                                            toolTip(data.resultMessage)
                                        }
                                    })

                                } else {
                                    new dialog().confirm({
                                        content: '余额不足',
                                        cancelBtnText: "取消",
                                        confirmBtnText: "去充值",
                                        confirmBtn: function() {
                                            var wait = new waiting();
                                            // $window.sessionStorage.setItem('rechargeFromUrl','order');
                                            sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href))
                                            $state.go('recharge', {

                                            }, {
                                                location: 'replace'
                                            })
                                            wait.hide();
                                        },
                                        cancelBtn:function(){
                                            monitor('balanceLessCancelpay','')
                                        }
                                    })
                                    $('.content').css('text-align', 'center')
                                    $('.content').css('font-size', '0.4rem')
                                    $('.content h1').css('font-weight', 'bold')
                                }
                            } else {
                                toolTip(data.resultMessage)
                            }
                        })
                    }


                }else{
                    toolTip('请选择支付方式')
                }
            }
            // if($scope.flag == 1){
            // 	$(function(){  
            // 		pushHistory();  
            // 		var bool=false;  
            // 		setTimeout(function(){  
            // 			  bool=true;  
            // 		},1500);  
            // 		window.addEventListener("popstate", function(e) {  
            // 		  if(bool)  
            // 			{  
            // 				new dialog().confirm({
            // 					content : '<h1>'+'确定要离开？'+'</h1>'+'您的订单在23小时59分内未支付将被取消，请尽快完成支付',
            // 					cancelBtnText : "继续支付",
            // 					confirmBtnText : "确认离开",
            // 					confirmBtn : function(){
            // 						var wait = new waiting();		
            // 						window.location.href='#/myCenter';
            // 						wait.hide();
            // 						$('.dialog-wrap').css('display','none')
            // 					},
            // 					cancelBtn : function(){
            // 						var wait = new waiting();				
            // 						pushHistory();
            // 						wait.hide();
            // 					}
            // 				})
            // 				$('.content').css('text-align','center')
            // 				$('.content').css('font-size','0.4rem')
            // 				$('.content h1').css('font-weight','bold')
            // 			}  


        // 	}, false);
        // 	function pushHistory() {  
        // 		var state = {  
        // 			title: "title",  
        // 			url: "#/confirmpay"  
        // 		};  
        // 		window.history.pushState(state, "title", "#/confirmpay");  
        // 	}
        // 	});
        // }

    }
    /*--------------------忘记余额支付密码-------------------*/
    angular.module('app').controller('forgetBalancePasswordController', forgetBalancePasswordController);
    forgetBalancePasswordController.$inject = ['$scope', '$state', '$q', '$verifyService', '$userService', '$stateParams'];

    function forgetBalancePasswordController($scope, $state, $q, $verifyService, $userService, $stateParams) {
        var vm = this;
        vm.phoneNum = JSON.parse(localStorage.getItem('$$payload')).mobile;
        vm.header = 'https://user.hlej.com/hlej/verify/getVerifyCodeForH5?sessionId=';
        vm.checkCode = "";
        vm.SMCode = "";
        vm.verifyForm = verifyForm;
        vm.verifyCode = vm.header + $scope.sessionKey + '&verifyType=forgetBalanceAccountPwd&t=' + Math.random();
        vm.newPassword = "";
        $scope.sessionKey = "";
        vm.send = send;
        $scope.qiqi = false;
        $scope.resultmess = '';
        //密码显示隐藏
        vm.passwordShow = passwordShow;
        // console.log(JSON.parse(localStorage.getItem('$$payload')).mobile)

        //
        function send() {
            var wait = new waiting();
            $userService.sendMessage({
                phoneNum: vm.phoneNum,
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    closeBtn();
                    setTime(60);
                    toolTip("短信验证码发送成功,请注意查收!");
                } else {
                    toolTip(data.resultMessage);
                }
            });
            wait.hide();
        }


        action();

        function action() {
            $verifyService.SetIOSTitle("忘记余额支付密码");
            openBtn();
        }

        function verifyForm() {
            if (vm.phoneNum != null && vm.phoneNum != "" && $verifyService.isPhoneNum(vm.phoneNum)) {
                if (vm.SMCode != null && vm.SMCode != "") {
                    if (vm.newPassword != null && vm.newPassword != "" && vm.newPassword.length == 6) {
                        $userService.resetBalancePassword({
                            phoneNum: vm.phoneNum,
                            checkCode: vm.SMCode,
                            newPayPassword: vm.newPassword,
                        }, localStorage.getItem("sinks-token")).success(function(data) {
                            if (data.resultCode == "0000") {
                                toolTip('余额支付密码重置成功')
                                if ($stateParams.state == 'machine') {
                                    if (sessionStorage.getItem('machineForgetUrl')) {
                                        location.href = JSON.parse(sessionStorage.getItem('machineForgetUrl'));
                                        sessionStorage.removeItem("machineForgetUrl");
                                    }
                                }else if($stateParams.state == 'confirm'){
                                    $state.go($stateParams.state, {
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
                                        pricenum: $stateParams.pricenum,
                                        couponCode: $stateParams.couponCode,
                                        couponContent: $stateParams.couponContent,
                                        cardCode: $stateParams.cardCode, 
                                        cardContent: $stateParams.cardContent,
                                    }, {
                                        location: 'replace'
                                    });
                                } else {
                                    $state.go("confirmpay", null, {
                                        location: 'replace'
                                    });
                                }

                            } else {
                                toolTip(data.resultMessage);
                            }
                        });
                    } else {
                        toolTip("请输入6位数字密码")
                    }
                } else {
                    toolTip("请输入手机验证码")
                }
            } else {
                toolTip("请输入正确的手机号码")
            }
        }
    }

    function openBtn() {
        $('.info-btn').html('获取验证码');
        $('.info-btn').attr('disabled', false);
    }

    function closeBtn() {
        $('.info-btn').attr('disabled', true);
        $('.info-btn').html('重新发送<span>' + 60 + '</span>(s)');
    }

    function setTime(time) {
        var timer = setInterval(function() {
            time--;
            $('.info-btn').find('span').text(time)
            if (time <= 0) {
                clearInterval(timer);
                $('.info-btn').html('获取验证码');
                $('.info-btn').attr('disabled', false);
            }
        }, 1000)
    }
    /*--------------------卡券信息-------------------*/
    confricardController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address', '$cardService','$productService'];

    function confricardController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address, $cardService,$productService) {
        var vm = this;
        $verifyService.SetIOSTitle("卡券信息");
        vm.pageNo = 1;
        vm.loadIcon = true; //加载loading
        vm.loadGoods = true;
        vm.loadEnd = true;
        vm.couponCode = '' || $stateParams.couponCode;
        vm.couponContent = '' || $stateParams.couponContent;
        vm.cardCode = $stateParams.cardCode;//购房通卡券
        vm.cardContent = parseFloat($stateParams.cardContent) || 0;
        $scope.accountPayable = $stateParams.pricenum;
        vm.stages = parseInt($stateParams.stages);
        $scope.couponCode = $stateParams.couponCode;
        vm.off = '';
        vm.item = '';
        $scope.freePeriods = parseInt(sessionStorage.getItem('freePeriods'));
        $scope.endname = '';
        if ($stateParams.couponCode) {
            vm.item = $stateParams.couponCode;
        }

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


        //跳转回确认订单
        $scope.Place = function() {
            if (!sessionStorage.getItem('confirm')) {
                $state.go('tourism-order', {
                    addressId: $stateParams.addressId,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    id: $stateParams.goodsId,
                    stages: $stateParams.stages,
                    orderstate: $stateParams.orderstate,
                    ordertext: $stateParams.ordertext,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent,
                    cardCode: vm.cardCode,
                    cardContent: vm.cardContent,
                })
            } else {
                $state.go('confirm', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    goodsId: $stateParams.goodsId,
                    stages: $stateParams.stages,
                    remark: $stateParams.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    // spikePirce: $stateParams.spikePirce,
                    // spikeStatus: $stateParams.spikeStatus,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent,
                    cardCode: vm.cardCode,
                    cardContent: vm.cardContent,
                    addressId: $stateParams.addressId
                })
            }
        }

        if ($('.myCard .cardBox3 .card-i').attr("class") == 'card-i active') {

        }
        console.log($('.myCard .card-i'))

        //tabs切换
        vm.handover = function(e, userConponNum, couponContent, couponType) {
            if ($(e.currentTarget).attr("class") == 'card-i active') {
                // $(e.currentTarget).parents('.myCard .cardBox3').css('background', 'url("./Order/images/coup.png")  no-repeat')
                // $(e.currentTarget).parents('.myCard .cardBox3').find('b').css('color', '#aeadad')
            } else {
                // $(e.currentTarget).parents('.myCard .cardBox3').css('background', 'url("./Order/images/coup1.png")  no-repeat')

                // $(e.currentTarget).parents('.myCard .cardBox3').siblings('.myCard .cardBox3').css('background', 'url("./Order/images/coup.png")  no-repeat')
                // $(e.currentTarget).parents('.myCard .cardBox3').siblings('.myCard .cardBox3').find('b').css('color', '#aeadad')
                // $(e.currentTarget).parents('.myCard .cardBox3').find('b').css('color', '#fe9b2a')
            }
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
            var sing = [{ goodsNum: $stateParams.goodsnum, goodsId: $stateParams.goodsId, attributes: $stateParams.attributes }];
            var cartList = JSON.parse(sessionStorage.getItem('cartList'));
            if (cartList) {
                var sing = [];
                for (var i = 0; i < cartList.length; i++) {
                    var json = {
                        goodsNum: cartList[i].goodsNum + '',
                        goodsId: cartList[i].goodsId + '',
                    }
                    sing.push(json);
                }
            }
            //获取可用优惠卷数量
            $cardService.getActivityCoupon({
                couponStatus: '2',
                pageNo: vm.pageNo,
                pageSize: 100,
                goodsInfo: sing
            }, localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result.activityCouponList)) {
                        vm.loadIcon = false;
                        angular.forEach(data.result.activityCouponList, function(data1) {
                            data1.couponName = data1.couponName.replace("(贷款)", "")
                            if (data1.useLimit == '') {
                                data1.useLimit = 0;
                            }
                            if ((data1.couponType == '10020003' && parseFloat(data1.useLimit) <= parseFloat($scope.accountPayable)) || (data1.couponType == '10020001' && parseFloat(data1.useLimit) <= parseFloat($scope.accountPayable) && vm.stages == data1.couponContent)) {
                                data1.orderStatus = true;
                            } else {
                                data1.orderStatus = false;
                            }
                            if ((data1.couponType == '10020003' && parseFloat(data1.useLimit) <= parseFloat($scope.accountPayable)) || (data1.couponType == '10020001' && (parseFloat(data1.useLimit) <= parseFloat($scope.accountPayable)) && data1.couponContent == vm.stages)) {
                                data1.orderAmount = false;
                            } else {
                                data1.orderAmount = true;
                            }
                        })
                        if (vm.pageNo == 1) {
                            vm.goodsList = data.result.activityCouponList;
                            if (data.result.total <= 10) {
                                vm.loadGoods = false;
                                vm.loadIcon = false;
                            }
                        } else {
                            angular.forEach(data.result.activityCouponList, function(data) {
                                vm.goodsList.push(data);
                            })
                        }

                        vm.loadEnd = true;
                    } else {
                        if (data.result.total == 0) {
                            vm.fiction = true;
                            vm.goodsList = data.result.activityCouponList;
                        }
                        vm.loadIcon = false;
                        vm.loadGoods = false;
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


    /*--------------------购房通礼品卡-------------------*/
    giftcardController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address', '$cardService','$productService'];

    function giftcardController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address, $cardService,$productService) {
        var vm = this;
        $verifyService.SetIOSTitle("礼品卡");
        vm.loadIcon = true; //加载loading
        vm.loadGoods = true;
        vm.loadEnd = false;
        vm.cardCode = '' || $stateParams.cardCode;
        vm.cardContent = '' || $stateParams.cardContent;
        vm.seclect = '可用';
        $scope.accountPayable = $stateParams.pricenum;
        vm.stages = parseInt($stateParams.stages);
        $scope.couponCode = $stateParams.couponCode;
        vm.goodsList = [];
        vm.mobile = JSON.parse(localStorage.getItem('$$payload')).mobile;
        vm.coupinstatus = 1;
        vm.item = '';
        $scope.endname = '';
        vm.fiction = false;
        if ($stateParams.cardCode) {
            vm.item = $stateParams.cardCode;
        }

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'giftcard',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        vm.tabList = [
            {name:'可用',num:1},
            {name:'不可用',num:2}
        ]

        $scope.switchover=function(name,code){
            vm.seclect = name;
            vm.coupinstatus = code;
            getGoodsList();
        }

        $scope.hit=function(e, userCardNum, cardContent){
            if(vm.seclect == '可用'){
                vm.cardContent = cardContent;
                if (vm.item === userCardNum) {
                    vm.item = '';
                    vm.cardContent = '';
                    vm.cardCode = '';
                    return false;
                } else {
                    vm.cardCode = userCardNum;
                }
                    vm.item = userCardNum;
            }
        }

         //初始化
         init()
         function init(){
             getGoodsList();
             vm.mainScroll = scroll('.main-content');
            //  vm.mainScroll.on('scrollEnd', function () {
            //      vm.loadIcon = true;                              	//加载loading
            //      vm.loadGoods = true;                     
            //      if( this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd){
            //          vm.loadEnd = false;
            //          getGoodsList();
            //          $timeout(function(){
            //              vm.mainScroll.refresh();
            //          },200)
            //      }
            //  })
         }

         function getGoodsList(){
			$cardService.getGiftCard({
				status : vm.coupinstatus
			},localStorage.getItem("sinks-token")).success(function(data){
				if(data.retCode =='0000'){
					if(!isEmptyObject(data.retData)){ 
	        			vm.fiction = false;  
			 	 		vm.goodsList = data.retData;
                        vm.loadEnd = true;
                        vm.loadIcon = false;
                        vm.loadGoods = false; 
			 	 	}else{
			 	 		if(data.retData.length == 0){
	                        vm.fiction = true;
	                        vm.goodsList = data.retData;
			 	 		}
			 	 		vm.loadIcon = false;
                        vm.loadGoods = false;  
                    }
			 	 	$timeout(function(){
                        vm.mainScroll.refresh();
                    },200)
				}else{
			 		vm.loadIcon = false; 
                   	toolTip(data.resultMessage)
			 	}
			})
        }
        
        //跳转回确认订单
        $scope.Place = function() {
            if (!sessionStorage.getItem('confirm')) {
                $state.go('tourism-order', {
                    addressId: $stateParams.addressId,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    id: $stateParams.goodsId,
                    stages: $stateParams.stages,
                    orderstate: $stateParams.orderstate,
                    ordertext: $stateParams.ordertext,
                    cardCode: vm.cardCode,
                    cardContent: vm.cardContent,
                })
            } else {
                $state.go('confirm', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    goodsId: $stateParams.goodsId,
                    stages: $stateParams.stages,
                    remark: $stateParams.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    // spikePirce: $stateParams.spikePirce,
                    // spikeStatus: $stateParams.spikeStatus,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    cardCode: vm.cardCode,
                    cardContent: vm.cardContent,
                    addressId: $stateParams.addressId
                })
            }
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
            if ($stateParams.flog == '1') {
                $state.go('tourism-order', {
                    id: $stateParams.goodsId,
                    stages: $stateParams.stages
                })
            } else {
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
    }

    /*--------------------付款成功-------------------*/
    successController.$inject = ['$scope', '$state', "$verifyService", "userInfo", "$timeout", '$customerService', '$stateParams', '$address','$productService'];

    function successController($scope, $state, $verifyService, userInfo, $timeout, $customerService, $stateParams, $address,$productService) {
        var vm = this;
        $verifyService.SetIOSTitle("付款成功");
        $('.main-content').css('background', '#fff');
        vm.goodsMoney = $stateParams.goodsMoney;
        vm.payType = $stateParams.payType;
        $scope.quota = '';
        $scope.shareGoodsId = sessionStorage.getItem('shareGoodsId')//拼团商品
        vm.group = false;
        //拼团
        if($scope.shareGoodsId == 72307473007||$scope.shareGoodsId == 3023597417261||$scope.shareGoodsId == 73137128830||$scope.shareGoodsId == 3023597416921||$scope.shareGoodsId == 72307463347){
            vm.group = true;
            $productService.getDetails($scope.shareGoodsId).success(function(data) {
                if(data.resultCode == '0000'){
                    var imgUrl = 'https://image.funsales.com/'
                    share(data.result.goodsName,data.result.salePrice,data.result.periods,$scope.shareGoodsId,imgUrl+data.result.thumbImgUrl);
                }
            })
        }else{
            vm.group = false;
        }
        // console.log($stateParams)
        init()

        function init() {
            if (userInfo.data.resultCode == "0000") {
                $customerService.queryUserAccountInfo({},localStorage.getItem("sinks-token")).success(function(data) {
                    $scope.quota = data.result.lines.surplus;
                })
            }
        }
        // console.log(wx)

        vm.monitor = monitor; //埋点
        // console.log(wx)
        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'Paytocomplete page',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

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

        $scope.share1=function(){
            $('.main-content.group .modal').css('display','block')
        }
        $scope.share2=function(){
            $('.main-content.group .modal').css('display','none')
        }

        // 拼团分享
        function share(name,price,periods,id,img){
            console.log(name+'-----'+id+'----'+img)
            var api={  
                getSignature:'https://www.funsales.com/mall/weixinshareApi/getSignature.action',//获取微信签名
            };
            var strUrl=encodeURI(location.href.split('#')[0]);
            strUrl.replace(/(^\s*)|(\s*$)/g, "");
            var link = 'https://www.funsales.com/mallh5/#/productDetails?goodsId='+id;
            var desc = name+'拼团价仅'+price+'元！'+'还可享'+periods+'期免息';
            console.log(link+'----'+desc)
            var shareType={wxFriend:"微信好友",wxCircle:"微信朋友圈",qqFriend:"QQ好友",QZone:"QQ空间",url:strUrl};
            var shareContent={title:"您的好友邀请您来拼团啦",
                desc:desc,
                link:link,
                imgUrl:img};
            $.ajax({
                url: api.getSignature, type: "POST", dataType: "json",
                data:{url:shareType.url},
                success: function(data){
                    var dataFind=data.result;
                    var dataFindNext=dataFind.data;
                    console.log(dataFindNext);
                    wx.config({
                        debug: false,// 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: dataFindNext.appid,// 必填，公众号的唯一标识
                        timestamp:dataFindNext.timestamp,// 必填，生成签名的时间戳
                        nonceStr:dataFindNext.noncestr, // 必填，生成签名的随机串
                        signature:dataFindNext.jsSign,// 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage','onMenuShareQQ','onMenuShareQZone']
                    });
                    wx.ready(function(){
                        console.log("初始化成功");
            //          alert(localStorage.getItem('phoneNum'))
                        //分享给朋友
                        wx.onMenuShareAppMessage({
                            title: shareContent.title,
                            desc: shareContent.desc,
                            link: shareContent.link,
                            imgUrl: shareContent.imgUrl,
                            trigger: function (res) {
                                
                            },
                            success: function (res) {
                                $productService.doUserTrace({
                                    channelId: sessionStorage.getItem('channelId'),
                                    page: 'share_group',
                                    pageModule: '微信好友',
                                    pageValue: id
                                }).success(function(data) {
                    
                                })
                            },
                            cancel: function (res) {
                                  toolTip('分享已取消');
                            },
                            fail: function (res) {
                                //tip('分享失败');
                            }
                        });
                        // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口---分享到朋友圈
                        wx.onMenuShareTimeline({
                            title: shareContent.title,
                            desc: shareContent.desc,
                            link: shareContent.link,
                            imgUrl: shareContent.imgUrl,
                            trigger: function (res) {
            //                    tip('用户点击分享到朋友圈');
                            },
                            success: function (res) {
                                $productService.doUserTrace({
                                    channelId: sessionStorage.getItem('channelId'),
                                    page: 'share_group',
                                    pageModule: '微信朋友圈',
                                    pageValue: id
                                }).success(function(data) {
                    
                                })
                            },
                            cancel: function (res) {
                                  toolTip('分享已取消');
                            },
                            fail: function (res) {
                                //tip('分享失败');
                            }
                        });
                        //分享到QQ
                        wx.onMenuShareQQ({
                            title: shareContent.title,
                            desc: shareContent.desc,
                            link: shareContent.link,
                            imgUrl: shareContent.imgUrl,
                            trigger: function (res) {
                                //tip('用户点击分享到QQ');
                            },
                            success: function (res) {
                                $productService.doUserTrace({
                                    channelId: sessionStorage.getItem('channelId'),
                                    page: 'share_group',
                                    pageModule: 'QQ好友',
                                    pageValue: id
                                }).success(function(data) {
                    
                                })
                            },
                            cancel: function (res) {
                                   toolTip('分享已取消');
                            },
                            fail: function (res) {
                                //tip('分享失败');
                            }
                        });
                        //分享到QQ空间
                        wx.onMenuShareQZone({
                            title: shareContent.title,
                            desc: shareContent.desc,
                            link: shareContent.link,
                            imgUrl: shareContent.imgUrl,
                            trigger: function (res) {
                                //tip('用户点击分享到QQ空间');
                            },
                            success: function (res) {
                                $productService.doUserTrace({
                                    channelId: sessionStorage.getItem('channelId'),
                                    page: 'share_group',
                                    pageModule: 'QQ空间',
                                    pageValue: id
                                }).success(function(data) {
                    
                                })
                            },
                            cancel: function (res) {
                                  toolTip('分享已取消');
                            },
                            fail: function (res) {
                                //tip('分享失败');
                            }
                        });
                        wx.error(function (res) {
                         console.log(res)
                         });
                    });
                }
            });
                        
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
    invoController.$inject = ['$scope', '$state', "$verifyService", "$timeout", '$customerService', '$stateParams', '$address','$productService'];

    function invoController($scope, $state, $verifyService, $timeout, $customerService, $stateParams, $address,$productService) {
        var vm = this;
        vm.text = "";
        vm.go = $stateParams.flag
        $verifyService.SetIOSTitle("发票信息");
        var a = $stateParams.invoiceTitle;
        var cartIndex = $stateParams.cartIndex;
        var isCart = JSON.parse(sessionStorage.getItem('cartList'));
        $timeout(function() {
            scroll('.main-content');
        }, 300);
        if (cartIndex) {
            var invoiceContent = isCart[cartIndex].invoiceContent;
            var invoiceIsCompany = isCart[cartIndex].invoiceIsCompany;
        } else {
            var invoiceContent = $stateParams.invoiceContent;
            var invoiceIsCompany = $stateParams.invoiceIsCompany;
        }
        if (invoiceContent == '明细') {
            $('.f3').addClass('active');
            vm.invoiceContent = "明细";
        } else if (invoiceContent == '办公用品') {
            $('.f4').addClass('active')
            vm.invoiceContent = "办公用品";
        } else if (invoiceContent == '电脑配件') {
            $('.f5').addClass('active')
            vm.invoiceContent = "电脑配件";
        } else if (invoiceContent == '耗材') {
            $('.f6').addClass('active')
            vm.invoiceContent = "耗材";
        }
        if (invoiceIsCompany == 0) {
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
        vm.handover = function(myevent) {
            $(myevent.currentTarget).addClass('active')
                .siblings().removeClass('active');
            if ($(myevent.currentTarget).attr("class") == 'f1 active') {
                vm.invoiceTitle = "个人";
                vm.invoiceIsCompany = 0
                vm.placeholder = "";
                vm.text = "";
                $('.invoice-text').prop("readonly", true);
                $('.invoice-section-list2 .invoice-text').css('border-bottom', '');
                monitor('invoicetitle','个人')
            } else {
                vm.invoiceTitle = "";
                vm.invoiceIsCompany = 1
                vm.placeholder = "请输入公司名称";
                $('.invoice-section-list2 .invoice-text').css('border-bottom', '0.013333rem solid #eee')
                if ($stateParams.invoiceTitle != '个人') {
                    vm.text = $stateParams.invoiceTitle;
                }
                $('.invoice-text').prop("readonly", false);
                monitor('invoicetitle','公司')
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
            monitor('invoicecontent','明细')
        }

        $scope.gocomfirm = function() {
            if (vm.invoiceIsCompany == 1 && (vm.text == '' || vm.text == null)) {
                toolTip('请填写公司名称')
            } else if (vm.invoiceContent == undefined) {
                toolTip('请填写发票内容')
            } else if (vm.invoiceIsCompany == undefined) {
                toolTip('请填写发票抬头')
            } else {
                if (cartIndex) {
                    isCart[cartIndex].invoiceType = '0';
                    isCart[cartIndex].invoiceTitle = vm.invoiceTitle || vm.text;
                    isCart[cartIndex].invoiceContent = vm.invoiceContent;
                    isCart[cartIndex].invoiceIsCompany = vm.invoiceIsCompany;
                    sessionStorage.setItem("cartList", JSON.stringify(isCart));
                }
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
                    cardCode: $stateParams.cardCode,
                    cardContent: $stateParams.cardContent,
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
        // $scope.spikeStatus = $stateParams.spikeStatus;
        // $scope.spikePirce = $stateParams.spikePirce;
        // $scope.spikeAllPirce = $scope.spikePirce * vm.goodsNum
        vm.Choice = '';
        vm.choiceCard = '';//礼品卡是否选择
        $scope.password = '';//支付密码
        vm.fromPage = 1;
        vm.theDialog = theDialog;
        vm.jd = '自营';
        vm.express = '快递包邮'
        vm.total = 0;
        vm.mode = $stateParams.payment || '选择支付方式';
        vm.bystages = false;
        vm.remark = '' || $stateParams.remark;
        vm.couponCode = $stateParams.couponCode;
        vm.couponContent = parseFloat($stateParams.couponContent) || 0;
        vm.totalCard = 0;//礼品卡
        vm.cardCode = $stateParams.cardCode;//购房通卡券
        vm.cardContent = parseFloat($stateParams.cardContent) || 0;
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
        $scope.selectionperiod = '分期';
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

        $scope.isCart = JSON.parse(sessionStorage.getItem('cartList')); //获取购物车过来存的列表数据
        if($stateParams.flagbit == 'car'){
            $scope.isCart = false
        }
        var couponList = JSON.parse(sessionStorage.getItem('couponList')); //获取选中的优惠券信息
        var couponListLength = 0; //已选中的优惠券数量
        for (var key in couponList) {
            couponListLength++
        }
        console.log($scope.isCart);
        $scope.attributes = $scope.isCart ? $scope.isCart.goodsAttrInfo : $stateParams.attributes;

        $scope.cartList = []; //商品列表
        $scope.huilImaUrl = imgUrl; //自营商品图片前缀
        $scope.jdImaUrl = $productService.imgUrl[0]; //京东图片前缀
        $scope.orderTotalAmount = 0; //订单总额--购物车
        $scope.firstMonthAmount = 0; //首期月供--购物车
        $scope.discountedAmount = 0; //优惠合计--购物车
        $scope.consigneeId = ''; //收货地址
        sessionStorage.removeItem('place'); //删除商品详情页前往登录保留的信息;
        $scope.info = {
            shareMakemoneyToken: sessionStorage.getItem('shareMakemoneyToken'), //从C端过来的标识
            paid: '' //实付总额
        }
        $scope.couponAmount = '';
        $scope.cardAmount = $stateParams.cardContent || 0;


        if ($stateParams.couponCode) {
            vm.Choice = '已选1张';
        }

        if($stateParams.cardCode){
            vm.choiceCard = '已选礼品卡'
        }

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

        // 0元购
        if($stateParams.goodsId == 302462437588 || $stateParams.goodsId == 302462437569||$stateParams.goodsId == 302462437548||$stateParams.goodsId == 302462437527){
            vm.show = false;
        }else{
            vm.show = true;
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
                // spikePirce: $stateParams.spikePirce,
                // spikeStatus: $stateParams.spikeStatus,
                attributes: $stateParams.attributes,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                payment: EL.voucher.val() || $stateParams.payment,
                basicSoluPrice: $stateParams.basicSoluPrice,
                pricenum: $scope.accountPayable,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent,
                cardCode: vm.cardCode, 
                cardContent: vm.cardContent,
                accountPayable: $scope.accountPayable,
                paid: $scope.info.paid
            }
            sessionStorage.setItem('confirm', JSON.stringify(a))
        }


        //跳转到发票
        $scope.goinvoice = function(index) {
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
                    cardCode: vm.cardCode,
                    cardContent: vm.cardContent,
                    stages: vm.stages,
                    cartIndex: index
                })
            }
            //分期协议跳转
        $scope.alert = function() {
                $state.go('contract', {

                })
            }
            //自定义alert弹框
        function theDialog(data) {
            $(".dialog-wrap1").fadeIn();
            setmonth(data);
        }
        $scope.Close = function() {
            $(".dialog-wrap1").fadeToggle()
        }


        //跳转到卡卷信息
        $scope.card = function() {
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
                pricenum: $scope.accountPayable,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent,
                cardCode: vm.cardCode,
                cardContent: vm.cardContent,
                addressId: $stateParams.addressId,
            })
        }

        // 跳转到礼品卡页面
        $scope.giftCard=function(){
            $state.go('giftcard', {
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
                pricenum: $scope.accountPayable,
                couponCode: vm.couponCode,
                couponContent: vm.couponContent,
                cardCode: vm.cardCode,
                cardContent: vm.cardContent,
                addressId: $stateParams.addressId,
                cardCode: vm.cardCode,
                cardContent: vm.cardContent,
            })
        }

        //购物车跳转到卡卷信息
        $scope.cartCard = function(data, index) {
            for (var i = 0; i < $scope.isCart.length; i++) {
                $scope.isCart[i].remark = $scope.cartList[i].remark; //更新session缓存里当前购物车商品的优惠券信息
                sessionStorage.setItem("cartList", JSON.stringify($scope.isCart));
            }
            $state.go('confricard', {
                remark: vm.remark,
                goodsId: data.goodsId,
                stages: data.loanPeriods,
                goodsnum: data.goodsnum,
                salePrice: data.salePrice,
                pricenum: data.salePrice,
                couponCode: data.couponCode,
                couponContent: data.couponContent,
                cartIndex: index
            })
        }
        

        //跳转到收货地址
        $scope.goaddAddress = function() {
            if ($scope.list == '新增收货地址') {
                $state.go('deliveryAddress', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    fromPage: 'confirm',
                    zet: 'confirm',
                    goodsId: $stateParams.goodsId,
                    stages: vm.stages,
                    remark: vm.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    // spikePirce: $stateParams.spikePirce,
                    // spikeStatus: $stateParams.spikeStatus,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: EL.voucher.val() || $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent,
                    flagbit : $stateParams.flagbit
                })
            } else {
                $state.go('addAddress', {
                    invoiceType: $stateParams.invoiceType,
                    sku: $stateParams.sku,
                    fromPage: 'confirm',
                    goodsId: $stateParams.goodsId,
                    stages: vm.stages,
                    remark: vm.remark,
                    goodsnum: $stateParams.goodsnum,
                    salePrice: $stateParams.salePrice,
                    // spikePirce: $stateParams.spikePirce,
                    // spikeStatus: $stateParams.spikeStatus,
                    attributes: $stateParams.attributes,
                    invoiceTitle: $stateParams.invoiceTitle,
                    invoiceContent: $stateParams.invoiceContent,
                    invoiceIsCompany: $stateParams.invoiceIsCompany,
                    payment: EL.voucher.val() || $stateParams.payment,
                    basicSoluPrice: $stateParams.basicSoluPrice,
                    couponCode: vm.couponCode,
                    couponContent: vm.couponContent,
                    flagbit : $stateParams.flagbit
                })
            }

        }



        function address() {
            //根据ID获取收货地址
            $address.getObtain({
                consigneeId: $stateParams.addressId || ''
            }).success(function(data) {
                if (!isEmptyObject(data.result)) {
                    $scope.provinceId = data.result.provinceId;
                    $scope.cityId = data.result.cityId;
                    $scope.countyId = data.result.countyId;
                    $scope.townId = data.result.townId;
                    $scope.townName = data.result.townName || '';

                    data.result.cityName = data.result.cityName ? data.result.cityName : '';
                    data.result.countyName = data.result.countyName ? data.result.countyName : '';
                    data.result.townName = data.result.townName ? data.result.townName : '';
                    $scope.list = data.result.consigneeName + ' ' + data.result.consigneeMobile //+' '+data.result.provinceName+data.result.cityName+data.result.countyName+$scope.townName+' '+data.result.consigneeAddress;
                    $scope.list1 = data.result.provinceName + data.result.cityName + data.result.countyName + data.result.townName + data.result.consigneeAddress;
                    console.log($scope.list);
                    var address = {
                        provinceId: $scope.provinceId,
                        cityId: $scope.cityId,
                        countyId: $scope.countyId,
                        townId: $scope.townId,
                    }
                    sessionStorage.setItem('address', address);
                } else {
                    if (!$scope.goodid) {
                        $scope.list = '新增收货地址';
                    }
                }
            })
        }
        //获取可用优惠卷数量
        function getGoodsCoupon() {
            var list = [{ goodsNum: $stateParams.goodsnum, goodsId: $stateParams.goodsId }]
            if ($scope.isCart) {

                var list = [];
                for (var i = 0; i < $scope.cartList.length; i++) {
                    var json = {
                        goodsNum: $scope.cartList[i].goodsNum,
                        goodsId: $scope.cartList[i].goodsId,
                    }
                    list.push(json);
                }
            }
            $cardService.getCouponNumIsUsable({
                pageNo: 1,
                pageSize: 200,
                couponStatus: '2',
                goodsInfo: list
            }, localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode == '0000') {
                    vm.total = data.result.couponNumIsUsable || 0;

                } else if (data.resultCode == '0002') {
                    $scope.couponGoodsFlag = 1
                }
            })
        }

        // 获取可用礼品卡数量
        function getCardNum(){
            $cardService.getUserGiftCardNum({
                status: '1'
            },localStorage.getItem("sinks-token")).success(function(data) {
                if(data.retCode == '0000'){
                    vm.totalCard = data.retData || 0;
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

        //购物车获取相关产品信息
        function getCartListInfo(index) {
            var data = $scope.isCart[index]; //获取当前购物车商品的相关信息
            $customerService.getdoGoodsDetail({
                goodsId: data.goodsId,
                consigneeId: data.addressId,
                channelId: sessionStorage.channelId
            }).success(function(result) {
                if (result.resultCode = "0000") {
                    var info = {};
                    info = result.result;
                    info.goodsNum = data.goodsNum; //商品数量
                    vm.goodsType = result.result.goodsType;
                    if (data.invoiceTitle) {
                        info.invoice = '开发票';
                    } else {
                        info.invoice = '不开发票';
                    }
                    if (data.couponCode) { //是否选择了优惠券
                        info.Choice = '已选择';
                        info.couponCode = data.couponCode;
                    } else {
                        info.Choice = '未选择';
                    }
                    info.monthRepayMoney = data.monthRepayMoney * data.goodsNum; //获取商品月供总额，月供单价乘以数量
                    info.loanPeriods = data.loanPeriods; //获取产品的贷款期数
                    info.remark = data.remark; //获取商家留言
                    $scope.cartList.push(info); //把该商品丢进购物车列表数组里
                    var num = $scope.isCart.length - 1;
                    if (index == num) { //判断是否是最后一个商品
                        getprice(); //获取购物车商品总额等数据
                        getGoodsCoupon(); //获取优惠券数量
                        getCardNum();//获取礼品卡数量
                        $timeout(function() { //添加滚动时间
                            scroll('.main-content');
                        }, 2000)
                    } else { //获取下一个购物车商品数据
                        getCartListInfo(index + 1);
                    }
                }
            })
        }
        //获取商品价格
        function getprice() {
            console.log($stateParams)
            var sing = [{ goodsNum: $stateParams.goodsnum, goodsId: $stateParams.goodsId, attributes: $stateParams.attributes, spikePirce: $stateParams.spikePirce, spikeStatus: $stateParams.spikeStatus }]
            if ($scope.isCart) {
                var sing = [];
                for (var i = 0; i < $scope.cartList.length; i++) {
                    var json = {
                        goodsNum: $scope.cartList[i].goodsNum + '',
                        goodsId: $scope.cartList[i].goodsId + '',
                        attributes:$scope.isCart[i].goodsAttrInfo,
                        // spikePirce: $scope.cartList[i].spikePirce,
                        // spikeStatus: $scope.cartList[i].spikeStatus,
                    }
                    sing.push(json);
                }


            }
            $customerService.getGoodsOrderPrice({
                couponCode: vm.couponCode,
                goodsList: sing
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.accountPayable = data.result.goodsOrderAmount;
                    $scope.couponAmount = data.result.couponAmount;
                    if (data.result.goodsOrderAmount - data.result.couponAmount - $scope.cardAmount > 0) {
                        $scope.info.paid = data.result.goodsOrderAmount - data.result.couponAmount - $scope.cardAmount
                    } else {
                        $scope.info.paid == 0
                    }
                    // $scope.info.paid=data.result.goodsOrderAmount-data.result.couponAmount;
                    session();
                }
            })
        }


        //获取收货地址
        function getaddress() {
            $address.getAddress({ custId: $scope.mobile.id }).success(function(data) {
                if (data.resultCode == "0000") {
                    console.log(data)
                    if (data.result) {
                        for (var i = 0; i < data.result.length; i++) {
                            if (data.result[i].defaultAddress == 1) { //默认地址
                                vm.provinceId = data.result[i].provinceId;
                                vm.cityId = data.result[i].cityId;
                                vm.countyId = data.result[i].countyId;
                                vm.townId = data.result[i].townId;
                                $scope.list = data.result[i].consigneeName + ' ' + data.result[i].consigneeMobile;
                                $scope.list1 = data.result[i].provinceName + data.result[i].cityName + data.result[i].countyName + data.result[i].consigneeAddress;
                                // console.log($scope.list)
                                $scope.goodid = data.result[i].consigneeAddress;
                                vm.consigneeId = data.result[i].consigneeId;
                                if ($stateParams.addressId != undefined) {
                                    vm.consigneeId = $stateParams.addressId;
                                }
                                //地址id存起来方便在支付页面使用
                                var address = {
                                    provinceId: vm.provinceId,
                                    cityId: vm.cityId,
                                    countyId: vm.countyId,
                                    townId: vm.townId,
                                }
                                sessionStorage.setItem('address', JSON.stringify(address));
                            }
                        }
                    }
                }
            })
        }

        //初始化
        getdoGoodsDetail();

        function getdoGoodsDetail() {
            if ($stateParams.invoiceIsCompany == null) {
                vm.invoice = '不开发票'
            } else {
                vm.invoice = '开发票'
            }
            sign();
            //获取分期购的月供数据接口
            if ($scope.isCart) { //判断是否是购物车
                getCartListInfo(0);
                getaddress();
                if($stateParams.addressId){
                    address()
                }
            } else {
                getprice();
                getaddress();
                $scope.couponMoney = sessionStorage.getItem('$$couponMoney'); //返卷
                //获取商品详情
                var wait = new waiting();
                $customerService.getdoGoodsDetail({
                    goodsId: $stateParams.goodsId,
                    consigneeId: $stateParams.addressId,
                    channelId: sessionStorage.channelId
                }).success(function(data) {
                    wait.hide();
                    if (data.resultCode = "0000") {
                        getNowFormatDate()
                        vm.type = data.result.typeFrom;
                        vm.goodsType = data.result.goodsType;
                        sessionStorage.setItem('goodsType',data.result.goodsType)
                        $scope.couponGoodsFlag = data.result.couponGoodsFlag;
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
                        // 汽车定金屏蔽卡券和发票
                        if($stateParams.flagbit == 'car'){
                            $('.method1').css('display','none');
                            $scope.couponGoodsFlag = 1;
                        }
                        //$verifyService.setGrowing('订单详情',data.result.goodsId,data.result.brandName,$scope.accountPayable,$scope.tiem)
                        //获取分期购的月供数据接口
                        address();
                        getGoodsCoupon();
                        getCardNum();//获取礼品卡数量
                        $timeout(function() {
                            scroll('.main-content');
                        }, 300)
                    } else {
                        toolTip(data.resultMessage)
                    }
                });
            }
        }


        //显示首期月供还款计划
        $scope.showMonthPaymentList = function() {
            var list = [];
            for (var i = 0; i < $scope.cartList.length; i++) {
                var json = {
                    goodsNum: $scope.cartList[i].goodsNum,
                    goodsId: $scope.cartList[i].goodsId,
                    periods: $scope.cartList[i].loanPeriods,
                    couponCode: $scope.cartList[i].couponCode,
                    attributes: $scope.cartList[i].arrtInfo,
                }
                list.push(json);
            }
            $productService.getCartGoodsOrdeMonthPaymentList({
                channelId: sessionStorage.channelId,
                businessType: $scope.businessType,
                goodsList: list
            }).success(function(data) {
                if (data.resultCode == '0000') {
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

                    $(".dialog-wrap1").fadeIn();
                }
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
        //激活
        function activation() {
            new dialog().confirm({
                content: "您的信用额度尚未激活，赶紧去激活吧！",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType;
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //额度不够跳转
        function goactivation() {
            new dialog().confirm({
                content: '您的可用额度不足,补充房产或社保信息可提高额您的可用额度不足,补充房产或社保信息可提高额度.',
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&order=y' + '&utmTerm=' + $scope.utmterm + '&totalMoney=' + $scope.accountPayable + '&utmMedium=' + $scope.utm_medium + '&utmSource=' + $scope.utm_source + '&businessType=' + $scope.businessType;
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }
        //绑卡
        function Card() {
            new dialog().confirm({
                content: "您还尚未绑定银行卡，赶紧去绑卡吧！",
                confirmBtn: function() {
                    var wait = new waiting();
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y' + '&businessType=' + $scope.businessType;
                    wait.hide();
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
        }

        //提交订单
        function order(shoppingCartOrderId) {
            if (shoppingCartOrderId) {
                sessionStorage.removeItem('couponList');
                sessionStorage.removeItem('cartList');
                /*location.href = httpsHeader+"/mall/orderAction/orderConfirm.action?shoppingCartOrderId="+shoppingCartOrderId;*/
                $state.go('confirmpay', {
                    stages: $stateParams.stages
                })
            } else {
                /*location.href = httpsHeader+"/mall/orderAction/orderConfirm.action?orderId="+vm.orderId;*/
                $state.go('confirmpay', {
                    stages: $stateParams.stages
                })
            }

        }



        //购物车---下单
        function submitCart() {
            var wait = new waiting();
            //获取购物车商品的相关数据
            var list = [{ goodsNum: $stateParams.goodsnum, goodsId: $stateParams.goodsId, attributes: $stateParams.attributes }]
            if ($scope.isCart) {
                var list = [];
                for (var i = 0; i < $scope.cartList.length; i++) {
                    var json = {
                        goodsNum: $scope.cartList[i].goodsNum,
                        goodsId: $scope.cartList[i].goodsId,
                        attributes:$scope.isCart[i].goodsAttrInfo,
                        remark: $scope.cartList[i].remark
                    }
                    list.push(json);
                }
            }
            

            $customerService.submitOrder({
                channelId: sessionStorage.channelId,
                consigneeId: $stateParams.addressId　 || vm.consigneeId || vm.defaultId,
                businessType: $scope.businessType,
                invoiceType: $stateParams.invoiceType,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                fromPage: vm.fromPage,
                couponCode: $stateParams.couponCode,
                goodsList: list,
                shareMakemoneyToken: $scope.info.shareMakemoneyToken
            },localStorage.getItem('sinks-token')).success(function(data) {
                wait.hide();
                if (data.resultCode == '0000') {
                        sessionStorage.removeItem('shareMakemoneyToken')
                        sessionStorage.setItem('shoppingCartOrderId', data.result.shoppingCartOrderId);
                        sessionStorage.setItem('shareGoodsId',list[0].goodsId)
                        $state.go('confirmpay', {
                            time: new Date().getTime(),
                            flagbit : $stateParams.flagbit
                        }, {
                            location: 'replace'
                        })
                //    }
                } else if (data.resultCode == '0022') {
                    conalert();
                } else {
                    toolTip(data.resultMessage)
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

        //搜索用户行为
        function doUserTrace() {
            var list = $stateParams.goodsId;
            if ($scope.isCart) {
                var list = '';
                for (var i = 0; i < $scope.cartList.length; i++) {
                    list += $scope.cartList[i].goodsId + ',';
                }
            }
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'order',
                pageModule: 'submit',
                pageValue: list
            }).success(function(data) {

            })
        }

        //确定下单
        $scope.Place = function() {
            //doUserTrace(); //用户行为
            if ($scope.list == '新增收货地址'&&vm.goodsType ==1) {
                toolTip('收货地址不能为空')
            } else {
                if($stateParams.goodsId == 302462437588||$stateParams.goodsId == 302462437569||$stateParams.goodsId == 302462437548||$stateParams.goodsId == 302462437527){
                    if(userInfo.data.result.lines.status != 1){
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
                        submitCart(); //下单
                    }
                    
                }else{
                    if($scope.info.paid > 0 && vm.choiceCard!=''){
                        toolTip('礼品卡不足以支付此订单，请核对后重新支付')
                    }else if($scope.info.paid > 0 && vm.choiceCard==''){
                        submitCart(); //下单
                    }else if($scope.info.paid == 0){
                        $('.dialog_gift').css('display','block');
                    }
                }
            }
        }

        // 关闭支付弹窗
        $scope.close=function(){
            $('.dialog_gift').css('display','none');
            $scope.password = '';
        }
        

        // 礼品卡下单
        $scope.beSure=function(){
            if($scope.password.length == 6){
                submitGiftCard()
            }else{
                toolTip('请填写支付密码')
            }
        }

        // 忘记密码
        $scope.forget=function(){
            $state.go('forgetBalancePassword', {
                state: 'confirm',
                invoiceType:$stateParams.invoiceType,
				sku : $stateParams.sku,
                goodsId : $stateParams.goodsId,
                stages : $stateParams.stages,
                remark : $stateParams.remark,
                goodsnum : $stateParams.goodsnum,
                salePrice : $stateParams.salePrice,
                spikePirce : $stateParams.spikePirce,
                spikeStatus : $stateParams.spikeStatus,
                attributes : $stateParams.attributes,
                invoiceTitle : $stateParams.invoiceTitle,
                invoiceContent : $stateParams.invoiceContent,
                invoiceIsCompany : $stateParams.invoiceIsCompany,
                payment : $stateParams.payment,
                basicSoluPrice : $stateParams.basicSoluPrice,
                pricenum : $stateParams.pricenum,
                couponCode : $stateParams.couponCode,
                couponContent : $stateParams.couponContent,
                cardCode: $stateParams.cardCode, 
                cardContent: $stateParams.cardContent,
            }, {
                location: 'replace'
            })
        }

        //购物车---下单
        function submitGiftCard() {
            var wait = new waiting();
            //获取购物车商品的相关数据
            var list = [{ goodsNum: $stateParams.goodsnum, goodsId: $stateParams.goodsId, attributes: $stateParams.attributes }]
            if ($scope.isCart) {
                var list = [];
                for (var i = 0; i < $scope.cartList.length; i++) {
                    var json = {
                        goodsNum: $scope.cartList[i].goodsNum,
                        goodsId: $scope.cartList[i].goodsId,
                        attributes:$scope.isCart[i].goodsAttrInfo,
                        remark: $scope.cartList[i].remark
                    }
                    list.push(json);
                }
            }
            

            $customerService.submitOrder({
                payCode: $scope.password,
                channelId: sessionStorage.channelId,
                consigneeId: $stateParams.addressId　 || vm.consigneeId || vm.defaultId,
                businessType: $scope.businessType,
                invoiceType: $stateParams.invoiceType,
                invoiceTitle: $stateParams.invoiceTitle,
                invoiceContent: $stateParams.invoiceContent,
                invoiceIsCompany: $stateParams.invoiceIsCompany,
                fromPage: vm.fromPage,
                couponCode: $stateParams.couponCode,
                userGiftCardNo: $stateParams.cardCode,
                goodsList: list,
                shareMakemoneyToken: $scope.info.shareMakemoneyToken
            }).success(function(data) {
                wait.hide();
                if (data.resultCode == '0000') {
                    $state.go('success', {}, {
                        location: 'replace'
                    })
                } else if (data.resultCode == '0022') {
                    conalert();
                } else {
                    toolTip(data.resultMessage)
                }
            })
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
                    var order = {
                        paid: vm.salePrice,
                        orderId: $stateParams.orderId
                    }
                    sessionStorage.removeItem('shoppingCartOrderId') //删除购物车ID;
                    sessionStorage.setItem('confirm', JSON.stringify(order));
                    $state.go('confirmpay', {

                    }, {
                        location: 'replace'
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
                orderId: $stateParams.orderId,
                typeFrom: vm.typeFrom
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
                orderId: $stateParams.orderId
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    vm.total = data.result.total;
                    vm.notYetTotal = data.result.notYetTotal;
                    //vm.repaymentDate = data.result.repaymentDate;
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
                    // vm.spikePirce = data.result.spikePirce;
                    // vm.spikeStatus = data.result.spikeStatus;
                    vm.typeFrom = data.result.typeFrom;
                    vm.payway = data.result.payway;
                    vm.goodsTypeId = data.result.goodsTypeId;
                    vm.goodsId = data.result.goodsId;
                    vm.hideAfsBtn = data.result.hideAfsBtn;
                    vm.goodsState = data.result.goodsState;
                    vm.adult = data.result.adult;
                    vm.child = data.result.child;
                    vm.goodsId = data.result.goodsId;
                    vm.loanRate = data.result.loanRate;
                    vm.feeRate = data.result.feeRate;
                    vm.isFile = data.result.isFile;
                    vm.amount = data.result.amount;
                    vm.couponCode = data.result.couponCode;
                    vm.businessType = data.result.businessType;
                    vm.goodsAttrInfo = angular.fromJson(data.result.goodsAttrInfo);
                    if (vm.businessType == 'faceTake') {
                        $scope.julle = false;
                        $scope.rent = '每期租金'
                    } else {
                        $scope.julle = true;
                    }
                    if (vm.typeFrom == 3) {
                        vm.visitDate = data.result.visitDate.split(' ')[0];
                    }

                    vm.price = vm.amount;

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

        // 带渠道参数进来 带授权码进来 带openid
        if($stateParams.channelId){
            sessionStorage.setItem('channelId',$stateParams.channelId)
        }

        if($stateParams.unionId){
            sessionStorage.setItem('unionId',$stateParams.unionId)
        }

        if($stateParams.openId){
            sessionStorage.setItem('openId',$stateParams.openId)
        }

        if($stateParams.Authorication){
            localStorage.setItem('sinks-token',$stateParams.Authorication)
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
        vm.goPay = function(price, id, typeId, payway, state ,goodsId) {
                if (state == '0' || state == '3') { //判断商品是否下架 
                    new dialog().alert({
                        content: '商品已下架！'
                    })
                } else {
                    if (payway == '20000000') { //分期购  	
                        var order = {
                            paid: price,
                            orderId: id,
                            goodsId: goodsId
                        }
                        // sessionStorage.removeItem('shoppingCartOrderId') //删除购物车ID;
                        sessionStorage.setItem('shoppingCartOrderId',id)
                        sessionStorage.setItem('confirm', JSON.stringify(order));
                        if(goodsId == 30318667087 || goodsId == 30318667103 || goodsId == 30318667128){//汽车缴纳意向金标志位
                            $state.go('confirmpay', {
                                flagbit : 'car'
                            }, {
                                location: 'replace'
                            })
                        }else{
                            sessionStorage.setItem('shareGoodsId',goodsId)
                            $state.go('confirmpay', {

                            }, {
                                location: 'replace'
                            })
                        }
                        
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
            },localStorage.getItem('sinks-token')).success(function(data) {
                if (data.resultCode == '0000') {
                    if (!isEmptyObject(data.result)) {
                        $scope.routeGoodsList = data.result.list;
                        angular.forEach($scope.routeGoodsList, function(data1) {
                            if (data1.typeFrom == 1) {
                                data1.thumbImgUrl = imgUrl + data1.thumbImgUrl;
                                data1.goodsAttrInfo = angular.fromJson(data1.goodsAttrInfo);
                            } else if (data1.typeFrom == 2) {
                                data1.thumbImgUrl = $productService.imgUrl[4] + data1.thumbImgUrl
                            }
                        })
                        angular.forEach($scope.routeGoodsList, function(data1) {
                            data1.price = data1.amount;
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