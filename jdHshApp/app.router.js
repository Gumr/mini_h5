/**
 * app.router.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular', 'angular-ui-route'], function(angular) {
  angular.module('app.router', ['ui.router']).config(router);
  router.$inject = ['$stateProvider', '$urlRouterProvider'];
  function router($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.deferIntercept();
    $urlRouterProvider.when('', '/').otherwise('/');
    $stateProvider
      .state('home', {//首页
        url: '/?Mark&isCredit',
        templateUrl: 'home/home.html',
        controller: 'HomeController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['home/home']);
          }]
        }
      })

      .state('productList', {//商品列表
        url: '/productList?oneLevelId&fromPage&listMark',
        templateUrl: 'product/productList.html',
        controller: 'productListController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['product/product']);
          }]
        }
      })

      .state('todayList', {//今日大牌
        url: '/todayList?brandName&brandId&brandPoster',
        templateUrl: 'product/todayList.html',
        controller: 'todayListController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['product/product']);
          }]
        }
      })

      .state('springSale', {//限时特惠
        url: '/springSale',
        templateUrl: 'product/springSale.html',
        controller: 'springSaleController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['product/product']);
          }]
        }
      })

      .state('easyPay', {//分期购
        url: '/easyPay?anchor',
        templateUrl: 'easyPay/easyPay.html',
        controller: 'easyPayController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['easyPay/easyPay']);
          }]
        }
      })

      .state('productDetails', {//商品详情
        url: '/productDetails?goodsId&addressId&goodsnum&attrDefaultText&businessType&utm_term&utm_source&utm_medium',
        templateUrl: 'product/productDetails.html',
        controller: 'productDetailsController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['product/product']);
          }]
        }
      })

      .state('invest', {//0元购
        url: '/invest',
        templateUrl: 'invest/invest.html',
        controller: 'investController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['invest/invest']);
          }]
        }
      })

      .state('investTime', {//0元购
        url: '/investTime?minInvestMoney&maxInvestMoney&test',
        templateUrl: 'invest/investTime.html',
        controller: 'investTimeController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['invest/invest']);
          }]
        }
      })

      .state('investIncome', {//0元购
        url: '/investIncome?minInvestMoney&maxInvestMoney&investTime&investTimeTest&test',
        templateUrl: 'invest/investIncome.html',
        controller: 'investIncomeController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['invest/invest']);
          }]
        }
      })

      .state('login', {//登录
        url: '/login?state&param1&param2&param3&param4&openId&flog&id&selected&fromPage&date&businessType&utm_term&utm_source&utm_medium&invoiceType&sku&goodsId&stages&remark&goodsnum&salePrice&attributes&invoiceTitle&invoiceContent&invoiceIsCompany&payment&basicSoluPrice&pricenum&couponCode&couponContent',
        templateUrl: 'userInto/login.html',
        controller: 'loginController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/userInto']);
          }]
        }
      })

      .state('register', {//注册
        url: '/register?openId',
        templateUrl: 'userInto/register.html',
        controller: 'registerController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/userInto']);
          }]
        }
      })

      .state('registerPassword', {//注册验证
        url: '/registerPassword?phoneNum&openId',
        templateUrl: 'userInto/registerPassword.html',
        controller: 'registerNextController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/userInto']);
          }]
        }
      })

      .state('registerAgreement', {//注册协议
        url: '/registerAgreement',
        templateUrl: 'userInto/registerAgreement.html',
        controller: 'registerAgreementController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/userInto']);
          }]
        }
      })

      .state('registerSuccess', {//注册成功
        url: '/registerSuccess?creditMoney&isSD&userId&mobile',
        templateUrl: 'userInto/registerSuccess.html',
        controller: 'registerSuccessController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/userInto']);
          }]
        }
      })

      .state('forgotPassword', {//忘记密码
        url: '/forgotPassword',
        templateUrl: 'myblocks/forgotPassword.html',
        controller: 'forgotPasswordController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/password']);
          }]
        }
      })

      .state('setPassword', {//设置密码
        url: '/setPassword?phoneNum',
        templateUrl: 'myblocks/setPassword.html',
        controller: 'setPasswordController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/password']);
          }]
        }
      })

      .state('editPassword', {//修改密码
        url: '/editPassword',
        templateUrl: 'myblocks/editPassword.html',
        controller: 'editPasswordController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/password']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'editPassword'
              },'/editPassword');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })

      .state('checkMobile', {//验证手机
        url: '/checkMobile',
        templateUrl: 'myblocks/checkMobile.html',
        controller: 'checkMobileController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/password']);
          }]
        }
      })

      .state('checkIdentity', {//验证身份
        url: '/checkIdentity',
        templateUrl: 'myblocks/checkIdentity.html',
        controller: 'checkIdentityController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/password']);
          }]
        }
      })
      .state('myCard', {//我的卡券
        url: '/myCard?mobile',
        templateUrl: 'myblocks/myCard.html',
        controller: 'myCardController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/myCard']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'myCard'
              },'/myCard');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
          }
        })

      .state('myCollection', {//我的收藏
        url: '/myCollection',
        templateUrl: 'myblocks/myCollection.html',
        controller: 'myCollectionController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/myCard']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'myCollection'
              },'/myCollection');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
          }
        })
      .state('myCenter', {//个人中心
        url: '/myCenter',
        templateUrl: 'myblocks/myCenter.html',
        controller: 'myCenterController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/user']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'myCenter'
              },'/myCenter');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
      .state('safetyCenter', {//安全中心
        url: '/safetyCenter',
        templateUrl: 'myblocks/safetyCenter.html',
        controller: 'safetyCenterController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/user']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'safetyCenter'
              },'/safetyCenter');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
      .state('deliveryAddress', {//收货地址
        url: '/deliveryAddress?consigneeId&goodsId&fromPage&stages&orderstate&ordertext&id&goodsnum&salePrice&attributes&sku&&invoiceTitle&invoiceContent&invoiceIsCompany&remark&invoiceType&payment&basicSoluPrice&couponCode&couponContent',
        templateUrl: 'myblocks/deliveryAddress.html',
        controller: 'deliveryController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/address']);
          }],goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'deliveryAddress',
              },'/deliveryAddress');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
      .state('addAddress', {//添加新地址
        url: '/addAddress?id&goodsId&fromPage&stages&orderstate&ordertext&goodsnum&salePrice&attributes&sku&invoiceTitle&invoiceContent&invoiceIsCompany&remark&invoiceType&payment&basicSoluPrice&couponCode&couponContent',
        templateUrl: 'myblocks/addAddress.html',
        controller: 'addController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/address']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'addAddress'
              },'/addAddress');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
      .state('essInfor', {//授信基本信息
        url: '/essInfor?ionviceId&id&flag',
        templateUrl: 'myblocks/essInfor.html',
        controller: 'essInforController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/essInfor']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'essInfor'
              },'/essInfor');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
      .state('workInfor', {//授信工作信息
        url: '/workInfor',
        templateUrl: 'myblocks/workInfor.html',
        controller: 'workInforController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['myblocks/essInfor']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'workInfor'
              },'/workInfor');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
      })
        .state('sesame', {//授信芝麻
          url: '/sesame',
          templateUrl: 'myblocks/sesame.html',
          controller: 'sesameController as vm',
          resolve: {
            load: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['myblocks/essInfor']);
            }],
            goLogin: ["$stateParams",'$common',function($stateParams,$common){
              return function (){
                $common.goUser({
                  state: 'sesame'
                },'/sesame');
              }
            }],
            userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
              console.log($userService.getAuthorication)
              return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
            }]
          }
        })
        .state('bankCard', {//绑卡页面
          url: '/bankCard',
          templateUrl: 'myblocks/bankCard.html',
          controller: 'bankCardController as vm',
          resolve: {
            load: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['myblocks/essInfor']);
            }],
            goLogin: ["$stateParams",'$common',function($stateParams,$common){
              return function (){
                $common.goUser({
                  state: 'bankCard'
                },'/bankCard');
              }
            }],
            userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
              console.log($userService.getAuthorication)
              return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
            }]
          }
        })
        .state('bankList', {//银行卡列表
          url: '/bankList',
          templateUrl: 'myblocks/bankList.html',
          controller: 'bankListController as vm',
          resolve: {
            load: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['myblocks/essInfor']);
            }],
            goLogin: ["$stateParams",'$common',function($stateParams,$common){
              return function (){
                $common.goUser({
                  state: 'bankList'
                },'/bankList');
              }
            }],
            userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
              console.log($userService.getAuthorication)
              return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
            }]
          }
        })
        .state('bankCardCode', {//绑定银行卡验证码
          url: '/bankCardCode',
          templateUrl: 'myblocks/bankCardCode.html',
          controller: 'bankCardCodeController as vm',
          resolve: {
            load: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['myblocks/essInfor']);
            }],
            goLogin: ["$stateParams",'$common',function($stateParams,$common){
              return function (){
                $common.goUser({
                  state: 'bankCardCode'
                },'/bankCardCode');
              }
            }],
            userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
              console.log($userService.getAuthorication)
              return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
            }]
          }
        })
      .state('part', {//商品分类
        url: '/part?id&name',
        templateUrl: 'search/part.html',
        controller: 'partController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['search/search']);
          }]
        }
      })
      .state('search', {//搜索
        url: '/search?categoryId&keywords&goodsCategories&brandName',
        templateUrl: 'search/search.html',
        controller: 'searchController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['search/search']);
          }]
        }
      })
      .state('Track', {//订单跟踪
        url: '/Track?jdOrderId',
        templateUrl: 'Order/Track.html',
        controller: 'TrackController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
      .state('Deliver', {//订单详情
        url: '/Deliver?orderId',
        templateUrl: 'Order/Deliver.html',
        controller: 'DeliverController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
       .state('Myorder', {//我的订单
        url: '/Myorder?state',
        templateUrl: 'Order/Myorder.html',
        controller: 'MyorderController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['Order/Order']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              $common.goUser({
                state: 'Myorder'
              },'/Myorder?state');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        }
        
      })
       .state('confricard', {//卡卷信息
        url: '/confricard?goodsId&addressId&goodsnum&stages&invoiceTitle&invoiceContent&invoiceIsCompany&salePrice&remark&attributes&sku&invoiceType&basicSoluPrice&payment&pricenum&couponCode&couponContent',
        templateUrl: 'Order/confricard.html',
        controller: 'confricardController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
       .state('invoice', {//发票信息
        url: '/invoice?flag&goodsId&addressId&goodsnum&invoiceTitle&invoiceContent&invoiceIsCompany&salePrice&remark&attributes&sku&payment&basicSoluPrice&couponCode&couponContent&stages',
        templateUrl: 'Order/invoice.html',
        controller: 'invoController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
        .state('confirm', {//确认订单
        url: '/confirm?goodsId&addressId&goodsnum&stages&invoiceTitle&invoiceContent&invoiceIsCompany&salePrice&remark&attributes&sku&invoiceType&basicSoluPrice&payment&couponCode&couponContent',
        templateUrl: 'Order/confirm.html',
        controller: 'confirmController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad){
            return $ocLazyLoad.load(['Order/Order']);
          }],
          goLogin: ["$stateParams",'$common',function($stateParams,$common){
            return function (){
              var confirm = JSON.parse(sessionStorage.getItem('confirm'));
              $common.goUser({
                state: 'confirm',
                invoiceType:confirm.invoiceType,
				sku : confirm.sku,
	        	goodsId : confirm.goodsId,
	        	stages : confirm.stages,
	        	remark : confirm.remark,
	        	goodsnum : confirm.goodsnum,
	        	salePrice : confirm.salePrice,
	        	attributes : confirm.attributes,
	        	invoiceTitle : confirm.invoiceTitle,
    			invoiceContent : confirm.invoiceContent,
    			invoiceIsCompany : confirm.invoiceIsCompany,
    			payment : confirm.payment,
    			basicSoluPrice : confirm.basicSoluPrice,
    			pricenum : confirm.pricenum,
    			couponCode : confirm.couponCode,
			    couponContent : confirm.couponContent 
              },'/confirm');
            }
          }],
          userInfo: ['$userService', 'goLogin', function ($userService, goLogin) {
            console.log($userService.getAuthorication)
            return $userService.isAuthenticated() ? $userService.getAllHshCustInfo($userService.getAuthorication) : goLogin();
          }]
        },
        
      })
       .state('scancode', {//二维码
        url: '/scancode?qrCodePath&orderNum&orderId&goodsId&goodsMoney',
        templateUrl: 'Order/Scancode.html',
        controller: 'scancodeController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad){
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
       .state('success', {//付款成功
        url: '/success?goodsId&orderId&goodsMoney',
        templateUrl: 'Order/success.html',
        controller: 'successController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad){
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
       .state('staging', {//分期协议
        url: '/staging?goodsId&goodsnum&salePrice&attributes&sku&basicSoluPrice&invoiceTitle&invoiceContent&invoiceIsCompany&invoiceType&payment&remark&couponCode&couponContent&stages',
        templateUrl: 'Order/staging.html',
        controller: 'stagingController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad){
            return $ocLazyLoad.load(['Order/Order']);
          }]
        }
      })
       .state('schedule', {//进度查询
        url: '/schedule?flag&afterSaleApplyId&orderId&id',
        templateUrl: 'customer/schedule.html',
        controller: 'scheduleController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
       .state('return', {//商品退回方式
        url: '/return?orderId&skuId&afterSaleApplyId&id&say&typeFrom',
        templateUrl: 'customer/return.html',
        controller: 'returnController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
       .state('logistics', {//提交物流信息
        url: '/logistics?afterSaleApplyId&flag',
        templateUrl: 'customer/logistics.html',
        controller: 'logisticsController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
       .state('Success', {//提交成功
        url: '/Success?say&orderId&id',
        templateUrl: 'customer/Success.html',
        controller: 'SuccessController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
        .state('details', {//服务单详情
        url: '/details?afsServiceId&typeFrom',
        templateUrl: 'customer/details.html',
        controller: 'detailsController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
       .state('Apply', {//申请售后
        url: '/Apply?jdOrderId&skuId&orderId',
        templateUrl: 'customer/Apply.html',
        controller: 'ApplyController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['customer/customer']);
          }]
        }
      })
      .state('tourism', {//旅游-首页
        url: '/tourism/',
        templateUrl: 'tourism/home/home.html',
        controller: 'homeCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/home/home']);
          }]
        }
      })
      .state('tourism-search', {//旅游-搜索
        url: '/tourism/search?productClass&productType&searchkeyword&placeStart&placeArrive',
        templateUrl: 'tourism/search/search.html',
        controller: 'searchCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/search/search']);
          }]
        }
      })
      .state('tourism-goodsDetail', {//旅游-商品详情
        url: '/tourism/goodsDetail?id&flog&getPackage',
        templateUrl: 'tourism/goods/goods.html',
        controller: 'goodsCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/goods/goods']);
          }]
        }
      })
      .state('tourism-setMeal', {//旅游-选择套餐
        url: '/tourism/setMeal?id&date&goodsNum&childNum&houseNum&stages&flog&adultPrice&marketPrice&childPrice&stock&roomPrice',
        templateUrl: 'tourism/goods/setMeal.html',
        controller: 'setMealCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/goods/goods']);
          }]
        }
      })
      .state('tourism-dateSelect', {//旅游-出发日期
        url: '/tourism/dateSelect?id&fromPage&goodsNum&childNum&houseNum&stages&flog',
        templateUrl: 'tourism/goods/dateSelect.html',
        controller: 'dateSelectCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/goods/goods']);
          }]
        }
      })
      .state('tourism-order', {//旅游-提交订单
        url: '/tourism/order?id&name&mobile&email&ename&emobile&addressId&ionviceId&stages&orderstate&ordertext',
        templateUrl: 'tourism/buy/order.html',
        controller: 'orderController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/buy/buy']);
          }]
        }
      })
      .state('tourism-addPerson', {//旅游-新增出游人
        url: '/tourism/addPerson?id&stages&index',
        templateUrl: 'tourism/buy/addPerson.html',
        controller: 'addPersonCtrl as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
          	return $ocLazyLoad.load(['tourism/buy/buy']);
          }]
        }
      })
      .state('tourism-invoice', {//旅游-发票信息
        url: '/tourism/invoice?id&name&mobile&email&ename&emobile&addressId&stages&orderstate&ordertext',
        templateUrl: 'tourism/buy/invoice.html',
        controller: 'invoiceController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['tourism/buy/buy']);
          }]
        }
      })
      .state('bindCard', {//解绑卡
        url: '/bindCard',
        templateUrl: 'userInto/bindCard.html',
        controller: 'bindCardController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/card']);
          }]
        }
      })
      .state('unbindCard', {//我的银行卡
        url: '/unbindCard',
        templateUrl: 'userInto/unbindCard.html',
        controller: 'unbindCardController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['userInto/card']);
          }]
        }
      })
     .state('interest', {//免息分期
        url: '/interest',
        templateUrl: 'interest/Interest.html',
        controller: 'InterestController as vm',
        resolve: {
          load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['interest/Interest']);
          }]
        }
      })
  }
});

