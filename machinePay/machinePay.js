define(['angular','css!./machinePay.css'], function(angular) {
    angular.module('app').
    controller('machinePayController', machinePayController);
   
  
      // ------------------------------------贩卖机扫码确认支付--------------------------------------------------------
      angular.module('app').controller('machinePayController', machinePayController);
      machinePayController.$inject = ['$scope', '$state', '$q','userInfo','$verifyService','$rootScope','$userService','$timeout','$window','$stateParams','$customerService','$productService'];
      function machinePayController($scope, $state, $q,userInfo,$verifyService,$rootScope,$userService,$timeout,$window,$stateParams,$customerService,$productService) {
        var vm = this;
        vm.toLogin = toLogin;
        vm.goRegister = goRegister;
        vm.submit = submit;
        vm.close = close;
        vm.change = change;
        vm.userName="";
        vm.passWord="";
        vm.forgetPassword = forgetPassword;
        $scope.goodName = decodeURI($window.location.href.split('&')[0].split('=')[1]);
        $scope.orderNo = $stateParams.orderNo;
        $scope.orderAmount = $stateParams.orderAmount/100;
        $scope.mobile = JSON.parse($window.localStorage.getItem('$$payload'));
        vm.show = '';
        vm.coupon = true;
        // console.log(decodeURI($window.location.href.split('&')[2].split('=')[1]))
        // vm.goRegister = goRegister;
        vm.openId = $stateParams.openId;
        var a = $stateParams.openId||$window.sessionStorage.getItem('openId');
        //获取openId 	
        if(a){
          $window.sessionStorage.setItem('openId',a) 
          }else{
          $window.sessionStorage.setItem('openId','');
          }
        $verifyService.SetIOSTitle("确认支付页");

        $scope.payment=function(){
            if($window.localStorage.getItem('sinks-token')){
                $customerService.judgePassword({
      
                }, localStorage.getItem("sinks-token")).success(function(data) {
                    if (data.resultCode == '0000') {
                      $(".dialog-wrap2").fadeIn();
                    } else if (data.resultCode == '002') {
                        toolTip('请设置支付密码')
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
              }else{
                $(".dialog-wrap1").fadeIn();
              }
        }



        // 取消弹窗
        $scope.cancel=function(){
            $(".dialog-wrap1").fadeToggle();
        }

        // 登录
        function toLogin(){
          if($verifyService.isPhoneNum(vm.userName) && $verifyService.isLoginPwd(vm.passWord)){
              var wait = new waiting();
              $userService.login({
                  channelId:$userService.$$channelId,
                  phoneNum:vm.userName,
                  passWord:vm.passWord,
                  openId:$window.sessionStorage.getItem('openId'),
                  unionId:$window.sessionStorage.getItem('unionId')
              }).success(function(data){
                  if(data.resultCode == "0000"){
                      // var auth= $window.localStorage.getItem($AuthTokenName);
                      // $service.getAllHshCustInfo(auth)
            
                              if(data.result.pwdModifyFlag==1){
                                  new dialog().confirm({
                                      content : "您的登录密码已经90天没有修改，为了您账号安全，建议您现在去修改。",
                                      cancelBtnText : "三个月后再说",
                                      confirmBtnText : "立即修改",
                                      confirmBtn : function(){
                                          $state.go('editPassword', null, {
                                              location: 'replace'
                                          });
                                      },
                                      cancelBtn : function(){
                                          var config=$window.localStorage.getItem($AuthTokenName);
                                          $userService.deLayPwdModify({},{"Authorication":config}).success(function(data){
                                              if(data.resultCode == "0000"){
                                                
                                              }
                                          });
                                      }
                                  })
                              }else{
                                $(".dialog-wrap1").fadeToggle();
                                
                                new dialog().confirm({
                                  content:'<img style="width:100%;height:100%" src="./machinePay/images/success.png">',
                                    })
                                  $('.dialog-content').css('width','46%');
                                  $('.dialog-content').css('left','27%');
                                  $('.dialog-wrap .content').css('width','100%');
                                  $('.dialog-wrap .content').css('height','3.546667rem');
                                  $('.dialog-wrap .content').css('padding','0')
                                  $('.confirm-btn').css('display','none');
                                  $('.cancel-btn').css('display','none');
                                  setTimeout(function(){
                                    $('.dialog-wrap').fadeToggle();
                                    $window.location.reload();
                                  },1000)
                                  
                              }
                        
                      
                  }else{
                      toolTip(data.resultMessage);
                  }
                  wait.hide();
              });
          }else{
              toolTip("请输入正确的电话号码和密码")
          }

      }

      // 忘记密码
      function forgetPassword(){
        // $(".dialog-wrap1").fadeToggle();
        sessionStorage.setItem('machinePayUrl',JSON.stringify($window.location.href))
        $state.go("forgotPassword",{
          state:'machinePay',
        }, {
          location: 'replace'
        });
      }

      // 去注册
      function goRegister(){
          sessionStorage.setItem('machineGoRegisterUrl',JSON.stringify($window.location.href))
          $state.go("register",{
            state:'machinePay',
          }, {
            location: 'replace'
          });
      }

      // 更改账号
      function change(){
         $(".dialog-wrap2").fadeToggle();
         $(".dialog-wrap1").fadeIn();
      }

      // 确认支付
      function submit(){
        if($('#pwd-input').val().length == 6){
            if($window.localStorage.getItem('sinks-token')){
                $customerService.accountMount({}, localStorage.getItem("sinks-token")).success(function(data) {
                    if (data.resultCode == '0000' || data.resultCode == '001') {
                        if (data.result.accountAmount >= $stateParams.orderAmount/100) {
                            $scope.mobile = JSON.parse($window.localStorage.getItem('$$payload'));
                            var wait = new waiting();
                            $customerService.machinePay({
                              accountNum:$scope.mobile.mobile,
                              payPassword :$('#pwd-input').val(),
                              thridOrderNo:$stateParams.orderNo,
                              consumeAmount:$stateParams.orderAmount/100,
                              goodsName:$scope.goodName
                            }).success(function(data){
                              wait.hide();
                              if(data.resultCode=='0000'){
                                  vm.show = true;
                                  $(".dialog-wrap2").fadeToggle();
                                  if(data.result.firstSign == '0'){
                                      vm.coupon = false;
                                  }else if(data.result.firstSign == '1'){
                                      vm.coupon = true;
                                  }
                              }else if(data.resultCode=='005'||data.resultCode=='001'){
                                $('.dialog-wrap2').fadeToggle();
                                new dialog().confirm({
                                  content : '余额不足',
                                  cancelBtnText : "取消",
                                  confirmBtnText : "去充值",
                                  confirmBtn : function(){
                                    var wait = new waiting();
                                    sessionStorage.setItem('rechargeCallbackUrl',JSON.stringify($window.location.href))
                                    $state.go('sweepRecharge',{
                                      
                                    },{
                                      location:'replace'
                                      })
                                    wait.hide();
                                  }
                                })
                                $('.content').css('text-align','center')
                                $('.content').css('font-size','0.4rem')
                                $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                                $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                                $('.dialog-wrap .dialog-content').css('width','62%')
                                $('.dialog-wrap .dialog-content').css('left','19%')
                                $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right','1px solid #dcdcdc')
                              }else if(data.resultCode=='003'){
                                $('.dialog-wrap2').fadeToggle();
                                new dialog().confirm({
                                  content : '支付密码错误，请重试',
                                  cancelBtnText : "忘记密码",
                                  confirmBtnText : "重试",
                                  cancelBtn : function(){
                                    var wait = new waiting();
                                    sessionStorage.setItem('machineForgetUrl',JSON.stringify($window.location.href))
                                    $state.go('forgetBalancePassword',{
                                      state:'machine'
                                    },{
                                      location:'replace'
                                      })
                                    wait.hide();
                                  },
                                  confirmBtn : function(){
                                    $('.dialog-wrap').css('display','none');
                                    $(".dialog-wrap2").fadeIn();
                                  }
                                })
                                $('.content').css('text-align','center')
                                $('.content').css('font-size','0.4rem')
                                $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                                $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#342f33')
                                $('.dialog-wrap .dialog-content').css('width','62%')
                                $('.dialog-wrap .dialog-content').css('left','19%')
                                $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right','1px solid #dcdcdc')
                              }
                              else{
                                toolTip(data.resultMessage)
                              }
                            })
                        } else {
                            // $('.dialog-wrap2').fadeToggle();
                            new dialog().confirm({
                                content: '余额不足',
                                cancelBtnText: "取消",
                                confirmBtnText: "去充值",
                                confirmBtn: function() {
                                    var wait = new waiting();
                                    sessionStorage.setItem('rechargeCallbackUrl', JSON.stringify($window.location.href))
                                    $state.go('sweepRecharge', {
          
                                    }, {
                                        location: 'replace'
                                    })
                                    wait.hide();
                                }
                            })
                            $('.content').css('text-align','center')
                            $('.content').css('font-size','0.4rem')
                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                            $('.dialog-wrap .dialog-content').css('width','62%')
                            $('.dialog-wrap .dialog-content').css('left','19%')
                            $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right','1px solid #dcdcdc')
                        }
                    } else {
                        toolTip(data.resultMessage)
                    }
                })
            }else{
                $('.dialog-wrap2').fadeToggle(); 
                $(".dialog-wrap1").fadeIn();
            }
        }else if($('#pwd-input').val().length < 6){
          toolTip('请输入6位支付密码')
        }

        
      }

      // 卡券跳转
      $scope.skip = function(){
          $state.go('home', null, {
            location: 'replace'
          });
      }


      // 取消支付
      function close(){
        $(".dialog-wrap2").fadeToggle();
      }


      // 支付密码框
      var $input = $(".fake-box input");  
      $("#pwd-input").on("input", function() {  
          var pwd = $(this).val().trim();  
          for (var i = 0, len = pwd.length; i < len; i++) {  
              $input.eq("" + i + "").val(pwd[i]);  
          }  
          $input.each(function() {  
              var index = $(this).index();  
              if (index >= len) {  
                  $(this).val("");  
              }  
          });  
          // if (len == 6) {  
          //       console.log($('#pwd-input').val())
          // }  
      });  



      }
  });