/**
 * Interest.js
 * @authors Casper 
 * @date    2016/09/01
 * @version 1.0.0
 */

define(['angular','css!./Interest.css','common/script/lib/swiper.min.js'], function(angular) {
	angular.module('app')
	.controller('InterestController',InterestController)
	
	/*--------------------免息分期-------------------*/	
    InterestController.$inject = ['$scope','$state',"$verifyService","$timeout",'$cardService','$stateParams','$userService','$productService'];
    function InterestController($scope, $state,$verifyService,$timeout,$cardService,$stateParams,$userService,$productService){	
    	$verifyService.SetIOSTitle("免息分期");
    	$scope.img = imgUrl;
    	$scope.cs = 'https://g1.hlej.com/';
    	$scope.url = $productService.imgUrl[4];
    	$scope.imges = jdImaUrl;
    	$scope.bannerlist = {};
    	$scope.explosionlist = {};
    	$scope.phone = {};
    	$scope.Computer = {};
    	$scope.household = {};
    	$scope.digital = {};
    	$scope.close = true; //爆款商品
/*    	$scope.interest = [
    		{icon:'icons',images:'../interest/imges/2_02.png'},
    		{icon:'iconb',images:'../interest/imges/3_01_02.png'},
    		{icon:'iconj',images:'../interest/imges/3_01_05.png'},
    		{icon:'iconj',images:'../interest/imges/2_03.png'}
		]*/
    	$timeout(function () {
       	 scroll('.main-content');
    	},300)
    	init()
    	function init(){
    		banner();
    		explosion();
    		$scope.$on('$includeContentLoaded', function(event) {
	          $('.footer-bar .tabs-fen').addClass('current')
	          .siblings().removeClass('current');
	        });
    	}
    	
    	//banner
    	function banner(){
    		$cardService.getInterestFreePageBanner({
    			channelId : $userService.$$channelId
    		}).success(function(data){
    			if(data.resultCode == '0000'){
    				$scope.bannerlist = data.result.bannerList;
			    	$timeout(function(){
			          var bannerSlide = new Swiper('.bannerSlide', {
			            loop:true,
			            autoplay:4000,
			            autoplayDisableOnInteraction : false,
			            pagination:'.swiper-pagination'
			          });
			        },200)
    			}
    		})
    	}
    	//爆款商品
    	function explosion(){
    		$cardService.getModuleGoodsList({
    			channelId : $userService.$$channelId
    		}).success(function(data){
    			if(data.resultCode == '0000'){
    				if(data.result.moduleList[0].moduleCode == '1000000027'){
    					$scope.explosionlist = data.result.moduleList[0].goodsList;
    					
    				}else{
    					$scope.explosionlist = [];
    					
    				}
    				if($scope.explosionlist.length == 0){
    					$scope.close = false;
    					$scope.moduleList = data.result.moduleList;
    				}else{
    					$scope.moduleList = data.result.moduleList.splice(1,4)
    				}
    				angular.forEach($scope.explosionlist, function(data1){
    					if(data1.otherPrice == undefined){
    						data1.otherPrice = 0; 
    					}
    					if(data1.typeFrom == 1){
    						data1.url = imgUrl;
    					}else if(data1.typeFrom == 2){
    						data1.url = $productService.imgUrl[4];
    					}
    				})
    				angular.forEach($scope.moduleList, function(data1){
/*    					for(var i=0;i<$scope.moduleList.length;i++){
	        				$scope.moduleList[i] = $.extend($scope.moduleList[i], $scope.interest[i])
	        			}	*/
		        		angular.forEach(data1.goodsList, function(data2){
	        				if(data2.typeFrom == 1){
	    						data2.url = imgUrl;
	    					}else if(data2.typeFrom == 2){
	    						data2.url = $productService.imgUrl[4];
	    					}
	        				if(data2.freePeriods == undefined){
								data2.freePeriods = 0;
							}
							if(data2.couponMoney == undefined){
								data2.couponMoney = 0;
							}
							if(data2.otherPrice == undefined){
								data2.otherPrice = 0;
							}
		        		})
		        	})
    				$timeout(function () {
			       	 scroll('.main-content');
			    	},300)
    				$timeout(function(){
			          var hotSwiper = new Swiper('.hot-swiper', {
			            slidesPerView: 'auto',
			            paginationClickable: true,
			            freeMode: true
			          });
			        },200)
    			}
    		})
    	}
    }
})