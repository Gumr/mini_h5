/**
 * Created by Administrator on 2017/6/6.
 */

define(['angular', 'css!./myCart.css'], function(angular) {
    angular.module('app')
        .controller('myCartController', myCartController)
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

    //我的购物车
    myCartController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', '$cardService', '$productService', '$userService', '$address', '$window'];

    function myCartController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, $cardService, $productService, $userService, $address, $window) {
        $verifyService.SetIOSTitle("购物车");
        var vm = this;
        $scope.num = 1; //购物车商品数量
        $scope.noLogin = false; //没有登录
        $scope.hasLogin = false; //已经登录
        $scope.cartList = JSON.parse(localStorage.getItem('cartList')); //从缓存里获取购物车列表
        $scope.selfList = []; //自营商品
        $scope.selfCheck = []; //自营商品选中
        $scope.selfAllCheck = false; //自营商品全部选中
        $scope.selfTotalMoney = 0.00; //自营商品总价
        $scope.selfMonthRepayMoney = 0.00; //自营商品总月供        
        $scope.huilImaUrl = imgUrl; //自营商品图片前缀
        $scope.jdList = []; //京东商品
        $scope.jdCheck = []; //京东商品选中
        $scope.jdAllCheck = false; //京东商品全部选中
        $scope.jdImaUrl = $productService.imgUrl[0]; //京东图片前缀
        $scope.jdTotalMoney = 0; //京东商品总价
        $scope.jdMonthRepayMoney = 0; //京东商品总月供
        $scope.totalMoney = 0; //合计总额
        $scope.monthRepayMoney = 0; //分期金额合计
        $scope.allGoodsCheck = false; //所有商品选中
        $scope.address = ''; //所在地
        $scope.Whether = false; //有无货编辑状态标识
        $scope.info_num = {}; //商品数量信息
        $scope.data = {
            state: '编辑商品',
            roll: false,
            jdgoodsid: '',
            zygoodsid: '',
            activityCouponList: {}, //优惠券数据
            fiction: false //无优惠卷提示
        }

        $scope.$on('$includeContentLoaded', function(event) {
            $('.footer-bar .tabs-hopping').addClass('current')
                .siblings().removeClass('current');
        });

        var myIscroll3 = scroll('.main-content');

        

        init();
        function init() {
            $scope.wait = new waiting();
            //判断用户是否登录
            $userService.checkLoginState($userService.getAuthorication).success(function(data) {
                $scope.wait.hide();
                if (data.resultCode == "0000") { //登录了
                    $scope.hasLogin = true;
                    $scope.address = sessionStorage.getItem("city-orientation");
                    //获取购物车商品列表
                    getCartGoodsList();
                    vm.monitor = monitor; //埋点

                    // 埋点
                    function monitor(pageModule,pageValue) {
                        $productService.doUserTrace({
                            channelId: sessionStorage.getItem('channelId'),
                            page: 'shoppingcartpage',
                            pageModule: pageModule,
                            pageValue: pageValue
                        }).success(function(data) {

                        })
                        
                    }
                } else if (data.resultCode == "1000") { //没登陆
                    $scope.noLogin = true;
                    $scope.address = sessionStorage.getItem("city-orientation"); //获取用户当前IP所在的城市
                    //获取购物车商品列表
                    getCartGoodsList();

                    vm.monitor = monitor; //埋点

                    // 埋点
                    function monitor(pageModule,pageValue) {
                        $productService.doUserTrace({
                            channelId: sessionStorage.getItem('channelId'),
                            page: 'offlineshoppingcartpage',
                            pageModule: pageModule,
                            pageValue: pageValue
                        }).success(function(data) {

                        })
                        
                    }
                }
            })
        }
        //设置购物车商品数量
        function setCartNum(){
            if($scope.num>0){
                $('.cartNum').show().html($scope.num);
            }else{
                $('.cartNum').hide();
            }
        }
        //获取购物车商品列表
        function getCartGoodsList(city){
            var cityName = city ? city : $scope.address;
            var wait = new waiting();
            $productService.getShoppingCartGoodsList({
                cityName: cityName,
            }, localStorage.getItem("sinks-token")).success(function(data) {
                wait.hide();
                if (data.resultCode == "0000") {
                    console.log(data);
                    $scope.num = data.result.goodsNum; //获取购物车商品数量
                    setCartNum();//设置购物车商品数量

                    for (var i = 0; i < data.result.goodsList.length; i++) {
                        data.result.goodsList[i].goodsAttrInfo = angular.fromJson(data.result.goodsList[i].goodsAttrInfo);
                        if (data.result.goodsList[i].typeFrom == 1) { //自营商品
                            $scope.selfList.push(data.result.goodsList[i]);
                            $scope.selfCheck.push(false);
                            $scope.data.zygoodsid += data.result.goodsList[i].goodsId + ',';
                        } else if (data.result.goodsList[i].typeFrom == 2) { //京东商品
                            $scope.jdList.push(data.result.goodsList[i]);
                            $scope.jdCheck.push(false);
                            $scope.data.jdgoodsid += data.result.goodsList[i].goodsId + ',';
                        }
                    }
                }
            });
        }

        //后台移除后前端同步--所有选中
        function deleteCheck(){
            console.log($scope.selfCheck);
            for(var i=0; i< $scope.selfCheck.length; i++){
                if( $scope.selfCheck[i] === true ){
                    $scope.num -= $scope.selfList[i].goodsNum;
                    $scope.selfList.splice(i,1);
                    $scope.selfCheck.splice(i,1);
                    i--;
                }
            }
            
            console.log($scope.jdCheck);
            for(var i=0; i< $scope.jdCheck.length; i++){
                if( $scope.jdCheck[i] === true ){
                    $scope.num -= $scope.jdList[i].goodsNum;
                    $scope.jdList.splice(i,1);
                    $scope.jdCheck.splice(i,1);
                    i--;
                }
            }
            setCartNum(); //设置购物车商品数量
            $scope.selfAllCheck = false; //自营商品全部选中
            $scope.selfTotalMoney = 0.00; //自营商品总价
            $scope.selfMonthRepayMoney = 0.00; //自营商品总月供
            $scope.jdAllCheck = false; //京东商品全部选中
            $scope.jdTotalMoney = 0; //京东商品总价
            $scope.jdMonthRepayMoney = 0; //京东商品总月供
            $scope.totalMoney = 0; //合计总额
            $scope.monthRepayMoney = 0; //分期金额合计
            $scope.allGoodsCheck = false;//所有商品选中

            setTimeout(function(){
                myIscroll3.refresh();
            },500);
        }

        
        /*
        //领取卡卷点击事件
        $scope.handover = function(num, activityNum, receiveCoupon, index) {
            if (localStorage.getItem('sinks-token')) {
                if (receiveCoupon == 0) {
                    $productService.getCouponToUser({
                        couponNum: num,
                        activityNum: activityNum
                    }, localStorage.getItem("sinks-token")).then(function(data) {
                        if (data.data.resultCode == '0000') {
                            toolTip('卡卷领取成功');
                            $scope.data.activityCouponList[index].receiveCoupon = 1;
                        } else if (data.data.resultCode == '1000') {
                            sessionStorage.setItem('hshurl', location.href);
                            $state.go('login', {

                            })
                        }
                    })
                }
            } else {
                sessionStorage.setItem('hshurl', location.href);
                $state.go('login', {

                })
            }
        }
        //领卷点击事件
        $scope.roll = function(code) {
            $scope.data.roll = true;
            $('.modal-layer,.shade').addClass('active');
            if (code == 'jd') {
                coupon($scope.data.jdgoodsid)
            } else if (code == 'zy') {
                coupon($scope.data.zygoodsid)
            }
        }
        //促销领卷弹层关闭事件
        $scope.hide = function() {
            $scope.data.roll = false;
            $('.modal-layer,.shade').removeClass('active');
        }
        //获取优惠券
        function coupon(goodsid) {
            $productService.findActivityCouponByGoodPoolId({
                goodsId: goodsid
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == '0000' && data.result.activityCouponList != '') {
                    $scope.data.activityCouponList = data.result.activityCouponList;
                    angular.forEach(data.result.activityCouponList, function(data) {
                        data.couponContent = parseInt(data.couponContent);
                        data.couponName = data.couponName.replace("(贷款)", "")
                    })
                    $scope.data.fiction = false;
                } else {
                    $scope.data.activityCouponList = {};
                    $scope.data.fiction = true;
                }
            })
        }
        */

        //跳转登录
        $scope.goLogin = function() {
            sessionStorage.setItem('hshurl', window.location.href);
            $state.go('login', {});
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'offlineshoppingcartpage',
                pageModule: 'login',
                pageValue: ''
            }).success(function(data) {

            })
        }

        //编辑按键
        $scope.edit = function(state) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'shoppingcartpage',
                pageModule: 'Edit',
                pageValue: ''
            }).success(function(data) {

            })
            if (state == '完成') {
                $scope.data.state = '编辑商品'
            } else {
                $scope.data.state = '完成'
            }

        }

        //选中商品
        $scope.checkgoods = function(typeFrom, index, stockStateDesc, state) {
            if (typeFrom == 'jd') { //京东商品
                if ($scope.jdCheck[index]) { //变成未选择
                    if ($scope.jdList[index].spikeStatus == 1) {
                        $scope.jdList[index].salePrice = $scope.jdList[index].spikePirce
                    }
                    if (stockStateDesc == '有货' && state != 0) {
                        $scope.jdTotalMoney = (parseFloat($scope.jdTotalMoney) - ($scope.jdList[index].salePrice * $scope.jdList[index].goodsNum)).toFixed(2); //京东商品总价格减去当前商品价格
                        $scope.jdMonthRepayMoney = (parseFloat($scope.jdMonthRepayMoney) - ($scope.jdList[index].monthRepayMoney) * $scope.jdList[index].goodsNum).toFixed(2); //京东商品月供总数减去当前商品月供
                    }
                } else { //变成选择
                    if ($scope.jdList[index].spikeStatus == 1) {
                        $scope.jdList[index].salePrice = $scope.jdList[index].spikePirce
                    }
                    if (stockStateDesc == '有货' && state != 0) {
                        $scope.jdTotalMoney = (parseFloat($scope.jdTotalMoney) + ($scope.jdList[index].salePrice * $scope.jdList[index].goodsNum)).toFixed(2); //京东商品总价格加上当前商品价格
                        $scope.jdMonthRepayMoney = (parseFloat($scope.jdMonthRepayMoney) + ($scope.jdList[index].monthRepayMoney) * $scope.jdList[index].goodsNum).toFixed(2); //京东商品月供总数加上当前商品月供
                    }
                }
                $scope.jdCheck[index] = !$scope.jdCheck[index]; //选中状态改变
                $scope.jdAllCheck = isAllCheck($scope.jdCheck, $scope.jdList); //判断京东商品是否已经全选
                if ($scope.jdAllCheck && $scope.selfList.length < 1) { //如果京东商品已经全选且没有自营商品
                    $scope.allGoodsCheck = true; //全选按钮点亮
                }
                if (!$scope.jdAllCheck) { //京东商品没有全选
                    $scope.allGoodsCheck = false; //全选按钮不点亮
                }
            } else if (typeFrom == 'huil') { //自营商品
                if ($scope.selfCheck[index]) { //变成未选择
                    if ($scope.selfList[index].spikeStatus == 1) {
                        $scope.selfList[index].salePrice = $scope.selfList[index].spikePirce
                    }
                    $scope.selfTotalMoney = (parseFloat($scope.selfTotalMoney) - ($scope.selfList[index].salePrice * $scope.selfList[index].goodsNum)).toFixed(2); //自营商品总价格减去当前商品价格
                    $scope.selfMonthRepayMoney = (parseFloat($scope.selfMonthRepayMoney) - ($scope.selfList[index].monthRepayMoney) * $scope.selfList[index].goodsNum).toFixed(2); //自营商品月供总数减去当前商品月供
                } else {
                    if ($scope.selfList[index].spikeStatus == 1) {
                        $scope.selfList[index].salePrice = $scope.selfList[index].spikePirce
                    }
                    //if (stockStateDesc == '有货' && state != 0) {
                    if( state == 2 ){
                        $scope.selfTotalMoney = (parseFloat($scope.selfTotalMoney) + ($scope.selfList[index].salePrice * $scope.selfList[index].goodsNum)).toFixed(2); //自营商品总价格加上当前商品价格
                        $scope.selfMonthRepayMoney = (parseFloat($scope.selfMonthRepayMoney) + ($scope.selfList[index].monthRepayMoney) * $scope.selfList[index].goodsNum).toFixed(2); //自营商品月供总数加上当前商品月供
                    }
                }
                $scope.selfCheck[index] = !$scope.selfCheck[index]; //选中状态改变
                $scope.selfAllCheck = isAllCheck($scope.selfCheck, $scope.selfList) //判断自营商品是否已经全选
                if ($scope.selfAllCheck && $scope.jdList.length < 1) { //如果自营商品已经全选且没有京东商品
                    $scope.allGoodsCheck = true; //全选按钮点亮
                }
                if (!$scope.selfAllCheck) { //自营商品没有全选
                    $scope.allGoodsCheck = false; //全选按钮不点亮
                }
            }
            $scope.totalMoney = parseFloat($scope.selfTotalMoney) + parseFloat($scope.jdTotalMoney); //计算京东商品跟自营商品总额
            $scope.monthRepayMoney = parseFloat($scope.jdMonthRepayMoney) + parseFloat($scope.selfMonthRepayMoney); //计算京东商品月供跟自营商品月供总额
            if ($scope.monthRepayMoney < 0) { //如果金额小于0
                $scope.monthRepayMoney = 0; //
            }
            if ($scope.totalMoney < 0) { //如果金额小于0
                $scope.totalMoney = 0;
            }
        }

        //循环遍历是否全选
        function isAllCheck(arr, goodList) {
            for (var i = 0; i < arr.length; i++) {
                //判断当前商品是否有货有效 --京东
                if (goodList[i].typeFrom=='2' && goodList[i].stockStateDesc == '有货' && goodList[i].state != 0) { 
                    if (!arr[i]) {
                        return false;
                    }
                }
                //判断当前商品是否有货有效 --自营
                if (goodList[i].typeFrom=='1' && goodList[i].status == 2 ) {
                    if (!arr[i]) {
                        return false;
                    }
                }
            }
            return true;
        }
        //全选或全不选商品
        function allOrNot(arr, goodsList, bool, type) {
            var salePrice = 0; //初始化商品总额
            var monthRepayMoney = 0; //初始化商品贷款总额
            for (var i = 0; i < arr.length; i++) {
                if (goodsList[i].goodsNum == 0 || goodsList[i].stockStateDesc == "无货" || goodsList[i].state == 0) { //判断是否商品数量或者无货或者无效，是的话跳过
                    continue
                }
                if (goodsList[i].spikeStatus == 1) {
                    goodsList[i].salePrice = goodsList[i].spikePirce
                }
                arr[i] = bool;
                salePrice = salePrice + goodsList[i].salePrice * goodsList[i].goodsNum; //商品金额相加
                monthRepayMoney = monthRepayMoney + goodsList[i].monthRepayMoney * goodsList[i].goodsNum; //商品月供相加
            }
            if (type == 'jd') { //京东商品
                $scope.jdTotalMoney = salePrice; //京东商品总额赋值
                $scope.jdMonthRepayMoney = monthRepayMoney; //京东商品月供赋值
                if (bool) { //全选
                    $scope.totalMoney = (parseFloat($scope.selfTotalMoney) + salePrice).toFixed(2); //京东总额相加
                    $scope.monthRepayMoney = (parseFloat($scope.selfMonthRepayMoney) + monthRepayMoney).toFixed(2); //京东自营月供相加
                } else { //全不选
                    $scope.jdTotalMoney = 0.00; //总额变成0
                    $scope.jdMonthRepayMoney = 0.00; //月供变成0
                    $scope.totalMoney = (parseFloat($scope.selfTotalMoney)).toFixed(2); //商品总额去掉京东的总额
                    $scope.monthRepayMoney = (parseFloat($scope.selfMonthRepayMoney)).toFixed(2); //商品总月供去掉京东的总月供
                }
            } else { //自营商品
                $scope.selfTotalMoney = salePrice; //自营商品总额赋值
                $scope.selfMonthRepayMoney = monthRepayMoney; //自营商品月供赋值
                if (bool) { //全选
                    $scope.totalMoney = (parseFloat($scope.jdTotalMoney) + salePrice).toFixed(2); //自营总额相加
                    $scope.monthRepayMoney = (parseFloat($scope.jdMonthRepayMoney) + monthRepayMoney).toFixed(2); //月供相加
                } else { //全不选
                    $scope.selfTotalMoney = 0.00; //总额变成0
                    $scope.selfMonthRepayMoney = 0.00; //月供变成0
                    $scope.totalMoney = (parseFloat($scope.jdTotalMoney)).toFixed(2); //自营总额去掉京东的总额
                    $scope.monthRepayMoney = (parseFloat($scope.jdMonthRepayMoney)).toFixed(2); //自营总月供去掉京东的总月供
                }
            }
        }

        //增加商品数量
        $scope.addNum = function(typeFrom, index, list) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'shoppingcartpage',
                pageModule: 'add',
                pageValue: ''
            }).success(function(data) {

            })
            var num;
            if (typeFrom == 'jd') { //京东
                num = $scope.jdList[index].goodsNum; 
                if ($scope.jdList[index].goodsNum < 10) { //商品数量不能大于10
                    $scope.jdList[index].goodsNum++; //商品数量+1
                    if ($scope.jdCheck[index]) { //当前商品是否选中
                        $scope.jdTotalMoney = parseFloat($scope.jdTotalMoney) + parseFloat(($scope.jdList[index].salePrice).toFixed(2)); //京东总额加上当前商品单价
                        $scope.jdMonthRepayMoney = parseFloat($scope.jdMonthRepayMoney) + parseFloat(($scope.jdList[index].monthRepayMoney).toFixed(2)); //京东月供加上当前商品月供
                    }
                }
            } else if (typeFrom == 'huil') { //自营
                num = $scope.selfList[index].goodsNum;
                if ($scope.selfList[index].goodsNum < 10) { //商品总额不能大于10
                    $scope.selfList[index].goodsNum++; //商品总额+1
                    if ($scope.selfCheck[index]) { //当前商品是否全选
                        $scope.selfTotalMoney = parseFloat($scope.selfTotalMoney) + parseFloat(($scope.selfList[index].salePrice).toFixed(2)); //自营总额加上当前商品单价
                        $scope.selfMonthRepayMoney = parseFloat($scope.selfMonthRepayMoney) + parseFloat(($scope.selfList[index].monthRepayMoney).toFixed(2)); //自营月供加上当前商品月供
                    }
                }
            }
            $scope.totalMoney = $scope.jdTotalMoney + $scope.selfTotalMoney; //更新商品总金额
            $scope.monthRepayMoney = $scope.jdMonthRepayMoney + $scope.selfMonthRepayMoney; //更新商品总月供

            if(num == 10){
                return;
            }

            if(!$scope.info_num[typeFrom+index]){
                $scope.info_num[typeFrom+index] = {num: 0};
            }

            //后台交互
            if( $scope.info_num[typeFrom+index].timer ){
                clearTimeout($scope.info_num[typeFrom+index].timer);
            }

            $scope.info_num[typeFrom+index].num++;
            $scope.info_num[typeFrom+index].timer = setTimeout(function(){
                var changeNum = $scope.info_num[typeFrom+index].num;
                $productService.setCartGoodsNum({
                    cartGoodsId: list.cartGoodsId,
                    goodsNum: num+1
                }).success(function(data) {
                    if (data.resultCode == '0000') {
                        $scope.num = $scope.num + changeNum;
                        setCartNum();                       
                    }
                });
                delete $scope.info_num[typeFrom+index];
            }, 1000);
        };

        //减少商品数量
        $scope.cutNum = function(typeFrom, index, list) {
            $productService.doUserTrace({
                channelId: sessionStorage.getItem('channelId'),
                page: 'shoppingcartpage',
                pageModule: 'subtract',
                pageValue: ''
            }).success(function(data) {

            })
            var num;
            if (typeFrom == 'jd') { //京东
                num = $scope.jdList[index].goodsNum; 
                if ($scope.jdList[index].goodsNum > 1) { //商品数量不能小于1
                    $scope.jdList[index].goodsNum--; //商品数量-1
                    if ($scope.jdCheck[index]) { //当前商品是否选中
                        $scope.jdTotalMoney = parseFloat($scope.jdTotalMoney) - parseFloat(($scope.jdList[index].salePrice).toFixed(2)); //京东总额减去当前商品单价
                        $scope.jdMonthRepayMoney = parseFloat($scope.jdMonthRepayMoney) - parseFloat(($scope.jdList[index].monthRepayMoney).toFixed(2)); //京东月供减去当前商品月供
                    }
                }
            } else if (typeFrom == 'huil') { //自营
                num = $scope.selfList[index].goodsNum; 
                if ($scope.selfList[index].goodsNum > 1) { //商品总额不能小于1
                    $scope.selfList[index].goodsNum--; //商品数量-1
                    if ($scope.selfCheck[index]) { //当前商品是否选中
                        $scope.selfTotalMoney = parseFloat($scope.selfTotalMoney) - parseFloat(($scope.selfList[index].salePrice).toFixed(2)); //自营总额减去当前商品单价
                        $scope.selfMonthRepayMoney = parseFloat($scope.selfMonthRepayMoney) - parseFloat(($scope.selfList[index].monthRepayMoney).toFixed(2)); //自营月供减去当前商品月供
                    }
                }
            }
            $scope.totalMoney = $scope.jdTotalMoney + $scope.selfTotalMoney; //更新商品总金额
            $scope.monthRepayMoney = $scope.jdMonthRepayMoney + $scope.selfMonthRepayMoney; //更新商品总月供

            if(num == 1){
                return;
            }

            if(!$scope.info_num[typeFrom+index]){
                $scope.info_num[typeFrom+index] = {num: 0};
            }

            //后台交互
            if( $scope.info_num[typeFrom+index].timer ){
                clearTimeout($scope.info_num[typeFrom+index].timer);
            }

            $scope.info_num[typeFrom+index].num--;
            $scope.info_num[typeFrom+index].timer = setTimeout(function(){
                var changeNum = $scope.info_num[typeFrom+index].num;
                $productService.setCartGoodsNum({
                    cartGoodsId: list.cartGoodsId,
                    goodsNum: num-1
                }).success(function(data) {
                    if (data.resultCode == '0000') {
                        $scope.num = $scope.num + changeNum;
                        setCartNum();
                    }
                });
                delete $scope.info_num[typeFrom+index];
            }, 1000);
        }
        //全选商品
        $scope.allcheck = function(typeFrom) {
            switch (typeFrom) {
                case 'jd': //京东
                    //isAllCheck($scope.jdCheck,$scope.jdAllCheck)
                    if ($scope.jdAllCheck) { //变成全不选
                        allOrNot($scope.jdCheck, $scope.jdList, false, 'jd')
                        $scope.jdAllCheck = false;
                        $scope.allGoodsCheck = false;
                    } else { //变成全选
                        allOrNot($scope.jdCheck, $scope.jdList, true, 'jd')
                        $scope.jdAllCheck = true;
                        if ($scope.selfList.length < 1) {
                            $scope.allGoodsCheck = true;
                        }
                    }
                    $productService.doUserTrace({
                        channelId: sessionStorage.getItem('channelId'),
                        page: 'shoppingcartpage',
                        pageModule: 'jingdongbutton',
                        pageValue: ''
                    }).success(function(data) {

                    })
                    break;
                case 'huil': //自营
                    if ($scope.selfAllCheck) {
                        allOrNot($scope.selfCheck, $scope.selfList, false, 'huil')
                        $scope.selfAllCheck = false;
                        $scope.allGoodsCheck = false;
                    } else {
                        allOrNot($scope.selfCheck, $scope.selfList, true, 'huil')
                        $scope.selfAllCheck = true;
                        if ($scope.jdList.length < 1) {
                            $scope.allGoodsCheck = true;
                        }
                    }
                    $productService.doUserTrace({
                        channelId: sessionStorage.getItem('channelId'),
                        page: 'shoppingcartpage',
                        pageModule: 'fanfanbutton',
                        pageValue: ''
                    }).success(function(data) {

                    })
                    break;
                case 'all': //全部
                    if ($scope.allGoodsCheck) {
                        allOrNot($scope.selfCheck, $scope.selfList, false, 'huil');
                        allOrNot($scope.jdCheck, $scope.jdList, false, 'jd')
                        $scope.selfAllCheck = false;
                        $scope.jdAllCheck = false;
                        $scope.allGoodsCheck = false;
                    } else {
                        allOrNot($scope.selfCheck, $scope.selfList, true, 'huil');
                        allOrNot($scope.jdCheck, $scope.jdList, true, 'jd')
                        $scope.selfAllCheck = true;
                        $scope.jdAllCheck = true;
                        $scope.allGoodsCheck = true;
                    }
                    $productService.doUserTrace({
                        channelId: sessionStorage.getItem('channelId'),
                        page: 'shoppingcartpage',
                        pageModule: 'checkall',
                        pageValue: ''
                    }).success(function(data) {

                    })
                    break;
            }
        }
        //移入收藏夹或者删除或者结算
        $scope.saveOrDeleteOrSet = function(type) {
            var idList = ''; //所选商品的id
            var goodsList = []; //选择的商品信息数组
            var collectList = [];
            var deleteListInfo = []; //要删除的商品信息数组
            for (var i = 0; i < $scope.selfCheck.length; i++) {
                if ($scope.selfCheck[i]) {
                    idList += $scope.selfList[i].goodsId + ',';
                    goodsList.push($scope.selfList[i]);
                    deleteListInfo.push($scope.selfList[i].cartGoodsId);
                    collectList.push({
                        goodsId: $scope.selfList[i].goodsId,
                        loanPeriods: $scope.selfList[i].loanPeriods,
                        goodsAttrInfo: $scope.selfList[i].goodsAttrInfo,
                    })
                }
            }
            for (var i = 0; i < $scope.jdCheck.length; i++) {
                if ($scope.jdCheck[i]) {
                    idList += $scope.jdList[i].goodsId + ',';
                    goodsList.push($scope.jdList[i]);
                    deleteListInfo.push($scope.jdList[i].cartGoodsId);
                    collectList.push({
                        goodsId: $scope.jdList[i].goodsId,
                        loanPeriods: $scope.jdList[i].loanPeriods,
                        goodsAttrInfo: $scope.jdList[i].goodsAttrInfo,
                    })
                }
            }
            if (!idList || idList == '') {
                toolTip('您还没有选择商品哦！');
                return;
            }
            idList = idList.substring(0, idList.length - 1);
            if (type == 'save') { //移入收藏夹
                $productService.saveGoodsCollectCart({
                    goodsId: idList,
                    goodsInfo: collectList
                }).success(function(data) {
                    if (data.resultCode == "0000") {
                        toolTip('移入收藏夹成功');

                        deleteCheck();
                        //$timeout(function() {
                            //$window.location.reload(); //页面刷新
                        //}, 1500)

                        //allOrNot($scope.selfCheck,$scope.seflList,false,'huil');
                        //allOrNot($scope.jdCheck,$scope.jdList,false,'jd');
                        //$scope.selfAllCheck=false;
                        //$scope.jdAllCheck=false;
                        //$scope.allGoodsCheck=false;
                    } else if(data.resultCode=='1000'){
                        toolTip(data.resultMessage);

                        setTimeout(function(){
                            $state.go('login', {
                                state: "myCart"
                            });
                            /*$common.goUser({
                              state: 'myCart'
                            },'/myCart');*/
                        },800);
                    }
                })
            } else if (type == 'delete') { //删除
                $productService.deleteShoppingCartGoods({
                    cartGoodsIds: deleteListInfo
                }, localStorage.getItem("sinks-token")).success(function(data) {
                    if (data.resultCode == "0000") {
                        toolTip('删除成功');
                        deleteCheck();
                    }
                })
            } else if (type == 'set') { //结算
                sessionStorage.setItem('cartList', JSON.stringify(goodsList)) //储存要结算的购物车信息
                sessionStorage.removeItem('couponList'); //刷新已使用的优惠券信息储存
                if ($scope.noLogin) { //如果没有登录
                    $state.go('login', {
                        state: "confirm"
                    });
                } else {
                    $state.go('confirm'); //跳转去确认订单页面
                }
                $productService.doUserTrace({
                    channelId: sessionStorage.getItem('channelId'),
                    page: 'shoppingcartpage',
                    pageModule: idList,
                    pageValue: ''
                }).success(function(data) {

                })
            }
        };

        //后台移除后前端同步--当前
        function deleteCheckOne(index, list){
            var isChecked; //删除的是否为选中
            var matchNum; //第几个
            if( list.typeFrom == '1' ){
                $scope.num = $scope.num - $scope.selfList[index].goodsNum;

                //选中则修改总价
                if( $scope.selfCheck[index] === true){
                    var selfCheck = $scope.selfList[index];
                    var deletePrice = (selfCheck.goodsNum * selfCheck.salePrice).toFixed(2);
                    var deleteMonthPay = (selfCheck.goodsNum * selfCheck.monthRepayMoney).toFixed(2);
                    $scope.selfTotalMoney = parseFloat($scope.selfTotalMoney - deletePrice);
                    $scope.selfMonthRepayMoney = parseFloat($scope.selfMonthRepayMoney-deleteMonthPay);
                    $scope.totalMoney = $scope.jdTotalMoney + $scope.selfTotalMoney;
                    $scope.monthRepayMoney = $scope.jdMonthRepayMoney + $scope.selfMonthRepayMoney;
                }

                $scope.selfList.splice(index,1);
                $scope.selfCheck.splice(index,1);
            } else {
                $scope.num = $scope.num - $scope.jdList[index].goodsNum;

                //选中则修改总价
                if( $scope.jdCheck[index] === true){
                    var jdCheck = $scope.jdList[index];

                    var deletePrice = (jdCheck.goodsNum * jdCheck.salePrice).toFixed(2);
                    var deleteMonthPay = (jdCheck.goodsNum * jdCheck.monthRepayMoney).toFixed(2);
                    $scope.selfTotalMoney = parseFloat($scope.selfTotalMoney - deletePrice);
                    $scope.selfMonthRepayMoney = parseFloat($scope.selfMonthRepayMoney-deleteMonthPay);
                    $scope.totalMoney = $scope.jdTotalMoney + $scope.selfTotalMoney;
                    $scope.monthRepayMoney = $scope.jdMonthRepayMoney + $scope.selfMonthRepayMoney;
                }
                

                $scope.jdList.splice(index,1);
                $scope.jdCheck.splice(index,1);
            }

            setCartNum();
            setTimeout(function(){
                myIscroll3.refresh();
            },500);
        };
        $scope.delete = function(event, index, list) {
            $productService.deleteShoppingCartGoods({
                cartGoodsIds: [list.cartGoodsId]
            }, localStorage.getItem("sinks-token")).success(function(data) {
                if (data.resultCode == "0000") {
                    toolTip('删除成功');
                    deleteCheckOne(index, list);
                }
            });
        };

        $scope.collection = function(event, index, list) {
            var idList = list.goodsId;
            var goodsInfo = [{
                goodsId: list.goodsId,
                loanPeriods: list.loanPeriods,
                goodsAttrInfo: list.goodsAttrInfo
            }];
            $productService.saveGoodsCollectCart({
                goodsId: idList,
                goodsInfo: goodsInfo
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    toolTip('移入收藏夹成功');
                    deleteCheckOne(index, list);
                } else if(data.resultCode=='1000'){
                    toolTip(data.resultMessage);

                    setTimeout(function(){
                        $state.go('login', {
                            state: "myCart"
                        });
                    },800);
                }
            })
        };
        $scope.$on("ngRepeatFinished", function(repeatFinishedEvent, element) {
            if (myIscroll3) {
                myIscroll3.refresh();
            }
            
            $(".myCart-list-cont").not(".hasInit").each(function() {
                $(this).addClass("hasInit");
                var _this = $(this)[0];
                var btnWidth = $(this).find(".btnbox").width();
                var _box = $(this).find(".myCart-list-box").css({ "left": "0" })[0];
                var startLeft;
                var ismove, isShow;

                var pageX, pageY, clientX, clientY, distanceX, distanceY;
                var count = 0, countP = 0;
                var width = $(this).width();
                var height = $(this).height();

                function move(event) {
                    //限制移动间隔
                    if (ismove) { return; }
                    ismove = true;
                    setTimeout(function() { ismove = false; }, 50);

                    //阻止默认事件，防止拖动
                    //event.preventDefault();

                    //计算
                    var touche = event.changedTouches[0];
                    distanceX = touche.pageX - pageX;
                    distanceY = touche.pageY - pageY;

                    //手指划过微积分算法
                    var bas = countP;
                    count++;
                    countP = countP + 0.5 * distanceY * distanceY / distanceX;
                    var pAvg = countP / count;
                    var touchS = (2/3) * (2 * pAvg * distanceX) * Math.sqrt(2 * pAvg * distanceX);

                    var targetH = height;
                    var targetW = width;
                    var targetS = 0;
                    if((targetH / targetW) > 0.1405) { //触摸的元素宽高比问题,选择了tan8°做标准
                        targetS = (2/3) * (Math.abs(distanceX) * targetW * 0.0197) * Math.sqrt( Math.abs(distanceX) * targetW * 0.0197 );
                    } else {
                        targetS = (2/3) * ( targetH * targetH * Math.abs(distanceX) / targetW) * Math.sqrt( targetH * targetH * Math.abs(distanceX) / targetW);
                    }

                    //在指定曲线内 并 移动距离足够时移动
                    if (touchS < targetS && Math.abs(distanceX) > 40 ) {
                        event.preventDefault();
                        var left = distanceX + 40;
                        //限定移动范围
                        if (left > 0) {
                            left = 0;
                        } else if (left < -btnWidth) {
                            left = -btnWidth;
                        }
                        _box.style.left = left + "px";
                    }
                }

                function end(event) {
                    //1.移动距离不够，返回
                    //2.移动距离足够，移动指定位置，并记录展开对象
                    var left;
                    x = parseInt(_box.style.left);
                    if (startLeft == 0 && x < -btnWidth / 2) {
                        left = -btnWidth;

                        isShow = true;
                        document.addEventListener("touchstart", back, false);
                    } else {
                        left = startLeft;
                    }
                    _box.style.left = left + "px";
                    //盒子移除move事件
                    _box.removeEventListener("touchmove", move);
                    //document移除end事件
                    document.removeEventListener("touchend", end);
                }

                function start(event) {
                    //有展开对象, 结束
                    if (isShow) {
                        isShow = false;
                        return;
                    }

                    //记录startLeft 和 clientX
                    var touche = event.changedTouches[0];
                    pageX = touche.pageX;
                    pageY = touche.pageY;
                    clientX = touche.clientX;
                    clientY = touche.clientY;
                    count = 0;
                    countP = 0;
                    startLeft = parseInt(_box.style.left);

                    //盒子绑定move事件
                    _box.addEventListener("touchmove", move);

                    //给document绑定end事件
                    document.addEventListener("touchend", end);
                }

                function back(event) {
                    var target = event.changedTouches[0].target;
                    if ($(target).closest(".btnbox").length > 0) {
                        return;
                    }

                    $(_box).animate({ left: 0 });
                    document.removeEventListener("touchstart", back);
                    setTimeout(function() {
                        isShow = false;
                    }, 50);
                }

                function swipeDirection(x1, x2, y1, y2) {
                    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down');
                }

                _box.addEventListener("touchstart", start);
            });
        });
    }
});