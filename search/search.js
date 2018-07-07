/**
 * Created by Administrator on 2016/8/20.
 */
define(['angular','css!./search.css'], function(angular) {
    angular.module('app')
        .controller('partController', partController)
        .controller('searchController', searchController)
        .directive('onRepeatFinishedRender', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function() {
                            scope.$emit('ngRepeatFinished', element);
                        });
                    }
                }
            };
        });

    /*--------------------商品分类----------------------*/
    partController.$inject = ['$scope', '$state', '$verifyService','$timeout','$cardService','$stateParams','$productService'];
    function partController($scope, $state,$verifyService,$timeout,$cardService,$stateParams,$productService) {
        var vm=this;
        $verifyService.SetIOSTitle("商品分类");
      	$scope.name = $stateParams.name || '手机';
        $scope.id = $stateParams.id || '9987';
        $scope.tab = [];
        $scope.url = $productService.imgUrl[4];
        $scope.img = imgUrl;
        
        $scope.$on('$includeContentLoaded', function(event) {
            $('.footer-bar .tabs-fen').addClass('current')
            .siblings().removeClass('current');
          });
        // 搜索框
          $scope.data = {
            historySearch: getSearchCookie('searchName')
        }

        if($scope.data.historySearch.length>0){
            $scope.searchText = $scope.data.historySearch[0]
        }else{
            $scope.searchText = 'iPhone X'
        }
        init();
        function init(){
        	getOne();
        	$timeout(function () {
	            var mainpart = new IScroll(".main-part",{
        			probeType : 1,
			        preventDefault:false,
			        preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ }
        		});	            
			    var mainScroll = new IScroll(".main-content",{
			        probeType : 1,
			        preventDefault:false,
			        preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ }
			    });
			    mainScroll.on('scrollEnd', function () {
			      var endY=(this.y - this.maxScrollY)
			      if(endY < 100){
		          	mainScroll.refresh();
			      }
			    });
	        },10);
            //调用获取购物车数量接口
            $productService.getShoppingCartGoodsNum({},localStorage.getItem("sinks-token")).success(function(data){
                if(data.resultCode=='0000'){
                    $scope.cartNum=data.result.goodsNum;
                    if($scope.cartNum>0){
                        $('.cartNum').show().html($scope.cartNum);
                    }else{
                        $('.cartNum').hide()
                    }
                }
            });
        }
        
        if($stateParams.sign&&$stateParams.sign=='digit'){
            $scope.name = $stateParams.name || '数码';
            $scope.id = $stateParams.id || '652';
            $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
                $timeout(function(){
                   
                },200)
            });
        }
        
      
        //跳转
        $scope.goseach = function(parentId,categoryId,searchKey,type,categoryName,pageModule){
            monitor(pageModule,categoryId)
        	if(type=='01'){
        		$state.go('search',{
                    goodsCategories:$scope.id+';'+parentId+';'+categoryId,
                    keywords : categoryName
        		})
        	}else if(type=='02'){
        		$state.go('search',{
        			brandName:searchKey,
        			goodsCategories:$scope.id
        		})
        	}
        }
        
        //一级分类数据
        function getOne(){
        	$cardService.getOneCategoryList({
        		channelId : sessionStorage.channelId
        	}).success(function(data){
        		if(data.resultCode=='0000'){
        			$scope.tab=data.result.categoryList;
                    classification();
        		}
        	})
        }


        vm.monitor = monitor; //埋点

        // 埋点
        function monitor(pageModule,pageValue) {
            
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'categoryPage',
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }
        
        //tab
        $scope.tabs = function(name,id,index,pageModule){
        	$scope.name = name;
        	$scope.id = id;
            classification(index);
            monitor(pageModule,id);
        }
        
        //搜索
        $scope.search = function(){
        	$state.go('home',{
        		Mark : 'part'
        	})
        }
        
        //分类数据
        function classification(index){
        	$('.part-contain').css('display','none');
        	$cardService.getGoodsCategoryList({
        		channelId : sessionStorage.channelId,
        		categoryId : $scope.id 
        	}).success(function(data){
        		if(data.resultCode == '0000'){
        			$('.part-contain').fadeIn("slow");
        			$('.part-contain').fadeIn(3000);
    				$timeout(function(){
		        		var mainpart = new IScroll(".main-part",{
		        			probeType : 1,
		        			preventDefault: false,
					        preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ }
		        		});
		         		var mainScroll = new IScroll(".main-content",{
					        probeType : 1,
					        preventDefault: false,
					        preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ }
					    });
					    $timeout(function(){
		        			mainScroll.refresh();
		        		},200)	
			        },200)
    				$scope.categoryList = data.result.categoryList;
        		}
        	})
        }
        
        //Cookie中获取搜索关键词
        function getSearchCookie(name) {
            var start = document.cookie.indexOf(name + "=");
            if (start != -1) {
                start = start + name.length + 1;
                var end = document.cookie.indexOf(";", start);
                if (end == -1) end = document.cookie.length;
                arr = JSON.parse(unescape(document.cookie.substring(start, end)));

                return arr;
            } else {
                return [];
            }
        }

        
    }


    /*--------------------搜索----------------------*/
    searchController.$inject = ['$scope', '$state', '$verifyService','$timeout','$stateParams','$productService','$userService'];
    function searchController($scope, $state,$verifyService,$timeout,$stateParams,$productService,$userService) {
        $verifyService.SetIOSTitle("搜索");
        var mainScroll = new IScroll(".main-content",{
        	preventDefault:false,
        	preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ }
        });
        var vm=this;
        var jdImgServer = $productService.imgUrl[4];//jd图片服务器地址
        $scope.Name	= $stateParams.brandName||'';
        $scope.info = JSON.parse(sessionStorage.getItem('serchinfo'));//搜索跳转后记录当前搜索的状态；
        $scope.init = false;		//页数显示隐藏标识
        $scope.mark = false;		//回到顶部标识
        if($scope.info){
        	$scope.data = {
	            freePeriodsList : [{name:'3期',code:3},{name:'6期',code:6},{name:'9期',code:9},{name:'12期',code:12}],      //分期列表
	            brandList : [],                                                                                             //品牌列表
	            serviceList : [{name:'京东配送',code:2},{name:'自营配送',code:1}],                                          //服务列表
	            goodsList : [],                                                                                             //商品列表
	
	            tabsIndex : $scope.info.tabsIndex||0,                          //tab选项卡选中索引
	            brandIndex : $scope.info.brandIndex||'',                        //品牌选中索引                 
	           
	            serviceIndex:$scope.info.serviceIndex,						 //服务选中索引
	            
	            searchText : $stateParams.keywords || $stateParams.brandName || $scope.info.keywords|| '',     //搜索框输入值
	            priceDesc : $scope.info.priceDesc||'',                         //价格排序 0倒序 1升序
	            freePeriods : $scope.info.freePeriods||'',                       //免息期数
	            freePoundage : $scope.info.freePoundage||0,                       //1免手续费
	            cashBack : $scope.info.cashBack||0,                           //1返现
	            minPrice : parseInt($scope.info.minPrice)||'',                          //最低价
	            maxPrice : parseInt($scope.info.maxPrice)||'',                          //最高价
	            brand : $scope.info.brand||'',                             //品牌
	            service : $scope.info.typeFrom||'',                           //服务
				total : '',								//商品总数量
	            loadIcon : true ,                       //加载loading  true显示 false隐藏
				pageNo:1,								//页数
        	}		
        }else{
        	$scope.data = {
	            freePeriodsList : [{name:'3期',code:3},{name:'6期',code:6},{name:'9期',code:9},{name:'12期',code:12}],      //分期列表
	            brandList : [],                                                                                             //品牌列表
	            serviceList : [{name:'京东配送',code:2},{name:'自营配送',code:1}],                                          //服务列表
	            goodsList : [],                                                                                             //商品列表
	
	            tabsIndex : 0,                          //tab选项卡选中索引
	            brandIndex : '',                        //品牌选中索引                 
	           
	            serviceIndex:null,						 //服务选中索引
	            
	            searchText :$stateParams.keywords || $stateParams.brandName || '手机',     //搜索框输入值
	            priceDesc : '',                         //价格排序 0倒序 1升序
	            freePeriods :'',                       //免息期数
	            freePoundage : 0,                       //1免手续费
	            cashBack : 0,                           //1返现
	            minPrice : '',                          //最低价
	            maxPrice : '',                          //最高价
	            brand : '',                             //品牌
	            service : '',                           //服务
				total : '',								//商品总数量
	            loadIcon : true ,                       //加载loading  true显示 false隐藏
				pageNo:1,								//页数
        	}		
        }
        
        var pageNo = 0,             //商品页码
            pageSize = 100,          //每页商品数
            loadGoods = true,       //下拉到底部是否请求商品（判断商品是否全部加载完成）            
            loadEnd = false,        //当前页码请求状态   false请求中  true请求完成
            minY='';
            

        vm.monitor = monitor; //埋点

        if($stateParams.keywords == 'iPhone'){
            var page = 'apple';
        }else{
            var page = 'categoryPage'
        }

        // 埋点
        function monitor(pageModule,pageValue) {
            
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: page,
                pageModule: pageModule,
                pageValue: pageValue
            }).success(function(data) {

            })
            
        }

        monitor('browse','')


        // 重新存入channelId
        if($stateParams.channelId){
            sessionStorage.setItem('channelId',$stateParams.channelId)
        }
        if($stateParams.pagInPosition){
            var pagInPosition = $stateParams.pagInPosition;
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'categoryPage',
                pageModule: pagInPosition,
                pageValue: $stateParams.keywords
            }).success(function(data) {

            })
        }


		
        init();//初始加载
        function init(){
            interest();//免息层
            screen();//筛选层
            anewGetGoods();
            setSearchCookie($scope.data.searchText);
            mainScroll.on('scrollStart', function(){
            	
	            $timeout(function () {
		            $scope.init = true;
		        },300)
            });
            //滚动条到底时加载商品
            mainScroll.on('scrollEnd', function(){        	
                if(this.y - this.maxScrollY < 1 && loadGoods && loadEnd){
                    pageNo++;
                    getGoodsList();
                }
                var a=$('a.item').height();
	        	var b= -(a*10);				//一页的高度
	        	var c=b*$scope.total;	//所有页数的高度；
	        	var g=$scope.total/10;
	        	var d=((this.y/c)*10)*g;	//当前页数
	        	$scope.data.pageNo=d.toFixed(2);
	        	if(this.y<(b/2)){
            		$scope.mark=true;
            	}else{
            		$scope.mark=false;
            	}
	        	if(/^\d+$/.test($scope.data.pageNo)){
	        		$scope.data.pageNo = $scope.data.pageNo;
	        	}else{
	        		$scope.data.pageNo=Math.round($scope.data.pageNo)+1;
	        	}
                $timeout(function () {
		            $scope.init= false;
		        },1500)
            });
        }
        
		//回到顶部
		$scope.top=function(){
			mainScroll.scrollTo(0,0,1000);
			$scope.mark=false;
		}	
		
        //tabs切换
        $scope.tabs = function(index,pageModule){
            monitor(pageModule,'')
			if ($scope.data.tabsIndex == index && index ==0) return;
				
            	$scope.data.tabsIndex = index; 
            if (index == 0) {
               $scope.data.priceDesc = ''; 
            }else if(index == 1) {
            	$(".today-select").slideUp();
            	$("#one").fadeOut();
                if ($scope.data.priceDesc == '') {
                    $scope.data.priceDesc = 'salePrice:asc';
                }else{
                	if($scope.data.priceDesc == 'salePrice:asc'){
                		$scope.data.priceDesc = 'salePrice:desc';
                	}else{
                		$scope.data.priceDesc = 'salePrice:asc';
                	}
                }
                $scope.data.goodsList=[];
                getGoodsList();
            }else if(index != 2){
            	$(".today-select").slideUp();
            	$("#one").fadeOut();
            }else{
                return false;
            }
            if(index != 1){
           	  anewGetGoods();  
            }
        }
        
        $scope.blur = blur;
        function blur(){
            $(".search-input").val('');
        }
		

        //搜索确认
        $scope.searchClick = searchClick;
        function searchClick(){
            $scope.data.freePeriods = '';
            $scope.data.freePoundage = 0;
            $scope.data.cashBack = 0;
            $scope.data.minPrice = '';
            $scope.data.maxPrice = '';
            $scope.data.brand = '';
            $scope.data.service = '';
            anewGetGoods();
            doUserTrace();
            setSearchCookie($scope.data.searchText);
        }

        // 按回车键搜索
		$('.search-input').on('keypress',function(e){
			var keycode=e.keyCode;
			if(keycode == '13') {
                    $(".search-input").blur();  
                    e.preventDefault();
                    searchClick();        
                }
		})

        //免息层
        function interest(){
            //免息
            $scope.free = function(){
                $(".today-select").slideToggle();
                $("#one").fadeToggle();
            }

            //免息重置
            $scope.interestReset = function(){
                $scope.data.freePeriods = '';
                $scope.data.freePoundage = 0;
                $scope.data.cashBack = 0;
            }

            //免息确定
            $scope.interestConfirm = function(){
                $(".today-select").slideUp();
                $("#one").fadeOut();
                anewGetGoods();
            }

            //免息期数选择
            $scope.freePeriodsSelect = function(val){
                if ($scope.data.freePeriods ===  val) {
                    $scope.data.freePeriods = ''; 
                    return false;
                }
                $scope.data.freePeriods = val;
            }

            //免手续费选择
            $scope.freePoundageSelect = function(){
                $scope.data.freePoundage = $scope.data.freePoundage ? 0 : 'Y';
            }

            //返现选择
            $scope.cashBackSelect = function(){
                $scope.data.cashBack = $scope.data.cashBack ? 0 : 'Y';
            }
        }

        //筛选层
        function screen(){
            var modal;

            //筛选层显示
            $scope.screenShow = function(pageModule){
                screenShow();
                monitor(pageModule,'')
            }

            //筛选层因此
            $scope.screenHide = function(){
                screenHide();
            }

            $scope.stopPropagation = function(event){
                event.stopPropagation();
            }

            //品牌选择
            $scope.brandSelect = function(index){
                if ($scope.data.brandIndex ===  index) {
                    $scope.data.brandIndex = ''; 
                    $scope.data.brand = '';
                    return false;
                }
                $scope.data.brandIndex = index;
                $scope.data.brand = $scope.data.brandList[index].brandName;
            }

            //服务选择
            $scope.serviceSelect = function(index){
                if ($scope.data.serviceIndex ===  index) {
                    $scope.data.serviceIndex = ''; 
                    $scope.data.service = '';
                    return false;
                }
                $scope.data.serviceIndex = index;
                $scope.data.service = $scope.data.serviceList[index].code;
            }

            //重置
            $scope.screenReset = function(){
                $scope.data.minPrice = '';
                $scope.data.maxPrice = '';
                $scope.data.brand = '';
                $scope.data.brandIndex = '';
                $scope.data.serviceIndex = '';
            }

            //确认
            $scope.screenConfirm = function(){
                screenHide();
                anewGetGoods();
            }

            //筛选层显示方法
            function screenShow(){
                modal = new animeModal('.screen-layer');
                $(".today-select").slideUp('fast');
                $("#one").fadeOut();
            }

            //筛选层隐藏方法
            function screenHide(){
                modal.hide();
            }
        }


    
		
		//点击商品跳转
		$scope.go=function(pageModule,pageValue){
            monitor(pageModule,pageValue);
			var info={
				keywords:$scope.data.searchText,
				priceDesc:$scope.data.priceDesc,
				freePeriods:$scope.data.freePeriods,
				freePoundage:$scope.data.freePoundage,
				cashBack:$scope.data.cashBack,
				minPrice:$scope.data.minPrice,
				maxPrice:$scope.data.maxPrice,
				brand:$scope.data.brand,
				typeFrom:$scope.data.service,
				tabsIndex:$scope.data.tabsIndex,
				brandIndex:$scope.data.brandIndex,
				serviceIndex:$scope.data.serviceIndex,  
			};
            var jumpInfo = {
                total: $scope.data.total,
                goodsList: $scope.data.goodsList,
                pageNo: $scope.data.pageNo,
                scrollTop: mainScroll.y
            };
            sessionStorage.setItem('jumpInfo',JSON.stringify(jumpInfo));
			sessionStorage.setItem('serchinfo',JSON.stringify(info));
		}
		
		
        //获取商品列表
        function getGoodsList(){
            loadEnd = false; 
            $productService.searchGoods({
                pageNo : pageNo,                                        //当前页数
                pageSize : pageSize,                                    //每页商品数
                searchKeyValue  : encodeURI($scope.data.searchText),    //搜索框输入值
                sortFields : $scope.data.priceDesc,                     //价格排序 asc升序 desc降序
                interestFeePeriods : $scope.data.freePeriods,           // 免息期数
                chargeFee : $scope.data.freePoundage,                   //是否免手续费
                returnCoupon :$scope.data.cashBack,                    //是否返现
                priceRangeLeftValue :$scope.data.minPrice,             //最低价
                priceRangeRightValue : $scope.data.maxPrice,            //最高价
                brandName :encodeURI($scope.Name)|| encodeURI($scope.data.brand),               //品牌
                typeFrom : $scope.data.service,                          //服务
                goodsCategories : $stateParams.goodsCategories
            }).success(function(data){
                if (data.resultCode == '0000'){

                    var goodsList = data.result.goodsList;  //商品
                    var goodsTotalNum = data.result.total;  //商品数量
					$scope.data.total = data.result.total/10;	//商品总页数
					$scope.total=data.result.total/10;	
                    if(parseInt($scope.data.total)==Number){
                    	$scope.data.total = data.result.total/10;
                    }else{
                    	$scope.data.total = parseInt((data.result.total/10)+1);
                    }
					// $scope.data.pageNo = pageNo+1;				//当前页数
                    //判断当前是否为最后一页
                    if (goodsTotalNum-pageNo*pageSize<=100){
                      loadGoods = false; 
                      $scope.data.loadIcon = false; 
                    } 

                    //判断搜索结果是否有商品
                    if (goodsList.length) {
                        angular.forEach(goodsList, function(data){

                            //图片地址拼接
                            data.imageUrl = data.typeFrom == '1' ? imgUrl + data.imageUrl : jdImgServer + data.imageUrl;

                            //优惠文字拼接
                            if (data.freePeriods) {
                                data.activityWords = '分期可免利息';
                            }else if(data.chargeFee){
                                data.activityWords = '分期可免手续费';
                            }else{
                               data.activityWords = ''; 
                            }

                            if (data.couponMoney) {
                                if (data.activityWords) data.activityWords += ',';
                                data.activityWords += '送'+data.couponMoney+'现金券';
                            }

                        });
                        //判断是否第一页，非第一页数据合并
                        if (pageNo === 0) {
                            $scope.data.goodsList = goodsList;
                        }else{
                            $scope.data.goodsList = $scope.data.goodsList.concat(goodsList);
                        }
                        getbrand(); //根据搜索关键词获取品牌列表
                    }else{
                        if (pageNo === 0){
                            $scope.data.loadIcon = false;
                            toolTip("商品暂未上架，敬请期待！");   
                        } 
                    } 
                    $timeout(function(){ mainScroll.refresh() },300)    //刷新滚动条
                }else{
                   $scope.data.loadIcon = false;
                   toolTip(data.resultMessage)
                }
                loadEnd = true;
            })
        }

        //获取品牌列表
        function getbrand(){
            $productService.searchBrandList({
                searchKeyValue : encodeURI($scope.data.searchText) || encodeURI(($stateParams.brandName == undefined ? '' : $stateParams.brandName)),
                goodsCategories:$stateParams.goodsCategories
            }).success(function(data){
                if (data.resultCode == '0000'){
                    $scope.data.brandList = data.result.brandList;
                }else{
                    toolTip(data.resultMessage)
                }   
            }) 
        }

        //重新加载商品
        function anewGetGoods(){
        	var minPrice = parseFloat($scope.data.minPrice);
        	var maxPrice = parseFloat($scope.data.maxPrice);
        	if(minPrice>maxPrice){
        		$scope.data.minPrice = maxPrice.toFixed(0);
        		$scope.data.maxPrice = minPrice.toFixed(0);
        	}

            var jumpInfo = JSON.parse(sessionStorage.getItem('jumpInfo'));
            if(jumpInfo){ //回退时加载
                var scrollTop = jumpInfo.scrollTop;
                loadGoods = true;
                pageNo = jumpInfo.pageNo;
                $scope.data.pageNo = jumpInfo.pageNo;
                $scope.data.total = jumpInfo.total; 
                $scope.total = jumpInfo.total;  
                $scope.data.goodsList = jumpInfo.goodsList;
                $(".main-content").css("visibility","hidden");
                $timeout(function(){ 
                    mainScroll.scrollTo(0,scrollTop,0);
                    mainScroll.refresh(); 
                    loadEnd = true;
                    $scope.data.loadIcon = false;
                    $(".main-content").css("visibility","");
                },50); 
                sessionStorage.removeItem('jumpInfo');             
            } else { //普通加载
                pageNo = 0; 
                loadGoods = true,
                $scope.data.goodsList = [];
                $timeout(function(){ mainScroll.refresh() },50)
                getGoodsList();
            }
        } 

        //搜索用户行为
        function doUserTrace(){
            $productService.doUserTrace({
                channelId : sessionStorage.getItem('channelId'),
                page : 'homePage',
                pageModule : 'search',
                pageValue : encodeURI($scope.data.searchText)
            }).success(function(data){
                  
            })   
        }

        //搜索关键词储存到Cookie
        function setSearchCookie(value){        
            if(value!=''){
        		var name = 'searchName';
	            var searchArr = getSearchCookie(name);
	            if (searchArr) {
	                for (var i = 0; i < searchArr.length; i++) {
	                    if (searchArr[i] == value) {
	                        searchArr.splice(i,1);
	                    }
	                }
	                if (searchArr.length >= 10) searchArr.pop();
	            }
	
	            searchArr.unshift(value);
	            var time = new Date();
	            time.setDate(time.getDate() + 365);
	            document.cookie = name+ "=" +escape(JSON.stringify(searchArr))+';expires='+time.toGMTString();
        	}
        }
		
        //Cookie中获取搜索关键词
        function getSearchCookie(name){
            var start = document.cookie.indexOf(name + "=");
            if(start!=-1){ 
                start  = start + name.length+1;
                var end = document.cookie.indexOf(";",start);
                if (end==-1) end = document.cookie.length;
                arr = JSON.parse(unescape(document.cookie.substring(start,end)));
                
                return arr;
            }else{
                return [];
            }
        }
    }
});
