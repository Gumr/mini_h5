define(['angular', 'css!./card.css'], function(angular) {
    angular.module('app')
        .controller('bindCardController', bindCardController)
        .controller('unbindCardController', unbindCardController)

    /*--------------------绑卡页面-------------------*/
    bindCardController.$inject = ['$scope', '$state', '$q', '$verifyService', '$cardService', '$timeout', '$window', '$customerService'];

    function bindCardController($scope, $state, $q, $verifyService, $cardService, $timeout, $window, $customerService) {
        var vm = this;
        vm.tCard = false;
        vm.fCard = false;
        vm.stages = false;
        vm.Investment = false;
        vm.stagesBank = '';
        vm.InvestmentBank = '';
        $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
        $scope.token = localStorage.getItem('sinks-token');
        $scope.sign = '';
        $verifyService.SetIOSTitle("我的银行卡");
        getbindCard()

        function getbindCard() {
            sign();
            //查询绑卡信息
            $cardService.querybindCard({

            }).success(function(data) {
                if (data.resultCode == '0000') {
                    if (data.result.bankList.length == 0) {
                        vm.fCard = true;
                    } else if (data.result.bankList.length == 1) {
                        if (data.result.bankList[0].msg == "fqg") {
                            vm.stages = true;
                            vm.stagesname = data.result.bankList[0].bankName;
                            vm.stagescard = data.result.bankList[0].bankCardNo.substr(data.result.bankList[0].bankCardNo.length - 4);
                        } else if (data.result.bankList[0].msg == "tzs") {
                            vm.Investment = true;
                            vm.fCard = true;
                            vm.Investmentname = data.result.bankList[0].bankName;
                            vm.Investmentcard = data.result.bankList[0].bankCardNo.substr(data.result.bankList[0].bankCardNo.length - 4);
                        }
                    } else if (data.result.bankList.length == 2) {
                        vm.stages = true;
                        vm.Investment = true;
                        vm.stagesname = data.result.bankList[0].bankName;
                        vm.stagescard = data.result.bankList[0].cardNo.substr(data.result.bankList[0].cardNo.length - 4);
                        vm.Investmentname = data.result.bankList[1].bankName;
                        vm.Investmentcard = data.result.bankList[1].bankCardNo.substr(data.result.bankList[1].bankCardNo.length - 4);
                    }
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
        $scope.bindCard = function() {
                //分期购
                location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y';
                s
            }
            /*$scope.Investment = function(){
    //投资送
			$state.go('bankCard',{  
        flag : 'Investment'
      })
		}*/

        $scope.alert = function() {
            new dialog().confirm({
                content: "400-966-0198",
                cancelBtnText: '取消',
                confirmBtnText: '拨打',
                confirmBtn: function() {
                    window.location.href = "tel:400-966-0198";
                }
            })
        }
    }
    /*--------------------解绑页面-------------------*/
    unbindCardController.$inject = ['$scope', '$state', '$q', '$verifyService', '$cardService', '$timeout', '$window'];

    function unbindCardController($scope, $state, $q, $verifyService, $cardService, $timeout, $window) {
        var vm = this;
        $verifyService.SetIOSTitle("解绑银行卡");
    }
});