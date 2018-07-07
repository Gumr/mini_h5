define(['angular', 'css!./user.css'], function(angular) {
    angular.module('app').
    controller('myCenterController', myCenterController);

    //个人中心
    myCenterController.$inject = ['$scope', '$state', '$q', '$verifyService', 'userInfo', '$rootScope', '$userService', '$timeout', '$common', '$window', '$cardService', '$customerService', '$userService'];

    function myCenterController($scope, $state, $q, $verifyService, userInfo, $rootScope, $userService, $timeout, $common, $window, $cardService, $customerService, $userService) {
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
        vm.channelId = $userService.$$channelId;
        $scope.token = localStorage.getItem('sinks-token');
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'))
        $scope.url = window.location.href;
        $scope.orderStatInfo = { dfk: 0, audit: 0, dfh: 0, dsh: 0, };

        $verifyService.SetIOSTitle("个人中心");
        var mainScroll = scroll('.main-content');
        active();
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
                mobile: $scope.mobile.mobile
            })
        }
        $scope.mycollection = function() {
            $state.go('myCollection', {})
        }

        function active() {
            getAllHshCustInfo();
            sign();
        };

        function goActive() {
            if (vm.lines.status == 1) {
                location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&gold=y';
            }
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

        function getAllHshCustInfo() {
            if (userInfo.data.resultCode == "0000") {
                console.log(userInfo);
                var jsonList = userInfo.data.result;
                vm.userInfo = jsonList.userInfo;
                $scope.orderStatInfo = jsonList.orderStatInfo;
                if (jsonList.lines.status == 5) {
                    jsonList.lines.quotaStatusDesc = 0;
                }
                if (jsonList.lines.consumption == '') {
                    jsonList.lines.consumption = 0.00;
                }
                $verifyService.getGrowing(vm.userInfo.hlejCustId, vm.userInfo.mobile);
                /*$userService.queryCustomInfo({
                	userid : vm.userInfo.hlejCustId
                }).success(function(data){
                	if(data.retCode == '00'){
                		$scope.data = data.data;
                		sessionStorage.setItem('set',JSON.stringify($scope.data))
                	}
                })*/
                //获取卡卷数量
                $cardService.getCoupons({
                        mobile: sessionStorage.mobile,
                    }).success(function(data) {
                        if (data.resultCode == '0000') {
                            vm.used = data.result.get;
                        }
                    })
                    //获取卡卷数量
                $cardService.getGoodsCollectList({
                    channelId: sessionStorage.channelId,
                    pageIndex: 1,
                    pageSize: 10
                }).success(function(data) {
                    if (data.resultCode == '0000') {
                        vm.count = data.result.count;
                    }
                })

                vm.bill = jsonList.bill;
                vm.lines = jsonList.lines;
                vm.lines.consumption = parseInt(vm.lines.consumption).toFixed(2);
                if (vm.lines.status == 1) {
                    vm.lines.surplus = 0.00;
                }
                vm.myInvest = jsonList.myInvest;
                vm.order = jsonList.order;
                vm.isBindCard = jsonList.isBindCard;
                vm.payCodeFlage = jsonList.payCodeFlage;
                $timeout(function() {
                    scroll('.main-content');
                }, 300)
            } else {
                toolTip(userInfo.data.resultMessage);
                $common.goUser({
                    state: 'myCenter'
                }, '/myCenter');
            }
            console.log("-----" + $userService.$$channelId);
        }
        $scope.$on('$includeContentLoaded', function(event) {
            $('.footer-bar .tabs-user').addClass('current')
                .siblings().removeClass('current');
        });
    }
    //安全中心
    angular.module('app').controller('safetyCenterController', safetyCenterController);
    safetyCenterController.$inject = ['$scope', '$state', '$q', 'userInfo', '$verifyService', '$rootScope', '$userService'];

    function safetyCenterController($scope, $state, $q, userInfo, $verifyService, $rootScope, $userService) {
        var vm = this;
        //var httpsHeader = "https://test5hsh.hlej.com";
        vm.goBankList = httpsHeader + "/mall/accountAction/getUserBankCard.action"; //我的银行卡
        vm.goResetPaycode = httpsHeader + "/mall/accountAction/toResetPaycode.action"; //设置交易密码
        vm.goSetPaycode = httpsHeader + "/mall/accountAction/toResetPaycode.action"; //修改交易密码
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
        if (vm.payCodeFlage) {
            vm.goSetPassword = vm.goSetPaycode;
        } else {
            vm.goSetPassword = vm.goResetPaycode
        }
        $verifyService.SetIOSTitle("安全中心");
    }
});