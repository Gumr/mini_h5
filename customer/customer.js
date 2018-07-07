/**
 * home.js
 * @authors Casper 
 * @date    2016/9/01
 * @version 1.0.0
 */

define(['angular','css!./customer.css','common/script/lib/swiper.min.js'], function(angular) {
	angular.module("app")
	.controller("scheduleController",scheduleController)
	.controller("returnController",returnController)
	.controller("logisticsController",logisticsController)
	.controller("SuccessController",SuccessController)	
	.controller("ApplyController",ApplyController)	
	.controller("detailsController",detailsController)	
	
	//服务单详情
	detailsController.$inject = ['$scope', '$state','$verifyService','$timeout','$customerService','$stateParams'];
	function detailsController($scope, $state,$verifyService,$timeout,$customerService,$stateParams){
		var vm = this;
		$verifyService.SetIOSTitle("服务单详情");
		$timeout(function () {
            scroll('.main-content')
        },300);
        var wait = new waiting();
        $customerService.getServiceDetailInfo({
        	typeFrom : $stateParams.typeFrom,
        	afsServiceId : $stateParams.afsServiceId
        }).success(function(data){
        	if(data.resultCode == "0000"){
        		wait.hide();
        		vm.afsServiceId = data.result.serviceDetailInfo.afsServiceId;
        		vm.afsApplyTime = data.result.serviceDetailInfo.afsApplyTime;
        		vm.afsServiceStepName = data.result.serviceDetailInfo.afsServiceStepName;
        		vm.approveNotes = data.result.serviceDetailInfo.approveNotes;
        		vm.questionDesc = data.result.serviceDetailInfo.questionDesc;
        	}
        })
	}
	
	/*进度查询*/
	scheduleController.$inject = ['$scope', '$state','$verifyService','$timeout','$customerService','$stateParams'];
	function scheduleController($scope, $state,$verifyService,$timeout,$customerService,$stateParams){
		var vm = this;
		$verifyService.SetIOSTitle("进度查询");
		vm.oid = $stateParams.afterSaleApplyId;
		$scope.jump = function(afsServiceId,typeFrom){
			$state.go('details',{
				afsServiceId : afsServiceId,
				typeFrom : typeFrom
			})
		}
		//进度查询
		var wait = new waiting();
		$customerService.getAllAfterSaleApply({
			id : $stateParams.id
		}).success(function(data){
			wait.hide();
			if(data.resultCode = '0000'){
				if(data.result.afterSaleApplyList.length == 0){
					toolTip("暂无进度")
				}else{
					$scope.serviceInfoList = data.result.afterSaleApplyList;
				}
			}else{
				toolTip(data.resultMessage)
			}
			$timeout(function(){
	            scroll('.main-content');
	        },300)
		}) 
		//取消按钮
		$scope.cancel = function(afsServiceId,id,typeFrom){
			var wait = new waiting();
			$customerService.cancelJDService({
				id : id,
				serviceId : afsServiceId,
				approveNotes : "客户取消",
				typeFrom : typeFrom
			}).success(function(data){
				wait.hide();
				if(data.resultCode == "0000"){
					if(data.result.success == true){
						toolTip(data.result.message)
						location.reload()
					}else if(data.result.success == false){
						toolTip(data.result.message)
					}
				}else{
					toolTip(data.resultMessage)
				}
			})
		}
		//提交物流信息按钮
		$scope.goschedule = function(afterSaleApplyId,id){
			$state.go('logistics',{
				flag : $stateParams.flag,
				afterSaleApplyId : afterSaleApplyId
			})
		}
		//确认收货按钮
		$scope.confirm = function(id){
			var wait = new waiting();
			$customerService.confirmReceipt({
				id : id
			}).success(function(data){
				wait.hide();
				if(data.resultCode = '0000'){
					toolTip('确认收货成功!')
					location.reload()
				}
			})
		}
	}
	
	/*提交成功*/
	SuccessController.$inject = ['$scope', '$state','$verifyService','$customerService','$stateParams']
	function SuccessController($scope, $state,$verifyService,$customerService,$stateParams){
		var vm = this;
		var d = new Date();
		vm.Date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
		$verifyService.SetIOSTitle("提交成功");
		if($stateParams.say == '30'){
			vm.stages = "维修"
		}else if($stateParams.say == '20'){
			vm.stages = "换货"
		}else if($stateParams.say == '10'){
			vm.stages = "退货"
		}
		$scope.getschedule = function(){
			$state.go('schedule',{
				orderId : $stateParams.orderId,
				flag:'Success',
				id : $stateParams.id
			},{
                location:'replace'
            })
		}
	}
	/*申请售后*/
	ApplyController.$inject = ['$scope', '$state','$verifyService','$timeout','$log','$customerService','$stateParams','$window','$productService','$address'];
	function ApplyController($scope, $state,$verifyService,$timeout,$log,$customerService,$stateParams,$window,$productService,$address){
		$verifyService.SetIOSTitle("申请售后服务");
		var vm = this;
    	vm.goodsnum = 1;
    	vm.goodtext = "" ;
    	vm.goodsPrice = 1999.00;
		vm.goodsNumMinus = goodsNumMinus;	
		vm.goodsNumAdd = goodsNumAdd;
		vm.goodid = $stateParams.goodsId
		vm.channelId = sessionStorage.channelId
		vm.setImagePreviews = setImagePreviews;
		vm.param = {orderId:"",filePaths:{},serviceType:"",applyNum:"",examreport:"",applyCertificate:""}
		vm.imges = imges;
		vm.provinceScroll = null;
        vm.showSelect=showSelect;
        vm.hideSelect=hideSelect;	
        vm.selectTabClick=selectTabClick;
        vm.addressActive={rightCity:$('.city-box'), rightCounty:$('.county-box'), rightStreet:$('.street-box')};
        vm.selectAddress='请选择所在地区';
        vm.selectAdd = '请选择所在地区';
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
        vm.stages = "";
        vm.method = method;
        vm.sreturn = "";
        vm.take = "";
        vm.falseh = {}
        vm.falsehs = {};
        vm.falsehsh = {};
        vm.falsehshy = {}
        vm.saddress = "";
        vm.name = "";
        vm.model = "";
        vm.adressone = '';
        vm.adresstwo = '';
        vm.showselect = showselect;
        var myIscroll = scroll('.rightProvince');
        var myIscroll1 = scroll('.city-box');
        var myIscroll2 = scroll('.county-box');
        var myIscroll3 = scroll('.street-box');
        var yearArr = [];
        var year = new Date().getFullYear();
		for (var i = year; i >= year-120; i--) { yearArr.push(i); }
        vm.hadestate= "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
		$scope.checked='';
		$scope.data=JSON.parse(localStorage.getItem('$$payload'));			//用户信息
		$scope.code=''					//服务类似				
		$scope.info={
			consigneeAddress:'',								//收货地址
			address:'',
			result:'',
			apply:{},											//页面缓存数据
		}
		
		
		
		
		
		//页面初始化判断数据
		if($('.f1 active')){
			vm.param.applyCertificate = "1"
		}
		if($('.f3 active')){
			vm.param.examreport = "1"
		}
		
		//发票切换
    	vm.handcode = function(myevent){
	      $(myevent.currentTarget).addClass('active')
	      .siblings().removeClass('active');
	      if($(myevent.currentTarget).attr("class") == 'f1 active'){
	      	vm.param.applyCertificate = "1"
	      }else{
	      	vm.param.applyCertificate = "2"
	      }
	      console.log($scope.info.apply.tumb);
	      console.log($scope.tumb)
	    }
    	//服务类型切换
    	vm.handoved = function(myevent,val){
    		$scope.code = val
    	}
    	//检测切换
    	vm.handove = function(myevent){
	      $(myevent.currentTarget).addClass('active')
	      .siblings().removeClass('active');
	      if($(myevent.currentTarget).attr("class") == 'f3 active'){
	      	vm.param.examreport = "1"
	      }else{
	      	vm.param.examreport = "2"
	      }
	    }
		
		
        
        //收件地址
        $scope.see = function(){
        	if($scope.checked==true){
        		$timeout(function () {
		            scroll('.main-content');
		        },300)
        	}
        }
        
        //获取退回方式
        method();
        function method(){
        	imges();
	        //init();
	        address();
        	$timeout(function () {
	            scroll('.main-content');
	        },300)
        }
        
        //获取商品信息
        function imges(){    		
    		$customerService.orderDetail({
    			orderId : $stateParams.orderId
    		}).success(function(data){
    			$scope.info.result=data.result;
    			vm.typeFrom = data.result.typeFrom;
    			$scope.id=data.result.id;
    			if(data.result.typeFrom == 2){
    				vm.goodsName = data.result.goodsName;
	    			vm.goodsNub = data.result.goodsNub;
	    			vm.imageUrl = $productService.imgUrl[4]+data.result.thumbImgUrl;
	    			vm.Price = data.result.salePrice;
	    			vm.num = data.result.goodsNum;
    			}else{
    				vm.goodsName = data.result.goodsName;
	    			vm.goodsNub = data.result.goodsNub;
	    			vm.imageUrl = imgUrl+data.result.thumbImgUrl;
	    			vm.Price = data.result.salePrice;
	    			vm.num = data.result.goodsNum;
    			}
    			//获取服务类型
	    		var wait = new waiting();
	    		$customerService.getJDServerType({
	    			orderId : $stateParams.orderId
	    		}).success(function(data){
	    			wait.hide();
	    			if(data.resultCode == '0000'){
						vm.fuwu = data.result.jdServerTypes
	    			}
	    		})
	    		$customerService.getJDReturnType({
	        		orderId : $stateParams.orderId,
	        	}).success(function(data){
	        		if(vm.typeFrom == 1){
	        			vm.mode = $scope.jdReturnTypes = [
	        				{code: "40", name: "客户发货"}
	        			]
	        		}else{
	        			vm.mode = data.result.jdReturnTypes
	        		}
	        		vm.stages= $scope.info.apply.stages || vm.mode[0].code;
	        		if(vm.stages == "7"||vm.stages == "40"){
						vm.hadestate = "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
						$(".pickup").fadeOut();
						$scope.checked =  $scope.info.apply.checked|| true;
					}else{
						$scope.checked= $scope.info.apply.checked||false;
						vm.hadestate = "请将商品送至京东任意一自提点";
					}
	        	})
    			$scope.info.consigneeAddress=data.result.consigneeAddress;
    			vm.selectAddress = $scope.info.apply.selectAddress||data.result.consigneeAddress;
    			$scope.info.address=data.result.address;
    		}) 	
    	}
		/*//获取服务单申请
    	function init(){
    		$customerService.getAfterSaleApplyInfo({
    			orderId : $stateParams.orderId
    		}).success(function(data){
    			if(data.resultCode=="0000"){
    				if(isEmptyObject(data.result)){
    					
    				}else{
    					vm.id = data.result.result.afterSaleApply.id
    					$scope.code = data.result.result.afterSaleApply.serviceType;
	    				vm.goodsnum = data.result.result.afterSaleApply.applyNum;
	    				vm.goodtext = data.result.result.afterSaleApply.remark;
	    				vm.applyCertificate = data.result.result.afterSaleApply.applyCertificate;
	    				vm.examReport = data.result.result.afterSaleApply.examReport;
	    				$scope.thumb = data.result.result.files;
	    				//判断数据
						if(vm.applyCertificate == 1){
							$('.f1').addClass('active')
							$('.f2').removeClass('active')
							vm.param.applyCertificate = "1"
						}else if(vm.applyCertificate == 2){
							$('.f2').addClass('active')
							$('.f1').removeClass('active')
							vm.param.applyCertificate = "2"
						}
						if(vm.examReport == "1"){
							$('.f3').addClass('active')
							$('.f4').removeClass('active')
							vm.param.examreport = "1"
						}else if(vm.examReport == "2"){
							$('.f4').addClass('active')
							$('.f3').removeClass('active')
							vm.param.examreport = "2"
						}
			    		for(var i=0;i<$scope.thumb.length;i++){
							vm.img = 'https://g1.hlej.com/'+$scope.thumb[i].imgUrl;
							var image = new Image();
							image.src = vm.img;
							$scope.tumb.push(vm.img)
							image.onload = function(){
							    var base64 = getBase64Image(image);
							    $scope.tup.push(base64)
							    console.log($scope.tup)
							}
						}
    				}
    			}
    		})
    	}*/
        
        function address(){
        	//根据ID获取收货地址
			$address.getObtain({
				consigneeId : $stateParams.addressId || ''
			}).success(function(data){
				if(!isEmptyObject(data.result)){
					$scope.provinceId = data.result.provinceId;
		        	$scope.cityId = data.result.cityId;
		        	$scope.countyId = data.result.countyId;
		        	$scope.townId = data.result.townId;
		        	$scope.townName = data.result.townName || '';
		        	$scope.list = data.result.consigneeName+' '+data.result.consigneeMobile+' '+data.result.provinceName+data.result.cityName+data.result.countyName+$scope.townName+' '+data.result.consigneeAddress;
					
				}
			})
        }
        
        
        $scope.goadd=function(){
        	add();
        	sessionStorage.setItem('hshurl',location.href);
        	$state.go('addAddress',{
        		
        	})
        }
        
        //tabs切换
    	vm.handover = function(myevent,val){
    		vm.stages = val ;
    		if(vm.stages == "7" || vm.stages == "40"){
    			vm.good = true;
    			vm.hadestate= "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
    			$(".pickup").fadeOut();
    			$scope.checked=true;
    		}else{
    			vm.hadestate= "请将商品送至京东任意一自提点";
    			vm.good = false;
    			$scope.checked=false;
    			$(".pickup").fadeIn();
    		}
	    }

        //取件时间
        $scope.fetchClick = function(myevent){
        	var myPicker = new picker(myevent.currentTarget,{
        		title : "请选择取件时间",
			    separator : '-',
        	cols:[
			    {values : yearArr},
			    {values : ['01','02','03','04','05','06','07','08','09','10','11','12']},
			    {values : ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']}
		    ]
        	})
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
            vm.trueProvince.id = id;
            vm.address1=name;
            vm.falseh.name = name;
            if($scope.random == "所在地区"){
            	vm.trueProvince.name = name || vm.address1;
            	vm.provinceId = id ;
            }else{
            	vm.take = name;
            	vm.takeid = id
            }
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
            vm.trueCity.id = id;
            vm.address2=name;
            vm.trueCity.name = name || vm.address2;
            vm.falsehs.name = name || vm.address2;
            vm.address2=name;
            vm.address3='请选择';
            vm.address4='';
            if($scope.random == "所在地区"){
            	vm.trueCity.name = name;
            	vm.cityId=id
            }else{
            	vm.city = name;
            	vm.cityid = id
            }
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
                    if($scope.random == "所在地区"){
                    	vm.selectAddress = vm.trueProvince.name + name;
                    }else{
                    	vm.selectAdd = vm.take + name
                    }
                    vm.address2=name;
                }
            })
        };
        //选择县
        $scope.countyClick=function (id,name){
            vm.trueCounty.id = id;
            vm.address3=name;
            vm.trueCounty.name = name;
            if($scope.random == "所在地区"){
            	vm.trueCounty.name = name || vm.address3 ;
            	vm.countyId=id;
            }else{
            	vm.county = name ||  vm.address3;
            	vm.countyid = id;
            }
            vm.falsehsh.name = name;
            
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
                    if($scope.random == "所在地区"){
                    	vm.selectAddress = (vm.trueProvince.name ||vm.address1)  + (vm.trueCity.name||vm.address2) + name;
                    }else{
                    	vm.selectAdd = (vm.take||vm.address1) + (vm.city||vm.address2) + name
                    }
                    vm.address4='';
                }
            })
        }
        //选择镇
        $scope.townClick=function (id,name) {
        	vm.address4=name;
            if($scope.random == "所在地区"){
            	vm.trueTown.name = name || vm.address4;
            	vm.townId = id;
            }else{
            	vm.town = name || vm.address4;
            	
            	vm.townid = id;
            }
            vm.falsehshy.name = name;
            console.log(vm.townId = id);
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
            hidePage();
            if($scope.random == "所在地区"){
            	 vm.selectAddress = (vm.trueProvince.name || vm.address1) + ' ' + (vm.trueCity.name || vm.address2)+ ' ' + (vm.trueCounty.name || vm.address3) + ' ' + vm.trueTown.name;
            }else{
            	
            	vm.selectAdd = (vm.take || vm.address1) + "  " + (vm.city || vm.address2) + "  " + (vm.county || vm.address3) + "  " + vm.town;
            }
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
        function showSelect(){
            vm.select3d=true;
            vm.address1 ="请选择"
        	vm.address2 = '';
        	vm.address3 = '';
        	vm.address4 = '';
        	$('.select-tab span').removeClass('active').eq(0).addClass('active');
            $('.modal-layer,.shade').addClass('active');
            $scope.random = "所在地区";
        }
        function showselect(){
        	vm.select3d=true;
        	vm.address1 ="请选择"
        	vm.address2 = '';
        	vm.address3 = '';
        	vm.address4 = '';
        	$('.select-tab span').removeClass('active').eq(0).addClass('active');
            $('.modal-layer,.shade').addClass('active');
            $scope.random = "收货所在地区"
        }

        function hideSelect() {
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
        }
		
		
		
		
    	//提交按钮
    	$scope.submit=function(){
    		if(vm.param.examreport != "1" && vm.param.examreport != "2"){
    			toolTip('请填写检测报告')	
    		}else if(vm.param.applyCertificate != "1" && vm.param.applyCertificate != "2"){
    			toolTip('请填写申请凭证')	
    		}else if(!vm.goodtext){
    			toolTip('请填写描述问题')
    		}else if(vm.param.examreport == "1" && $scope.tumb.length == 0){
    			toolTip('请上传图片')
    		}else if(!$scope.code){
    			toolTip('请选择服务类型')
    		}else if(vm.goodtext.length < 6){
    			toolTip('提示  ： 最少需要输入6个汉字！')
    		}else if(!vm.stages){
    			toolTip('请选择商品退回方式')
    		}else if(!$scope.data.realName){
    			toolTip('请填写联系人姓名')
    		}else if(!$scope.data.mobile){
    			toolTip('请填写联系人电话')
    		}else{
    			if(vm.stages=='4'){
    				if(!vm.selectAddress){
    					toolTip('请选择取件地区')
    				}else{
    					btn()
    				}
    			}else{
    				btn()
    			}
    		}	
    			
		}
    	
    	//提交接口
    	function btn(){
    		var wait = new waiting();
			$customerService.saveAfterSaleApply({
				orderId : $stateParams.orderId,
				examReport : vm.param.examreport,
				filePaths : $scope.tup,
				serviceType : $scope.code,
				applyNum : vm.goodsnum,
				applyCertificate : vm.param.applyCertificate,
				remark : vm.goodtext,
				returnWay : vm.stages,
    			returnwareType : "10",
    			returnwareProvince : $scope.info.result.provinceId,
    			returnwareCity: $scope.info.result.cityId,
    			returnwareCounty:$scope.info.result.countyId,
    			returnwareVillage: $scope.info.result.townId || 0,
    			returnwareAddress: $scope.info.address,
    			returnwareContacts: $scope.data.realName,
    			returnwarePhone: $scope.data.mobile, 
    			pickwareType:vm.stages,
    			pickwareProvince: vm.provinceId || $scope.info.result.provinceId,
    			pickwareCity: vm.cityId || $scope.info.result.cityId,
    			pickwareCounty: vm.countyId || $scope.info.result.countyId,
    			pickwareVillage:  vm.townId || $scope.info.result.townId || 0,
    			pickwareAddress: $scope.info.address,
			}).success(function(data){
				vm.afterSaleApplyId = data.result.afterSaleApplyId;
				vm.id = data.result.id
				if(data.resultCode == "0000"){
					wait.hide();
					$state.go('Success',{
						orderId :　$stateParams.orderId,
						say : $scope.code,
						id : vm.id
					},{
		                location:'replace'
		            })
				}else{
					toolTip(data.resultMessage)
				}
			})	
    	}
    	
    	
    	setImagePreviews()
    	//图片上传
		function setImagePreviews(){
			var num = 0;
        	$scope.reader = new FileReader();   //创建一个FileReader接
        	$scope.tumb = $scope.info.apply.tumb||[]
		    $scope.tup = $scope.info.apply.tumb||[]
		    $scope.img_upload = function(files) {       //单次提交图片的函数
	        	$scope.reader.readAsDataURL(files[0]);  //FileReader的方法，把图片转成base64
		        $scope.reader.onload = function(ev) {
		            $scope.$apply(function(){
		            	if($scope.tup.length < 3){
		            		$scope.tup.push(ev.target.result);
		            		$scope.tumb.push(ev.target.result)
		            	}
	            		num = num+1;
		                console.log($scope.thumb)
		                console.log($scope.tup)
		            });
		        };
		    };
		    $scope.img_del = function(index){    //删除，删除的时候thumb和form里面的图片数据都要删除，避免提交不必要的
		        $scope.tumb.splice(index,1)
		        $scope.thumb.splice(index,1)
		        $scope.tup.splice(index,1)
		        console.log($scope.tup)
		        console.log($scope.tumb)
		        console.log($scope.thumb)
		    };
		}
		
    	function getBase64Image(img) {
	        var canvas = document.createElement("canvas");
	        canvas.width = img.width;
	        canvas.height = img.height;
	        var ctx = canvas.getContext("2d");
	        ctx.drawImage(img, 0, 0, img.width, img.height);
	        var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
	        var dataURL = canvas.toDataURL("image/"+ext);
	        return dataURL;
		}
    	
    	
    	
    	
    	
	 	//商品数量加减
	    function goodsNumMinus(){
	      if ( vm.goodsnum > 1 ) {
	        vm.goodsnum = vm.goodsnum - 1;
	      }
	    }
	    function goodsNumAdd(){
	      if(vm.goodsnum < vm.num){
	      	 vm.goodsnum = vm.goodsnum + 1;
	      }
	    }
	  	
	  	if(sessionStorage.getItem('apply')){
			$scope.info.apply=JSON.parse(sessionStorage.getItem('apply'));
			vm.goodsnum=$scope.info.apply.goodsnum || 1;
			$scope.code=$scope.info.apply.code;
			vm.param.examreport=$scope.info.apply.examreport || '1';
			vm.param.applyCertificate=$scope.info.apply.applyCertificate || '1';
			vm.goodtext=$scope.info.apply.goodtext;
		}
		

	  	
	  	//页面缓存
	  	function add(){
	  		var add={//页面缓存
        		selectAddress:vm.selectAddress,
        		checked:$scope.checked,
        		stages:vm.stages,
        		code:$scope.code,
        		goodsnum:vm.goodsnum,
        		examreport:vm.param.examreport,
        		applyCertificate:vm.param.applyCertificate,
        		goodtext:vm.goodtext,
        		tumb:$scope.tumb
        	}
        	sessionStorage.setItem('apply',JSON.stringify(add));
	  	}
	  	
	}
	
	/*提交物流信息*/
	logisticsController.$inject = ['$scope','$state','$stateParams','$address','$verifyService','$homeService','$timeout','$http','$customerService'];
	function logisticsController($scope,$state,$stateParams,$address,$verifyService,$homeService,$timeout,$http,$customerService){
	 	var vm = this;
        vm.provinceScroll = null;
        vm.company = "";
        vm.text = "";
        $verifyService.SetIOSTitle("提交物流信息");
        //缓存页面元素
		var EL = {
			voucher : $('.form-voucher'),
		}

        //物流公司
      	$scope.logisticsClick = function(myevent){
        	var myPicker = new picker(myevent.currentTarget,{
			    title : "请输入物流公司",
			    cols : [
				    {values : ['顺丰物流','圆通快递','申通快递','中通快递','韵达快递','EMS','天天快递','全峰快递']},
			    ]
			})
        	
		}
      	
      	$scope.submitLogisticsInfo = function(){
      		if(!EL.voucher.val()){
      			toolTip('请选择物流公司')
      		}else if(!vm.text){
      			toolTip('请填写物流编号')
      		}else{
      			var wait = new waiting();
      			$customerService.submitLogisticsInfo({
	      			afterSaleApplyId : $stateParams.afterSaleApplyId,
	      			logisticsCompany : EL.voucher.val(),
	      			logisticsNumber : vm.text
	      		}).success(function(data){
	      			if(data.resultCode ='0000'){
	      				wait.hide();
	      				$state.go('schedule',{
	      					flag : $stateParams.flag,
	      					afterSaleApplyId : $stateParams.afterSaleApplyId
	      				})
	      			}
	      		})
      		}
      		
      	}
	}
	
	
	/*商品退回方式*/
	returnController.$inject = ['$scope','$state','$stateParams','$address','$verifyService','$timeout','$http','$common','$customerService'];
	function returnController($scope,$state,$stateParams,$address,$verifyService,$timeout,$http,$common,$customerService){
        var vm = this;
        vm.provinceScroll = null;
        vm.showSelect=showSelect;
        vm.hideSelect=hideSelect;	
        vm.selectTabClick=selectTabClick;
        vm.addressActive={rightCity:$('.city-box'), rightCounty:$('.county-box'), rightStreet:$('.street-box')};
        vm.selectAddress='请选择所在地区';
        vm.selectAdd = '请选择所在地区';
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
        vm.stages = "40";
        vm.method = method;
        vm.sreturn = "";
        vm.take = "";
        vm.falseh = {}
        vm.falsehs = {};
        vm.falsehsh = {};
        vm.falsehshy = {}
        vm.saddress = "";
        vm.name = "";
        vm.model = "";
        vm.adressone = '';
        vm.adresstwo = '';
        vm.showselect = showselect;
        var myIscroll = scroll('.rightProvince');
        var myIscroll1 = scroll('.city-box');
        var myIscroll2 = scroll('.county-box');
        var myIscroll3 = scroll('.street-box');
        var yearArr = [];
        var year = new Date().getFullYear();
		for (var i = year; i >= year-120; i--) { yearArr.push(i); }
        vm.hadestate= "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
        $verifyService.SetIOSTitle("商品退回方式");

        if(vm.stages == "7"||vm.stages == "40"){
			$(".pickup").css("display","none")
			vm.hadestate = "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
		}else{
			vm.hadestate = "请将商品送至京东任意一自提点";
			$(".pickup").css("display","block")
		}
        
        //获取退回方式
        method();
        function method(){
        	$customerService.getJDReturnType({
        		orderId : $stateParams.orderId,
        	}).success(function(data){
        		if($stateParams.typeFrom == 1){
        			vm.mode = $scope.jdReturnTypes = [
        				{code: "40", name: "客户发货"}
        			]
        		}else{
        			vm.mode = data.result.jdReturnTypes
        		}
        	})
        }
        
        //tabs切换
    	vm.handover = function(myevent,val){
    		vm.stages = val ;
    		if(vm.stages == "7" || vm.stages == "40"){
    			vm.good = true;
    			vm.hadestate= "商品返回地址将在服务审核通过后，以短信形式告知，或在查看返修/退换货记录中查询，不收取快递附加费用。";
    			$(".pickup").css("display","none")
    		}else{
    			vm.hadestate= "请将商品送至京东任意一自提点";
    			vm.good = false;
    			$(".pickup").css("display","block")
    		}
	    }

        //取件时间
        $scope.fetchClick = function(myevent){
        	var myPicker = new picker(myevent.currentTarget,{
        		title : "请选择取件时间",
			    separator : '-',
        	cols:[
			    {values : yearArr},
			    {values : ['01','02','03','04','05','06','07','08','09','10','11','12']},
			    {values : ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']}
		    ]
        	})
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
            vm.trueProvince.id = id;
            vm.address1=name;
            vm.falseh.name = name;
            if($scope.random == "所在地区"){
            	vm.trueProvince.name = name || vm.address1;
            	vm.provinceId = id ;
            }else{
            	vm.take = name;
            	vm.takeid = id
            }
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
            vm.trueCity.id = id;
            vm.address2=name;
            vm.trueCity.name = name || vm.address2;
            vm.falsehs.name = name || vm.address2;
            vm.address2=name;
            vm.address3='请选择';
            vm.address4='';
            if($scope.random == "所在地区"){
            	vm.trueCity.name = name;
            	vm.cityId=id
            }else{
            	vm.city = name;
            	vm.cityid = id
            }
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
                    if($scope.random == "所在地区"){
                    	vm.selectAddress = vm.trueProvince.name + name;
                    }else{
                    	vm.selectAdd = vm.take + name
                    }
                    vm.address2=name;
                }
            })
        };
        //选择县
        $scope.countyClick=function (id,name) {
            vm.trueCounty.id = id;
            vm.address3=name;
            vm.trueCounty.name = name;
            if($scope.random == "所在地区"){
            	vm.trueCounty.name = name || vm.address3 ;
            	vm.countyId=id;
            }else{
            	vm.county = name ||  vm.address3;
            	vm.countyid = id;
            }
            vm.falsehsh.name = name;
            
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
                    if($scope.random == "所在地区"){
                    	vm.selectAddress = (vm.trueProvince.name ||vm.address1)  + (vm.trueCity.name||vm.address2) + name;
                    }else{
                    	vm.selectAdd = (vm.take||vm.address1) + (vm.city||vm.address2) + name
                    }
                    vm.address4='';
                }
            })
        }
        //选择镇
        $scope.townClick=function (id,name) {
        	vm.address4=name;
            if($scope.random == "所在地区"){
            	vm.trueTown.name = name || vm.address4;
            	vm.townId = id;
            }else{
            	vm.town = name || vm.address4;
            	
            	vm.townid = id;
            }
            vm.falsehshy.name = name;
            console.log(vm.townId = id);
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
            hidePage();
            if($scope.random == "所在地区"){
            	 vm.selectAddress = (vm.trueProvince.name || vm.address1) + ' ' + (vm.trueCity.name || vm.address2)+ ' ' + (vm.trueCounty.name || vm.address3) + ' ' + vm.trueTown.name;
            }else{
            	
            	vm.selectAdd = (vm.take || vm.address1) + "  " + (vm.city || vm.address2) + "  " + (vm.county || vm.address3) + "  " + vm.town;
            }
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
        function showSelect(){
            vm.select3d=true;
            vm.address1 ="请选择"
        	vm.address2 = '';
        	vm.address3 = '';
        	vm.address4 = '';
        	$('.select-tab span').removeClass('active').eq(0).addClass('active');
            $('.modal-layer,.shade').addClass('active');
            $scope.random = "所在地区";
        }
        function showselect(){
        	vm.select3d=true;
        	vm.address1 ="请选择"
        	vm.address2 = '';
        	vm.address3 = '';
        	vm.address4 = '';
        	$('.select-tab span').removeClass('active').eq(0).addClass('active');
            $('.modal-layer,.shade').addClass('active');
            $scope.random = "收货所在地区"
        }

        function hideSelect() {
            vm.select3d=false;
            $('.modal-layer,.shade').removeClass('active');
        }
        
        //提交按钮
    	vm.addAddressOpen = function(){
    		if((vm.stages == '7'||vm.stages=='40')&&vm.selectAdd == '请选择所在地区'){
    			toolTip('请选择收货地区')
    		}else if(vm.stages == '4'&&vm.selectAddress == '请选择所在地区'){
    			toolTip('请选择取件地区')
    		}else if(!vm.addresstwo){
    			toolTip('请填写详细地址')
    		}else if(!vm.name){
    			toolTip('请填写姓名')
    		}else if(!vm.model){
    			toolTip('请输入手机号码')
    		}else if(!$verifyService.isPhoneNum(vm.model)){
    			toolTip('请输入正确的手机号码')
    		}else{
    			if(vm.stages == "4"){
    				var wait = new waiting();
    				$customerService.updateAfterSaleApply({
		    			id : $stateParams.id,
		    			orderId : $stateParams.orderId,
		    			returnWay : "4",
		    			returnwareType : "10",
		    			returnwareProvince : vm.takeid,
		    			returnwareCity: vm.cityid,
		    			returnwareCounty: vm.countyid,
		    			returnwareVillage: vm.townid || 0,
		    			returnwareAddress: vm.addresstwo,
		    			returnwareContacts: vm.name,
		    			returnwarePhone: vm.model, 
		    			pickwareType:"4",
		    			pickwareProvince: vm.provinceId,
		    			pickwareCity: vm.cityId,
		    			pickwareCounty: vm.countyId,
		    			pickwareVillage:  vm.townId || 0,
		    			pickwareAddress: vm.addressone,
					}).success(function(data){
						if(data.resultCode == "0000"){
							wait.hide();
							$state.go('Success',{
								orderId :　$stateParams.orderId,
								say : $stateParams.say,
								id : $stateParams.id
							},{
				                location:'replace'
				            })
						}
					})
    			}else{
    				var wait = new waiting();
    				$customerService.updateAfterSaleApply({
		    			id : $stateParams.id,
		    			orderId : $stateParams.orderId,
		    			returnWay : vm.stages,
		    			returnwareType : "10",
		    			returnwareProvince : vm.takeid,
		    			returnwareCity: vm.cityid,
		    			returnwareCounty: vm.countyid,
		    			returnwareVillage: vm.townid || 0,
		    			returnwareAddress: vm.addresstwo,
		    			returnwareContacts: vm.name,
		    			returnwarePhone: vm.model
					}).success(function(data){
						if(data.resultCode == "0000"){
							wait.hide();
							$state.go('Success',{
								orderId :　$stateParams.orderId,
								say : $stateParams.say,
								id : $stateParams.id
							},{
				                location:'replace'
				            })
						}
					})
    			}
			}	
    	}
    }
});