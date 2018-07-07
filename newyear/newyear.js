/**
 * Interest.js
 * @authors Casper 
 * @date    2016/09/01
 * @version 1.0.0
 */

define(['angular','css!./newyear.css','common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
    .controller('newyearhomeController',newyearhomeController)
    .controller('examineController',examineController)
    .controller('newyearListController',newyearListController)
    .controller('newYearDetailsController',newYearDetailsController)
    .controller('newYearConfirmController',newYearConfirmController)
    .controller('newYearAddressController',newYearAddressController)
    .controller('newYearaddAddressController',newYearaddAddressController)
    // .directive('onRepeatFinishedRender', function ($timeout) {
    //     return {
    //       restrict: 'A',
    //       link: function (scope, element, attr) {
    //         if (scope.$last === true) {
    //           $timeout(function () {
    //             scope.$emit('ngRepeatFinished', element);
    //           });
    //         }
    //       }
    //     };
    // });


    /*--------------------新年首页-------------------*/	
    newyearhomeController.$inject = ['$scope','$state','$stateParams','$verifyService','$userService','$window','$timeout'];
    function newyearhomeController($scope,$state,$stateParams,$verifyService,$userService,$window,$timeout){
    	var vm = this;
        vm.hit = hit;
        $verifyService.SetIOSTitle("新年快乐");
        function hit(){
            $state.go('examine',{

              })
        }
       
    	$timeout(function () {
       	 scroll('.main-content');
    	},300)
	
  }
	
	/*--------------------新年快乐-------------------*/	
    examineController.$inject = ['$scope', '$state','$stateParams','$verifyService','$userService','$window','$timeout','$customerService'];
    function examineController($scope, $state, $stateParams,$verifyService,$userService,$window,$timeout,$customerService){
    	var vm = this;
        vm.sendSM = sendSM;
        vm.phoneNum = '';
        vm.checkCode = '';
        vm.isTimeout = false;
        vm.confirm = confirm;
        $scope.verification = '';
        var mainScroll = "";
    	$verifyService.SetIOSTitle("新年快乐");

        

        function sendSM(){
        	if($verifyService.isPhoneNum(vm.phoneNum)){
                $customerService.qualification({
                    phoneNum:vm.phoneNum
                },localStorage.getItem("sinks-token")).success(function(data){
                    if(data.resultCode=='0000'){
                        send()
                    }else if(data.resultCode=='0030'){
                      new dialog().confirm({
                        content : "抱歉，您没有资格领取",
                        confirmBtnText : "好的",
                          })	  
                        $('.cancel-btn').css('display','none')
                        $('.content').css('text-align','center')
                        $('.content').css('font-size','0.4rem')
                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                        $('.dialog-wrap .dialog-content').css('width','70%')
                        $('.dialog-wrap .dialog-content').css('left','15%')
                    }else{
                      toolTip(data.resultMessage)
                    }
                })
        	}else{
        		toolTip('请输入正确的电话号码');
        	}
        }

        function send(){
            var wait = new waiting();
                $customerService.sendMessage({
                    phoneNum:vm.phoneNum,
              }).success(function(data){
                  if(data.resultCode == '0000'){
                    closeBtn();
                    setTime(60);
                    toolTip("短信验证码发送成功,请注意查收!");
                  }else{
                    toolTip(data.resultMessage);
                    openBtn();
                  }
              });
                wait.hide();
        }
        
    
        action();
        function action(){
          openBtn();
        }
        function confirm(){
          if(vm.phoneNum !=null && vm.phoneNum != "" && $verifyService.isPhoneNum(vm.phoneNum)){
            if(vm.checkCode!= null && vm.checkCode != ""){
              var wait = new waiting();
                $customerService.single({
                  phoneNum:vm.phoneNum,
                  checkCode:vm.checkCode,
                }).success(function(data){
                    // console.log(data);
                    if(data.resultCode == "0000"){
                        if($stateParams.state == 'newYearDetails'){
                            sessionStorage.setItem('phoneNum',vm.phoneNum);
                            sessionStorage.setItem('custId',data.result.custId);
                            $state.go('newYearDetails',{
                                goodsId:$stateParams.goodsId,
                                activityId:$stateParams.activityId
                              })
                        }else if($stateParams.state == 'newYearConfirm'){
                            sessionStorage.setItem('phoneNum',vm.phoneNum);
                            sessionStorage.setItem('custId',data.result.custId);
                            $state.go('newYearConfirm',{
                                goodsId:$stateParams.goodsId,
                                activityId:$stateParams.activityId
                              })
                        }else if($stateParams.state == 'newyearList'){
                            sessionStorage.setItem('phoneNum',vm.phoneNum);
                            sessionStorage.setItem('custId',data.result.custId);
                            $state.go('newyearList',{
                               
                              })
                        }else{
                            sessionStorage.setItem('phoneNum',vm.phoneNum);
                            sessionStorage.setItem('custId',data.result.custId);
                            $state.go('newyearList',{
                              
                            })
                        }
                     
                    }else{
                      toolTip(data.resultMessage);
                    }
                    wait.hide();
                });
                
            }else{
              toolTip("请输入手机验证码")
            }
          }else{
            toolTip("请输入正确的手机号码")
          }
        }
        
            function openBtn (){
                $('.sms-btn').html('获取验证码');
                $('.sms-btn').attr('disabled',false);
            }
              function closeBtn(){
                $('.sms-btn').attr('disabled',true);
                $('.sms-btn').html('重新发送<span>'+60+'</span>(s)');
            }
            function setTime(time){
                var timer = setInterval(function(){
                    time--;
                    $('.sms-btn').find('span').text(time)
                    if (time <= 0) {
                        clearInterval(timer);
                        $('.sms-btn').html('获取验证码');
                        $('.sms-btn').attr('disabled',false);
                    }
                },1000)
            }

       




            mainScroll = new IScroll(".main-content",{probeType : 3,preventDefault:false});
            mainScroll.on('scrollEnd', function () {
              var endY=(this.y - this.maxScrollY)
              if(endY < 100){
                $timeout(function(){
                  mainScroll.refresh();
                },300)
              }
            });
	
  }



      /*--------------------新年商品列表-------------------*/
      newyearListController.$inject = ['$scope','$state',"$verifyService","$timeout","$window",'$stateParams','$userService','$customerService','$common','$productService','$interval'];
      function newyearListController($scope, $state,$verifyService,$timeout,$window,$stateParams,$userService,$customerService,$common,$productService,$interval){
          var vm = this;
          $scope.data = {goodsList:[],}
          var jdImgServer = $productService.imgUrl[0];//jd图片服务器地址
          $scope.phoneNum = sessionStorage.getItem('phoneNum');
          $verifyService.SetIOSTitle("新年快乐");

          $customerService.newYearGood({
            phoneNum:$scope.phoneNum
        },localStorage.getItem("sinks-token")).success(function(data){
            if(data.resultCode=='0000'){
                var goodsList = data.result.goodsList;  //商品
                $scope.activityId = data.result.activityId; //活动id
                angular.forEach(goodsList, function(data){
                    
                    //图片地址拼接
                    data.imageUrl = data.typeFrom == '1' ? imgUrl + data.imageUrl : jdImgServer + data.imageUrl;

                });

                $scope.data.goodsList = $scope.data.goodsList.concat(goodsList);

                // console.log($scope.data.goodsList)
            }else{
                toolTip(data.resultMessage);  
            }
        })

        vm.receive=function(phoneNum,activityId,goodsId){
            
            $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
               
                if(data.resultCode == "0000"){//登录了
                    var wait = new waiting();
                    $customerService.isNoGetGood({
                        phoneNum : phoneNum,
                        activityId : activityId,
                        goodsId : goodsId
                    },localStorage.getItem("sinks-token")).success(function(data){
                        wait.hide();
                        if(data.resultCode=='0000'){
                            wait.hide(); 
                          $state.go('newYearDetails',{
                            goodsId : goodsId,
                            activityId : activityId
                          })
                        }else{
                            wait.hide(); 
                            toolTip(data.resultMessage);  
                        }   
                    })
                  
                }else{//没登录
                    $state.go('examine',{
                        state:'newyearList',
                    })
                }
               
            })
            
        }
  
          $timeout(function () {
              scroll('.main-content');
          },300)
        

      /**
       * [description]  当repeat完成时，调用该方法
       * [description]  需要配合directive使用，并在监控对象上加上属性on-repeat-finished-render
       */
        // $scope.$on("ngRepeatFinished", function (repeatFinishedEvent, element){
        //     scroll('.main-content');
        // });
      
    }
    	




      /*-------------------- 商品详情 --------------------*/
  newYearDetailsController.$inject = ['$scope', '$state', '$stateParams','$q','$verifyService','$productService','$timeout','$sce','$userService','$common','$easyPayService','$address','$customerService','$window','$interval'];
  function newYearDetailsController($scope, $state,$stateParams, $q,$verifyService,$productService,$timeout,$sce,$userService,$common,$easyPayService,$address,$customerService,$window,$interval) {
    var vm = this;
    vm.goodsNum = $stateParams.goodsnum!=null ? parseInt($stateParams.goodsnum) : 1;
    vm.product = "";
    vm.goodsId = $stateParams.goodsId;
    
    vm.productImgList = [];
    vm.jdUrl = $productService.imgUrl[0];
    vm.activityName = '';
    vm.productInfo = "";
    vm.tjProductList = [];
    vm.installment = installment;
    vm.basicPrice = 0;
    vm.attrDefaultText = '';
    vm.attrCheckedObj = [];
    vm.attrClick = attrClick;
    vm.attrModal = attrModal;
    vm.goodsNumMinus = goodsNumMinus;
    vm.goodsNumAdd = goodsNumAdd;
    vm.channelId = $userService.$$channelId;
    vm.provinceScroll = null;
    vm.showSelect=showSelect;
    vm.hideSelect=hideSelect;
    vm.selectTabClick=selectTabClick;
    vm.addressActive={rightCity:$('.city-box'), rightCounty:$('.county-box'), rightStreet:$('.street-box')};
    vm.selectAddress='请选择所在地区';
    vm.address1 = '请选择';
    vm.address2 = '';
    vm.address3 = '';
    vm.address4 = '';
    vm.provinceList = [];
    vm.cityList = [];
    vm.countyList = [];
    vm.townList = [];
    vm.trueProvince={};
    vm.trueCity={};
    vm.trueCounty={};
    vm.trueTown={};
    $scope.number = '';
    $scope.addToCartNum=1;
    $scope.cartNum=0;//购物车数量
    $scope.businessType = $stateParams.businessType || sessionStorage.getItem('businessType');
    $scope.utmterm =  $stateParams.utm_term || sessionStorage.getItem('utmterm');
    $scope.utm_source =  $stateParams.utm_source || sessionStorage.getItem('utm_source');
    $scope.utm_medium =  $stateParams.utm_medium || sessionStorage.getItem('utm_medium');
    vm.consigneeAddress='';
    var myIscroll = scroll('.rightProvince');
    var myIscroll1 = scroll('.city-box');
    var myIscroll2 = scroll('.county-box');
    var myIscroll3 = scroll('.street-box');

    $scope.judge = $scope.businessType == null ||$scope.businessType == 'null' ? true : false;
    $scope.colour = false;
    vm.id = '';
    vm.mobile = '';
    vm.isOK = false;
    vm.pro = false;
    $scope.isCart=false;
    $scope.jueok = true;
    $scope.isCart=false //是否加入购物车
    $scope.is7ToReturn =true;		//是否支持7天无理由退货标识
    $scope.phoneNum = sessionStorage.getItem('phoneNum')
    
    
    var mainScroll = null;
    $scope.selectAddress = '';
    mainScroll = new IScroll(".main-content",{probeType : 3,preventDefault:false});
    mainScroll.on('scrollEnd', function () {
      var endY=(this.y - this.maxScrollY)
      if(endY < 100){
        $timeout(function(){
          mainScroll.refresh();
        },300)
      }
    });
 
 
    action();
    function action(){
    	if($stateParams.shareCode){
	    	sessionStorage.setItem('shareMakemoneyToken',$stateParams.shareCode)			//存放在session里面，方便下单使用
	    }
    	$('.picker-wrapper').remove();
    	if($stateParams.businessType){
    		sessionStorage.setItem('businessType',$scope.businessType);
    		sessionStorage.setItem('utmterm',$scope.utmterm);
    		sessionStorage.setItem('utm_source',$scope.utm_source);
    		sessionStorage.setItem('utm_medium',$scope.utm_medium);
    		
    	}else{
    		sessionStorage.removeItem('businessType');
    	}
    	if($stateParams.goodsId==21434745848){
    		$scope.driver = false;
    	}
        getDetails();
        // coupon();
        //getPeriodPrice();
        // 详情tbas
        vm.tabs = tabss;
        function tabss(myevent){
          tabs(myevent,function(){
            $timeout(function(){
              mainScroll.refresh();
            },300)
        })
      }
        //调用获取购物车数量接口
        getCartnum();
		// add the plugin to the jQuery.fn object
		$.fn.fly = function (options) {
			return this.each(function () {
		  	if (undefined == $(this).data('fly')) {
		    	$(this).data('fly', new fly(this, options));
			}
			});
		};

    }
      //调用获取购物车数量接口
      function getCartnum(){
          $productService.getShoppingCartGoodsNum({},localStorage.getItem("sinks-token")).success(function(data){
              if(data.resultCode=='0000'){
              	$scope.cartNum=data.result.goodsNum;
              }
          });
      }
	//促销点击事件
    $scope.promotion = function(){
    	vm.pro = true;
    	$('.modal-layer,.shade').addClass('active');
    }
    //领卷点击事件
    $scope.roll = function(){
    	$scope.data.roll = true;
    	$('.modal-layer,.shade').addClass('active');
    	mainScroll = new IScroll(".roll",{probeType : 1,preventDefault:false});
    }
    //促销领卷弹层关闭事件
    $scope.hide = function(){
    	vm.pro = false;
    	$scope.data.roll=false;
    	$('.modal-layer,.shade').removeClass('active');
    }

    //跳转去购物车页面
   $scope.goMyCart=function(){
       $state.go('myCart');
   }

  
  	

    
    //搜索用户行为
    function doUserTrace(){
        $productService.doUserTrace({
            channelId : sessionStorage.getItem('channelId'),
            page : 'newYearDetails',
            pageModule : 'browse',
            pageValue : $stateParams.goodsId
        }).success(function(data){
              
        })   
    }

  
    
    
    
    //收藏
    $scope.setcollection = function(){
//  	console.log($userService.getAuthorication)
    	$userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
	        if(data.resultCode == "0000"){
		    	if($scope.isCollect == 'other'){
		    		$productService.saveGoodsCollect({
		    			goodsId : vm.product.goodsId
		    		}).success(function(data){
		    			if(data.resultCode == '0000'){
		    				$scope.colour = true;
		    				$scope.isCollect = 'collect'
		    				toolTip('收藏成功')
		    			}
		    		})
		    	}else if($scope.isCollect = 'collect'){
		    		$productService.cancelGoodsCollect({
		    			goodsId : vm.product.goodsId
		    		}).success(function(data){
		    			if(data.resultCode == '0000'){
		    				$scope.colour = false;
		    				$scope.isCollect = 'other'
		    				toolTip('取消收藏')
		    			}
		    		})
		    	}
	    	}else{
	    		var attributes = getAttributes();
				var place={
				  sku : vm.sku,
				  goodsId:	vm.goodsId,
				  addressId: $stateParams.addressId,
				  goodsnum : vm.goodsNum,
				  channelId: $userService.$$channelId,
				  salePrice : vm.product.salePrice,
				  attributes : JSON.stringify(attributes),
				  basicSoluPrice : vm.basicSoluPrice
			    }
				sessionStorage.setItem('place',JSON.stringify(place))
	    		$common.goUser({
		            state: 'newYearDetails',
		            param1:vm.product.goodsId,
		            businessType : 'faceTake',
            		utm_term : $stateParams.utm_term,
            		utm_medium : $scope.utm_medium,
            		utm_source : $scope.utm_source
          		},'/newYearDetails');
	    	}
        }) 
    }

    function getGoodsIsCollect(){
    	
    	$productService.getGoodsIsCollect({
    		
          	goodsId : vm.product.goodsId
        }).success(function(data){
          	if(data.resultCode == '0000'){
          		$scope.isCollect = data.result.isCollect;
          		if($scope.isCollect == 'collect'){
          			$scope.colour = true;
          		}else if($scope.isCollect == 'other'){
          			$scope.colour = false;
          		}
          	}
        })
    }
    
    function getDetails(){
    	
    	doUserTrace();//用户行为
      if(!$stateParams.addressId){
        $stateParams.addressId = "";
      }
      var wait = new waiting();
      $productService.getDetails(vm.goodsId,$stateParams.addressId,vm.channelId,$scope.businessType).success(function (data) {
		vm.spikeStatus=data.result.spikeStatus;
        var ht = "";
        wait.hide();
        if(data.resultCode == "0000"){
          vm.product = data.result;
          if($window.localStorage.getItem("$$payload")){
	        var get = $window.localStorage.getItem("$$payload")
	        $verifyService.getGrowing(JSON.parse(get).hlejCustId,JSON.parse(get).mobile);
	        getGoodsIsCollect();
	      }
          sessionStorage.setItem('freePeriods',vm.product.freePeriods);
			if(vm.product.freePeriods == undefined){
				vm.product.freePeriods = 0;
			}else if(vm.product.freePeriods == 3){
				$scope.number = '3';
			}else if(vm.product.freePeriods == 6){
				$scope.number = '3/6';
			}else if(vm.product.freePeriods == 9){
				$scope.number = '3/6/9';
			}else if(vm.product.freePeriods == 12){
				$scope.number = '3/6/9/12';
			}
			if(vm.product.couponMoney == undefined){
				vm.product.couponMoney = 0;
			}
			if((vm.product.chargeFee==0 && vm.product.freePeriods==0 && vm.product.couponMoney==0)){
				$scope.jueok = false;
			}
         
           vm.sku = data.result.sku;
//         console.log(vm.sku)
           if(vm.product.spikeStatus==1){
           		$verifyService.SetIOSTitle(vm.product.goodsName);
           }else{
           		$verifyService.SetIOSTitle(vm.product.goodsName);
           }
          if(!isEmptyObject(vm.product)){
            vm.basicPrice = parseFloat(vm.product.salePrice);
            vm.attrList = vm.product.arrtInfo;
            vm.productInfo = $sce.trustAsHtml(vm.product.param);
            // vm.product.details = vm.product.details.replace(/src/g,'src="common/images/lazy-loading.jpg" data-src')
            vm.product.details = $sce.trustAsHtml(vm.product.details);
            vm.productImgList = data.result.goodsImages;
            vm.province = data.result.provinceName+data.result.cityName;
            vm.basicSoluPrice = data.result.basicSoluPrice;
            vm.typeFrom = data.result.typeFrom;
			
			$scope.couponGoodsFlag = vm.product.couponGoodsFlag;
			
            if(vm.product.is7ToReturn!=undefined){
	        	if(vm.product.is7ToReturn==1){
	        		$scope.is7ToReturn=true;
	        	}else{
	        		$scope.is7ToReturn=false;
	        	}
	        }else{
	        	$scope.is7ToReturn=true;
	        }
            if(vm.attrList.length > 0){
              vm.isAttr = true;
            }else{
              vm.isAttr = false;
            }
    		/*if(vm.product.activityList.length){
              angular.forEach(vm.product.activityList,function(data){
                vm.activityName += data.activityName+'，';
                vm.freePeriods = data.periods;
              })
            }*/

            angular.forEach(vm.attrList, function(data,index){
              vm.attrCheckedObj[index] = {};
              vm.attrCheckedObj[index]['attrTypeName'] = data.attrTypeName;
              vm.attrCheckedObj[index]['attrInfo'] = data.attrInfo[0];
              vm.attrDefaultText += data.attrInfo[0].attributeValue +' ';
              vm.product.salePrice +=data.attrInfo[0].attributePrice;
            })
            if(vm.product.spikeStatus!=1){
            	vm.product.periodPrice = (vm.product.salePrice/12).toFixed(3);
            }else{
            	vm.product.periodPrice = (vm.product.spikePirce/12).toFixed(3);
            }
			
			var a = parseInt(vm.product.periodPrice.charAt(vm.product.periodPrice.length-1));
			if(a>0&&a<5){
			 	vm.product.periodPrice = (parseFloat(vm.product.periodPrice)+0.01).toFixed(2);
			}else{
				if(vm.product.spikeStatus!=1){
            	vm.product.periodPrice = (vm.product.salePrice/12).toFixed(3);
            }else{
            	vm.product.periodPrice = (vm.product.spikePirce/12).toFixed(3);
            }
			}
            if(vm.product.typeFrom == "1"){
              vm.sxImg = imgUrl+vm.product.thumbImgUrl
            }else{
              vm.sxImg = $productService.imgUrl[4]+vm.product.thumbImgUrl
            }
            if(vm.productImgList){
              $.each(vm.productImgList, function(i, v) {
                if(vm.product.typeFrom == "1"){
                  ht += '<div class="swiper-slide"><img src=' + imgUrl+v+ '></div>';
                }else{
                  ht += '<div class="swiper-slide"><img src=' + vm.jdUrl+v+ '></div>';
                }
              });
              $('#bannerSwiper').html(ht);
              // banner 轮播
              var bannerSlide = new Swiper('.bannerSlide', {
                loop:true,
                autoplay:4000,
                autoplayDisableOnInteraction : false,
                pagination:'.swiper-pagination'	
              });
              recommendGoods();
              //getPeriodPrice();
              $timeout(function(){
                vm.isOK = true;
              },300)
            }else{
              vm.isOK = false;
            }
          }

        }
      })
    }




    function recommendGoods(){
      var wait = new waiting();
      $productService.recommendGoods({
        goodsId:$stateParams.goodsId,
        channelId:$userService.$$channelId
      }).success(function (data) {
      	wait.hide();
        if(data.resultCode == "0000"){
          if(!isEmptyObject(data.result) && data.result.length > 0){
            vm.tjProductList = data.result;
            for(var i =0;i<vm.tjProductList.length;i++){
              if(vm.tjProductList[i].typeFrom == "1"){
                vm.tjProductList[i].thumbImgUrl = imgUrl+vm.tjProductList[i].thumbImgUrl;
              }else{
                vm.tjProductList[i].thumbImgUrl = vm.jdUrl+vm.tjProductList[i].thumbImgUrl;
              }   
            }
            $timeout(function(){
	          var hotSwiper = new Swiper('.hot-swiper', {
	            slidesPerView: 'auto',
	            paginationClickable: true,
	            freeModeMomentum : false,
	            autoplay:3000
	          });
	        },200)
          }
          $timeout(function() {
            new lazyLoading('.details-content img',mainScroll);
            mainScroll.refresh();
          },200)
        }
      });
    }
    //填写新地址
        $address.getProvince({
        }).success(function (data) {
            if(data.resultCode == "0000"){
                vm.provinceList = data.result;
                $timeout(function(){
                    myIscroll.refresh();
                },200)

            }else{
                toolTip(data.resultMessage);
            }
        });     	
    //选择省份
        $scope.provinceClick=function (id,name) {
            vm.provinceId=id;
            vm.trueProvince.id = id;
            vm.trueProvince.name = name;
            vm.address1=name;
            vm.address2='请选择';
            vm.address3='';
            vm.address4='';
            vm.addressActive.rightCity.addClass('active');
            $('.select-tab span').removeClass('active').eq(0).addClass('active');
            $address.getCity({
                provinceId:id
            }).success(function (data) {
                if(data.resultCode == "0000"){
                    vm.cityList = data.result;
                    $timeout(function(){
                        myIscroll.refresh();
                        myIscroll1.refresh();
                    },200)
                }else{

                }
            })
        };
        //选择城市
        $scope.cityClick=function (id,name) {
            vm.cityId=id;
            vm.trueCity.id = id;
            vm.trueCity.name = name;
            vm.address2=name;
            vm.address3='请选择';
            vm.address4='';
            vm.addressActive.rightCounty.addClass('active');
            $('.select-tab span').removeClass('active').eq(1).addClass('active');
            $address.getCounty({
                cityId:id
            }).success(function (data) {
                if(data.result.length > 0){
                    vm.countyList = data.result;
                    $timeout(function(){
                        myIscroll2.refresh();
                    },200)
                }else{
                    vm.select3d=false;
                    $('.modal-layer,.shade').removeClass('active');
                    hidePage();
                    vm.countyId = 0;
                    vm.townId = 0;
                    vm.selectAddress = vm.trueProvince.name + name;
                    vm.address2=name;
                }
            })
        };
        //选择县
        $scope.countyClick=function (id,name) {
            vm.countyId=id;
            vm.trueCounty.id = id;
            vm.trueCounty.name = name;
            vm.address3=name;
            vm.address4='请选择';
            vm.addressActive.rightStreet.addClass('active');
            $('.select-tab span').removeClass('active').eq(2).addClass('active');
            $address.getTown({
                countyId:id
            }).success(function (data) {
                if(data.result.length > 0){
                    vm.townList = data.result;
                    $timeout(function(){
                        myIscroll3.refresh();
                    },200)
                }else{
                    vm.select3d=false;
                    $('.modal-layer,.shade').removeClass('active');
                    hidePage();
                    vm.townId = 0;
                    vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + name;
                    vm.province = vm.trueProvince.name + vm.trueCity.name + name;
                    vm.address4='';
                }
            })
            if(vm.typeFrom == 2){
            	newAjaxCheckJDStock(vm.provinceId,vm.cityId,vm.countyId)
            }
            
        }
        //选择镇
        $scope.townClick=function (id,name) {
            vm.townId = id;
            vm.trueTown.name = name;
            vm.address4=name;
            console.log(vm.townId = id);
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
            hidePage();
            vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + vm.trueCounty.name + name;
            vm.province = vm.trueProvince.name + vm.trueCity.name + vm.trueCounty.name + name;
            $('.select-tab span').removeClass('active').eq(3).addClass('active');
            if(vm.typeFrom == 2){
            	 newAjaxCheckJDStock(vm.provinceId,vm.cityId,vm.countyId,vm.townId)
            }
        }
        //验证是否有货
        function newAjaxCheckJDStock(provinceid,cityid,countyid,townid){
        	$customerService.newAjaxCheckJDStock({
	    		skuId : vm.sku,
	    		num : vm.goodsNum,
	    		province : provinceid,
	    		city : cityid,
	    		county : countyid,
	    		town : townid || 0
	    	}).success(function(data){
	    		if(data.result.hasStock == true){
	    			vm.product.stockStateDesc = '有货';
	    			vm.product.stockStateld = 35;
	    			vm.product.state = 1;
	    		}else{
	    			vm.product.stockStateDesc = '无货';
	    			vm.product.stockStateld = 34;
	    			vm.product.state = 1;
	    		}
	    	})
        }
        //关闭
        function hidePage() {
            setTimeout(function(){
                vm.addressActive.rightCity.removeClass('active');
                vm.addressActive.rightCounty.removeClass('active');
                vm.addressActive.rightStreet.removeClass('active');
            },300);
        }
        //地址选择系列
        function selectTabClick(str){
            switch(str){
                case "province":
                    if(vm.address1=="请选择"){return}
                    $('.select-tab span').removeClass('active').eq(0).addClass('active');
                    vm.addressActive.rightCity.removeClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "city":
                    if(vm.address2=="请选择"){return}
                    $('.select-tab span').removeClass('active').eq(1).addClass('active');
                    vm.addressActive.rightCity.addClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "county":
                    if(vm.address3=="请选择"){return}
                    $('.select-tab span').removeClass('active').eq(2).addClass('active');
                    vm.addressActive.rightCounty.addClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "town":
                    if(vm.address4=="请选择"){return}
                    $('.select-tab span').removeClass('active').eq(3).addClass('active');
                    vm.addressActive.rightStreet.addClass('active');
                    break;
            }
        }
        //地址选择系列
        function showSelect() {
            vm.select3d=true;
            $('.modal-layer,.shade').addClass('active');
            if(vm.cityId){
                $('.select-tab span').removeClass('active').eq(1).addClass('active');
                vm.addressActive.rightCity.addClass('active');
            }
            if(vm.countyId){
                $('.select-tab span').removeClass('active').eq(2).addClass('active');
                vm.addressActive.rightCounty.addClass('active');
            }
            if(vm.townId){
                $('.select-tab span').removeClass('active').eq(3).addClass('active');
                vm.addressActive.rightStreet.addClass('active');
            }
        }

        function hideSelect() {
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
        }

    //分期购
    function installment(){

        // 判断登录
        $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
            if(data.resultCode == "0000"){//登录了
                $customerService.isNoGetGood({//判断用户是否能领取商品
                    phoneNum:$scope.phoneNum,
                    activityId:$stateParams.activityId,
                    goodsId:$stateParams.goodsId
                },localStorage.getItem("sinks-token")).success(function(data){
                    if(data.resultCode=='0000'){
                      $state.go('newYearConfirm',{
                        goodsId:vm.goodsId,
                        activityId:$stateParams.activityId
                      });
                    }else if(data.resultCode=='0030'){
                      new dialog().confirm({
                        content : "抱歉，您没有资格领取",
                        confirmBtnText : "好的",
                          })	  
                        $('.cancel-btn').css('display','none')
                        $('.content').css('text-align','center')
                        $('.content').css('font-size','0.4rem')
                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                        $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                        $('.dialog-wrap .dialog-content').css('width','70%')
                        $('.dialog-wrap .dialog-content').css('left','15%')
                    }else{
                      toolTip(data.resultMessage)
                    }
                })
            }else{//没登录
                $state.go('examine',{
                        state:'newYearDetails',
                        goodsId:$stateParams.goodsId,
                        activityId:$stateParams.activityId
                    })
            }
           
        })

     

      
       
    }


    
      //tab选择分期数
      $scope.Obtain = function(periods,loanRate,feeRate,monthRepayPrincipalAmount,freeServerFee){
          $scope.periodsValue=periods;
          $scope.monthRepayPrincipalAmount=monthRepayPrincipalAmount;
      }

      
      
	
	
	
  
    function attrModal(str){
        var modal = new animeModal('#select-norms');
        $timeout(function(){ scroll('.center'); },300);
        if(str=='cart'){//是否是点击了加入购物车
            $scope.isCart=true;
        }else{
            $scope.isCart=false;
        }
    }
	

	
    function attrClick(myevent,type,obj){
    	if($scope.isCart ==true){
    	  vm.attrDefaultText = '';
	      vm.product.salePrice = vm.basicPrice;
	      vm.attrIdArr = [];
	      $(myevent.currentTarget).addClass('current').siblings().removeClass('current');
	      angular.forEach(vm.attrCheckedObj, function(data){
	        if (data.attrTypeName == type) {
	          data.attrInfo = obj;
	        } 
	        vm.product.salePrice += parseFloat(data.attrInfo.attributePrice); 
	        vm.attrDefaultText += data.attrInfo.attributeValue +' ';    
	      })
	      //getPeriodPrice();
	      vm.product.salePrice = vm.product.salePrice.toFixed(2); 
	      //vm.product.periodPrice = toDecimal(vm.product.salePrice/12);
    	}else{
    		vm.attrDefaultText = '';
	      vm.product.salePrice = vm.basicPrice;
	      vm.attrIdArr = [];
	      $(myevent.currentTarget).addClass('current').siblings().removeClass('current');
	      angular.forEach(vm.attrCheckedObj, function(data){
	        if (data.attrTypeName == type) {
	          data.attrInfo = obj;
	        } 
	        vm.product.salePrice += parseFloat(data.attrInfo.attributePrice); 
	        vm.attrDefaultText += data.attrInfo.attributeValue +' ';    
	      })
	      //getPeriodPrice();
	      vm.product.salePrice = vm.product.salePrice.toFixed(2); 
	      //vm.product.periodPrice = toDecimal(vm.product.salePrice/12);
    	}
      
    }
    
    //获取选中的属性
    function getAttributes(){
      var attributes = [];
      angular.forEach(vm.attrCheckedObj,function(data){
        var obj = {};
        obj.goodsAttribute = data.attrTypeName;
        obj.goodsAttValue = data.attrInfo.attributeValue;
        obj.goodsAttributeId = data.attrInfo.attributeId;
        attributes.push(obj) 
      })
      return attributes;
    }

    //商品数量加减
    function goodsNumMinus(){
      if ( vm.goodsNum > 1 ) {
        vm.goodsNum = vm.goodsNum - 1;
        //getPeriodPrice();
      }
    }
    function goodsNumAdd(){
      vm.goodsNum = vm.goodsNum + 1; 
      //getPeriodPrice();   
    }

  }



      /*--------------------确认订单-------------------*/		
      newYearConfirmController.$inject = ['$scope','$state',"$verifyService","$timeout",'$customerService','$stateParams','$address','$productService','$window','$userService'];
      function newYearConfirmController($scope, $state,$verifyService,$timeout,$customerService,$stateParams,$address,$productService,$window,$userService){	
        var vm=this;
        $verifyService.SetIOSTitle("确认订单");
        vm.goodsid = $stateParams.goodsId;
        vm.goodsNum = $stateParams.goodsnum;
        $scope.isaddress = '';
        $scope.phoneNum = sessionStorage.getItem('phoneNum');
        $scope.custId = sessionStorage.getItem('custId')


        $customerService.getdoGoodsDetail({
					goodsId : $stateParams.goodsId,
					channelId : sessionStorage.channelId
				}).success(function(data){
					if(data.resultCode = "0000"){
						vm.type = data.result.typeFrom;
						if(data.result.typeFrom == 2){
							vm.thumbImgUrl = $productService.imgUrl[4]+data.result.thumbImgUrl;
							vm.jd = "京东";
							vm.express = '京东快递'
						}else if(data.result.typeFrom == 1){
							vm.thumbImgUrl = imgUrl+data.result.thumbImgUrl;
							vm.jd = '自营';
							vm.express = '快递包邮'
						}
						vm.goodsName = data.result.goodsName;
						$timeout(function () {
							scroll('.main-content');
						},300)
					}else{
						toolTip(data.resultMessage)
					}
        });
        

                //跳转到收货地址
                $scope.goaddAddress = function(){

                  $address.getAddress({custId:$scope.custId}).success(function(data){
                    if(data.resultCode == "0000"){
                      if(!isEmptyObject(data.result)){
                          
                          $state.go('newYearaddAddress',{
                            goodsId : $stateParams.goodsId,
                            activityId : $stateParams.activityId
                          })
                      }else{
                         
                          $state.go('newYearAddress',{
                            goodsId : $stateParams.goodsId,
                            zet:'newYearConfirm',
                            activityId:$stateParams.activityId
                          })
                      }
                    }
                  })
                  
                }

                if($stateParams.addressId != undefined){
                        //根据ID获取收货地址
                        $address.getObtain({
                            consigneeId: $stateParams.addressId || ''
                        }).success(function(data) {
                            if (!isEmptyObject(data.result)) {
                                $scope.isaddress = true;
                                $scope.provinceId = data.result.provinceId;
                                $scope.cityId = data.result.cityId;
                                $scope.countyId = data.result.countyId;
                                $scope.townId = data.result.townId;
                                $scope.townName = data.result.townName || '';
                                $scope.list = data.result.consigneeName + ' ' + data.result.consigneeMobile //+' '+data.result.provinceName+data.result.cityName+data.result.countyName+$scope.townName+' '+data.result.consigneeAddress;
                                $scope.list1 = data.result.provinceName + data.result.cityName + data.result.countyName + data.result.consigneeAddress;
                                console.log($scope.list);
                                vm.consigneeId = $stateParams.addressId;
                                var address = {
                                    provinceId: $scope.provinceId,
                                    cityId: $scope.cityId,
                                    countyId: $scope.countyId,
                                    townId: $scope.townId,
                                }
                                sessionStorage.setItem('address', address);
                            } else {
                                $scope.list = '新增收货地址';
                                $scope.isaddress = false; 
                            }
                        })

                }else{
                    $address.getAddress({custId:$scope.custId}).success(function(data){
                        if(data.resultCode == "0000") {
                          if (!isEmptyObject(data.result)) {
                                $scope.isaddress = true;
                            for (var i = 0; i < data.result.length; i++) {
                              if (data.result[i].defaultAddress == 1) {//默认地址
                                vm.provinceId = data.result[i].provinceId;
                                vm.cityId = data.result[i].cityId;
                                vm.countyId = data.result[i].countyId;
                                vm.townId = data.result[i].townId;
                                $scope.list = data.result[i].consigneeName+' '+data.result[i].consigneeMobile;
                                $scope.list1 = data.result[i].provinceName+data.result[i].cityName+data.result[i].countyName+data.result[i].consigneeAddress;
                                // console.log($scope.list)
                                $scope.goodid = data.result[i].consigneeAddress;
                                vm.consigneeId = data.result[i].consigneeId;
                                if($stateParams.addressId != undefined){
                                  vm.consigneeId = $stateParams.addressId;
                                }
                                //地址id存起来方便在支付页面使用
                                var address={
                                  provinceId:vm.provinceId,
                                  cityId:vm.cityId,
                                  countyId:vm.countyId,
                                  townId:vm.townId,
                                }
                                sessionStorage.setItem('address',JSON.stringify(address));
                              }
                            }
                          }else{
                            $scope.list = '新增收货地址';
                            $scope.isaddress = false;
                          }
                        }
                      })
                }

                


                $scope.Place=function(){
                    // 判断登录
                    var wait = new waiting();
                    $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
                        wait.hide();
                        if(data.resultCode == "0000"){//登录了
                            
                            $customerService.isNoGetGood({
                                phoneNum : $scope.phoneNum,
                                activityId : $stateParams.activityId,
                                goodsId : vm.goodsid
                            },localStorage.getItem("sinks-token")).success(function(data){
                                
                                if(data.resultCode=='0000'){
                                    var list=[{goodsNum:1,goodsId:$stateParams.goodsId}]
                                    var wait = new waiting();
                                    $customerService.newYearOrder({
                                      channelId : sessionStorage.getItem('channelId'),
                                      consigneeId : vm.consigneeId,
                                      goodsList :list,
                                    },localStorage.getItem("sinks-token")).success(function(data){
                                        wait.hide();
                                      if(data.resultCode == '0000'){
                                        new dialog().confirm({
                                            content : "恭喜您，礼物领取成功！您还有一台50寸彩电可以领取哦！快去看看吧！",
                                            cancelBtnText: '不，谢谢',
                                            confirmBtnText : "立即领取",
                                            cancelBtn : function(){
                                                $state.go('home',{
                          
                                                })
                                            },
                                            confirmBtn : function(){
                                                sessionStorage.setItem('rechargeCallbackUrl',JSON.stringify(httpsHeader+'/mallh5/#/myCenter'));
                                              var wait = new waiting();
                                              $state.go('recharge',{
                                                index:0,
                                                status:0
                                             })
                                              wait.hide();
                                            },
                                            
                                              })
                                              
                                            $('.content').css('text-align','center')
                                            $('.content').css('font-size','0.4rem')
                                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                                            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                                            $('.dialog-wrap .dialog-content').css('width','70%')
                                            $('.dialog-wrap .dialog-content').css('left','15%')
                                            $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right','1px solid #dcdcdc')
                                            $('.dialog-wrap .dialog-content .bottom a.flex-1').css('-webkit-box-flex','2')
                                      }else if(data.resultCode == '0022'){
                                        new dialog().confirm({
                                          content : "抱歉，当前地址无货，请返回选择其他礼物",
                                          confirmBtnText : "返回礼物列表",
                                          confirmBtn : function(){
                                            var wait = new waiting();
                                            $state.go('newyearList',{
                                           
                                           })
                                            wait.hide();
                                          }	
                                            })
                                            
                                          $('.cancel-btn').css('display','none')
                                          $('.content').css('text-align','center')
                                          $('.content').css('font-size','0.4rem')
                                          $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
                                          $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
                                          $('.dialog-wrap .dialog-content').css('width','70%')
                                          $('.dialog-wrap .dialog-content').css('left','15%')
                                      }else{
                                        toolTip(data.resultMessage)
                                      }
                                    })
                                }else{
                                    toolTip(data.resultMessage);  
                                }
                                
                            })

                            
                        }else{//没登录
                            $state.go('examine',{
                                state:'newYearConfirm',
                                goodsId:$stateParams.goodsId,
                                activityId:$stateParams.activityId
                                })
                        }
                       
                    })
                  
                }


        
      }


//---------------------------------------------------- 新增收货地址

      newYearAddressController.$inject = ['$scope','$state','$stateParams','$address','$verifyService','$homeService','$timeout','$http','$common','$userService'];
      function newYearAddressController($scope,$state,$stateParams,$address,$verifyService,$homeService,$timeout,$http,$common,$userService) {
          var vm = this;
          vm.provinceScroll = null;
          vm.showSelect=showSelect;
          vm.hideSelect=hideSelect;
          vm.checkbox=checkbox;
          vm.selectTabClick=selectTabClick;
          vm.addAddressOpen=addAddressOpen;
          vm.addressActive={rightCity:$('.city-box'), rightCounty:$('.county-box'), rightStreet:$('.street-box')};
          vm.selectAddress='请选择所在地区';
          vm.address1 = '请选择';
          vm.address2 = '';
          vm.address3 = '';
          vm.address4 = '';
          vm.provinceList = [];
          vm.cityList = [];
          vm.countyList = [];
          vm.townList = [];
          vm.name='';
          vm.phone='';
          vm.eml='';
          vm.consigneeAddress='';
          vm.defaultAddress=0;
          vm.trueProvince={};
          vm.trueCity={};
          vm.trueCounty={};
          vm.trueTown={};
          $scope.custId = sessionStorage.getItem('custId');
          var myIscroll = scroll('.rightProvince');
          var myIscroll1 = scroll('.city-box');
          var myIscroll2 = scroll('.county-box');
          var myIscroll3 = scroll('.street-box');
          $scope.custId = sessionStorage.getItem('custId');
          if($stateParams.consigneeId){
              $verifyService.SetIOSTitle("编辑收货地址");
          }else{
              $verifyService.SetIOSTitle("新增收货地址");
          }

          
          
          //填写新地址
          $address.getProvince({
          }).success(function (data) {
              if(data.resultCode == "0000"){
                  vm.provinceList = data.result;
                  $timeout(function(){
                      myIscroll.refresh();
                  },200)
  
              }else{
                  toolTip(data.resultMessage);
              }
          });
          //选择省份
          $scope.provinceClick=function (id,name) {
              vm.provinceId=id;
              vm.trueProvince.id = id;
              vm.trueProvince.name = name;
              vm.address1=name;
              vm.address2='请选择';
              vm.address3='';
              vm.address4='';
              vm.addressActive.rightCity.addClass('active');
              $('.select-tab span').removeClass('active').eq(0).addClass('active');
              $address.getCity({
                  provinceId:id
              }).success(function (data) {
                  if(data.resultCode == "0000"){
                      vm.cityList = data.result;
                      $timeout(function(){
                          myIscroll.refresh();
                          myIscroll1.refresh();
                      },200)
                  }else{
  
                  }
              })
          };
          //选择城市
          $scope.cityClick=function (id,name) {
              vm.cityId=id;
              vm.trueCity.id = id;
              vm.trueCity.name = name;
              vm.address2=name;
              vm.address3='请选择';
              vm.address4='';
              vm.addressActive.rightCounty.addClass('active');
              $('.select-tab span').removeClass('active').eq(1).addClass('active');
              $address.getCounty({
                  cityId:id
              }).success(function (data) {
                  if(data.result.length > 0){
                      vm.countyList = data.result;
                      $timeout(function(){
                          myIscroll2.refresh();
                      },200)
                  }else{
                      vm.select3d=false;
                      $('.modal-layer,.shade').removeClass('active');
                      hidePage();
                      vm.countyId = 0;
                      vm.townId = 0;
                      vm.selectAddress = vm.trueProvince.name + name;
                      vm.address2=name;
                  }
              })
          };
          //选择县
          $scope.countyClick=function (id,name) {
              vm.countyId=id;
              vm.trueCounty.id = id;
              vm.trueCounty.name = name;
              vm.address3=name;
              vm.address4='请选择';
              vm.addressActive.rightStreet.addClass('active');
              $('.select-tab span').removeClass('active').eq(2).addClass('active');
              $address.getTown({
                  countyId:id
              }).success(function (data) {
                  if(data.result.length > 0){
                      vm.townList = data.result;
                      $timeout(function(){
                          myIscroll3.refresh();
                      },200)
                  }else{
                      vm.select3d=false;
                      $('.modal-layer,.shade').removeClass('active');
                      hidePage();
                      vm.townId = 0;
                      vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + name;
                      vm.address4='';
                  }
              })
          }
          //选择镇
          $scope.townClick=function (id,name) {
              vm.townId = id;
              vm.trueTown.name = name;
              vm.address4=name;
              console.log(vm.townId = id);
              vm.select3d=false;
              $('.modal-layer,.shade').removeClass('active');
              hidePage();
              vm.selectAddress = vm.trueProvince.name + vm.trueCity.name + vm.trueCounty.name + name;
              $('.select-tab span').removeClass('active').eq(3).addClass('active');
          }
          //关闭
          function hidePage() {
              setTimeout(function(){
                  vm.addressActive.rightCity.removeClass('active');
                  vm.addressActive.rightCounty.removeClass('active');
                  vm.addressActive.rightStreet.removeClass('active');
              },300);
          }
          //
          function selectTabClick(str){
              switch(str){
                  case "province":
                      if(vm.address1=="请选择"){return}
                      $('.select-tab span').removeClass('active').eq(0).addClass('active');
                      vm.addressActive.rightCity.removeClass('active');
                      vm.addressActive.rightCounty.removeClass('active');
                      vm.addressActive.rightStreet.removeClass('active');
                      break;
                  case "city":
                      if(vm.address2=="请选择"){return}
                      $('.select-tab span').removeClass('active').eq(1).addClass('active');
                      vm.addressActive.rightCity.addClass('active');
                      vm.addressActive.rightCounty.removeClass('active');
                      vm.addressActive.rightStreet.removeClass('active');
                      break;
                  case "county":
                      if(vm.address3=="请选择"){return}
                      $('.select-tab span').removeClass('active').eq(2).addClass('active');
                      vm.addressActive.rightCounty.addClass('active');
                      vm.addressActive.rightStreet.removeClass('active');
                      break;
                  case "town":
                      if(vm.address4=="请选择"){return}
                      $('.select-tab span').removeClass('active').eq(3).addClass('active');
                      vm.addressActive.rightStreet.addClass('active');
                      break;
              }
          }
          //
          function showSelect() {
              vm.select3d=true;
              $('.modal-layer,.shade').addClass('active');
              //{
              //    $('.select-tab span').removeClass('active').eq(0).addClass('active');
              //    vm.addressActive.rightCity.removeClass('active');
              //    vm.addressActive.rightCounty.removeClass('active');
              //    vm.addressActive.rightStreet.removeClass('active');
              //}
              if(vm.cityId){
                  $('.select-tab span').removeClass('active').eq(1).addClass('active');
                  vm.addressActive.rightCity.addClass('active');
              }
              if(vm.countyId){
                  $('.select-tab span').removeClass('active').eq(2).addClass('active');
                  vm.addressActive.rightCounty.addClass('active');
              }
              if(vm.townId){
                  $('.select-tab span').removeClass('active').eq(3).addClass('active');
                  vm.addressActive.rightStreet.addClass('active');
              }
          }
  
          function hideSelect() {
              vm.select3d=false;
              $('.modal-layer,.shade').removeClass('active');
          }
          function checkbox(){
              if(vm.defaultAddress ==0){
                  console.log(vm.defaultAddress =1);
              }else{
                  console.log(vm.defaultAddress =0);
              }
          }
          //保存到查询地址
          function verify() {
              var phoneReg = /^1(3[0-9]|4[57]|5[0-35-9]|7[678]|8[0-9])\d{8}$/;
              var eml=/^\w+@[a-z0-9\-]+(\.[a-z]{2,6}){1,2}$/i;
              if (vm.name == '') {
                  toolTip("姓名不能为空");
                  return false;
              }
              if (vm.phone == "") {
                  toolTip("联系电话不能为空！");
                  return false;
              }
              if (!$verifyService.isPhoneNum(vm.phone)) {
                  toolTip("请输入正确的手机号码！");
                  return false;
              }
              if (vm.selectAddress == "请选择所在地区") {
                  toolTip("请选择所在地区");
                  return false;
              }
              if (vm.consigneeAddress == "" || vm.consigneeAddress.length < 5) {
                  toolTip("详细地址不能少于5个字!");
                  return false;
              }
              return true;
          }
          function addAddressOpen() {
            
                if (!verify()) {
                    return false
                }
              //------------添加新地址------------//
             
                  if(!$stateParams.consigneeId){
                      var wait =new waiting();
                      $address.getdelivery({
                          custId:$scope.custId,
                          consigneeName:vm.name,
                          consigneeMobile:vm.phone,
                          consigneeEmail:vm.eml,
                          consigneeAddress:vm.consigneeAddress,
                          provinceId:vm.provinceId,
                          cityId:vm.cityId,
                          countyId:vm.countyId,
                          townId:vm.townId,
                          defaultAddress:vm.defaultAddress
                      }).success(function (data) {
                          wait.hide();
                          if(data.resultCode == "0000"){
                              toolTip('添加成功');
                              if($stateParams.zet){
                                  
                                  $state.go($stateParams.zet,{
                                      goodsId:$stateParams.goodsId,
                                      activityId:$stateParams.activityId
                                      })
                                  
                              }else{
                                  
                                      $state.go('newYearAddAddress',{
                                        goodsId:$stateParams.goodsId,
                                        activityId:$stateParams.activityId
                                      })
                                  
                              }
                          }else{
                              toolTip(data.resultMessage);
                          }
                      })
                  }else{
                      //保存更新地址
                      var wait =new waiting();
                      $address.getdoUpdate({
                          custId:$scope.custId,
                          consigneeId:$stateParams.consigneeId,
                          consigneeName:vm.name,
                          consigneeMobile:vm.phone,
                          consigneeEmail:vm.eml,
                          consigneeAddress:vm.consigneeAddress,
                          provinceId:vm.provinceId,
                          cityId:vm.cityId,
                          countyId:vm.countyId,
                          townId:vm.townId,
                          defaultAddress:vm.defaultAddress
                      }).success(function (data) {
                          wait.hide();
                          if(data.resultCode == "0000"){
                              toolTip('修改成功');
                              setTimeout(function () {
                                  $state.go('newYearConfirm',{
                                     
                                      goodsId:$stateParams.goodsId,
                                      activityId:$stateParams.activityId
                                  },{
                                      location:'replace'
                                  })
                              },2000);
                          }else{
                              toolTip(data.resultMessage);
                          }
                      });
                  }
                 
              
          }
          //根据ID获取收货地址
          if($stateParams.consigneeId){
              Obtain();
          }
          function Obtain() {
              $address.getObtain({
                  consigneeId:$stateParams.consigneeId
              }).success(function (data) {
                  if(data.resultCode == "0000"){
                      var list=data.result;
                      console.log(list);
                      vm.name=list.consigneeName;
                      vm.phone=list.consigneeMobile;
                      vm.eml=list.consigneeEmail;
                      list.countyName = list.countyName ? list.countyName : '';
                      list.townName = list.townName ? list.townName : '';
                      vm.selectAddress=list.provinceName+list.cityName+list.countyName+list.townName;
                      vm.consigneeAddress=list.consigneeAddress;
                      vm.defaultAddress=list.defaultAddress;
                      vm.provinceId=list.provinceId;
                      vm.cityId=list.cityId;
                      vm.countyId=list.countyId;
                      vm.townId=list.townId;
                      vm.address1 =list.provinceName;
                      vm.address2 = list.cityName;
                      vm.address3 = list.countyName;
                      vm.address4 = list.townName;
                      vm.townList['townName']=list.townName;
                      if(vm.address2){
                          //$scope.cityClick(vm.cityId,vm.address2);
                          $address.getCity({
                              provinceId:list.provinceId
                          }).success(function (data) {
                              if(data.resultCode == "0000"){
                                  vm.cityList = data.result;
                                  $timeout(function(){
                                      myIscroll.refresh();
                                      myIscroll1.refresh();
                                  },200)
                              }else{
  
                              }
                          })
                      }
                      if(vm.address3){
                          //$scope.countyClick(vm.countyId,vm.address3);
                          $address.getCounty({
                              cityId:list.cityId
                          }).success(function (data) {
                              if(data.result.length > 0){
                                  vm.countyList = data.result;
                                  $timeout(function(){
                                      myIscroll2.refresh();
                                  },200)
                              }
                          })
                      }
                      if(vm.address4){
                          $address.getTown({
                              countyId:list.countyId
                          }).success(function (data) {
                              if(data.result.length > 0){
                                  vm.townList = data.result;
                                  $timeout(function(){
                                      myIscroll3.refresh();
                                  },200)
                              }
                          })
                          //$scope.townClick(vm.townId,vm.address4);
                      }
                  }else{
                      toolTip(data.resultMessage);
                  }
              })
          }
      }



       //-----------------------------------------查询地址
       newYearaddAddressController.$inject = ['$address','$scope','$state','$stateParams','$q','$verifyService','$rootScope','$timeout','$http','$userService','$common'];
    function newYearaddAddressController($address,$scope, $state,$stateParams ,$q,$verifyService,$rootScope,$timeout,$http,$userService,$common) {
        var vm = this;
        vm.name='';
        vm.phone='';
        vm.eml='';
        vm.defaultAddress='';
        vm.consigneeAddress='';
        vm.address=[];
        vm.addressList=[];
        vm.goodsId="";
        vm.name = $stateParams.name;
        vm.mobile = $stateParams.mobile;
        vm.email = $stateParams.email;
        vm.ename = $stateParams.ename;
        vm.emobile = $stateParams.emobile;
        vm.deleteAddress=deleteAddress;
        vm.selectAddress=selectAddress;
        vm.editAddress=editAddress;
        vm.goodsId = $stateParams.goodsId;
        vm.deliveryAddressOpen = deliveryAddressOpen;
        $scope.custId = sessionStorage.getItem('custId');
        var href = location.href;
        console.log($stateParams)
        if($stateParams.goodsId){
            vm.goodsId=$stateParams.goodsId;
        }
        if(href.indexOf("orderId")!=-1){
            var orderInfo={
                orderId:$verifyService.getQueryParam("orderId"),
                goodsMoney:$verifyService.getQueryParam("goodsMoney"),
                fromPage:$verifyService.getQueryParam("fromPage"),
                typeFrom:$verifyService.getQueryParam("typeFrom")
            };
            sessionStorage.setItem("orderInfo",JSON.stringify(orderInfo));
        }
//      console.log(orderInfo.goodsMoney)
        var myIscroll = scroll('.main-content');
        $verifyService.SetIOSTitle("收货地址");
        getAddress();
       
       
        //获取收货地址列表
        function getAddress() {
            var orderId=$verifyService.getQueryParam("orderId");
                
                    $address.getAddress({
                        custId:$scope.custId,
                    }).success(function (data) {
                        if(data.resultCode == "0000"){
                            if(isEmptyObject(data.result)){
                              $scope.zeroaddress = true
                            }else{
                              $scope.zeroaddress = false
                            } 
                            vm.addressList=data.result;
                            $timeout(function(){
                                myIscroll.refresh();
                            },200)
                        }else {
                            toolTip(data.resultMessage);
                        }
                    });
               
        }

        //编辑按钮点击事件
        function editAddress(id,$event){
            $event.stopPropagation();
            $state.go('newYearAddress',{
                consigneeId:id,
                goodsId:$stateParams.goodsId,
                fromPage:$stateParams.fromPage,
                stages : $stateParams.stages,
                activityId:$stateParams.activityId
            })
        };

      

        //选择地址
        function selectAddress(id){
          $state.go('newYearConfirm',{
            addressId: id,
            goodsId : $stateParams.goodsId,
            activityId:$stateParams.activityId
          })
        }
        //------------删除地址//
        function deleteAddress(consigneeId,index,$event){
            $event.stopPropagation();
            var deletediaolg = new dialog().confirm({
                content: '是否删除地址？',
                cancelBtn: function () {
                },
                confirmBtn: function () {
                    $address.getDelete({
                        consigneeId:consigneeId,
                    }).success(function (data) {
                        if(data.resultCode == "0000"){
                            toolTip("删除成功");
                            $('.addAddress>ul>li').eq(index).remove();
                            $timeout(function(){
                              window.location.reload()
                            },200);
                        }else{
                            toolTip(data.resultMessage);
                        }
                    })
                }
            })
            $('.content').css('text-align','center')
            $('.content').css('font-size','0.4rem')
            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('background-color','#fff')
            $('.dialog-wrap .dialog-content .bottom a.confirm-btn').css('color','#fe9d2e')
            $('.dialog-wrap .dialog-content').css('width','70%')
            $('.dialog-wrap .dialog-content').css('left','15%')
            $('.dialog-wrap .dialog-content .bottom a.cancel-btn').css('border-right','1px solid #dcdcdc')
            $('.dialog-wrap .dialog-content .bottom a.flex-1').css('-webkit-box-flex','2')
        }


        // 新增收货地址
        function deliveryAddressOpen(){
          $state.go('newYearAddress',{
            goodsId : $stateParams.goodsId,
            zet:'newYearConfirm',
            activityId:$stateParams.activityId
          })
        }
        
    }

    })

    