define(['angular', 'css!./user.css', 'css!./balance.css', 'css!./recharge.css', 'css!./explain.css'], function(angular) {
    angular.module('app')
        .controller('myCenterController', myCenterController)
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

    //------------------------------------个人中心-------------------------------
    myCenterController.$inject = ['$scope', '$state', '$q', '$verifyService', 'userInfo', '$rootScope', '$userService', '$timeout', '$common', '$window', '$cardService', '$customerService', '$productService','$stateParams','$http'];

    function myCenterController($scope, $state, $q, $verifyService, userInfo, $rootScope, $userService, $timeout, $common, $window, $cardService, $customerService, $productService,$stateParams,$http) {
        var vm = this;
        vm.userInfo = {};
        vm.bill = {};
        vm.lines = {};
        vm.myInvest = {};
        vm.order = {};
        vm.isBindCard = false;
        vm.payCodeFlage = false;
        vm.goActive = goActive;
        vm.isActive = "";
        vm.used = 0;
        vm.count = 0;
        vm.totalCard = 0;//礼品卡数量
        vm.accountAmount = 0;
        vm.channelId = $userService.$$channelId;
        vm.exit = exit;
        $scope.i = 0;
        $scope.token = localStorage.getItem('sinks-token');
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'))
        $scope.orderStatInfo = { dfk: 0, audit: 0, dfh: 0, dsh: 0, };
        $scope.firstRecharge = '';
        $scope.dataList = '';
        active();
        $verifyService.SetIOSTitle("个人中心");
        var mainScroll = scroll('.main-content');
        
        if($stateParams.Authorication){
            localStorage.setItem('sinks-token',$stateParams.Authorication)
        }

        if($stateParams.channelId){
            sessionStorage.setItem('channelId',$stateParams.channelId)
        }


        // 退出当前登录
        function exit() {
            if (localStorage.getItem('$$payload') && localStorage.getItem('$$payload') != '') {
                var wait = new waiting()
                setTimeout(function() {
                    wait.hide();
                    localStorage.clear();
                    $state.go('login', {

                    }, {
                        location: 'replace'
                    })
                }, 400)
            }
        }

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'mycenter',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        // 充值金额
        $customerService.rechangeMoney({}, localStorage.getItem("sinks-token")).success(function(data) {
            if (data.resultCode == '0000') {
                $scope.dataList = data.result.dataList
            } else {
                toolTip(data.result.resultMessage)
            }
        });

        $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
            console.log(mainScroll);
            console.log(element.parent());
            if (mainScroll) {
                mainScroll.refresh();
            }
        });

        $scope.isActive = function(i) {
            sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href));
            $scope.i = i;
            // console.log(i)
        }

        //我的账单地址
        vm.myBill = httpsHeader + "/mall/userCenterAction/userBill.action";
        //我的投资地址
        vm.myInvestment = httpsHeader + "/mall/myInvestAction/toMyInvestList.action";
        //我的订单地址
        vm.myOrder = httpsHeader + "/mall/orderAction/find.action?channelId=" + vm.channelId;
        //二期订单页面
        $scope.Mygod = function() {
            $state.go('Myorder', {
                channelId: vm.channelId
            })
        }
        $scope.gocustomer = function() {
            $state.go('schedule', {
                flag: 'myCenter'
            })
        }

        //跳转到卡卷
        $scope.myCard = function() {
                $state.go('myCard', {
                    mobile: localStorage.getItem('phoneNum')
                })
            }
            //跳转到我的账单
        $scope.mybill = function() {
            $state.go('mybill', {

            })
        }

        $scope.mycollection = function() {
            $state.go('myCollection', {})
        }

        $scope.giftCard = function() {
            $state.go('myGiftCard', {})
        }

        $scope.session = function() {
            sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href))
        }

        function active() {
            getAllHshCustInfo();
            sign();
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
        };

        function goActive() {
            if (vm.lines.status == 1) {
                location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&toBankCard=n'+ '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href);
            }
        }
        // 获取sign
        function sign() {
            $customerService.getSign({
                mobile: localStorage.getItem('phoneNum')
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $scope.sign = data.sign;
                }
            })
        }


        function getAllHshCustInfo() {
            if (userInfo.data.resultCode == "0000") {
                    $scope.orderStatInfo = userInfo.data.result.orderStatInfo;
                    $verifyService.getGrowing(localStorage.getItem('$$payload').hlejCustId, localStorage.getItem('$$payload').mobile);
                    vm.userInfo = JSON.parse(localStorage.getItem('$$payload'));
                    //获取卡券数量
                    $cardService.getCoupons({
                        mobile: sessionStorage.mobile,
                    },localStorage.getItem('sinks-token')).success(function(data) {

                        if (data.resultCode == '0000') {
                            vm.used = data.result.get;
                        }
                    })
                    //获取收藏数量
                    $cardService.getGoodsCollectList({
                        channelId: sessionStorage.channelId,
                        pageIndex: 1,
                        pageSize: 10
                    },localStorage.getItem('sinks-token')).success(function(data) {
                        if (data.resultCode == '0000') {
                            vm.count = data.result.count;
                        }
                    })

                    //获取礼品卡数量
                    $cardService.getUserGiftCardNum({
                        status: '0'
                    },localStorage.getItem("sinks-token")).success(function(data) {
                        if (data.retCode == '0000') {
                            vm.totalCard = data.retData || 0;
                        }
                    })
            } else {
                toolTip(userInfo.data.resultMessage);
                $common.goUser({
                    state: 'myCenter'
                }, '/myCenter');
            }
            console.log("-----" + $userService.$$channelId);
        }

        // 判断用户是否首次充值
        $customerService.firstRecharge({

        }, localStorage.getItem("sinks-token")).success(function(data) {
            // alert(data.resultCode)
            if (data.resultCode == '0000') {
                $scope.firstRecharge = true;
            } else if (data.resultCode == '0001') {
                $scope.firstRecharge = false;
            } else {
                toolTip(data.resultMessage)
            }
        })




        $scope.$on('$includeContentLoaded', function(event) {
            $('.footer-bar .tabs-user').addClass('current')
                .siblings().removeClass('current');
        });
    }
    // ------------------------------安全中心---------------------------------
    angular.module('app').controller('safetyCenterController', safetyCenterController);
    safetyCenterController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService', '$customerService','$productService'];

    function safetyCenterController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService, $customerService,$productService) {
        var vm = this;
        //var httpsHeader = "https://www.funsales.com";
        vm.goBankList = httpsHeader + "/mall/accountAction/getUserBankCard.action"; //我的银行卡
        vm.goResetPaycode = httpsHeader + "/mall/accountAction/toResetPaycode.action"; //设置交易密码
        vm.goSetPaycode = httpsHeader + "/mall/accountAction/toResetPaycode.action"; //修改交易密码
        vm.setBalancePassword = '#/balancePassword'; //设置余额支付密码
        vm.resetBalancePassword = '#/resetBalancePassword'; //重置余额支付密码
        $scope.gobindCard = function() {
            $state.go('bindCard', {
                flag: 'myCenter'
            })
        }
        var mainScroll = scroll('.main-content');
        var jsonList = userInfo.data.result;
        vm.userInfo = jsonList.userInfo;
        vm.isBindCard = jsonList.isBindCard;
        vm.payCodeFlage = jsonList.payCodeFlage;
        vm.channelId = $userService.$$channelId;
        vm.goSetPassword = "";
        vm.balanceFlag = "";
        vm.balancePassword = "";
        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'Security center page',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }
        if (vm.payCodeFlage) {
            vm.goSetPassword = vm.goSetPaycode;
        } else {
            vm.goSetPassword = vm.goResetPaycode
        }
        $verifyService.SetIOSTitle("安全中心");

        $customerService.judgePassword({

        }, localStorage.getItem("sinks-token")).success(function(data) {
            // alert(data.resultCode)
            if (data.resultCode == '0000') {
                vm.balanceFlag = true;
                vm.balancePassword = vm.resetBalancePassword;
            } else if (data.resultCode == '002' || data.resultCode == '001' || data.resultCode == '003') {
                vm.balanceFlag = false;
                vm.balancePassword = vm.setBalancePassword;
            }
        })



    }
    // ----------------------------账户余额--------------------------------

    angular.module('app').controller('accountBalanceController', accountBalanceController);
    accountBalanceController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService', '$timeout', '$customerService', '$common'];

    function accountBalanceController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService, $timeout, $customerService, $common) {
        var vm = this;
        //var httpsHeader = "https://www.funsales.com";
        // var mainScroll = scroll('.main-content');
        $scope.billdetail = '';
        $verifyService.SetIOSTitle("账户余额");
        $scope.accountAmount = '';
        vm.pageNum = 1;
        mainScroll = '';
        var pullDown = false;
        $scope.data = {
            loadIcon: true, //加载loading  true显示 false隐藏
            loadGoods: true,
            loadEnd:false
        }

        myIscroll();

        function myIscroll() {
            init();

            vm.mainScroll = scroll('.main-content');
			vm.mainScroll.on('scrollEnd', function () {
                $scope.data.loadIcon = true;
                $scope.data.loadGoods = true;
				pullDown = (this.y - this.maxScrollY) < 1 ? true : false;
                if (pullDown && $scope.data.loadGoods && $scope.data.loadEnd) {
                    $scope.data.loadEnd = false;
                    vm.pageNum++;
                    init();
                }
            })
        }

        function init() {
            //查询账户明细
            $customerService.billDetail({
                pageNum: vm.pageNum,
                pageSize: 9
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    var billdetail = data.result.dataList; //消费信息
                    var TotalNum = data.result.total; //消费信息数量
                    //判断当前是否为最后一页
                    if (TotalNum - vm.pageNum * 9 <= 9) {
                        $scope.data.loadIcon = false;
                    }
                    if (!isEmptyObject(data.result.dataList)&&data.result.dataList[data.result.dataList.length-1].fundChangeDetailsList.length>0) {
                        //判断是否第一页，非第一页数据合并
                        if (vm.pageNum == 1) {
                            $scope.billdetail = billdetail;
                            $scope.data.loadIcon = false;
                        } else {
                            $scope.billdetail = $scope.billdetail.concat(billdetail);

                            var beforeTitle = "";
                            var currentTitle = "";
                            for (var index = 0; index < $scope.billdetail.length; index++) {
                                if (index == 0) {
                                    beforeTitle = $scope.billdetail[index].title;
                                } else {
                                    beforeTitle = $scope.billdetail[index - 1].title;
                                    currentTitle = $scope.billdetail[index].title;
                                }

                                if (beforeTitle == currentTitle) {
                                    $scope.billdetail[index].repeat = "true"; //重复月份中添加额外的对象元素
                                }
                            }
                            // console.log($scope.billdetail)
                        }
                        $scope.data.loadEnd = true;
                    } else if (typeof(data.result.dataList) == 'undefined'||isEmptyObject(data.result)||data.result.dataList[data.result.dataList.length-1].fundChangeDetailsList.length == 0) {
                        $scope.data.loadIcon = false;
                        $scope.data.loadGoods = false;
                        $scope.data.loadEnd = false;
                    }

                    $timeout(function(){
                        vm.mainScroll.refresh();
                    },200) //刷新滚动条
                } else {
                    $scope.data.loadIcon = false;
                    toolTip(data.resultMessage)
                }
            })
            $timeout(function(){
                vm.mainScroll.refresh();
            },200)
        }

        // 查询账户基本信息
        $customerService.inforMation({

        }, localStorage.getItem("sinks-token")).success(function(data) {
            if (data.result.accountAmount) {
                $scope.accountAmount = data.result.accountAmount;
            } else {
                $scope.accountAmount = 0;
            }
        })


        //  详情显示隐藏
        $scope.show = function(e) {
            if ($(e.currentTarget).attr("class") == 'arrows') {
                $(e.currentTarget).addClass('active')
                $(e.currentTarget).css('background', 'url("./myblocks/images/have.png")  no-repeat')
                $(e.currentTarget).css('background-size', 'contain')
                $(e.currentTarget).css('background-position', 'center')
                $(e.currentTarget).parents('.date').siblings('.month-two').css('display', 'block')
            } else {
                $(e.currentTarget).removeClass('active')
                $(e.currentTarget).css('background', 'url("./myblocks/images/not.png")  no-repeat')
                $(e.currentTarget).css('background-size', 'contain')
                $(e.currentTarget).css('background-position', 'center')
                $(e.currentTarget).parents('.date').siblings('.month-two').css('display', 'none')
            }
        }

    }
    // ------------------------------------------余额充值
    angular.module('app').controller('rechargeController', rechargeController);
    rechargeController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService', '$customerService', '$timeout', '$stateParams'];

    function rechargeController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService, $customerService, $timeout, $stateParams) {
        var vm = this;
        vm.accountAmount = 0;
        var mainScroll = scroll('.main-content');
        vm.channelId = $userService.$$channelId;

        $customerService.accountMount({ //查询余额

        }, localStorage.getItem("sinks-token")).success(function(data) {
            if (typeof(data.result.accountAmount) != 'undefined') {
                vm.accountAmount = data.result.accountAmount
            } else if (data.resultCode == '1000') {
                vm.accountAmount = 0
            } else {
                vm.accountAmount = 0
            }
        })


        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
        $scope.confirm = JSON.parse(sessionStorage.getItem('confirm')); //订单信息
        $verifyService.SetIOSTitle("余额充值");
        $scope.info = {
                payment: false, //弹层标识
                total: '',
                Price: '', //价格
                name: '分期支付',
                shareMakemoneyToken: sessionStorage.getItem('shareMakemoneyToken'), //从C端过来的标识
                code: '000', //支付方式
                tal: '', //合计应还
                fee: '',
                channelId: sessionStorage.channelId,
                spikePirce: ''
            }
            //  console.log(typeof($stateParams.index))
        $scope.i = $stateParams.index;
        $scope.mode = [{ name: '微信支付', code: '000', img: 'Order/images/tub1.png' }]; //充值支付方式
        // console.log(userInfo);
        // 选择充值方式
        $scope.method = function(code) {
            $scope.info.code = code;
        }
        $scope.dataList = '';
        $scope.firstRecharge = 1;
        //   $scope.colors = [{
        //       'id':'10',
        //       'name':'50'
        //   },{
        //       'id':'15',
        //       'name':'100'
        //   },{
        //       'id':'30',
        //       'name':'200'
        //   },{
        //     'id':'75',
        //     'name':'500'
        // },{
        //     'id':'150',
        //     'name':'1000'
        // },{
        //     'id':'750',
        //     'name':'5000'
        // }];

        // 判断用户是否首次充值
        $customerService.firstRecharge({

        }, localStorage.getItem("sinks-token")).success(function(data) {
            // alert(data.resultCode)
            if (data.resultCode == '0000') {
                $scope.firstRecharge = true;
                sessionStorage.setItem('firstRecharge', JSON.stringify(true))
            } else if (data.resultCode == '0001') {
                $scope.firstRecharge = false;
                sessionStorage.setItem('firstRecharge', JSON.stringify(false))
            } else {
                toolTip(data.resultMessage)
            }
        })

        // 充值金额
        $customerService.rechangeMoney({}, localStorage.getItem("sinks-token")).success(function(data) {
            if (data.resultCode == '0000') {
                $scope.dataList = data.result.dataList;
                sessionStorage.setItem('dataList', JSON.stringify($scope.dataList))
            } else {
                toolTip(data.result.resultMessage)
            }
        });

        init();

        function init() {
            if ($stateParams.payOpenId) {
                wxcz();
            }
        }


        $scope.isActive = function(i) {
                $scope.i = i;
            }
            //微信充值
        function wxcz() {
            $scope.dataList = JSON.parse(sessionStorage.getItem('dataList'));
            $scope.rechargeLargessId = $scope.dataList[Number($stateParams.index)].rechargeLargessRecord.rechargeLargessId;
            $customerService.weChatRecharge({
                // rechargeMoney:$scope.rechargeMoney,
                // preferentialSign:2,
                // largessMoney:$scope.largessMoney,
                // giveCoupon:'',
                rechargeLargessId: $scope.rechargeLargessId,
                payOpenId: $stateParams.payOpenId
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    data.result.payResult = JSON.parse(data.result.payResult);

                    function onBridgeReady() {
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest', {
                                "appId": data.result.payResult.appId, //公众号名称，由商户传入     
                                "timeStamp": data.result.payResult.timeStamp, //时间戳，自1970年以来的秒数     
                                "nonceStr": data.result.payResult.nonceStr, //随机串     
                                "package": data.result.payResult.package,
                                "signType": "MD5", //微信签名方式：     
                                "paySign": data.result.payResult.paySign //微信签名 
                            },
                            function(res) {
                                if (res.err_msg == "get_brand_wcpay_request:ok") { // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                    if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '4') {
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您100元优惠券(仅限购买99元美的电热水壶)，已下发到您的个人中心。请下单填写收货地址',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "去领取奖品",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                var wait = new waiting();
                                                location.href = 'https://www.funsales.com/mallh5/#/productDetails?goodsId=72339925548&grandeditiongtdi=1'
                                                sessionStorage.removeItem('firstRecharge')
                                                wait.hide();
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    } else if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '5') {
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您500元商城组合优惠券，已下发到您的个人中心。',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "确定",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                sessionStorage.removeItem('firstRecharge')
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    }/* else if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '5') {
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您2000元优惠券(仅限购买1999元乐视S50电视机)，已下发到您的个人中心。请下单填写收货地址',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "去领取奖品",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                var wait = new waiting();
                                                location.href = 'https://www.funsales.com/mallh5/#/productDetails?goodsId=22581763877&grandeditiongtdi=1'
                                                sessionStorage.removeItem('firstRecharge')
                                                wait.hide();
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    } */else {
                                        toolTip('恭喜您充值成功')
                                        $customerService.judgePassword({

                                        }, localStorage.getItem("sinks-token")).success(function(data) {
                                            // alert(data.resultCode)
                                            if (data.resultCode == '0000') {
                                                if (sessionStorage.getItem('rechargeCallbackUrl')) {
                                                    location.href = JSON.parse(sessionStorage.getItem('rechargeCallbackUrl'));
                                                    sessionStorage.removeItem("rechargeCallbackUrl");
                                                } else {
                                                    $state.go('myCenter', {

                                                    }, {
                                                        location: 'replace'
                                                    })
                                                }

                                            } else if (data.resultCode == '002') {
                                                $state.go('balancePassword', {
                                                    code: 0,
                                                }, {
                                                    location: 'replace'
                                                })
                                            } else {
                                                toolTip(data.resultMessage)
                                            }
                                        })
                                    }

                                } else {
                                    toolTip('微信支付失败')
                                }
                            }
                        );
                    }
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    } else {
                        onBridgeReady();
                    }
                } else {
                    toolTip(data.resultMessage)
                }
            })
        }
        $scope.recharge = function() {
            if (typeof($scope.i) === 'number' || typeof($scope.i) === 'string') {
                location.href = httpsHeader + '/mall/funsalesWechatPay/oauthViewForRecharge.action?pageFlag=recharge&index=' + $scope.i;
            } else {
                toolTip('请选择充值面额')
            }

        }

    }


    // ------------------------------------------扫码余额充值
    angular.module('app').controller('sweepRechargeController', sweepRechargeController);
    sweepRechargeController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService', '$customerService', '$timeout', '$stateParams', '$window'];

    function sweepRechargeController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService, $customerService, $timeout, $stateParams, $window) {
        var vm = this;
        var mainScroll = scroll('.main-content');
        vm.accountAmount = '';
        $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
            if (data.resultCode == "0000") { //登录了

                $customerService.accountMount({

                }, localStorage.getItem("sinks-token")).success(function(data) {
                    if (typeof(data.result.accountAmount) != 'undefined') {
                        vm.accountAmount = data.result.accountAmount
                    } else {
                        vm.accountAmount = 0
                    }
                })
            } else { //没登录
                vm.accountAmount = 0
            }

        })

        vm.channelId = $userService.$$channelId;
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));

        $verifyService.SetIOSTitle("余额充值");
        $scope.info = {
                payment: false, //弹层标识
                total: '',
                Price: '', //价格
                name: '分期支付',
                shareMakemoneyToken: sessionStorage.getItem('shareMakemoneyToken'), //从C端过来的标识
                code: '000', //支付方式
                tal: '', //合计应还
                fee: '',
                channelId: sessionStorage.channelId,
            }
            //  console.log(typeof($stateParams.index))
        $scope.i = $stateParams.index;
        $scope.mode = [{ name: '微信支付', code: '000', img: 'Order/images/tub1.png' }]; //充值支付方式
        // console.log(userInfo);
        // 选择充值方式
        $scope.method = function(code) {
            $scope.info.code = code;
        }
        $scope.firstRecharge = 1;
        $scope.dataList = '';
        //    $scope.colors = [{
        //        'id':'10',
        //        'name':'50'
        //    },{
        //        'id':'15',
        //        'name':'100'
        //    },{
        //        'id':'30',
        //        'name':'200'
        //    },{
        //      'id':'75',
        //      'name':'500'
        //  },{
        //      'id':'150',
        //      'name':'1000'
        //  },{
        //      'id':'750',
        //      'name':'5000'
        //  }];

        // 判断用户是否首次充值
        $customerService.firstRecharge({

        }, localStorage.getItem("sinks-token")).success(function(data) {
            // alert(data.resultCode)
            if (data.resultCode == '0000') {
                $scope.firstRecharge = true;
                sessionStorage.setItem('firstRecharge', JSON.stringify(true))
            } else if (data.resultCode == '0001') {
                $scope.firstRecharge = false;
                sessionStorage.setItem('firstRecharge', JSON.stringify(false))
            } else {
                toolTip(data.resultMessage)
            }
        })

        // 充值金额
        $customerService.rechangeMoney({}, localStorage.getItem("sinks-token")).success(function(data) {
            if (data.resultCode == '0000') {
                $scope.dataList = data.result.dataList;
                sessionStorage.setItem('dataList', JSON.stringify($scope.dataList))
            } else {
                toolTip(data.resultMessage)
            }
        });

        init();

        function init() {
            if ($stateParams.payOpenId) {
                wxcz();
            }
        }


        $scope.isActive = function(i) {
                $scope.i = i;
            }
            //微信充值
        function wxcz() {
            $scope.dataList = JSON.parse(sessionStorage.getItem('dataList'));
            //  $scope.rechargeMoney = $scope.colors[Number($stateParams.index)].name;
            //  $scope.largessMoney = $scope.colors[Number($stateParams.index)].id;
            $scope.rechargeLargessId = $scope.dataList[Number($stateParams.index)].rechargeLargessRecord.rechargeLargessId;
            $scope.rechargeMoney = $scope.dataList[Number($stateParams.index)].rechargeLargessRecord.rechargeMoney;
            $scope.degree = parseInt($scope.rechargeMoney / 50)
            $customerService.weChatRecharge({
                rechargeLargessId: $scope.rechargeLargessId,
                machineId: $stateParams.machineId,
                payOpenId: $stateParams.payOpenId
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000') {
                    data.result.payResult = JSON.parse(data.result.payResult);

                    function onBridgeReady() {
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest', {
                                "appId": data.result.payResult.appId, //公众号名称，由商户传入     
                                "timeStamp": data.result.payResult.timeStamp, //时间戳，自1970年以来的秒数     
                                "nonceStr": data.result.payResult.nonceStr, //随机串     
                                "package": data.result.payResult.package,
                                "signType": "MD5", //微信签名方式：     
                                "paySign": data.result.payResult.paySign //微信签名 
                            },
                            function(res) {
                                if (res.err_msg == "get_brand_wcpay_request:ok") { // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                    if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '4') {
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您100元优惠券(仅限购买99元美的电热水壶)，已下发到您的个人中心。请下单填写收货地址',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "去领取奖品",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                var wait = new waiting();
                                                location.href = 'https://www.funsales.com/mallh5/#/productDetails?goodsId=72339925548&grandeditiongtdi=1'
                                                sessionStorage.removeItem('firstRecharge')
                                                wait.hide();
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    } else if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '5') {
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您500元商城组合优惠券，已下发到您的个人中心。',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "确定",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                sessionStorage.removeItem('firstRecharge')
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    } /*else if (sessionStorage.getItem('firstRecharge') == 'true' && $stateParams.index == '5') { 
                                        new dialog().confirm({
                                            content: '恭喜，充值成功！赠送您2000元优惠券(仅限购买1999元乐视S50电视机)，已下发到您的个人中心。请下单填写收货地址',
                                            cancelBtnText: "回活动页",
                                            confirmBtnText: "去领取奖品",
                                            cancelBtn: function() {
                                                location.href = 'https://www.funsales.com/ActivityProject/ritual/index.html'
                                                sessionStorage.removeItem('firstRecharge')
                                            },
                                            confirmBtn: function() {
                                                var wait = new waiting();
                                                location.href = 'https://www.funsales.com/mallh5/#/productDetails?goodsId=22581763877&grandeditiongtdi=1'
                                                sessionStorage.removeItem('firstRecharge')
                                                wait.hide();
                                            }
                                        })
                                        $('.content').css('text-align', 'center')
                                        $('.content').css('font-size', '0.4rem')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color', '#fff')
                                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color', '#fe9d2e')
                                        $('.dialog-wrap .dialog-content').css('width', '70%')
                                        $('.dialog-wrap .dialog-content').css('left', '15%')
                                        $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right', '1px solid #dcdcdc')

                                    }*/else if($stateParams.index == '0'){
                                        toolTip('恭喜您充值成功')
                                        $customerService.judgePassword({

                                        }, localStorage.getItem("sinks-token")).success(function(data) {
                                            // alert(data.resultCode)
                                            if (data.resultCode == '0000') {
                                                if (sessionStorage.getItem('rechargeCallbackUrl')) {
                                                    location.href = JSON.parse(sessionStorage.getItem('rechargeCallbackUrl'));
                                                    sessionStorage.removeItem("rechargeCallbackUrl");
                                                } else {
                                                    $state.go('myCenter', {

                                                    }, {
                                                        location: 'replace'
                                                    })
                                                }

                                            } else if (data.resultCode == '002') {
                                                $state.go('balancePassword', {
                                                    code: 0,
                                                }, {
                                                    location: 'replace'
                                                })
                                            } else {
                                                toolTip(data.resultMessage)
                                            }
                                        })
                                    } else {
                                        toolTip('恭喜您充值成功')
                                        $customerService.judgePassword({

                                        }, localStorage.getItem("sinks-token")).success(function(data) {
                                            // alert(data.resultCode)
                                            if (data.resultCode == '0000') {
                                                if (sessionStorage.getItem('rechargeCallbackUrl')) {
                                                    location.href = JSON.parse(sessionStorage.getItem('rechargeCallbackUrl'));
                                                    sessionStorage.removeItem("rechargeCallbackUrl");
                                                } else {
                                                    new dialog().confirm({
                                                        content: '<div class="ment">充值成功!<br/>恭喜充值成功，获得<span></span>次抽奖机会,请在贩卖机上点击抽奖吧!</div>',
                                                        confirmBtnText: "好的",
                                                        confirmBtn: function() {
                                                            // $scope.machineId = localStorage.getItem('machineId')
                                                            // alert($stateParams.machineId)
                                                            var wait = new waiting();
                                                            $userService.registDraw({
                                                                luckydrawSourceType: 2,
                                                                rechargeMoney: $scope.rechargeMoney,
                                                                mobile: $scope.mobile.mobile,
                                                                machineNum: $stateParams.machineId,
                                                            }).success(function(data) {
                                                                wait.hide();
                                                                if (data.resultCode == "0000") {
                                                                    $state.go('myCenter', {

                                                                    }, {
                                                                        location: 'replace'
                                                                    })
                                                                } else {
                                                                    toolTip(data.resultMessage);
                                                                }

                                                            });
                                                        }
                                                    })
                                                    $('.content').css('text-align', 'center')
                                                    $('.content').css('font-size', '0.4rem')
                                                    $('.cancel-btn').css('display', 'none')
                                                    $('.content span').html($scope.degree)
                                                }
                                            } else if (data.resultCode == '002') {
                                                $state.go('balancePassword', {
                                                    code: 0,
                                                    machineId: $stateParams.machineId,
                                                    rechargeMoney: $scope.rechargeMoney
                                                }, {
                                                    location: 'replace'
                                                })
                                            } else {
                                                toolTip(data.resultMessage)
                                            }
                                        })
                                    }

                                } else {
                                    toolTip('微信支付失败')
                                }
                            }
                        );
                    }
                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    } else {
                        onBridgeReady();
                    }
                } else {
                    toolTip(data.resultMessage)
                }
            })
        }
        $scope.recharge = function() {

            $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data) {
                if (data.resultCode == "0000") { //登录了
                    if (typeof($scope.i) === 'number' || typeof($scope.i) === 'string') {
                        location.href = httpsHeader + '/mall/funsalesWechatPay/oauthViewForRecharge.action?pageFlag=sweepRecharge&index=' + $scope.i + '&machineId=' + $stateParams.machineId;
                    } else {
                        toolTip('请选择充值面额')
                    }
                } else if (data.resultCode == "0001") { //没登陆
                    sessionStorage.setItem('sweepRechargeUrl', JSON.stringify($window.location.href))
                    $state.go('login', {
                        state: 'sweepRecharge',
                        machineId: $stateParams.machineId
                    }, {
                        location: 'replace'
                    })
                } else {
                    toolTip(data.resultMessage)
                }

            })

        }

    }




    // ------------------------------------余额说明--------------------------------------------------------
    angular.module('app').controller('explainController', explainController);
    explainController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService', '$timeout'];

    function explainController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService, $timeout) {
        var vm = this;
        //var httpsHeader = "https://www.funsales.com";
        $verifyService.SetIOSTitle("余额说明");
    }


});