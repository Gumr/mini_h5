/**
 * home.js
 * @authors Casper
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'css!./userInto.css'], function(angular) {
    //登录
    angular.module('app')
        .controller('loginController', loginController)
        .controller('registerController', registerController)
        .controller('registerNextController', registerNextController)
        .controller('registerSuccessController', registerSuccessController)
        .controller('registerAgreementController', registerAgreementController)

    loginController.$inject = ['$scope', '$state', "$stateParams", '$verifyService', "$userService", '$window'];

    function loginController($scope, $state, $stateParams, $verifyService, $userService, $window) {
        var vm = this;
        vm.userName = "";
        vm.passWord = ""
        vm.toLogin = toLogin;
        vm.goRegister = goRegister;
        $verifyService.SetIOSTitle("登录");
        vm.openId = $stateParams.openId;
        //获取openId
        $stateParams.openId ? $window.sessionStorage.setItem('openId', $stateParams.openId) : $window.sessionStorage.setItem('openId', '');
        //密码显示隐藏
        vm.passwordShow = passwordShow;

        function toLogin() {
            if ($verifyService.isPhoneNum(vm.userName) && $verifyService.isLoginPwd(vm.passWord)) {
                var wait = new waiting();
                $userService.login({
                    channelId: sessionStorage.channelId,
                    phoneNum: vm.userName,
                    passWord: vm.passWord,
                    uId: sessionStorage.getItem('uId')
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        var auth = $window.localStorage.getItem($AuthTokenName);
                        $service.getAllHshCustInfo(auth)
                        if ($stateParams.state) {
                            switch ($stateParams.state) {
                                case 'productDetails':
                                    $state.go($stateParams.state, {
                                        goodsId: $stateParams.param1,
                                        businessType: sessionStorage.getItem('businessType'),
                                        utm_term: sessionStorage.getItem('utmterm'),
                                        utm_source: sessionStorage.getItem('utm_source'),
                                        utm_medium: sessionStorage.getItem('utm_medium')
                                    }, {
                                        location: 'replace'
                                    });
                                    break;
                                case 'confirm':
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
                                        couponContent: $stateParams.couponContent
                                    }, {
                                        location: 'replace'
                                    });
                                    break;
                                case 'order':
                                    location.href = httpsHeader + '/mall/orderAction/orderConfirm.action?orderId=' + $stateParams.param1;
                                    break;
                                case 'addAddress':
                                    $state.go($stateParams.state, {
                                        goodsId: $stateParams.param1,
                                        fromPage: $stateParams.param2
                                    }, {
                                        location: 'replace'
                                    });
                                    break;
                                default:
                                    if ($stateParams.state) { //$common.isUserState($stateParams.state)
                                        if (data.result.pwdModifyFlag == 1) {
                                            new dialog().confirm({
                                                content: "您的登录密码已经90天没有修改，为了您账号安全，建议您现在去修改。",
                                                cancelBtnText: "三个月后再说",
                                                confirmBtnText: "立即修改",
                                                confirmBtn: function() {
                                                    $state.go('editPassword', null, {
                                                        location: 'replace'
                                                    });
                                                },
                                                cancelBtn: function() {
                                                    var config = $window.localStorage.getItem($AuthTokenName);
                                                    $userService.deLayPwdModify({}, { "Authorication": config }).success(function(data) {
                                                        if (data.resultCode == "0000") {
                                                            $state.go($stateParams.state, {
                                                                state: $stateParams.param1
                                                            }, {
                                                                location: 'replace'
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        } else {
                                            $state.go($stateParams.state, {
                                                state: $stateParams.param1
                                            }, {
                                                location: 'replace'
                                            });
                                        }
                                    } else {
                                        if (data.result.pwdModifyFlag == 1) {
                                            new dialog().confirm({
                                                content: "您的登录密码已经90天没有修改，为了您账号安全，建议您现在去修改。",
                                                cancelBtnText: "三个月后再说",
                                                confirmBtnText: "立即修改",
                                                confirmBtn: function() {
                                                    $state.go('editPassword', null, {
                                                        location: 'replace'
                                                    });
                                                },
                                                cancelBtn: function() {
                                                    var config = $window.localStorage.getItem($AuthTokenName);
                                                    $userService.deLayPwdModify({}, { "Authorication": config }).success(function(data) {
                                                        if (data.resultCode == "0000") {
                                                            $state.go('myCenter', null, {
                                                                location: 'replace'
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        } else {
                                            $state.go('myCenter', null, {
                                                location: 'replace'
                                            });
                                        }
                                    }
                                    break;
                            }
                        } else {
                            if ($stateParams.flog == "tourism-goodsDetail") {
                                $state.go("tourism-goodsDetail", {
                                    id: $stateParams.id,
                                    getPackage: $stateParams.selected
                                })
                            } else if ($stateParams.flog == "tourism-setMeal") {
                                $state.go("tourism-setMeal", {
                                    id: $stateParams.id,
                                    date: $stateParams.date,
                                    adultPrice: $stateParams.adultPrice
                                })
                            } else if ($stateParams.flog == "tourism-order") {
                                $state.go("tourism-order", {
                                    id: $stateParams.id,
                                    stages: $stateParams.stages
                                })
                            } else {
                                if (data.result.pwdModifyFlag == 1) {
                                    new dialog().confirm({
                                        content: "您的登录密码已经90天没有修改，为了您账号安全，建议您现在去修改。",
                                        cancelBtnText: "三个月后再说",
                                        confirmBtnText: "立即修改",
                                        confirmBtn: function() {
                                            $state.go('editPassword', null, {
                                                location: 'replace'
                                            });
                                        },
                                        cancelBtn: function() {
                                            var config = $window.localStorage.getItem($AuthTokenName);
                                            $userService.deLayPwdModify({}, { "Authorication": config }).success(function(data) {
                                                if (data.resultCode == "0000") {
                                                    $state.go('myCenter', null, {
                                                        location: 'replace'
                                                    });
                                                }
                                            });
                                        }
                                    })
                                } else {
                                    $state.go('myCenter', null, {
                                        location: 'replace'
                                    });
                                }
                            }
                        }
                    } else {
                        toolTip(data.resultMessage);
                    }
                    wait.hide();
                });
            } else {
                toolTip("请输入正确的电话号码和密码")
            }

        }

        function goRegister() {
            $state.go("register", null, {
                location: 'replace'
            });
        }
    }


    //注册
    registerController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$userService', '$window'];

    function registerController($scope, $state, $stateParams, $verifyService, $userService, $window) {
        var vm = this;
        vm.verCode = "";
        vm.verifyNum = "";
        vm.userName = "";
        vm.verifyCode = httpsHeader + "/mall/verificatCodeAction/getVerifyCode.action?verifyType=regist&t=" + Math.random();
        $verifyService.SetIOSTitle("注册");
        $stateParams.signkey = $verifyService.getQueryParam("signkey");
        $stateParams.vendingCode = $verifyService.getQueryParam("vendingCode");
        vm.isSD = false;
        vm.regist = regist;
        vm.sendSM = sendSM;
        vm.checkCode = "";
        vm.userName = $stateParams.phoneNum;
        vm.phoneName = "";
        vm.newPassword = "";
        vm.recomPhoneNum = "";
        vm.isTimeout = false;
        vm.isSD = false;
        vm.passwordShow = passwordShow;
        $scope.qiqi = false;
        $scope.verification = '';
        $scope.isAgreement = true;
        $scope.deletelt = function() {
            vm.checkCode = "";
        }
        $scope.businessType = sessionStorage.getItem('businessType');
        $scope.agreementClick = function() {
            $scope.isAgreement = !$scope.isAgreement;
        }
        if ($window.sessionStorage.getItem('channelId') == '14044841') {
            vm.isSD = true;
            $stateParams.signkey ? $window.sessionStorage.setItem('signkey', $stateParams.signkey) : $window.sessionStorage.setItem('signkey', '');
            $stateParams.vendingCode ? $window.sessionStorage.setItem('vendingCode', $stateParams.vendingCode) : $window.sessionStorage.setItem('vendingCode', '');
        }

        //失去焦点
        function Verification() {
            var wait = new waiting();
            $userService.checkRegistVerify({
                phoneNum: vm.userName
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    wait.hide();
                    $scope.qiqi = true;
                    var verifyCode = '';
                    vm.getVerifyCode = function() {
                        verifyCode = httpsHeader + "/mall/verificatCodeAction/getVerifyCode.action?verifyType=regist&t=" + Math.random();
                    };
                    new dialog().confirm({
                        content: '<div class="item-form">' +
                            '<label for="verification"><i class="icon-input i-verification"></i></label>' +
                            '<input id="register-verification" maxlength="4" type="text" name="" ng-model="vm.verifyNum" placeholder="请输入验证码">' +
                            '<span class="verification-code" id="txcode"><img id="verCode" ></span>' +
                            '</div>',
                        confirmBtn: function() {
                            $scope.verification = $('#register-verification').val();
                            send();

                        }
                    })
                    $('.confirm-btn').css('background-color', '#aaa');
                    $('.confirm-btn').css('color', '#fff');
                    $('.confirm-btn').removeClass('confirm-btn');
                    $('#register-verification').bind('input propertychange', function() {
                        if ($(this).val().length != 4) {
                            $('.confirm-btn').css('background-color', '#aaa')
                            $('.confirm-btn').removeClass('confirm-btn')
                        } else {
                            $('.flex-2').addClass('confirm-btn')
                            $('.flex-2').css('background-color', '#ff602e')
                        }
                    });
                    vm.getVerifyCode();
                    $("#verCode").attr("src", verifyCode);
                    $("#txcode").click(function() {
                        vm.getVerifyCode();
                        $("#verCode").attr("src", verifyCode);
                    });
                } else {
                    wait.hide();
                    vm.verifyNum = '';
                    toolTip(data.resultMessage);
                }
            });
        }
        //获取openId
        $stateParams.openId ? $window.sessionStorage.setItem('openId', $stateParams.openId) : $window.sessionStorage.setItem('openId', '');
        vm.deletel = function() {
                vm.userName = "";
            }
            //发送短信确认框
        vm.verificationLayerOpen = function() {

            if (!vm.userName) {
                toolTip("请输入电话号码");
                return;
            }

            if (!$verifyService.isPhoneNum(vm.userName)) {
                toolTip("请输入正确的电话号码");
                return;
            }

            if (vm.checkCode.length != 6) {
                toolTip("请输入正确的手机验证码");
                return;
            }
            regist();

        };

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
        action();

        function action() {
            if ($window.sessionStorage.getItem('channelId') == '14044841') {
                vm.isSD = true;
                $stateParams.signkey = $window.sessionStorage.getItem('signkey');
                $stateParams.vendingCode = $window.sessionStorage.getItem('vendingCode');
            }
            $verifyService.SetIOSTitle("注册验证");
            var re = /([\s\S]{3})([\s\S]{4})/
            if (!$window.sessionStorage.getItem("index")) {
                vm.isTimeout = true;
            } else {
                vm.isTimeout = false;
                openBtn();
                // var timer = new countDown('.info-btn',{
                //     time : 60,
                //     callback : function(){ }
                // })
            }

        }

        function sendSM() {
            if ($verifyService.isPhoneNum(vm.userName)) {
                Verification()
            } else {
                toolTip('请输入正确的电话号码');
            }
        }

        function send() {
            $userService.sendSM({
                phoneNum: vm.userName,
                verifyType: "regist",
                checkCode: $scope.verification
            }).success(function(data) {
                $window.sessionStorage.setItem("index", "1");
                if (data.resultCode == '0000') {
                    //disabled
                    closeBtn();
                    setTime(60);
                    // var timer = new countDown('.info-btn',{
                    //     time : 60,
                    //     callback : function(){ }
                    // })
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        function regist() {
            if (vm.isSD) {
                //时代注册
                var wait = new waiting();
                $userService.registSD({
                    openId: $window.sessionStorage.getItem('openId'),
                    channelId: $userService.$$channelId,
                    phoneNum: vm.userName,
                    passWord: vm.newPassword,
                    checkCode: vm.checkCode,
                    recomPhoneNum: vm.recomPhoneNum,
                    signkey: $stateParams.signkey,
                    vendingCode: $stateParams.vendingCode
                }).success(function(data) {
                    wait.hide();
                    if (data.resultCode == "0000") {
                        if (data.result.drawCode) {
                            location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                        } else {
                            $state.go("registerSuccess", {
                                creditMoney: data.result.creditMoney,
                                isSD: true
                            }, {
                                location: 'replace'
                            });
                        }
                    } else {
                        toolTip(data.resultMessage);
                    }

                });
            } else {
                if ($stateParams.signkey) {
                    //汇生活售货机注册
                    var wait = new waiting();
                    $userService.registSD({
                        openId: $window.sessionStorage.getItem('openId'),
                        channelId: $userService.$$channelId,
                        phoneNum: vm.userName,
                        passWord: vm.newPassword,
                        checkCode: vm.checkCode,
                        recomPhoneNum: vm.recomPhoneNum,
                        signkey: $stateParams.signkey,
                        vendingCode: $stateParams.vendingCode
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == "0000") {
                            if (data.result.drawCode) {
                                location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                            } else {
                                $state.go("registerSuccess", {
                                    creditMoney: data.result.creditMoney,
                                    isSD: true
                                }, {
                                    location: 'replace'
                                });
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }
                    });
                } else {
                    //汇生活正常注册
                    var wait = new waiting();
                    $userService.regist({
                        openId: $window.sessionStorage.getItem('openId'),
                        channelId: sessionStorage.channelId,
                        phoneNum: vm.userName,
                        passWord: vm.newPassword,
                        checkCode: vm.checkCode,
                        recomPhoneNum: vm.recomPhoneNum,
                        uId: sessionStorage.getItem('uId')
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == "0000") {
                            if (data.result.drawCode) {
                                location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                            } else {
                                sessionStorage.setItem('regist', JSON.stringify(data.result))
                                if ($scope.businessType == 'faceTake') {
                                    location.href = 'https://test8hsh.hlej.com/ActivityProject/faceSwipping/face.html'
                                } else {
                                    $state.go("registerSuccess", {
                                        creditMoney: data.result.creditMoney,
                                        isSD: false,
                                        userId: data.result.userId,
                                        mobile: data.result.mobile
                                    }, {
                                        location: 'replace'
                                    });
                                }
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }
                    });
                }
            }
        }
    }

    //注册下一步
    registerNextController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', "$userService", '$window'];

    function registerNextController($scope, $state, $stateParams, $verifyService, $userService, $window) {
        var vm = this;
        vm.regist = regist;
        vm.sendSM = sendSM;
        vm.checkCode = "";
        vm.verifyForm = verifyForm;
        vm.userName = $stateParams.phoneNum;
        vm.phoneName = "";
        vm.newPassword = "";
        vm.recomPhoneNum = "";
        vm.isTimeout = false;
        vm.isSD = false;
        vm.passwordShow = passwordShow;
        vm.deletel = function() {
            vm.checkCode = "";
        }
        action();

        function action() {
            if ($window.sessionStorage.getItem('channelId') == '14044841') {
                vm.isSD = true;
                $stateParams.signkey = $window.sessionStorage.getItem('signkey');
                $stateParams.vendingCode = $window.sessionStorage.getItem('vendingCode');
            }
            $verifyService.SetIOSTitle("注册验证");
            var re = /([\s\S]{3})([\s\S]{4})/
            vm.phoneName = vm.userName.replace(re, "$1****")
            if (!$window.sessionStorage.getItem("index")) {
                vm.isTimeout = true;
                sendSM();
            } else {
                vm.isTimeout = false;
                var timer = new countDown('.info-btn', {
                    time: 60,
                    callback: function() {}
                })
            }
        }

        function sendSM() {
            $userService.sendSM({
                phoneNum: vm.userName,
                verifyType: "regist"
            }).success(function(data) {
                $window.sessionStorage.setItem("index", "1");
                if (data.resultCode == '0000') {
                    //disabled
                    var timer = new countDown('.info-btn', {
                        time: 60,
                        callback: function() {}
                    })
                } else {
                    toolTip(data.resultMessage);
                }
            });
        }

        function regist() {
            if (vm.isSD) {
                //时代注册
                $userService.registSD({
                    openId: $window.sessionStorage.getItem('openId'),
                    channelId: $userService.$$channelId,
                    phoneNum: vm.userName,
                    passWord: vm.newPassword,
                    checkCode: vm.checkCode,
                    recomPhoneNum: vm.recomPhoneNum,
                    signkey: $stateParams.signkey,
                    vendingCode: $stateParams.vendingCode
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        if (data.result.drawCode) {
                            location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                        } else {
                            $state.go("registerSuccess", {
                                creditMoney: data.result.creditMoney,
                                isSD: true
                            }, {
                                location: 'replace'
                            });
                        }
                    } else {
                        toolTip(data.resultMessage);
                    }

                });
            } else {

                if ($stateParams.signkey) {
                    //汇生活售货机注册
                    $userService.registSD({
                        openId: $window.sessionStorage.getItem('openId'),
                        channelId: $userService.$$channelId,
                        phoneNum: vm.userName,
                        passWord: vm.newPassword,
                        checkCode: vm.checkCode,
                        recomPhoneNum: vm.recomPhoneNum,
                        signkey: $stateParams.signkey,
                        vendingCode: $stateParams.vendingCode
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            if (data.result.drawCode) {
                                location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                            } else {
                                $state.go("registerSuccess", {
                                    creditMoney: data.result.creditMoney,
                                    isSD: true
                                }, {
                                    location: 'replace'
                                });
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }
                    });
                } else {
                    //汇生活正常注册
                    $userService.regist({
                        openId: $window.sessionStorage.getItem('openId'),
                        channelId: $userService.$$channelId,
                        phoneNum: vm.userName,
                        passWord: vm.newPassword,
                        checkCode: vm.checkCode,
                        recomPhoneNum: vm.recomPhoneNum
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            if (data.result.drawCode) {
                                location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                            } else {
                                sessionStorage.setItem('regist', JSON.stringify(data.result))
                                $state.go("registerSuccess", {
                                    creditMoney: data.result.creditMoney,
                                    isSD: false,
                                    userId: data.result.userId,
                                    mobile: data.result.mobile
                                }, {
                                    location: 'replace'
                                });
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }

                    });
                }

            }


        }

        function verifyForm() {
            if (vm.userName != null && vm.userName != "") {
                if (vm.checkCode != null && vm.checkCode != "") {
                    if (vm.newPassword != null && vm.newPassword != "" && vm.newPassword.length >= 6 || vm.checkCode.length >= 20) {
                        regist();
                    } else {
                        toolTip("请设置正确登录密码")
                    }
                } else {
                    toolTip("请输入短信验证码")
                }
            } else {
                toolTip("请输入电话号码")
            }
        }
    }

    //注册协议
    registerAgreementController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService'];

    function registerAgreementController($scope, $state, $stateParams, $q, $verifyService) {
        var vm = this;
        $verifyService.SetIOSTitle("注册协议");
        var mainscroll = scroll('.main-content');
    }

    //注册成功
    registerSuccessController.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService'];

    function registerSuccessController($scope, $state, $stateParams, $q, $verifyService) {
        var vm = this;
        vm.creditMoney = $stateParams.creditMoney
        vm.isSD = $stateParams.isSD;
        vm.userid = $stateParams.userId;
        vm.mobile = $stateParams.mobile;
        if (vm.isSD == "false") {
            vm.isSD = false;
        } else {
            vm.isSD = true;
        }
        $verifyService.SetIOSTitle("注册成功");
        //$verifyService.getGrowing(vm.userid,vm.mobile)
    }

});