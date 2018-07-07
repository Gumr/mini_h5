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

    loginController.$inject = ['$scope', '$state', "$stateParams", '$verifyService', "$userService", '$window','$customerService','$productService'];

    function loginController($scope, $state, $stateParams, $verifyService, $userService, $window,$customerService,$productService) {
        var vm = this;
        vm.userName = "";
        vm.passWord = ""
        vm.toLogin = toLogin;
        vm.goRegister = goRegister;
        vm.tab = 0;
        vm.confirm = confirm;
        vm.sendSM = sendSM;
        vm.codeLogin = codeLogin;
        vm.phoneNum = '';
        vm.code = '';
        $verifyService.SetIOSTitle("登录");
        vm.openId = $stateParams.openId;
        if ($stateParams.url) {
            sessionStorage.setItem('hshurl', $stateParams.url)
        }
        var a = $stateParams.openId || $window.sessionStorage.getItem('openId');

        $scope.stateArg = $stateParams.state

        //获取openId 	
        if (a) {
            $window.sessionStorage.setItem('openId', a)
        } else {
            $window.sessionStorage.setItem('openId', '');
        }
        //密码显示隐藏
        vm.passwordShow = passwordShow;

        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'passwordlogin',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        vm.tab1 = tab1;
        function tab1(){
            vm.tab = 0
        }
        vm.tab2 = tab2;
        function tab2(){
            vm.tab = 1
        }
        vm.monitor1 = monitor1;
        vm.monitor2 = monitor2;

        function monitor1(){
            if(vm.tab == 0){
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'messageloginpage',
                    pageModule: 'forgotpassword',
                    pageValue: ''
                }).success(function(data) {
    
                })
            }else if(vm.tab == 1){
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'passwordlogin',
                    pageModule: 'forgotpassword',
                    pageValue: ''
                }).success(function(data) {
    
                })
            }
        }

        function monitor2(){
            if(vm.tab == 0){
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'messageloginpage',
                    pageModule: 'register',
                    pageValue: ''
                }).success(function(data) {
    
                })
            }else if(vm.tab == 1){
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'passwordlogin',
                    pageModule: 'register',
                    pageValue: ''
                }).success(function(data) {
    
                })
            }
        }

        function toLogin() {
            vm.monitor('loginbutton','');
            if ($verifyService.isPhoneNum($('#username').val()) && $verifyService.isLoginPwd($('#password').val())) {
                var wait = new waiting();
                $userService.login({
                    channelId: $userService.$$channelId,
                    phoneNum: $('#username').val(),
                    passWord: $('#password').val(),
                    openId: $window.sessionStorage.getItem('openId'),
                    unionId: $window.sessionStorage.getItem('unionId')
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        // var auth = $window.localStorage.getItem($AuthTokenName);
                        $userService.getAllHshCustInfo($userService.getAuthorication)
                        if ($stateParams.state) {
                            switch ($stateParams.state) {
                                case 'productDetails':
                                    var place = JSON.parse(sessionStorage.getItem('place'));
                                    $state.go($stateParams.state, {
                                        goodsId: $stateParams.param1,
                                        businessType: sessionStorage.getItem('businessType'),
                                        utm_term: sessionStorage.getItem('utmterm'),
                                        utm_source: sessionStorage.getItem('utm_source'),
                                        utm_medium: sessionStorage.getItem('utm_medium'),
                                        sku: place.sku,
                                        // goodsId: place.goodsId,
                                        addressId: place.addressId,
                                        goodsnum: place.goodsnum,
                                        channelId: place.$$channelId,
                                        salePrice: place.salePrice,
                                        attributes: place.attributes,
                                        basicSoluPrice: place.basicSoluPrice
                                    }, {
                                        location: 'replace'
                                    });
                                    break;
                                case 'interest':
                                    $state.go($stateParams.state, {}, {
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
                                        couponContent: $stateParams.couponContent,
                                        cardCode: $stateParams.cardCode, 
                                        cardContent: $stateParams.cardContent,
                                    }, {
                                        location: 'replace'
                                    });
                                    break;
                                case 'car':
                                $customerService.getdoGoodsDetail({
                                    goodsId: $stateParams.goodsId,
                                    channelId: sessionStorage.channelId
                                }).success(function(data) {
                                    if (data.resultCode = "0000") {
                                        $state.go('confirm', {
                                            goodsId: data.result.goodsId,
                                            goodsnum: 1,
                                            salePrice: data.result.salePrice,
                                            attributes: JSON.stringify([]),
                                            spikeStatus : 0,
                                            basicSoluPrice: data.result.basicSoluPrice,
                                            couponContent: 0,
                                            flagbit : 'car'
                                        }, {
                                            location: 'replace'
                                        });
                                    } else {
                                        toolTip(data.resultMessage)
                                    }
                                });
                                    break;
                                case 'order':
                                    location.href = httpsHeader + '/mall/orderAction/orderConfirm.action?orderId=' + $stateParams.param1;
                                    break;
                                case 'sweepRecharge':
                                    location.href = JSON.parse(sessionStorage.getItem('sweepRechargeUrl'));
                                    sessionStorage.removeItem("sweepRechargeUrl");
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
                                                                state: $stateParams.param1,
                                                            }, {
                                                                location: 'replace'
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        } else {
                                            $state.go($stateParams.state, {
                                                state: $stateParams.param1,
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
                            } else if (sessionStorage.getItem('hshurl')) {
                                location.href = sessionStorage.getItem('hshurl');
                                sessionStorage.removeItem('hshurl');
                            } else if ($stateParams.url) {
                                location.href = $stateParams.url;
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
            $state.go("register", {
                machineId: $stateParams.machineId,
                flagbit : $stateParams.state,
                goodsId : $stateParams.goodsId
            });
        }


        // 验证码快捷登录

        action();

        function action() {
            openBtn();
        }


        function sendSM() {
            if ($verifyService.isPhoneNum(vm.phoneNum)) {
                send();
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'messageloginpage',
                    pageModule: 'getverificationcode',
                    pageValue: ''
                }).success(function(data) {
    
                })
            } else {
                toolTip('请输入正确的电话号码');
            }
        }

        function send() {
            var wait = new waiting();
            $userService.sendCode({
                phoneNum: vm.phoneNum,
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    $('#code').focus();
                    closeBtn();
                    setTime(60);
                    toolTip("短信验证码发送成功,请注意查收!");
                } else {
                    toolTip(data.resultMessage);
                    openBtn();
                }
            });
            wait.hide();
        }

        function codeLogin() {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'messageloginpage',
                pageModule: 'loginbutton',
                pageValue: ''
            }).success(function(data) {

            })
            if (vm.phoneNum != null && vm.phoneNum != "" && $verifyService.isPhoneNum(vm.phoneNum)) {
                if (vm.code != null && vm.code != "") {
                    var wait = new waiting();
                    $userService.codeLogin({
                        channelId: $userService.$$channelId,
                        phoneNum: vm.phoneNum,
                        verifyCode: vm.code,
                        openId: $window.sessionStorage.getItem('openId'),
                        unionId: $window.sessionStorage.getItem('unionId')
                    }).success(function(data) {
                        if (data.resultCode == "0000") {
                            // var auth = $window.localStorage.getItem($AuthTokenName);
                            $userService.getAllHshCustInfo($userService.getAuthorication)
                            if ($stateParams.state) {
                                switch ($stateParams.state) {
                                    case 'productDetails':
                                        var place = JSON.parse(sessionStorage.getItem('place'));
                                        $state.go($stateParams.state, {
                                            goodsId: $stateParams.param1,
                                            businessType: sessionStorage.getItem('businessType'),
                                            utm_term: sessionStorage.getItem('utmterm'),
                                            utm_source: sessionStorage.getItem('utm_source'),
                                            utm_medium: sessionStorage.getItem('utm_medium'),
                                            sku: place.sku,
                                            // goodsId: place.goodsId,
                                            addressId: place.addressId,
                                            goodsnum: place.goodsnum,
                                            channelId: place.$$channelId,
                                            salePrice: place.salePrice,
                                            attributes: place.attributes,
                                            basicSoluPrice: place.basicSoluPrice
                                        }, {
                                            location: 'replace'
                                        });
                                        break;
                                    case 'interest':
                                        $state.go($stateParams.state, {}, {
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
                                            couponContent: $stateParams.couponContent,
                                            cardCode: $stateParams.cardCode, 
                                            cardContent: $stateParams.cardContent,
                                        }, {
                                            location: 'replace'
                                        });
                                        break;
                                    case 'car':
                                        $customerService.getdoGoodsDetail({
                                            goodsId: $stateParams.goodsId,
                                            channelId: sessionStorage.channelId
                                        }).success(function(data) {
                                            if (data.resultCode = "0000") {
                                                $state.go('confirm', {
                                                    goodsId: data.result.goodsId,
                                                    goodsnum: 1,
                                                    salePrice: data.result.salePrice,
                                                    attributes: JSON.stringify([]),
                                                    spikeStatus : 0,
                                                    basicSoluPrice: data.result.basicSoluPrice,
                                                    couponContent: 0,
                                                    flagbit : 'car'
                                                }, {
                                                    location: 'replace'
                                                });
                                            } else {
                                                toolTip(data.resultMessage)
                                            }
                                        });
                                        break;
                                    case 'order':
                                        location.href = httpsHeader + '/mall/orderAction/orderConfirm.action?orderId=' + $stateParams.param1;
                                        break;
                                    case 'sweepRecharge':
                                        location.href = JSON.parse(sessionStorage.getItem('sweepRechargeUrl'));
                                        sessionStorage.removeItem("sweepRechargeUrl");
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
                                            
                                            $state.go($stateParams.state, {
                                                state: $stateParams.param1,
                                            }, {
                                                location: 'replace'
                                            });
                                            
                                        } else {
                                            
                                            $state.go('myCenter', null, {
                                                location: 'replace'
                                            });
                                            
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
                                }else if (sessionStorage.getItem('hshurl')) {
                                    location.href = sessionStorage.getItem('hshurl');
                                    sessionStorage.removeItem('hshurl'); 
                                } else if ($stateParams.url) {
                                    location.href = $stateParams.url;
                                }  else {
                                    
                                    $state.go('myCenter', null, {
                                        location: 'replace'
                                    });
                                    
                                }
                            }
                        } else {
                            toolTip(data.resultMessage);
                        }
                        wait.hide();
                    });

                } else {
                    toolTip("请输入手机验证码")
                }
            } else {
                toolTip("请输入正确的手机号码")
            }
        }

        function openBtn() {
            $('.getcode').html('获取验证码');
            $('.getcode').attr('disabled', false);
        }

        function closeBtn() {
            $('.getcode').attr('disabled', true);
            $('.getcode').html('重新发送<span>' + 60 + '</span>(s)');
        }

        function setTime(time) {
            var timer = setInterval(function() {
                time--;
                $('.getcode').find('span').text(time)
                if (time <= 0) {
                    clearInterval(timer);
                    $('.getcode').html('获取验证码');
                    $('.getcode').attr('disabled', false);
                }
            }, 1000)
        }


    }


    //注册
    registerController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$userService', '$window','$customerService','$productService'];

    function registerController($scope, $state, $stateParams, $verifyService, $userService, $window, $customerService,$productService) {
        var vm = this;
        vm.verCode = "";
        vm.verifyNum = "";
        vm.verifyCode = httpsHeader + "/mall/verificatCodeAction/getVerifyCode.action?verifyType=regist&t=" + Math.random();
        $verifyService.SetIOSTitle("注册");
        $stateParams.signkey = $verifyService.getQueryParam("signkey");
        $stateParams.vendingCode = $verifyService.getQueryParam("vendingCode");
        vm.isSD = false;
        vm.regist = regist;
        vm.sendSM = sendSM;
        vm.checkCode = "";
        vm.userName = $stateParams.phoneNum ? $stateParams.phoneNum : '';
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
        $scope.originCode = '200408573600703';
        vm.monitor = monitor; //埋点
        // 埋点
        function monitor(pageModule,pageValue) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'registerpage',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
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
        // 贩卖机扫码关注后推送注册链接 -- 注册地址待贩卖机参数
		$stateParams.scanLinkVendFlag ? sessionStorage.setItem('vendScanCodeParams', $stateParams.scanLinkVendFlag) : "";

        if (sessionStorage.getItem('shareMakemoneyToken')) {
            $scope.originCode = '200408572600720';
        }
        //失去焦点
        function Verification() {
            var wait = new waiting();
            $userService.checkRegistVerify({
                phoneNum: vm.userName
            }).success(function(data) {
                if (data.resultCode == '0000') {
                    wait.hide();
                    /*$scope.qiqi = true;
					var verifyCode = '';
		        	vm.getVerifyCode = function (){
			            verifyCode = httpsHeader+"/mall/verificatCodeAction/getVerifyCode.action?verifyType=regist&t="+Math.random();
			        };
		    		new dialog().confirm({
						content:'<div class="item-form">'+
									'<label for="verification"><i class="icon-input i-verification"></i></label>'+
									'<input id="register-verification" maxlength="4" type="text" name="" ng-model="vm.verifyNum" placeholder="请输入验证码">'+
									'<span class="verification-code" id="txcode"><img id="verCode" ></span>'+
								'</div>',
		        		confirmBtn : function(){
		        			$scope.verification = $('#register-verification').val();
		        			send();
		        			
		        		}
		        	})
		    		$('.confirm-btn').css('background-color','#aaa');
		    		$('.confirm-btn').css('color','#fff');
		    		$('.confirm-btn').removeClass('confirm-btn');
		    		$('#register-verification').bind('input propertychange', function() {  
		    			if($(this).val().length!=4){
		    				$('.confirm-btn').css('background-color','#aaa')
		    				$('.confirm-btn').removeClass('confirm-btn')
		    			}else{
		    				$('.flex-2').addClass('confirm-btn')
		    				$('.flex-2').css('background-color','#ff602e')
		    			}
					});  
		    		vm.getVerifyCode();
		    		$("#verCode").attr("src",verifyCode);
		    		$("#txcode").click(function(){
					    vm.getVerifyCode();
					    $("#verCode").attr("src",verifyCode);
				  	});*/
                    initNECaptcha({
                        captchaId: '84cc0ec761134f59a46c953ec71f8087',
                        element: '#captcha',
                        mode: 'popup',
                        onReady: function(instance) {

                            // 验证码一切准备就绪，此时可正常使用验证码的相关功能

                        },
                        onVerify: function(err, data) {

                            if (data) {
                                $scope.verification = data.validate;
                                send();
                            }

                        }
                    }, function onload(instance) {

                        // 初始化成功
                        instance.popUp();

                    }, function onerror(err) {

                        // 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化

                    })
                } else {
                    wait.hide();
                    //vm.verifyNum = '';
                    toolTip(data.resultMessage);
                }
            });
        }

        var a = $stateParams.openId || $window.sessionStorage.getItem('openId');
        //获取openId 	
        if (a) {
            $window.sessionStorage.setItem('openId', a)
        } else {
            $window.sessionStorage.setItem('openId', '');
        }

        vm.deletel = function() {
                vm.userName = "";
            }
            //发送短信确认框
        vm.verificationLayerOpen = function() {
            monitor('registerbutton','')
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
            if (vm.newPassword == null && vm.newPassword == "" && vm.newPassword.length < 6 || vm.checkCode.length > 20) {
                toolTip("请设置正确登录密码");
                return;
            }

            watchman.flush(function() {
                $scope.token = watchman.getToken();
                regist();
            });

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
            monitor('getverificationcode','');
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
                    //$('.login-check').slideDown();
                    closeBtn();
                    setTime(60);
                    toolTip('校验码已发送到您的手机,2分钟内输入有效,请勿泄露');
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
            if ($stateParams.state == 'machinePay') {
                // 贩卖机扫码支付支付支付注册
                var wait = new waiting();
                $userService.regist({
                    token: $scope.token,
                    openId: $window.sessionStorage.getItem('openId'),
                    channelId: $userService.$$channelId,
                    phoneNum: vm.userName,
                    passWord: vm.newPassword,
                    checkCode: vm.checkCode,
                    recomPhoneNum: vm.recomPhoneNum,
                    uId: sessionStorage.getItem('uId'),
                    unionId: $window.sessionStorage.getItem('unionId'),
                    originCode: $scope.originCode,
                    vendScanCodeParams: sessionStorage.getItem('vendScanCodeParams')
                }).success(function(data) {
                    wait.hide();
                    if (data.resultCode == "0000") {
                        if (data.result.drawCode) {
                            location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                        } else {
                            if (sessionStorage.getItem('machineGoRegisterUrl')) {
                                location.href = JSON.parse(sessionStorage.getItem('machineGoRegisterUrl'));
                                sessionStorage.removeItem("machineGoRegisterUrl");
                            }
                        }
                    } else {
                        toolTip(data.resultMessage);
                    }

                });
            } else if ($stateParams.machineId) {
                // 贩卖机扫码注册
                var wait = new waiting();
                $userService.regist({
                    token: $scope.token,
                    openId: $window.sessionStorage.getItem('openId'),
                    channelId: $userService.$$channelId,
                    phoneNum: vm.userName,
                    passWord: vm.newPassword,
                    checkCode: vm.checkCode,
                    recomPhoneNum: vm.recomPhoneNum,
                    uId: sessionStorage.getItem('uId'),
                    unionId: $window.sessionStorage.getItem('unionId'),
                    originCode: $scope.originCode,
                    vendScanCodeParams: sessionStorage.getItem('vendScanCodeParams')
                }).success(function(data) {
                    wait.hide();
                    if (data.resultCode == "0000") {
                        if (data.result.drawCode) {
                            location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                        } else {
                            new dialog().confirm({
                                content: '恭喜注册成功，获得1次抽奖机会！请在贩卖机屏幕上点击抽奖吧',
                                confirmBtnText: "好的",
                                confirmBtn: function() {
                                    var wait = new waiting();
                                    $userService.registDraw({
                                        luckydrawSourceType: 1,
                                        rechargeMoney: '',
                                        mobile: vm.userName,
                                        machineNum: $stateParams.machineId,
                                    }).success(function(data) {
                                        wait.hide();
                                        if (data.resultCode == "0000") {
                                            if (sessionStorage.getItem('sweepRechargeUrl')) {
                                                location.href = JSON.parse(sessionStorage.getItem('sweepRechargeUrl'));
                                                sessionStorage.removeItem("sweepRechargeUrl");
                                            } else {
                                                $state.go("home", {

                                                }, {
                                                    location: 'replace'
                                                });
                                            }

                                        } else {
                                            toolTip(data.resultMessage);
                                        }

                                    });
                                }
                            })
                            $('.content').css('text-align', 'center')
                            $('.content').css('font-size', '0.4rem')
                            $('.cancel-btn').css('display', 'none')
                            $('.content h1').css('font-weight', 'bold')
                        }
                    } else {
                        toolTip(data.resultMessage);
                    }

                });
            } else if (vm.isSD) {
                //时代注册
                var wait = new waiting();
                $userService.regist({
                    token: $scope.token,
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
                        token: $scope.token,
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
                        token: $scope.token,
                        openId: $window.sessionStorage.getItem('openId'),
                        channelId: $stateParams.channelId ? $stateParams.channelId : $userService.$$channelId,
                        phoneNum: vm.userName,
                        passWord: vm.newPassword,
                        checkCode: vm.checkCode,
                        recomPhoneNum: vm.recomPhoneNum,
                        uId: sessionStorage.getItem('uId'),
                        unionId: $window.sessionStorage.getItem('unionId'),
                        originCode: $scope.originCode,
                        vendScanCodeParams: sessionStorage.getItem('vendScanCodeParams')
                    }).success(function(data) {
                        wait.hide();
                        if (data.resultCode == "0000") {
                            $userService.getAllHshCustInfo($userService.getAuthorication)
                            if (data.result.drawCode) {
                                location.href = httpsHeader + '/mall/vendRewardAction/toShowDrawCodeQrCode.action?drawCode=' + data.result.drawCode + '&drawQr=' + data.result.drawQr + '&invalidTime=' + data.result.invalidDate;
                            } else {
                                sessionStorage.setItem('regist', JSON.stringify(data.result))
                                if ($scope.businessType == 'faceTake') {
                                    location.href = 'https://test8hsh.hlej.com/ActivityProject/faceSwipping/face.html'
                                } else if (sessionStorage.getItem('hshurl')) {
                                    location.href = sessionStorage.getItem('hshurl');
                                    sessionStorage.removeItem('hshurl');
                                } else if (sessionStorage.getItem('place')) {
                                    var place = JSON.parse(sessionStorage.getItem('place'));
                                    $state.go('confirm', {
                                        goodsId: $stateParams.param1,
                                        businessType: sessionStorage.getItem('businessType'),
                                        utm_term: sessionStorage.getItem('utmterm'),
                                        utm_source: sessionStorage.getItem('utm_source'),
                                        utm_medium: sessionStorage.getItem('utm_medium'),
                                        sku: place.sku,
                                        goodsId: place.goodsId,
                                        addressId: place.addressId,
                                        goodsnum: place.goodsNum,
                                        channelId: place.$$channelId,
                                        salePrice: place.salePrice,
                                        attributes: place.attributes,
                                        basicSoluPrice: place.basicSoluPrice
                                    }, {
                                        location: 'replace'
                                    });
                                }else if ($stateParams.flagbit == 'car') {
                                    $customerService.getdoGoodsDetail({
                                        goodsId: $stateParams.goodsId,
                                        channelId: sessionStorage.channelId
                                    }).success(function(data) {
                                        if (data.resultCode = "0000") {
                                            $state.go('confirm', {
                                                goodsId: data.result.goodsId,
                                                goodsnum: 1,
                                                salePrice: data.result.salePrice,
                                                attributes: JSON.stringify([]),
                                                spikeStatus : 0,
                                                basicSoluPrice: data.result.basicSoluPrice,
                                                couponContent: 0,
                                                flagbit : 'car'
                                            }, {
                                                location: 'replace'
                                            });
                                        } else {
                                            toolTip(data.resultMessage)
                                        }
                                    });
                                } else if (sessionStorage.getItem('interestPlace')) {
                                    $state.go('interest', {}, {
                                        location: 'replace'
                                    });
                                } else {
                                    // $state.go("registerSuccess", {
                                    //     creditMoney: data.result.creditMoney,
                                    //     isSD: false,
                                    //     userId: data.result.userId,
                                    //     mobile: data.result.mobile
                                    // }, {
                                    //     location: 'replace'
                                    // });
                                    $state.go('myCenter', null, {
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
            watchman.reset();
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
                        recomPhoneNum: vm.recomPhoneNum,
                        vendScanCodeParams: sessionStorage.getItem('vendScanCodeParams')
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