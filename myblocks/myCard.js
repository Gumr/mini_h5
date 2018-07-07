
define(['angular','css!./user.css','css!./myGiftCard.css'], function(angular) {
    angular.module('app')
        .controller('myCardController', myCardController)
		.controller('myCollectionController', myCollectionController)
		.controller('myGiftCardController', myGiftCardController)
        
    //我的收藏
    myCollectionController.$inject = ['$scope','$state','$stateParams','$verifyService','$http','$common','$timeout','userInfo','$cardService','$productService'];
    function myCollectionController($scope,$state,$stateParams,$verifyService,$http,$common,$timeout,userInfo,$cardService,$productService){
    	$verifyService.SetIOSTitle("我的收藏");
    	var vm = this;
    	$scope.pageIndex = 1;
    	$scope.pageSize = 10;
    	$scope.list = {};
    	$scope.jdUrl = $productService.imgUrl[0];
    	$scope.zjUrl = imgUrl;
    	/*vm.loadIcon = true;                              	//加载loading
        vm.loadGoods = true;                     
        vm.loadEnd = true;*/
        vm.goodsList = [];
        $scope.fiction = false;
        
    	init()
    	function init(){
    		getlist();
    		vm.mainScroll = scroll('.main-content');
			vm.mainScroll.on('scrollEnd', function () {
				vm.loadIcon = true;                              	//加载loading
		        vm.loadGoods = true;                     
				if( this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd){
					vm.loadEnd = false;
                    $scope.pageIndex ++;
                    getlist();
                    $timeout(function(){
                        vm.mainScroll.refresh();
                    },200)
                }
			})
    	}
    	function getlist(){
    		$cardService.getGoodsCollectList({
    			channelId : sessionStorage.channelId,
    			pageIndex : $scope.pageIndex,
    			pageSize : $scope.pageSize
    		},localStorage.getItem('sinks-token')).success(function(data){
    			if(data.resultCode == '0000'){
    				if(!isEmptyObject(data.result.goodsList)){ 
			 	 		$scope.list = data.result.goodsList;
			 	 		vm.goodsList = data.result.goodsList;
			 	 		angular.forEach($scope.list, function(data1){
			                if(!data1.freePeriods){
			 	 				data1.freePeriods = 0;
			 	 			}
			                //优惠文字拼接
			                if (data1.freePeriods) {
			                    data1.activityWords = '分期可免利息';
			                }else if(data1.chargeFee){
			                    data1.activityWords = '分期可免手续费';
			                }else{
			                   data1.activityWords = ''; 
			                }
			
			                if (data1.couponMoney) {
			                    if (data1.activityWords) data1.activityWords += ',';
			                    data1.activityWords += '送'+data1.couponMoney+'现金券';
			                }
		                })   
			 	 		/*if ($scope.pageIndex == 1) {
							vm.goodsList = data.result.goodsList;
							if(data.result.count <= 10){
	                            vm.loadGoods = false;
	                            vm.loadIcon = false;
	                        }
						}else{
							if(data.result.count <= 10){
	                            vm.loadGoods = false;
	                            vm.loadIcon = false;
	                        }else{
	                        	angular.forEach(data.result.goodsList, function(data){ 
	                                vm.goodsList.push(data);  
	                           })
	                        }
	                        vm.loadEnd = true;
						}*/
			 	 	}/*else{
			 	 		if(data.result.count == 0){
			 	 			$scope.fiction = true;
	                        vm.goodsList = data.result.userCouponList;
			 	 		}
			 	 		vm.loadIcon = false;
                        vm.loadGoods = false;  
                    }*/
			 	 	$timeout(function(){
                        vm.mainScroll.refresh();
                    },200)
    			}
    		})
    	}
    }
    
    //我的卡卷
    myCardController.$inject = ['$scope','$state','$stateParams','$verifyService','$http','$common','$timeout','userInfo','$cardService','$productService'];
    function myCardController($scope,$state,$stateParams,$verifyService,$http,$common,$timeout,userInfo,$cardService,$productService) {
        var vm = this;
		$verifyService.SetIOSTitle("我的卡券");
		vm.loadIcon = true;                              	//加载loading
        vm.loadGoods = true;                     
        vm.loadEnd = false;
		vm.stages = '未用';
		vm.volume = '';
		vm.Label = "恭喜！您获得一张优惠卷"+"<br/>"+"马上去使用";
		vm.label = "无效兑换码"+"<br/>"+"去参加活动获得更多优惠";
		vm.off = '';
		vm.pageNo = 1;
		vm.coupinstatus = 2;
		vm.fiction = false;
		vm.goodsList = [];
		vm.mobile = JSON.parse(localStorage.getItem('$$payload')).mobile;
		//tabs
		vm.handover = function(myevent,val,code){
	       vm.stages = val;
	       vm.coupinstatus = code;
	       vm.pageNo = 1;
		   getGoodsList()
		   if(code == 2){
			monitor('unused','')
		   }else if(code == 4){
			monitor('failure','')
		   }else if(code == 3){
			monitor('used','')
		   }
		  }
		vm.monitor = monitor; //埋点
		// 埋点
		function monitor(pageModule,pageValue) {
			$productService.doUserTrace({
				channelId: sessionStorage.getItem('channelId'),
				page: 'couponspage',
				pageModule: pageModule,
				pageValue: pageValue
			}).success(function(data) {

			})
			
		}
		$scope.item = [
			{mess:'未用',code:'2'},
			{mess:'失效',code:'4'},
			{mess:'已用',code:'3'}
		]
		//alert对话框
		function alert(Label){
			new dialog().alert({
				content : Label,
				confirmBtnText : "知道了",
				confirmBtn:function(){
        			location.reload();
        		}
        	})
			$('.content').css('text-align','center')
			$('.content').css('font-size','0.4rem')
		}
		
		$scope.card = function(){
			new dialog().alert({
				content : 	'<div class="macard-div">' +
			                 	'<h3 class="f26">卡券使用规则</h3>'+
			                 	'<p>1、乐道卡券仅限在汇生活平台使用；</p>'+
			                 	'<p>2、单笔订单仅限使用1张卡券，卡券不可转正他人使用，券超过订单金额的部分不予退还。</p>'+
			                 	'<p>3、现金券，不能提现，只能用于分期商城再消费抵扣订单金额。</p>'+
			                 	'<p>4、使用卡券的订单若产生退款退货，则该订单所使用的卡券将不予退回；赠送的卡券失效。</p>'+
			                 	'<p>5、卡券在有效期内使用，逾期未使用则自动失效，系统不再予以补发。</p>'+
		                	'</div>',
				confirmBtnText : "知道了",
        	})
		}
		init()
		function init(){
			getGoodsList();
	        vm.mainScroll = scroll('.main-content');
			vm.mainScroll.on('scrollEnd', function () {
				vm.loadIcon = true;                              	//加载loading
		        vm.loadGoods = true;                     
				if( this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd){
					vm.loadEnd = false;
                    vm.pageNo ++;
                    getGoodsList();
                    $timeout(function(){
                        vm.mainScroll.refresh();
                    },200)
                }
			})
		}
		
		function getGoodsList(){
			$cardService.getCouponList({
				mobile : vm.mobile,
				pageNo : vm.pageNo,
				pageSize  : 10,
				couponStatus : vm.coupinstatus
			},localStorage.getItem('sinks-token')).success(function(data){
				if(data.resultCode =='0000'){
					if(!isEmptyObject(data.result.userCouponList)){ 
	        			vm.fiction = false;
			 	 		$scope.list = data.result.userCouponList;
			 	 		angular.forEach(data.result.userCouponList, function(data1){
			 	 			data1.couponName= data1.couponName.replace("(贷款)","")
			                if(data1.useLimit == ''){
			 	 				data1.useLimit = 0;
			 	 			}
		                })   
			 	 		if (vm.pageNo == 1) {
							vm.goodsList = data.result.userCouponList;
							if(data.result.total <= 10){
	                            vm.loadGoods = false;
	                            vm.loadIcon = false;
	                        }
						}else{
							angular.forEach(data.result.userCouponList, function(data){ 
                                vm.goodsList.push(data);  
                            })
						}
						vm.loadEnd = true;
			 	 	}else{
			 	 		if(data.result.total == 0){
	                        vm.fiction = true;
	                        vm.goodsList = data.result.userCouponList;
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
		
		//兑换
		$scope.exchange = function(){
			if(vm.volume == ''){
				toolTip('请输入兑换码')
			}else{
				$cardService.convertCoupon({
					code : vm.volume
				}).success(function(data){
					if(data.resultCode == '0000'){
						alert(vm.Label)
					}else{
						toolTip(data.resultMessage)
					}
				})
			}
		}
	}
	

    //礼品卡
    myGiftCardController.$inject = ['$scope','$state','$stateParams','$verifyService','$http','$common','$timeout','userInfo','$cardService','$productService'];
    function myGiftCardController($scope,$state,$stateParams,$verifyService,$http,$common,$timeout,userInfo,$cardService,$productService) {
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
                page: 'mygiftcard',
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


         //初始化
         init()
         function init(){
             getGoodsList();
             vm.mainScroll = scroll('.main-content');
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
        	
		
    }

});