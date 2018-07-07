/**
 * Interest.js
 * @authors Casper 
 * @date    2016/09/01
 * @version 1.0.0
 */

define(['angular','css!./Interest.css','css!../product/product.css','common/script/lib/swiper.min.js'], function(angular) {
	angular.module('app')
	.controller('InterestController',InterestController)
	
	/*--------------------秒杀专场-------------------*/	
    InterestController.$inject = ['$scope','$state',"$verifyService","$timeout","$window",'$cardService','$stateParams','$userService','$customerService','$common','$productService','$interval'];
    function InterestController($scope, $state,$verifyService,$timeout,$window,$cardService,$stateParams,$userService,$customerService,$common,$productService,$interval){
    	var vm = this;
    	vm.isHide = true;
		vm.findWare = findWare;
		vm.product = "";
		vm.spikeActivityId="";
		vm.progress = "";
		vm.index="";
		vm.stop=stop;
		vm.qiangwan=qiangwan;
    	$verifyService.SetIOSTitle("秒杀专场");
    	$scope.img = imgUrl;
    	$scope.cs = 'https://image.hlej.com/';
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
//  		explosion();
    		$scope.$on('$includeContentLoaded', function(event) {
	          $('.footer-bar .tabs-fen').addClass('current')
	          .siblings().removeClass('current');
	        });
    	}
    	
    	
    	//banner
    	function banner(){
    		$cardService.getInterestFreePageBanner().success(function(data){
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
//  	function explosion(){
//  		$cardService.getModuleGoodsList({
//  			channelId : $userService.$$channelId
//  		}).success(function(data){
//  			if(data.resultCode == '0000'){
//  				if(data.result.moduleList[0].moduleCode == '1000000027'){
//  					$scope.explosionlist = data.result.moduleList[0].goodsList;
//  					
//  				}else{
//  					$scope.explosionlist = [];
//  					
//  				}
//  				if($scope.explosionlist.length == 0){
//  					$scope.close = false;
//  					$scope.moduleList = data.result.moduleList;
//  				}else{
//  					$scope.moduleList = data.result.moduleList.splice(1,4)
//  				}
//  				angular.forEach($scope.explosionlist, function(data1){
//  					if(data1.otherPrice == undefined){
//  						data1.otherPrice = 0; 
//  					}
//  					if(data1.typeFrom == 1){
//  						data1.url = imgUrl;
//  					}else if(data1.typeFrom == 2){
//  						data1.url = $productService.imgUrl[4];
//  					}
//  				})
//  				angular.forEach($scope.moduleList, function(data1){
///*    					for(var i=0;i<$scope.moduleList.length;i++){
//	        				$scope.moduleList[i] = $.extend($scope.moduleList[i], $scope.interest[i])
//	        			}	*/
//		        		angular.forEach(data1.goodsList, function(data2){
//	        				if(data2.typeFrom == 1){
//	    						data2.url = imgUrl;
//	    					}else if(data2.typeFrom == 2){
//	    						data2.url = $productService.imgUrl[4];
//	    					}
//	        				if(data2.freePeriods == undefined){
//								data2.freePeriods = 0;
//							}
//							if(data2.couponMoney == undefined){
//								data2.couponMoney = 0;
//							}
//							if(data2.otherPrice == undefined){
//								data2.otherPrice = 0;
//							}
//		        		})
//		        	})
//  				$timeout(function () {
//			       	 scroll('.main-content');
//			    	},300)
//  				$timeout(function(){
//			          var hotSwiper = new Swiper('.hot-swiper', {
//			            slidesPerView: 'auto',
//			            paginationClickable: true,
//			            freeMode: true
//			          });
//			        },200)
//  			}
//  		})
//  	}

		
    	
    	
    	//秒杀专场tab栏
    	tablistid()
    	function tablistid(){
    		$cardService.getTabList().success(function(data){
    			// console.log(data.result.goodsList)
    			var tabArr = [];
				var goodList=data.result.goodsList;
				for(var i=0;i<goodList.length;i++){
					
					tabArr.push(goodList[i].spikeActivityId)
				}
				tabArr.length=5
				// console.log(tabArr)
				$scope.tabArr=tabArr;
				vm.findWare(event,tabArr[0])
				
    		})
    	}
    	
    	
    	
    	
    	//tab栏内容
    	tabcontent()
    	function tabcontent(){
    		var datetime=[];
    		for(var i=2;i<5;i++){
    			var date = new Date();
				date.setTime(date.getTime()+24*60*60*1000*i);
				var s3 = (date.getMonth()+1) + "月" + date.getDate()+"日";
				datetime.push(s3)
    		}
    		 
			$scope.datetime=datetime;
			
    	}
    	
    	
    	
    	
    	//获取商品
    	function findWare($event,spikeActivityId){
    			vm.index=$(event.target).index();
				
				getWareList(spikeActivityId)
				// if(spikeActivityId==undefined){
				// 	console.log(111111)
				// }
				$($event.target).addClass('active')
      			.siblings().removeClass('active');
				vm.spikeActivityId=spikeActivityId;
				daojis()
				
		    }
    	
    	//距离本场结束时间
    	daojis()
    	function daojis(){
    	
		var date = new Date();
	    var seperator1 = "-";
	    var seperator2 = ":";
	    var strDate = date.getDate();
	    var a = date.getHours();
	    var b = date.getMinutes();
	    if(a >=0&&a <10){
	    	a =a+24;
	    }
	    
	    
	    vm.firstactive=$(".tablist div:first-child").hasClass("active");
		vm.secondactive=$(".tablist div:eq(1)").hasClass("active");
		vm.thirdactive=$(".tablist div:eq(2)").hasClass("active");
		vm.fourthactive=$(".tablist div:eq(3)").hasClass("active");
		vm.fifthactive=$(".tablist div:eq(4)").hasClass("active");
		if(vm.firstactive){
			var h=33,m=59,s=59;
			h = (h- parseInt(a));
		if(h<10){
			h = '0'+h
		}
		m = m- parseInt(date.getMinutes());
		if(m<10){
			m = '0'+m
		}
		s = s- parseInt(date.getSeconds());
		
       var timer = $interval( function run(){
       	
			
            --s;
            if(s<10&&s>-1){
            	s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
        			m = '0'+m
        		}
            }
            if(m<0){
//          	console.log(m)
                --h;
                m=59;
                if(h<10&&h>-1){
	            	h = '0'+h
	            }
            }
            if(h<0){
                h=00;
                s=00;
                m=00;
            }
            $scope.datah1 = h;
            $scope.datam1= m;
            $scope.datas1 = s;
//          console.log(h)
        },1000);
		}
		else if(vm.secondactive){
			var h=33,m=59,s=59;
			h = (h- parseInt(a));
		if(h<10){
			h = '0'+h
		}
		m = m- parseInt(date.getMinutes());
		if(m<10){
			m = '0'+m
		}
		s = s- parseInt(date.getSeconds());
		
       var timer = $interval( function run(){
       	
			
            --s;
            if(s<10&&s>-1){
            	s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
        			m = '0'+m
        		}
            }
            if(m<0){
                --h;
                m=59;
                if(h<10&&h>-1){
	            	h = '0'+h
	            }
            }
            if(h<0){
                h=00;
                s=00;
                m=00;
            }
            $scope.datah2 = h;
            $scope.datam2= m;
            $scope.datas2 = s;
//          console.log(h)
        },1000);
		}
		else if(vm.thirdactive){
			var d=1,h=33,m=59,s=59;
//			if(d<10){
//				d = '0'+d
//			}
			h = (h- parseInt(a));
		if(h<10){
			h = '0'+h
		}
		m = m- parseInt(date.getMinutes());
		if(m<10){
			m = '0'+m
		}
		s = s- parseInt(date.getSeconds());
		
       var timer = $interval( function run(){
       	
			
            --s;
            if(s<10&&s>-1){
            	s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
        			m = '0'+m
        		}
            }
            if(m<0){
                --h;
                m=59;
                if(h<10&&h>-1){
	            	h = '0'+h
	            }
            }
            if(h<0){
                --d;
                h=23;
//              if(d<10&&d>-1){
//	            	d = '0'+d
//          }
               }
            if(d<0){
            	d=0;
                h=00;
                s=00;
                m=00;
            }
            $scope.datad3 = d;
            $scope.datah3 = h;
            $scope.datam3= m;
            $scope.datas3 = s;
//          console.log(h)
        },1000);
		}
		else if(vm.fourthactive){
			var d=2,h=33,m=59,s=59;
//			if(d<10){
//				d = '0'+d
//			}
			h = (h- parseInt(a));
		if(h<10){
			h = '0'+h
		}
		m = m- parseInt(date.getMinutes());
		if(m<10){
			m = '0'+m
		}
		s = s- parseInt(date.getSeconds());
		
       var timer = $interval( function run(){
       	
			
            --s;
            if(s<10&&s>-1){
            	s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
        			m = '0'+m
        		}
            }
            if(m<0){
                --h;
                m=59;
                if(h<10&&h>-1){
	            	h = '0'+h
	            }
            }
            if(h<0){
                --d;
                h=23;
//              if(d<10&&d>-1){
//	            	d = '0'+d
//          }
               }
            if(d<0){
            	d=0;
                h=00;
                s=00;
                m=00;
            }
            $scope.datad4 = d;
            $scope.datah4 = h;
            $scope.datam4= m;
            $scope.datas4 = s;
//          console.log(h)
        },1000);
		}
		else if(vm.fifthactive){
			var d=3,h=33,m=59,s=59;
//			if(d<10){
//				d = '0'+d
//			}
			h = (h- parseInt(a));
		if(h<10){
			h = '0'+h
		}
		m = m- parseInt(date.getMinutes());
		if(m<10){
			m = '0'+m
		}
		s = s- parseInt(date.getSeconds());
		
       var timer = $interval( function run(){
       	
			
            --s;
            if(s<10&&s>-1){
            	s = '0'+s
            }
            if(s<0){
                --m;
                s=59;
                if(m<10&&m>-1){
        			m = '0'+m
        		}
            }
            if(m<0){
                --h;
                m=59;
                if(h<10&&h>-1){
	            	h = '0'+h
	            }
            }
            if(h<0){
                --d;
                h=23;
//              if(d<10&&d>-1){
//	            	d = '0'+d
//          }
               }
            if(d<0){
            	d=0;
                h=00;
                s=00;
                m=00;
            }
            $scope.datad5 = d;
            $scope.datah5 = h;
            $scope.datam5= m;
            $scope.datas5 = s;
//          console.log(h)
        },1000);
		}

			
			
		
		
		
		
        
	}
    	
    	//毫秒倒计时
    	ms();
    	function ms(){
    		var ms=10;
    		$interval( function run(){
                        --ms;
                        if(ms<0){
                        	ms=10
                        }
                        $scope.datams = ms;
                    },100);
    	}
    	
    	
    	
    	//商品列表
    	function getWareList(spikeActivityId){
    		
      $productService.getWare(spikeActivityId).success(function (data) {
			   
			  if(data.resultCode=="0000"){
					// if(data.result.goodsList.length==0){
					// 	toolTip("暂无商品,去看看其他的品牌吧")
					// }
					
					if(!isEmptyObject(data.result) && data.result.goodsList.length>0){
						// vm.productList=data.result.goodsList;
						$scope.getproductlist = data.result.goodsList;
						$scope.length=data.result.goodsList.length;
						
						//进度条进度条
						vm.progress=50;
						vm.text=true;
						// console.log($scope.length)
						angular.forEach($scope.getproductlist, function(data1){
							// console.log(data1)
							if(data1.typeFrom==2){
								data1.img = $productService.imgUrl[4];
							}else if(data1.typeFrom==1){
								data1.img = imgUrl;
							}
						   })
					}
			  }
      })
    
    	}
    	//阻止已抢完
    	function qiangwan($event){
    		if($event.preventDefault){
    			$event.preventDefault()
    		}else{
    			window.$event.returnValue==false
    		}
    		
    	}
    	//阻止开售提醒
    	function stop($event,goodsId){
    		if($event.preventDefault){
    			$event.preventDefault()
    		}else{
    			window.$event.returnValue==false
    		}
    		
    		$userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
		        if(data.resultCode == "0000"){
			    	$customerService.goodsTi({
				    	channelId:$window.sessionStorage.getItem('channelId'),
						spikeActivityId:vm.spikeActivityId,
						goodsId:goodsId
				    }).success(function(data1){
				    	toolTip(data1.resultMessage);
				    	$($event.target).css('background','#ACACAC')
				    	$($event.target).text('已提醒')
//				    	$($event.target).unbind("click")
				    })
		    	}else{
		    		sessionStorage.setItem('interestPlace', '1');
		    		$common.goUser({
			            state: 'interest'
	          		},'/interest');
		    	}
	      });
        };
			
			
	
  }
    	
    })




