/**
 * Created by Administrator on 2016/8/20.
 */
define(['angular','css!./search.css'], function(angular) {
    angular.module('app')
        .controller('partController', partController)
        .controller('searchController', searchController);

    /*--------------------商品分类----------------------*/
    partController.$inject = ['$scope', '$state', '$verifyService','$timeout','$cardService','$stateParams'];
    function partController($scope, $state,$verifyService,$timeout,$cardService,$stateParams) {
        var vm=this;
        $verifyService.SetIOSTitle("商品分类");
      	$scope.name = $stateParams.name || '手机';
        $scope.id = $stateParams.id || '9987';
        $scope.tab = [{name:'手机',id:'9987'},{name:'数码',id:'652'},{name:'家用电器',id:'737'},{name:'电脑办公',id:'670'}];
        $scope.hot = {
        	categoryName:'热门品牌',
        	categoryList : [{categoryName:'iPhone',img:httpsHeader+'/mallh5/search/images/apple.jpg',code:'Apple'},{categoryName:'小米',img:httpsHeader+'/mallh5/search/images/xiaomi.png',code:'小米（MI）'},{categoryName:'荣耀',img:httpsHeader+'/mallh5/search/images/rong.jpg',code:'华为（HUAWEI）'},{categoryName:'华为',img:httpsHeader+'/mallh5/search/images/huawec.jpg',code:'华为（HUAWEI）'},{categoryName:'乐视',img:httpsHeader+'/mallh5/search/images/leshi.png',code:'乐视（Letv）'},{categoryName:'魅族',img:httpsHeader+'/mallh5/search/images/meizu.jpg',code:'魅族（MEIZU）'},{categoryName:'三星',img:httpsHeader+'/mallh5/search/images/san.png',code:'三星（SAMSUNG）'},{categoryName:'OPPO',img:httpsHeader+'/mallh5/search/images/oppo.png',code:'OPPO'},{categoryName:'努比亚',img:httpsHeader+'/mallh5/search/images/nu.jpg',code:'努比亚（nubia）'}]
        }
        
        //手机图片数据
        $scope.mobile = {
        	Operator : [{img:httpsHeader+'/mallh5/search/images/img-02.png'}],
        	communication : [{img:httpsHeader+'/mallh5/search/images/sj.jpg'},{img:httpsHeader+'/mallh5/search/images/tx-1.jpg'}],
        	parts : [{img:httpsHeader+'/mallh5/search/images/pj-2.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-3.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-1.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-5.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-6.jpg'},{img:httpsHeader+'/mallh5/search/images/wx.jpg'},]
        }
		//数码图片数据
        $scope.Digital = {
        	Photography : [{img:httpsHeader+'/mallh5/search/images/sy-1.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-2.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-3.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-4.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-6.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-7.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-8.jpg'},{img:httpsHeader+'/mallh5/search/images/sy-9.jpg'},{img:httpsHeader+'/mallh5/search/images/xk.jpg'}],
        	entertainment : [{img:httpsHeader+'/mallh5/search/images/pj-1.jpg'},{img:httpsHeader+'/mallh5/search/images/yl-1.jpg'},{img:httpsHeader+'/mallh5/search/images/yl-2.jpg'},{img:httpsHeader+'/mallh5/search/images/yl-3.jpg'},{img:httpsHeader+'/mallh5/search/images/zn.jpg'},{img:httpsHeader+'/mallh5/search/images/yl-5.jpg'},{img:httpsHeader+'/mallh5/search/images/yl-6.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-1.jpg'},{img:httpsHeader+'/mallh5/search/images/gq.jpg'}],
        	accessories : [{img:httpsHeader+'/mallh5/search/images/sm-1.jpg'},{img:httpsHeader+'/mallh5/search/images/sm-2.jpg'},{img:httpsHeader+'/mallh5/search/images/sm-5.jpg'},{img:httpsHeader+'/mallh5/search/images/sm-6.jpg'},{img:httpsHeader+'/mallh5/search/images/sm-10.jpg'},{img:httpsHeader+'/mallh5/search/images/pj-2.jpg'}],
        	Intelligence : [{img:httpsHeader+'/mallh5/search/images/zn-1.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-2.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-6.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-7.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-3.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-8.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-4.jpg'},{img:httpsHeader+'/mallh5/search/images/zn-5.jpg'}],
        	education : [{img:httpsHeader+'/mallh5/search/images/dz-1.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-2.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-3.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-4.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-5.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-6.jpg'},{img:httpsHeader+'/mallh5/search/images/dz-7.jpg'}]
        }
        //家用电器图片数据
        $scope.household = {
        	life : [{img:httpsHeader+'/mallh5/search/images/sh-1.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-2.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-3.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-4.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-5.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-6.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-10.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-11.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-12.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-16.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-17.jpg'},{img:httpsHeader+'/mallh5/search/images/sh-18.jpg'}],
        	Kitchen : [{img:httpsHeader+'/mallh5/search/images/cf-1.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-2.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-3.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-4.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-5.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-6.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-7.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-8.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-9.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-10.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-11.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-14.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-16.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-18.jpg'},{img:httpsHeader+'/mallh5/search/images/cf-19.jpg'}],
        	appliances : [{img:httpsHeader+'/mallh5/search/images/d-1.jpg'},{img:httpsHeader+'/mallh5/search/images/d-2.jpg'},{img:httpsHeader+'/mallh5/search/images/d-3.jpg'},{img:httpsHeader+'/mallh5/search/images/d-6.jpg'},{img:httpsHeader+'/mallh5/search/images/d-8.jpg'},{img:httpsHeader+'/mallh5/search/images/d-9.jpg'},{img:httpsHeader+'/mallh5/search/images/miniyx.jpg'},{img:httpsHeader+'/mallh5/search/images/d-12.jpg'},{img:httpsHeader+'/mallh5/search/images/d-13.jpg'}],
        	Healthy : [{img:httpsHeader+'/mallh5/search/images/jk-1.jpg'},{img:httpsHeader+'/mallh5/search/images/jk-2.jpg'},{img:httpsHeader+'/mallh5/search/images/jk-5.jpg'},{img:httpsHeader+'/mallh5/search/images/jk-7.jpg'},{img:httpsHeader+'/mallh5/search/images/gh-01.jpg'},{img:httpsHeader+'/mallh5/search/images/jk-6.jpg'},{img:httpsHeader+'/mallh5/search/images/jk-9.jpg'}]
        }
        //电脑办公图片数据
        $scope.Computer = {
        	machine : [{img:httpsHeader+'/mallh5/search/images/dp-1.jpg'},{img:httpsHeader+'/mallh5/search/images/CPU.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-3.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-4.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-5.jpg'},{img:httpsHeader+'/mallh5/search/images/sanre.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-7.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-9.jpg'},{img:httpsHeader+'/mallh5/search/images/dp-10.jpg'}],
        	Peripheral : [{img:httpsHeader+'/mallh5/search/images/ws-1.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-2.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-3.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-4.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-5.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-6.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-7.jpg'},{img:httpsHeader+'/mallh5/search/images/dw.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-9.jpg'},{img:httpsHeader+'/mallh5/search/images/sbd.jpg'},{img:httpsHeader+'/mallh5/search/images/ws-13.jpg'}],
        	network : [{img:httpsHeader+'/mallh5/search/images/wl-1.jpg'},{img:httpsHeader+'/mallh5/search/images/wl-2.jpg'},{img:httpsHeader+'/mallh5/search/images/wl-3.jpg'},{img:httpsHeader+'/mallh5/search/images/wl-4.jpg'},{img:httpsHeader+'/mallh5/search/images/wl-5.jpg'},{img:httpsHeader+'/mallh5/search/images/wl-6.jpg'}],
        	work : [{img:httpsHeader+'/mallh5/search/images/bg-1.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-2.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-3.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-4.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-5.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-6.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-7.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-8.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-9.jpg'},{img:httpsHeader+'/mallh5/search/images/bg-10.jpg'}],
        	complete : [{img:httpsHeader+'/mallh5/search/images/zj-1.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-2.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-3.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-4.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-5.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-6.jpg'},{img:httpsHeader+'/mallh5/search/images/zj-7.jpg'}]
        }
        
        init();
        function init(){
        	classification();
        	$scope.$on('$includeContentLoaded', function(event) {
	          $('.footer-bar .tabs-fen').addClass('current')
	          .siblings().removeClass('current');
	        });
        }
      
        //跳转
        $scope.goseach = function(parentId,categoryId,code){
        	if(categoryId){
        		$state.go('search',{
        			goodsCategories:$scope.id+';'+parentId+';'+categoryId
        		})
        	}else{
        		$state.go('search',{
        			brandName:code,
        			goodsCategories:'9987;653;655'
        		})
        	}
        }
        
        
        
        //tab
        $scope.tabs = function(name,id){
        	$scope.name = name;
        	$scope.id = id;
        	$state.go('part',{
        		id : $scope.id,
        		name : $scope.name
        	})
        }
        
        //搜索
        $scope.search = function(){
        	$state.go('home',{
        		Mark : 'part'
        	})
        }
        
        //分类数据
        function classification(){
        	var wait = new waiting();
        	$cardService.getGoodsCategoryList({
        		channelId : sessionStorage.channelId,
        		categoryId : $scope.id 
        	}).success(function(data){
        		if(data.resultCode == '0000'){
        			wait.hide()
        			$scope.categoryList = data.result.categoryList;
        			if($scope.id == '9987'){
        				$scope.categoryList.unshift($scope.hot)
        			}
        			angular.forEach($scope.categoryList, function(data1){
        				for(var i=0;i<data1.categoryList.length;i++){
        					if(data1.categoryName == "运营商"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.mobile.Operator[i])
        					}else if(data1.categoryName == "手机通讯"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.mobile.communication[i]);
        					}else if(data1.categoryName == "手机配件"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.mobile.parts[i])
        					}else if(data1.categoryName == "摄影摄像"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Digital.Photography[i])
        					}else if(data1.categoryName == "影音娱乐"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Digital.entertainment[i])
        					}else if(data1.categoryName == "数码配件"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Digital.accessories[i])
        					}else if(data1.categoryName == "智能设备"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Digital.Intelligence[i])
        					}else if(data1.categoryName == "电子教育"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Digital.education[i])
        					}else if(data1.categoryName == "生活电器"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.household.life[i])
        					}else if(data1.categoryName == "厨房电器"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.household.Kitchen[i])
        					}else if(data1.categoryName == "大 家 电"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.household.appliances[i])
        					}else if(data1.categoryName == "个护健康"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.household.Healthy[i])
        					}else if(data1.categoryName == "电脑配件"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Computer.machine[i])
        					}else if(data1.categoryName == "外设产品"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Computer.Peripheral[i])
        					}else if(data1.categoryName == "网络产品"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Computer.network[i])
        					}else if(data1.categoryName == "办公设备"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Computer.work[i])
        					}else if(data1.categoryName == "电脑整机"){
        						data1.categoryList[i] = $.extend(data1.categoryList[i],$scope.Computer.complete[i])
        					}
        				}
        				$timeout(function () {
				            scroll('.main-content');
				        },300)
        			})
        		}
        	})
        }
    }


    /*--------------------搜索----------------------*/
    searchController.$inject = ['$scope', '$state', '$verifyService','$timeout','$stateParams','$productService','$userService'];
    function searchController($scope, $state,$verifyService,$timeout,$stateParams,$productService,$userService) {
        $verifyService.SetIOSTitle("搜索");
        var mainScroll = scroll('.main-content');
        var jdImgServer = $productService.imgUrl[4];//jd图片服务器地址
        $scope.Name	= $stateParams.brandName||'';
        $scope.data = {
            freePeriodsList : [{name:'3期',code:3},{name:'6期',code:6},{name:'9期',code:9},{name:'12期',code:12}],      //分期列表
            brandList : [],                                                                                             //品牌列表
            serviceList : [{name:'京东配送',code:2},{name:'自营配送',code:1}],                                          //服务列表
            goodsList : [],                                                                                             //商品列表

            tabsIndex : 0,                          //tab选项卡选中索引
            brandIndex : '',                        //品牌选中索引
            serviceSelect : '',                     //服务选中索引
            
            searchText : $stateParams.keywords || '',     //搜索框输入值
            priceDesc : '',                         //价格排序 0倒序 1升序
            freePeriods : '',                       //免息期数
            freePoundage : 0,                       //1免手续费
            cashBack : 0,                           //1返现
            minPrice : '',                          //最低价
            maxPrice : '',                          //最高价
            brand : '',                             //品牌
            service : '',                           //服务

            loadIcon : true                        //加载loading  true显示 false隐藏
            
        }
        
        var pageNo = 0,             //商品页码
            pageSize = 10,          //每页商品数
            loadGoods = true,       //下拉到底部是否请求商品（判断商品是否全部加载完成）            
            loadEnd = false;        //当前页码请求状态   false请求中  true请求完成


        init();//初始加载
        function init(){
            interest();//免息层
            screen();//筛选层
            searchClick();
            //滚动条到底时加载商品
            mainScroll.on('scrollEnd', function(){
                if( this.y - this.maxScrollY < 1 && loadGoods && loadEnd){
                    pageNo++;
                    getGoodsList();
                }       
            });
        }

        //tabs切换
        $scope.tabs = function(index){
			if ($scope.data.tabsIndex == index && index ==0) return;

            	$scope.data.tabsIndex = index; 
            if (index == 0) {
               $scope.data.priceDesc = ''; 
            }else if(index != 2){
            	$(".today-select").slideUp();
            	$("#one").fadeOut();
            }else if(index == 1) {
                if ($scope.data.priceDesc == '') {
                    $scope.data.priceDesc = 'salePrice:asc';
                }else{
                    $scope.data.priceDesc = $scope.data.priceDesc == 'salePrice:asc' ? 'salePrice:desc' : 'salePrice:asc';
                }   
            }else{
                return false;
            }
            if(index != 1){
           	  anewGetGoods();  
        	}
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
            $scope.screenShow = function(){
                screenShow();
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
                returnCoupon : $scope.data.cashBack,                    //是否返现
                priceRangeLeftValue : $scope.data.minPrice,             //最低价
                priceRangeRightValue : $scope.data.maxPrice,            //最高价
                brandName : encodeURI($scope.data.brand) || encodeURI($scope.Name),               //品牌
                typeFrom : $scope.data.service,                          //服务
                goodsCategories : $stateParams.goodsCategories
            }).success(function(data){
                if (data.resultCode == '0000'){

                    var goodsList = data.result.goodsList;  //商品
                    var goodsTotalNum = data.result.total;  //商品数量

                    //判断当前是否为最后一页
                    if (goodsTotalNum-pageNo*pageSize<=10){
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
                            toolTip("搜索的商品不存在");   
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
                searchKeyValue : encodeURI($scope.data.searchText)
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
            pageNo = 0; 
            loadGoods = true,
            $scope.data.goodsList = [];
            $timeout(function(){ mainScroll.refresh() },50)
            getGoodsList();
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
