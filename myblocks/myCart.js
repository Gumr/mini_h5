/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular','css!./user.css'], function(angular) {
    angular.module('app')
        .controller('myCartController', myCartController)

    //我的购物车
    myCartController.$inject = ['$scope','$state','$stateParams','$verifyService','$http','$common','$timeout','$cardService','$productService','$userService','$address','$window'];
    function myCartController($scope,$state,$stateParams,$verifyService,$http,$common,$timeout,$cardService,$productService,$userService,$address,$window){
        $verifyService.SetIOSTitle("购物车");

        $scope.num = 1;         //购物车商品数量
        $scope.noLogin=false;  //没有登录
        $scope.hasLogin=false;  //已经登录
        $scope.cartList=JSON.parse(localStorage.getItem('cartList'));   //从缓存里获取购物车列表
        $scope.selfList=[];     //自营商品
        $scope.selfCheck=[];    //自营商品选中
        $scope.selfAllCheck=false;  //自营商品全部选中
        $scope.selfTotalMoney=0.00;    //自营商品总价
        $scope.selfMonthRepayMoney=0.00;   //自营商品总月供
        $scope.huilImaUrl=imgUrl;      //自营商品图片前缀
        $scope.jdList=[];       //京东商品
        $scope.jdCheck=[];    //京东商品选中
        $scope.jdAllCheck=false;  //京东商品全部选中
        $scope.jdImaUrl=$productService.imgUrl[0];      //京东图片前缀
        $scope.jdTotalMoney=0;    //自营商品总价
        $scope.jdMonthRepayMoney=0;   //自营商品总月供
        $scope.totalMoney=0;    //合计总额
        $scope.monthRepayMoney=0;   //分期金额合计
        $scope.allGoodsCheck=false; //所有商品选中
        $scope.address='';          //所在地
        $scope.Whether=false;			//有无货编辑状态标识
        $scope.data={
        	state:'编辑',
        	roll:false,
        	jdgoodsid:'',
        	zygoodsid:'',
        	activityCouponList:{},			//优惠券数据
        	fiction:false					//无优惠卷提示
        }
        
        
        
        var myIscroll3 = scroll('.main-content');
         init();
         function init(){
             //var mainScroll = null;
             //mainScroll = new IScroll(".main-content",{probeType : 3,preventDefault:false});
             //mainScroll.on('scrollEnd', function () {
             //    //vm.loadIcon = true;                              	//加载loading
             //    //vm.loadGoods = true;
             //    if( this.y - this.maxScrollY < 1 && vm.loadGoods && vm.loadEnd){
             //        //vm.loadEnd = false;
             //        $timeout(function(){
             //            mainScroll.refresh();
             //        },200)
             //    }
             //})
             //判断用户是否登录
             $userService.getAllHshCustInfo($userService.getAuthorication).success(function(data){
                 if(data.resultCode == "0000"){//登录了
                     $scope.hasLogin=true;
                     
                     //获取客户默认收货地址
                     
                     $address.getAddress({custId:data.result.userInfo.id}).success(function(params){
                         if(params.resultCode == "0000"){
                             //var data={
                             //    provinceId:"",
                             //    cityId:"",
                             //    countyId:"",
                             //    townId:""
                             //}
                             var cityName='';
                             if(params.result){
                                 for(var i=0;i<params.result.length;i++){
                                     if(params.result[i].defaultAddress==1){//默认地址
                                         $scope.address=params.result[i].cityName+params.result[i].countyName;
                                         cityName=params.result[i].cityName || '';
                                         //data.cityId=data.result[i].cityId || '';
                                         //data.countyId=data.result[i].countyId || '';
                                         //data.townId=data.result[i].townId || '';
                                     }
                                 }
                             }
                             if(!$scope.address){//没有默认收货地址，用用户所在城市地址
                                 $scope.address=sessionStorage.getItem("city-orientation");
                                 cityName=$scope.address;
                             }
                             //获取购物车列表
                             var wait = new waiting();
                             $productService.getShoppingCartGoodsList({
                                 cityName:cityName,
                             },localStorage.getItem("sinks-token")).success(function(data){
                             	wait.hide();
                                 if(data.resultCode == "0000"){
                                     $scope.num=data.result.goodsNum;//购物车商品数量
                                     for(var i=0;i<data.result.goodsList.length;i++){
                                         if(data.result.goodsList[i].typeFrom==1){//自营商品
                                             $scope.selfList.push(data.result.goodsList[i]);
                                             $scope.selfCheck.push(false);
                                             $scope.data.zygoodsid+=data.result.goodsList[i].goodsId+',';
                                         }else if(data.result.goodsList[i].typeFrom==2){//京东商品
                                             $scope.jdList.push(data.result.goodsList[i]);
                                             $scope.jdCheck.push(false);
                                             $scope.data.jdgoodsid+=data.result.goodsList[i].goodsId+',';
                                         }
                                     }
                                     $timeout(function(){
                                         myIscroll3.refresh();
                                     },200)
                                     //var myIscroll3 = scroll('.main-content');
                                 }
                             })
                         }
                         
                     })
                 }else if(data.resultCode == "0001"){//没登陆
                     $scope.noLogin=true;
                     $scope.address=sessionStorage.getItem("city-orientation");//获取用户当前IP所在的城市
                     //获取购物车商品列表
                     var wait = new waiting();
                     $productService.getShoppingCartGoodsList({
                         cityName:$scope.address,
                     },localStorage.getItem("sinks-token")).success(function(data){
                     	wait.hide();
                         if(data.resultCode == "0000"){
                             $scope.num=data.result.goodsNum;//购物车商品数量
                             for(var i=0;i<data.result.goodsList.length;i++){
                                 if(data.result.goodsList[i].typeFrom==1){//自营商品
                                     $scope.selfList.push(data.result.goodsList[i]);
                                     $scope.selfCheck.push(false);
                                     $scope.data.zygoodsid+=data.result.goodsList[i].goodsId+',';
                                 }else if(data.result.goodsList[i].typeFrom==2){//京东商品
                                     $scope.jdList.push(data.result.goodsList[i]);
                                     $scope.jdCheck.push(false);
                                     $scope.data.jdgoodsid+=data.result.goodsList[i].goodsId+',';
                                 }
                             }
                             $timeout(function(){
                                 myIscroll3.refresh();
                             },200)
                         }
                     })
                 }
                
             })
         }
		
		//跳转登录
		$scope.goLogin = function(){
			sessionStorage.setItem('hshurl',window.location.href);
			$state.go('login',{});
		}
		
		//编辑按键
		$scope.edit = function(state){
			if(state=='完成'){
				$scope.data.state='编辑'
			}else{
				$scope.data.state='完成'
			}
			
		}

        //选中商品
        $scope.checkgoods=function(typeFrom,index,stockStateDesc,state){
            if(typeFrom=='jd'){//京东商品
                if($scope.jdCheck[index]){//变成未选择
                	if(stockStateDesc=='有货' && 	state!=0){
	                    $scope.jdTotalMoney=(parseFloat($scope.jdTotalMoney)-($scope.jdList[index].salePrice*$scope.jdList[index].goodsNum)).toFixed(2);//京东商品总价格减去当前商品价格
	                    $scope.jdMonthRepayMoney=(parseFloat($scope.jdMonthRepayMoney)-($scope.jdList[index].monthRepayMoney)*$scope.jdList[index].goodsNum).toFixed(2);//京东商品月供总数减去当前商品月供
                	}
            	}else{//变成选择
                	if(stockStateDesc=='有货' && 	state!=0){
                		$scope.jdTotalMoney=(parseFloat($scope.jdTotalMoney)+($scope.jdList[index].salePrice*$scope.jdList[index].goodsNum)).toFixed(2);//京东商品总价格加上当前商品价格
                    	$scope.jdMonthRepayMoney=(parseFloat($scope.jdMonthRepayMoney)+($scope.jdList[index].monthRepayMoney)*$scope.jdList[index].goodsNum).toFixed(2);//京东商品月供总数加上当前商品月供
                	}
                }
                $scope.jdCheck[index]=!$scope.jdCheck[index];//选中状态改变
                $scope.jdAllCheck=isAllCheck($scope.jdCheck,$scope.jdList);//判断京东商品是否已经全选
                if($scope.jdAllCheck && $scope.selfList.length<1){//如果京东商品已经全选且没有自营商品
                    $scope.allGoodsCheck=true;//全选按钮点亮
                }
                if(!$scope.jdAllCheck){//京东商品没有全选
                    $scope.allGoodsCheck=false;//全选按钮不点亮
                }
            }else if(typeFrom=='huil'){//自营商品
                if($scope.selfCheck[index]){//变成未选择
                    $scope.selfTotalMoney=(parseFloat($scope.selfTotalMoney)-($scope.selfList[index].salePrice*$scope.selfList[index].goodsNum)).toFixed(2);//自营商品总价格减去当前商品价格
                    $scope.selfMonthRepayMoney=(parseFloat($scope.selfMonthRepayMoney)-($scope.selfList[index].monthRepayMoney)*$scope.selfList[index].goodsNum).toFixed(2);//自营商品月供总数减去当前商品月供
                }else{
                	if(stockStateDesc=='有货' && 	state!=0){
                		$scope.selfTotalMoney=(parseFloat($scope.selfTotalMoney)+($scope.selfList[index].salePrice*$scope.selfList[index].goodsNum)).toFixed(2);//自营商品总价格加上当前商品价格
                    	$scope.selfMonthRepayMoney=(parseFloat($scope.selfMonthRepayMoney)+($scope.selfList[index].monthRepayMoney)*$scope.selfList[index].goodsNum).toFixed(2);//自营商品月供总数加上当前商品月供
                	}
                }
                $scope.selfCheck[index]=!$scope.selfCheck[index];//选中状态改变
                $scope.selfAllCheck=isAllCheck($scope.selfCheck,$scope.selfList)//判断自营商品是否已经全选
                if($scope.selfAllCheck && $scope.jdList.length<1){//如果自营商品已经全选且没有京东商品
                    $scope.allGoodsCheck=true;//全选按钮点亮
                }
                if(!$scope.selfAllCheck){//自营商品没有全选
                    $scope.allGoodsCheck=false;//全选按钮不点亮
                }
            }
            $scope.totalMoney=parseFloat($scope.selfTotalMoney)+parseFloat($scope.jdTotalMoney);//计算京东商品跟自营商品总额
            $scope.monthRepayMoney=parseFloat($scope.jdMonthRepayMoney)+parseFloat($scope.selfMonthRepayMoney);//计算京东商品月供跟自营商品月供总额
            if($scope.monthRepayMoney<0){//如果金额小于0
                $scope.monthRepayMoney=0;//
            }
            if($scope.totalMoney<0){//如果金额小于0
                $scope.totalMoney=0;
            }
        }

        //循环遍历是否全选
        function isAllCheck(arr,goodList){
                for(var i=0;i<arr.length;i++){
                if(goodList[i].stockStateDesc=='有货' && goodList[i].state!=0){//判断当前商品是否有货有效
                    if(!arr[i]){
                        return false;
                    }
                }
            }
            return true;
        }
        //全选或全不选商品
        function allOrNot(arr,goodsList,bool,type){
            var salePrice=0;//初始化商品总额
            var monthRepayMoney=0;//初始化商品贷款总额
            for(var i=0;i<arr.length;i++){
                if(goodsList[i].goodsNum==0 || goodsList[i].stockStateDesc=="无货" || goodsList[i].state==0){//判断是否商品数量或者无货或者无效，是的话跳过
                    continue
                }
                arr[i]=bool;
                salePrice=salePrice+goodsList[i].salePrice*goodsList[i].goodsNum;//商品金额相加
                monthRepayMoney=monthRepayMoney+goodsList[i].monthRepayMoney*goodsList[i].goodsNum;//商品月供相加
            }
            if(type=='jd'){//京东商品
                $scope.jdTotalMoney=salePrice;//京东商品总额赋值
                $scope.jdMonthRepayMoney=monthRepayMoney;//京东商品月供赋值
                if(bool){//全选
                    $scope.totalMoney=(parseFloat($scope.selfTotalMoney)+salePrice).toFixed(2);//京东总额相加
                    $scope.monthRepayMoney=(parseFloat($scope.selfMonthRepayMoney)+monthRepayMoney).toFixed(2);//京东自营月供相加
                }else{//全不选
                    $scope.jdTotalMoney=0.00;//总额变成0
                    $scope.jdMonthRepayMoney=0.00;//月供变成0
                    $scope.totalMoney=(parseFloat($scope.selfTotalMoney)).toFixed(2);//商品总额去掉京东的总额
                    $scope.monthRepayMoney=(parseFloat($scope.selfMonthRepayMoney)).toFixed(2);//商品总月供去掉京东的总月供
                }
            }else{//自营商品
                $scope.selfTotalMoney=salePrice;//自营商品总额赋值
                $scope.selfMonthRepayMoney=monthRepayMoney;//自营商品月供赋值
                if(bool){//全选
                    $scope.totalMoney=(parseFloat($scope.jdTotalMoney)+salePrice).toFixed(2);//自营总额相加
                    $scope.monthRepayMoney=(parseFloat($scope.jdMonthRepayMoney)+monthRepayMoney).toFixed(2);//月供相加
                }else{//全不选
                    $scope.selfTotalMoney=0.00;//总额变成0
                    $scope.selfMonthRepayMoney=0.00;//月供变成0
                    $scope.totalMoney=(parseFloat($scope.jdTotalMoney)).toFixed(2);//自营总额去掉京东的总额
                    $scope.monthRepayMoney=(parseFloat($scope.jdMonthRepayMoney)).toFixed(2);//自营总月供去掉京东的总月供
                }
            }
        }


        //增加商品数量
        $scope.addNum=function(typeFrom,index,num){
            if(typeFrom=='jd'){//京东
                if($scope.jdList[index].goodsNum<10){//商品数量不能大于10
                    $scope.jdList[index].goodsNum++;//商品数量+1
                    if($scope.jdCheck[index]){//当前商品是否选中
                        $scope.jdTotalMoney=parseFloat($scope.jdTotalMoney)+parseFloat(($scope.jdList[index].salePrice).toFixed(2));//京东总额加上当前商品单价
                        $scope.jdMonthRepayMoney=parseFloat($scope.jdMonthRepayMoney)+parseFloat(($scope.jdList[index].monthRepayMoney).toFixed(2));//京东月供加上当前商品月供
                    }
                }
            }else if(typeFrom=='huil'){//自营
                if($scope.selfList[index].goodsNum<10){//商品总额不能大于10
                    $scope.selfList[index].goodsNum++;//商品总额+1
                    if($scope.selfCheck[index]){//当前商品是否全选
                        $scope.selfTotalMoney=parseFloat($scope.selfTotalMoney)+parseFloat(($scope.selfList[index].salePrice).toFixed(2));//自营总额加上当前商品单价
                        $scope.selfMonthRepayMoney=parseFloat($scope.selfMonthRepayMoney)+parseFloat(($scope.selfList[index].monthRepayMoney).toFixed(2));//自营月供加上当前商品月供
                    }
                }
            }
            $scope.totalMoney=$scope.jdTotalMoney+$scope.selfTotalMoney;//更新商品总金额
            $scope.monthRepayMoney=$scope.jdMonthRepayMoney+$scope.selfMonthRepayMoney;//更新商品总月供
        }

        //减少商品数量
        $scope.cutNum=function(typeFrom,index,num){
            if(typeFrom=='jd'){//京东
                if($scope.jdList[index].goodsNum>1){//商品数量不能小于1
                    $scope.jdList[index].goodsNum--;//商品数量-1
                    if($scope.jdCheck[index]){//当前商品是否选中
                        $scope.jdTotalMoney=parseFloat($scope.jdTotalMoney)-parseFloat(($scope.jdList[index].salePrice).toFixed(2));//京东总额减去当前商品单价
                        $scope.jdMonthRepayMoney=parseFloat($scope.jdMonthRepayMoney)-parseFloat(($scope.jdList[index].monthRepayMoney).toFixed(2));//京东月供减去当前商品月供
                    }
                }
            }else if(typeFrom=='huil'){//自营
                if($scope.selfList[index].goodsNum>1){//商品总额不能小于1
                    $scope.selfList[index].goodsNum--;//商品数量-1
                    if($scope.selfCheck[index]){//当前商品是否选中
                        $scope.selfTotalMoney=parseFloat($scope.selfTotalMoney)-parseFloat(($scope.selfList[index].salePrice).toFixed(2));//自营总额减去当前商品单价
                        $scope.selfMonthRepayMoney=parseFloat($scope.selfMonthRepayMoney)-parseFloat(($scope.selfList[index].monthRepayMoney).toFixed(2));//自营月供减去当前商品月供
                    }
                }
            }
            $scope.totalMoney=$scope.jdTotalMoney+$scope.selfTotalMoney;//更新商品总金额
            $scope.monthRepayMoney=$scope.jdMonthRepayMoney+$scope.selfMonthRepayMoney;//更新商品总月供
        }
        //全选商品
        $scope.allcheck=function(typeFrom){
            switch (typeFrom){
                case 'jd'://京东
                    //isAllCheck($scope.jdCheck,$scope.jdAllCheck)
                    if($scope.jdAllCheck){//变成全不选
                        allOrNot($scope.jdCheck,$scope.jdList,false,'jd')
                        $scope.jdAllCheck=false;
                        $scope.allGoodsCheck=false;
                    }else{//变成全选
                        allOrNot($scope.jdCheck,$scope.jdList,true,'jd')
                        $scope.jdAllCheck=true;
                        if($scope.selfList.length<1){
                            $scope.allGoodsCheck=true;
                        }
                    }
                    break;
                case 'huil'://自营
                    if($scope.selfAllCheck){
                        allOrNot($scope.selfCheck,$scope.selfList,false,'huil')
                        $scope.selfAllCheck=false;
                        $scope.allGoodsCheck=false;
                    }else{
                        allOrNot($scope.selfCheck,$scope.selfList,true,'huil')
                        $scope.selfAllCheck=true;
                        if($scope.jdList.length<1){
                            $scope.allGoodsCheck=true;
                        }
                    }
                    break;
                case 'all'://全部
                    if($scope.allGoodsCheck){
                        allOrNot($scope.selfCheck,$scope.selfList,false,'huil');
                        allOrNot($scope.jdCheck,$scope.jdList,false,'jd')
                        $scope.selfAllCheck=false;
                        $scope.jdAllCheck=false;
                        $scope.allGoodsCheck=false;
                    }else{
                        allOrNot($scope.selfCheck,$scope.selfList,true,'huil');
                        allOrNot($scope.jdCheck,$scope.jdList,true,'jd')
                        $scope.selfAllCheck=true;
                        $scope.jdAllCheck=true;
                        $scope.allGoodsCheck=true;
                    }
                    break;
            }
        }
        //移入收藏夹或者删除或者结算
        $scope.saveOrDeleteOrSet=function(type){
            var idList='';//所选商品的id
            var goodsList=[];//选择的商品信息数组
            var deleteListInfo=[];//要删除的商品信息数组
            for(var i=0;i<$scope.selfCheck.length;i++){
                if($scope.selfCheck[i]){
                    idList+=$scope.selfList[i].goodsId+',';
                    goodsList.push($scope.selfList[i]);
                    deleteListInfo.push({
                        goodsId:$scope.selfList[i].goodsId,
                        loanPeriods:$scope.selfList[i].loanPeriods,
                        goodsAttrInfo:$scope.selfList[i].goodsAttrInfo,
                    })
                }
            }
            for(var i=0;i<$scope.jdCheck.length;i++){
                if($scope.jdCheck[i]){
                    idList+=$scope.jdList[i].goodsId+',';
                    goodsList.push($scope.jdList[i]);
                    deleteListInfo.push({
                        goodsId:$scope.jdList[i].goodsId,
                        loanPeriods:$scope.jdList[i].loanPeriods,
                        goodsAttrInfo:$scope.jdList[i].goodsAttrInfo,
                    })
                }
            }
            if(!idList || idList==''){
                toolTip('您还没有选择商品哦！');
                return;
            }
            idList=idList.substring(0,idList.length-1);
            if(type=='save'){//移入收藏夹
                $productService.saveGoodsCollectCart({
                    goodsId:idList,
                    goodsInfo:deleteListInfo
                }).success(function(data){
                    if(data.resultCode == "0000"){
                        toolTip('移入收藏夹成功');
                        $timeout(function(){
                            $window.location.reload();//页面刷新
                        },1500)

                        //allOrNot($scope.selfCheck,$scope.seflList,false,'huil');
                        //allOrNot($scope.jdCheck,$scope.jdList,false,'jd');
                        //$scope.selfAllCheck=false;
                        //$scope.jdAllCheck=false;
                        //$scope.allGoodsCheck=false;
                    }
                })
            }else if(type=='delete'){//删除
                $productService.deleteShoppingCartGoods({
                    goodsInfo:deleteListInfo
                },localStorage.getItem("sinks-token")).success(function(data){
                    if(data.resultCode == "0000"){
                        toolTip('删除成功');
                        $timeout(function(){
                            $window.location.reload();//页面刷新
                        },1500)
                        //allOrNot($scope.selfCheck,$scope.seflList,false,'huil');
                        //allOrNot($scope.jdCheck,$scope.jdList,false,'jd');
                        //$scope.selfAllCheck=false;
                        //$scope.jdAllCheck=false;
                        //$scope.allGoodsCheck=false;
                    }
                })
            }else if(type=='set'){//结算
                sessionStorage.setItem('cartList',JSON.stringify(goodsList))//储存要结算的购物车信息
                sessionStorage.removeItem('couponList');//刷新已使用的优惠券信息储存
                if($scope.noLogin){//如果没有登录
                    $state.go('login',{
                        state:"confirm"
                    });
                }else{
                    $state.go('confirm');//跳转去确认订单页面
                }
            }
        }
    }
});