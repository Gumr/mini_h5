/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular','css!./user.css'], function(angular) {

  //忘记密码
  angular.module('app').controller('forgotPasswordController', forgotPasswordController);
  forgotPasswordController.$inject = ['$scope', '$state', '$q','$verifyService','$userService'];
  function forgotPasswordController($scope, $state, $q,$verifyService,$userService) {
    var vm = this;
    vm.phoneNum = "";
    vm.header = 'https://user.hlej.com/hlej/verify/getVerifyCodeForH5?sessionId=';
    vm.checkCode = "";
    vm.SMCode = "";
    vm.verifyForm = verifyForm;
    vm.verifyCode =vm.header+$scope.sessionKey+'&verifyType=forget&t=' + Math.random();
    vm.newPassword = "";
    $scope.sessionKey = "";
    vm.send = send;
    $scope.qiqi = false;
    $scope.resultmess = '';
    //密码显示隐藏
    vm.passwordShow = passwordShow;
    
    
    //
    function Verification(){
    	var wait = new waiting();
		$userService.forgetLoginPswCheck({
            phoneNum:vm.phoneNum,
        	verifyType:"forget"
        }).success(function(data){
        	wait.hide();
            if(data.resultCode == '0000'){
				vm.verifyNum = '';
            	$scope.sessionKey = data.result.sessionKey;
            	var verifyCode = '';
	        	vm.getVerifyCode = function (){
		            verifyCode = vm.header+$scope.sessionKey+'&verifyType=forget&t=' + Math.random();
		        };
	    		new dialog().confirm({
					content:'<div class="item-form">'+
								'<label for="verification"><i class="icon-input i-verification"></i></label>'+
								'<input id="register-verification" type="text" maxlength="4" name="" ng-model="vm.checkCode" placeholder="图形验证码">'+
								'<span class="verification-code" id="txcode"><img id="verCode" ></span>'+
							'</div>',
	        		confirmBtn : function(){
	        			$scope.verification = $('#register-verification').val();
	        			$userService.sendSM({
			              phoneNum:vm.phoneNum,
				          verifyType:"forget",
				          checkCode:$scope.verification,
				          sessionKey:$scope.sessionKey
				        }).success(function(data){
				            if(data.resultCode == '0000'){
				            	closeBtn();
	                    		setTime(60);
				              toolTip("短信验证码发送成功,请注意查收!");
				            }else{
				              toolTip(data.resultMessage);
				            }
				        });
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
			  	});
            }else{
            	toolTip(data.resultMessage);
            }
        });
    }
    

    action();
    function action(){
      $verifyService.SetIOSTitle("忘记密码");
      openBtn();
    }
    function verifyForm(){
      if(vm.phoneNum !=null && vm.phoneNum != "" && $verifyService.isPhoneNum(vm.phoneNum)){
        if(vm.SMCode!= null && vm.SMCode != ""){
        	if(vm.newPassword != null && vm.newPassword != ""&&vm.newPassword.length>=6){
        		completeForm();
        	}else{
        		toolTip("请输入6~20位的数字或字母作为密码")
        	}
        }else{
          toolTip("请输入手机验证码")
        }
      }else{
        toolTip("请输入正确的手机号码")
      }
    }


    function send(){
    	if($verifyService.isPhoneNum(vm.phoneNum)){
    		Verification()
    	}else{
    		toolTip('请输入正确的手机号码');
    	}	
    }
    	function openBtn (){
            $('.info-btn').html('获取验证码');
            $('.info-btn').attr('disabled',false);
        }
  		function closeBtn(){
            $('.info-btn').attr('disabled',true);
            $('.info-btn').html('重新发送<span>'+60+'</span>(s)');
        }
		function setTime(time){
            var timer = setInterval(function(){
                time--;
                $('.info-btn').find('span').text(time)
                if (time <= 0) {
                    clearInterval(timer);
                    $('.info-btn').html('获取验证码');
                    $('.info-btn').attr('disabled',false);
                }
            },1000)
        }
	    function completeForm(){
	      $userService.forgetLoginPassWord({
	        phoneNum:vm.phoneNum,
	        checkCode:vm.SMCode,
	        newPwd:vm.newPassword,
	        verifyType:"forget",
	        sessionKey:$scope.sessionKey
	      }).success(function(data){
	          if(data.resultCode == "0000"){
	            var verificationDialog = new dialog().confirm({
	                content : '尊贵的会员,您的登录密码重置成功,立马去登录吧!',
	                cancelBtn : function(){
	                  $state.go("home",null, {
	                    location: 'replace'
	                  });
	                },
	                confirmBtn : function() {
	                  $state.go("login", {
	                    phoneNum: vm.userName
	                  }, {
	                    location: 'replace'
	                  });
	              }
	            })
	          }else{
	            toolTip(data.resultMessage);
	          }
	      });
	    } 
	  }

	
	 	

  //设置密码
  angular.module('app').controller('setPasswordController', setPasswordController);
  setPasswordController.$inject = ['$scope', '$state', '$stateParams','$q','$verifyService','$userService'];
  function setPasswordController($scope, $state,$stateParams ,$q,$verifyService,$userService) {
    var vm = this;
    vm.phoneNum = $stateParams.phoneNum;
    vm.SMCode = "";
    vm.newPassword = "";
    vm.verifyForm = verifyForm;
    $verifyService.SetIOSTitle("设置密码");
    //密码显示隐藏
    vm.passwordShow = passwordShow;
    action();
    function action(){
      var timer = new countDown('.info-btn',{
        time : 60,
        callback : function(){
          $userService.sendSM({
            phoneNum:vm.phoneNum,
            verifyType:"forget"
          }).success(function(data){
            if(data.resultCode == '0000'){
              toolTip("短信验证码发送成功,请注意查收!");
            }else{
              toolTip(data.resultMessage);
            }
          console.log(data)
          });
        }
      })
    }

    function completeForm(){
      $userService.forgetLoginPassWord({
        phoneNum:vm.phoneNum,
        checkCode:vm.SMCode,
        newPwd:vm.newPassword,
        verifyType:"forget"
      }).success(function(data){
          if(data.resultCode == "0000"){
            var verificationDialog = new dialog().confirm({
                content : '尊贵的会员,您的登录密码重置成功,立马去登录吧!',
                cancelBtn : function(){
                  $state.go("home",null, {
                    location: 'replace'
                  });
                },
                confirmBtn : function() {
                  $state.go("login", {
                    phoneNum: vm.userName
                  }, {
                    location: 'replace'
                  });
              }
            })
          }else{
            toolTip(data.resultMessage);
          }
      });
    }

    function verifyForm(){
      if(vm.SMCode !=null && vm.SMCode != "" && vm.SMCode.length>=4){
        if(vm.newPassword != null && vm.newPassword != ""){
          completeForm();
        }else{
          toolTip("请输入6~20位的数字或字母作为密码")
        }
      }else{
        toolTip("请输入正确的手机验证码");
      }
    }
  }

  //修改密码
  angular.module('app').controller('editPasswordController', editPasswordController);
  editPasswordController.$inject = ['$scope', '$state', '$q','$verifyService','$userService','$timeout'];
  function editPasswordController($scope, $state, $q,$verifyService,$userService,$timeout) {
    var vm = this;
    vm.passWord = "";
    vm.newPassWord = "";
    vm.goModifyPsw = goModifyPsw;
    vm.verifyForm = verifyForm;
    $verifyService.SetIOSTitle("修改密码");
    //密码显示隐藏
    vm.passwordShow = passwordShow;
    function goModifyPsw(){
      $state.go("forgotPassword",null,{
        location:'replace'
      })
    }

    function getForm(){
      $userService.updateLoginPassWord({
          oldPwd:vm.passWord,
          newPwd:vm.newPassWord
      },{
        headers: {
          Authorication: $userService.getAuthorication
        }
      }).success(function(data){
          if(data.resultCode == "0000"){
            toolTip("登录密码修改成功");
            $timeout(function(){
              $state.go('login',null,{
                location:'replace'
              })
            },2000);
          }else{
            toolTip(data.resultMessage);
          }
      });
    }
    function verifyForm(){
      if(vm.passWord !=null && vm.passWord != "" && vm.passWord.length>=6 && vm.passWord.length<=20){
        if(vm.newPassWord != null && vm.newPassWord != "" && vm.newPassWord.length>=6 && vm.newPassWord.length<=20){
          getForm();
        }else{
          toolTip("请输入6~20位的数字或字母作为新密码")
        }
      }else{
        toolTip("请输入6~20位的旧密码");
      }
    }

  }

  //验证手机
  angular.module('app').controller('checkMobileController', checkMobileController);
  checkMobileController.$inject = ['$scope', '$state', '$q','$verifyService'];
  function checkMobileController($scope, $state, $q,$verifyService) {
    var vm = this;
    $verifyService.SetIOSTitle("验证手机");
    var timer = new countDown('.info-btn',{
      time : 60,
      callback : function(){ }
    })

  }


   //验证身份
  angular.module('app').controller('checkIdentityController', checkIdentityController);
  checkIdentityController.$inject = ['$scope', '$state', '$q','$verifyService'];
  function checkIdentityController($scope, $state, $q,$verifyService) {
    var vm = this;
    $verifyService.SetIOSTitle("验证身份");

    //密码显示隐藏
    vm.passwordShow = passwordShow;

  }


});

