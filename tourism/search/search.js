/**
 * home.js
 * @authors Casper 
 * @date    2016/9/01
 * @version 1.0.0
 */

define(['angular','css!./search.css','common/script/lib/swiper.min.js'], function(angular) {
	angular.module("app")
	.controller("searchCtrl",searchCtrl)
	
	/*旅游搜索*/
	searchCtrl.$inject = ['$scope', '$state','$verifyService','$timeout','$tourismService','$stateParams','$window'];
	function searchCtrl($scope, $state,$verifyService,$timeout,$tourismService,$stateParams,$window){
		$verifyService.SetIOSTitle("旅游列表");
		var vm = this;
		vm.types = $tourismService.type.slice(0,3);
		vm.ftypes = $tourismService.type.slice(3,5)
		vm.desc = '';
		vm.goodsList = [];									//商品数据	
		vm.pageNo = 1;
		vm.pageSize = 5;
		vm.packageName = $stateParams.searchkeyword;
		vm.productClass = $stateParams.productClass;
		vm.productType = $stateParams.productType;
		vm.placeArrive = $stateParams.placeArrive;
		vm.placeStart = $stateParams.placeStart;
		vm.startPrice = '';
		vm.endPrice = '';
		vm.productAct = ''; 									//分页													
		vm.loadIcon = true;                              	//加载loading
        vm.loadGoods = true;                     
        vm.loadEnd = false;
        vm.searchSub = searchSub; 
        $scope.routeGoodsList = [];
        $scope.list ={g:"",x:"",h:''};
        vm.images = "https://test5hsh.hlej.com/mallh5/tourism/search/images/list_07.jpg"
        $scope.roll=false;
        
        
		init()
		function init(){
			get();
			getGoodsList();
			vm.mainScroll = scroll('.main-content');
			vm.mainScroll.on('scrollEnd', function () {
				if( this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd){
                    vm.loadEnd = false;
                    vm.pageNo ++;
                    getGoodsList();
                }
			})
		}

		//功能 
		function get(){
			//重置按钮
			vm.Remove = function(){
			 	$("span.active").removeClass("active");
				vm.startPrice = '';
				vm.endPrice = '';
				$scope.list ={g:"",x:"",h:""};
			 }
		
			//tabs切换
			vm.handover = function(myevent){
		    $(myevent.currentTarget).addClass('active')
		      .siblings().removeClass('active');
		     	$(".screen").hide();
		   }
			//产品类型
			vm.handovertype = function(e,type){
			    $(e.target).toggleClass('active')
		      	.siblings().removeClass('active');

		      	if($(e.target).attr("class") == 'tabs-btn travel-margin ng-binding ng-scope active'){	
					$scope.list.g = type;
	        	}else{
	        		$scope.list.g = "";
	        	}
	        	if($(e.target).text() == "周边游"){
					vm.placeStart = $window.sessionStorage.getItem("city-orientation")	
				}else{
					vm.placeStart = "";
				}
		   	}
			
			//出游方式
			vm.handoverftype = function(e,type){
			   $(e.target).toggleClass('active')
		      	.siblings().removeClass('active');
		      	if($(e.target).attr("class") == 'tabs-btn travel-margin ng-binding ng-scope active'){	
					$scope.list.x = type;
	        	}else{
	        		$scope.list.x = "";
	        	}
		   	}
			//特色主题
			vm.handovertwo = function(e){
			    $(e.target).toggleClass('active')
			     .siblings().removeClass('active');
		     	if($(e.target).attr("class") == 'tabs-btn travel-marginright active'){
			     	$scope.list.h = $(e.target).text()
		        }else{
		        	$scope.list.h = "";
		        }
		   	}
			//筛选弹出层
			vm.hanblock = function(myevent){
				$(".screen").show(); 
				$(myevent.currentTarget).addClass('active')
		      	.siblings().removeClass('active');
			}
			//特色主题隐藏效果
			vm.hanslide = function(){
				$(".travel-div").slideToggle("slow");
			}
		}
		
		// 获取数据商品
		function getGoodsList(type){
			$('.travel-yc').css('display','none')
			$tourismService.getTourismSearch({
				pageNo : vm.pageNo,
	        	pageSize : vm.pageSize,
				packageName : vm.packageName,
				productClass : vm.productClass,
				productType : vm.productType,
				startPrice : isNaN(vm.startPrice) ? '' : vm.startPrice,
				endPrice : isNaN(vm.endPrice) ? '' : vm.endPrice,
				productAct : vm.productAct,
				placeArrive : vm.placeArrive,
				placeStart : vm.placeStart
			})
			.success(function(data){
			 	if (data.resultCode == '0000'){
			 	 	if(!isEmptyObject(data.result)){ 
			 	 		$scope.routeGoodsList = data.result;
			            angular.forEach($scope.routeGoodsList, function(data1){
			               angular.forEach($tourismService.type,function(data2){
			                  if (data1.productClass == data2.productClass) {
			                      data1.productClassName = data2.name == '周边游' ? '' : data2.name  ;
			                  }
			               })   
			            });
			 	 		if (vm.pageNo == 1) {
							vm.goodsList = data.result;
						}else{
							angular.forEach(data.result, function(data){ 
                                vm.goodsList.push(data);  
                            })
						}
						vm.loadEnd = true;
			 	 	}else{
			 	 		$scope.routeGoodsList = data.result;
			 	 		vm.loadIcon = false;
                        vm.loadGoods = false;  
                        if (vm.pageNo == 1 && isEmptyObject(data.result)) {
                            $('.travel-yc').css('display','block')
                        	vm.goodsList = "";
                        }	
                    }
			 	 	$timeout(function(){
                        vm.mainScroll.refresh();
                    },200)
			 	}else{
			 		vm.loadIcon = false; 
                   	toolTip(data.resultMessage)
                
			 	}
			 	if(type =="sx"){
			 		if(isEmptyObject($scope.routeGoodsList)){
			 			toolTip("暂无商品")
					}else{
						$(".tabs-list").addClass('active')
						.siblings().removeClass('active');
					    $(".screen").hide();
					}
			 	}
			 	
			 	   	//确认按钮
				vm.handovert = function(myevent){
					vm.pageNo = 1;
					vm.productType = $scope.list.g ;
			     	vm.productClass = $scope.list.x;
			     	vm.productAct = $scope.list.h;
			     	getGoodsList("sx")
				}	
			 	
			})
		}
		
		//搜索按钮
		function searchSub(){
			if (vm.searchText != '') {
				vm.goodsList = [];
				vm.pageNo = 1; 
				vm.loadIcon = true;
	            vm.loadGoods = true;
	            vm.loadEnd = false;
	            getGoodsList();
			}	
		}
	}
})