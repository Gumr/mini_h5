/**
 * home.js
 * @authors Casper 
 * @date    2016/9/01
 * @version 1.0.0
 */

define(['angular', 'css!./goods.css', 'common/script/lib/swiper.min.js'], function(angular) {
    angular.module("app")
        .controller("goodsCtrl", goodsCtrl)
        .controller("setMealCtrl", setMealCtrl)
        .controller("dateSelectCtrl", dateSelectCtrl)
        /*--------------------商品详情-------------------*/
    goodsCtrl.$inject = ['$scope', '$state', '$stateParams', '$q', '$verifyService', '$timeout', '$tourismService', '$sce'];

    function goodsCtrl($scope, $state, $stateParams, $q, $verifyService, $timeout, $tourismService, $sce) {
        var vm = this;
        vm.goodsId = $stateParams.packagesId;
        $verifyService.SetIOSTitle("商品详情");
        vm.toAddressList = toAddressList;
        vm.Fenqi = Fenqi;
        vm.productName = [];
        vm.goodsList = [];
        vm.productClass = [];
        vm.getRecommend = [];
        vm.getTrip = [];
        vm.getChangeInfo = [];
        vm.getPackage = $stateParams.getPackage || "点击选择";
        vm.productInto = [];
        vm.Modift = Modift;
        vm.Mobye = Mobye;
        vm.warn = [];
        vm.changeInfo = [];
        vm.exclude = [];
        vm.include = [];
        vm.act = [];
        vm.price = [];
        vm.productStatus = [];
        vm.promotion = [];
        vm.goodId = [];
        vm.adultPrice = "";
        vm.fromPage = 'tourism-goodsDetail'
        var mainScroll = null;
        mainScroll = new IScroll(".main-content", { probeType: 3, preventDefault: false });
        mainScroll.on('scrollEnd', function() {
            var endY = (this.y - this.maxScrollY)
            if (endY < 100) {
                this.refresh();
            }
        });

        getProductAct()

        function getProductAct() {
            var wait = new waiting();
            $tourismService.getProductInfo({
                id: $stateParams.id,
            }).success(function(data) {
                vm.packageStatus = data.packageProduct.packageStatus;
                vm.productStatus = data.packageProduct.product[0].productStatus[0];
                if (vm.packageStatus == "true" && vm.productStatus == "true") {
                    vm.getPackage = "点击选择"
                } else {
                    vm.getPackage = "暂无行程"
                }
                if (data.packageProduct.isPackage == "false") {
                    vm.adultPrice = data.adultPrice;
                    vm.act = data.packageProduct;
                    for (var i = 0; i < $tourismService.type.length; i++) {
                        if ($tourismService.type[i].productClass == vm.act.product[0].productClass) {
                            vm.productClass = $tourismService.type[i].name == '周边游' ? '' : $tourismService.type[i].name + ' | ';
                        }
                    }
                    if (!vm.act.product[0].placeStart) {
                        vm.placeStart = vm.act.product[0].placeStart == undefined ? '' : vm.act.product[0].placeStart;
                    } else {
                        vm.placeStart = vm.act.product[0].placeStart + "出发"
                    }
                    if (vm.act.product[0].productInfo == null) {
                        vm.act.product[0].productInfo = $sce.trustAsHtml(vm.act.product[0].productInfo);
                    } else {
                        vm.act.product[0].productInfo[0] = $sce.trustAsHtml(vm.act.product[0].productInfo[0]);
                    }
                    if (vm.act.product[0].productAct == null) {
                        vm.productAct = vm.act.product[0].productAct
                    } else {
                        vm.productAct = vm.act.product[0].productAct[0].split(",");
                    }
                    vm.id = vm.act.product[0].productId == null ? vm.act.product[0].productId : vm.act.product[0].productId[0]
                    vm.price = data.marketPrice;
                    vm.goodsList = vm.act.product[0].productImage[0];
                    vm.productName = vm.act.product[0].productName == null ? vm.act.product[0].productName : vm.act.product[0].productName[0];
                    vm.getRecommend = vm.act.product[0].recommend == null ? vm.act.product[0].recommend : vm.act.product[0].recommend[0];
                    vm.getRecommend = vm.getRecommend.replace(/<br\/>/g, "");
                    vm.getTrip = vm.act.product[0].trips == null ? vm.act.product[0].trips : vm.act.product[0].trips[0].trip;
                    vm.exclude = vm.act.product[0].feeExclude[0];
                    vm.exclude = vm.exclude.replace(/<br\/>/g, "");
                    vm.include = vm.act.product[0].feeInclude[0];
                    vm.include = vm.include.replace(/<br\/>/g, "");
                    vm.warn = vm.act.product[0].warning;
                    vm.changeInfo = vm.act.product[0].changeInfo;
                    vm.productStatus = vm.act.product[0].productStatus;
                    vm.promotion = data.promotion;
                    vm.goodId = data.goodsId;
                    vm.stock = data.stock;
                } else if (data.packageProduct.isPackage == "true") {
                    vm.adultPrice = data.adultPrice;
                    vm.act = data.packageProduct;
                    for (var i = 0; i < $tourismService.type.length; i++) {
                        if ($tourismService.type[i].productClass == vm.act.product[0].productClass) {
                            vm.productClass = $tourismService.type[i].name == '周边游' ? '' : $tourismService.type[i].name + ' | ';
                        }
                    }
                    vm.id = vm.act.product[0].productId[0];
                    if (vm.act.product[0].productAct == null) {
                        vm.productAct = vm.act.product[0].productAct
                    } else {
                        vm.productAct = vm.act.product[0].productAct[0].split(",");
                    }
                    if (vm.act.product[0].trips == null) {
                        vm.getTrip = vm.act.product[0].trips
                    } else {
                        vm.getTrip = vm.act.product[0].trips[0].trip;
                    }
                    vm.price = data.marketPrice;
                    vm.goodsList = vm.act.product[0].productImage[0];
                    vm.productName = vm.act.product[0].productName[0];
                    vm.getRecommend = vm.act.product[0].recommend[0];
                    vm.getRecommend = vm.getRecommend.replace(/<br\/>/g, "");
                    vm.exclude = vm.act.product[0].feeExclude[0];
                    vm.exclude = vm.exclude.replace(/<br\/>/g, "");
                    vm.include = vm.act.product[0].feeInclude[0];
                    vm.include = vm.exclude.replace(/<br\/>/g, "");
                    vm.act.product[0].productInfo[0] = $sce.trustAsHtml(vm.act.product[0].productInfo[0]);
                    vm.warn = vm.act.product[0].warning[0];
                    vm.changeInfo = vm.act.product[0].changeInfo[0];
                    vm.productStatus = vm.act.product[0].productStatus[0];
                    vm.promotion = data.promotion;
                    vm.goodId = data.goodsId;
                    vm.stock = data.stock;
                }
                if (data.promotion == null) {
                    $('.num').hide()
                }
                $timeout(function() {
                    var bannerSlide = new Swiper('.bannerSlide', {
                        loop: true,
                        autoplay: 4000,
                        autoplayDisableOnInteraction: false,
                        pagination: '.swiper-pagination'
                    });
                }, 200)
                wait.hide();
            })
        }
        vm.tabs = tabss;

        function tabss(myevent) {
            tabs(myevent, function() {
                $timeout(function() {
                    mainScroll.refresh();
                }, 300)
            })
        }
        //console.log($tourismService.type)
        function Modift() {
            var verificationDialog = new dialog().alert({
                content: '<div class="wrap">' + vm.warn + "</div>",
                confirmBtnText: '关闭'
            })
            $('.dialog-content').css('height', '64%');
            $('.bottom ').css('position', 'absolute', 'bottom', '0').css('bottom', '0').css('width', '100%');
            var mainScroll = scroll('.dialog-content');
        }
        //		
        function Mobye() {
            var verificationDialog = new dialog().alert({
                content: '<div class="wrap">' + vm.changeInfo + "</div>",
                confirmBtnText: '关闭'
            })

            /*$timeout(function(){
            	var mainScroll = scroll('.dialog-content .wrap');
            },200)*/
        }
        $timeout(init, 300)

        function init() {
            // 详情tbas
            vm.changes = changes;

            function changes(myevent) {
                tabs(myevent, function() {
                    $timeout(function() {
                        mainScroll.refresh();
                    }, 300)
                })
            }
        }

        function toAddressList() {
            if (vm.packageStatus != "true" || vm.productStatus != "true") {
                toolTip("暂无行程")
            } else {
                $state.go('tourism-setMeal', {
                    id: $stateParams.id,
                }, {
                    location: 'replace'
                })
            }
        }

        function Fenqi() {
            if (vm.packageStatus != "true" || vm.productStatus != "true") {
                toolTip("暂无行程")
            } else {
                var wait = new waiting();
                $tourismService.checkUserLogin({}).success(function(data) {
                    if (data.response.code[0] == "2") {
                        $state.go('login', {
                            flog: vm.fromPage,
                            id: $stateParams.id,
                            selected: $stateParams.getPackage
                        }, {
                            location: 'replace'
                        })
                    } else if (vm.getPackage == "点击选择") {
                        $state.go('tourism-setMeal', {
                            id: $stateParams.id,
                        })
                    } else {
                        $state.go('tourism-order', {
                            id: $stateParams.id
                        })
                    }
                    wait.hide();
                })
            }
        }

    }
    /*--------------------选择套餐-------------------*/
    setMealCtrl.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$productService', '$timeout', '$tourismService', '$window', '$customerService'];

    function setMealCtrl($scope, $state, $stateParams, $verifyService, $productService, $timeout, $tourismService, $window, $customerService) {
        $verifyService.SetIOSTitle("选择套餐");
        var mainScroll = scroll('.main-content');
        var vm = this;
        vm.momo = true;
        vm.goodsNum = 1; //默认大人数
        vm.childNum = 0; //默认小孩数
        vm.houseNum = 1;
        vm.childNumMinus = childNumMinus;
        vm.childNumAdd = childNumAdd;
        vm.todateSelect = todateSelect;
        vm.setFood = setFood;
        vm.isChild = true; //是否有小孩价
        vm.goDate = $stateParams.date || "请选择";
        vm.bigNum = 1
        vm.bigNumMinus = bigNumMinus;
        vm.bigNumAdd = bigNumAdd;
        $scope.sign = '';
        $scope.token = localStorage.getItem('sinks-token');
        $scope.mobile = localStorage.getItem('$$payload');
        if ($scope.mobile) {
            $scope.mobile = JSON.parse(localStorage.getItem('$$payload'));
            sign();
        }
        //判断session是否有值，如有以session的值为准赋默认值
        var orderbasInfo = sessionStorage.orderbasInfo
        if (orderbasInfo) {
            orderbasInfo = JSON.parse(orderbasInfo)
            if ($stateParams.id == orderbasInfo.packageId) {
                vm.goDate = orderbasInfo.visitDate;
                vm.goodsNum = orderbasInfo.goodsNum;
                vm.childNum = orderbasInfo.childNum;
                vm.houseNum = orderbasInfo.houseNum;
                vm.goodsM = orderbasInfo.goodsMoney;
                vm.visitdata = orderbasInfo.visitDate;
            }
        }

        init();

        function init() {
            //检查url上是否有值，如有以url的值为准赋默认值
            vm.goDate = $stateParams.date != null ? $stateParams.date : vm.goDate;
            vm.goodsNum = $stateParams.goodsNum != null ? parseInt($stateParams.goodsNum) : vm.goodsNum;
            vm.childNum = $stateParams.childNum != null ? parseInt($stateParams.childNum) : vm.childNum;
            vm.houseNum = $stateParams.houseNum != null ? parseInt($stateParams.houseNum) : vm.houseNum;
            //商品信息
            getProductName();
        }

        //儿童价说明
        $scope.children = function() {
            new dialog().alert({
                content: "<h2 style='color:#000;margin-bottom:0.5rem;font-size:0.5rem'>儿童价说明</h2><p>12周岁以下为小童,12岁（含12岁）以上必须占床,占床与成人同价</p>",
                confirmBtnText: '我知道了',
                confirmBtn: function() {

                }
            })
            $('.content').css('text-align', 'center');
            $('.content').css('font-size', '0.4rem');
        }

        //房差说明
        $scope.difference = function() {
                new dialog().alert({
                    content: "<h2 style='color:#000;margin-bottom:0.5rem;font-size:0.5rem'>房差说明</h2><p>本产品是两人共住一间核算的价格，当出游人数为单数或者有需要单独住一间房时需补全差价</p>",
                    confirmBtnText: '我知道了',
                    confirmBtn: function() {

                    }
                })
                $('.content').css('text-align', 'center');
                $('.content').css('font-size', '0.4rem');
            }
            //按套餐增减
        function childNumAdd(type) {
            if (type == "houseNum") {
                if (vm.houseNum < vm.maxRoom) {
                    vm.houseNum = vm.houseNum + vm.roomMax;
                    getPrice();
                }
            } else {
                if (vm.totalNum < vm.max) {
                    if (type == "goodsNum") {
                        vm.goodsNum++;
                        getPrice('goodsNum');
                    } else if (type == "childNum") {
                        vm.childNum++;
                        getPrice();
                    }
                } else {
                    toolTip("最大订购人数为：" + vm.max)
                }
            }
        }

        function childNumMinus(type) {
            if (type == "goodsNum") {
                if (vm.goodsNum > 1) {
                    vm.goodsNum--;
                    getPrice('goodsNum');
                }

            } else if (type == "childNum") {
                if (vm.childNum > 0) {
                    vm.childNum--;
                    getPrice();
                }
            } else if (type == "houseNum") {
                if (vm.houseNum > vm.RoomDifference) {
                    vm.houseNum = vm.houseNum - vm.roomMax;
                    getPrice();
                }
            }

        }

        //按份数增减
        function bigNumAdd() {
            if (vm.max > vm.bigNum && vm.bigNum >= vm.min) {
                vm.bigNum = vm.bigNum + 1;
                setprice();
            } else {
                toolTip("最大订购人数为：" + vm.max);
            }
        }

        function bigNumMinus() {
            if (vm.bigNum > vm.min) {
                vm.bigNum = vm.bigNum - 1;
                setprice();
            } else {
                toolTip("最小订购人数为：" + vm.min);
            }
        }

        //获取sign
        function sign() {
            $customerService.getSign({
                mobile: $scope.mobile.mobile
            }).success(function(data) {
                if (data.resultCode == '00') {
                    $scope.sign = data.sign;
                }
            })
        }
        //绑卡
        function Card() {
            new dialog().confirm({
                content: "您还尚未绑定银行卡，赶紧去绑卡吧！",
                confirmBtn: function() {
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href) + '&toBankCard=y';
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
            $('.content').css('height', 'inherit')
        }
        //激活
        function activation() {
            new dialog().confirm({
                content: "您的信用额度尚未激活，赶紧去激活吧！",
                confirmBtn: function() {
                    location.href = httpsHeader + '/mall/insideCustAction/authorizationInfo.action?mobile=' + parseInt($scope.mobile.mobile) + '&sign=' + $scope.sign + '&channelId=' + sessionStorage.channelId + '&authorication=' + $scope.token + '&returnUrl=' + encodeURIComponent(window.location.href);
                }
            })
            $('.content').css('text-align', 'center')
            $('.content').css('font-size', '0.4rem')
            $('.content').css('height', 'inherit')
        }


        //确认套餐
        function setFood() {
            sessionStorage.setItem("id", $stateParams.id)
            if (vm.totalNum >= vm.min || vm.bigNum > 0) {
                if (vm.goDate != "请选择") {
                    if (vm.stock < vm.totalNum) {
                        toolTip("库存不足")
                    } else {
                        var orderInfo = {};
                        if (vm.isPackage == "false") {
                            orderInfo.partnerOrderNo = "";
                            orderInfo.packageId = vm.packageId;
                            orderInfo.visitDate = vm.goDate;
                            orderInfo.orderNum = "1";
                            orderInfo.orderMoney = vm.totalPrice;
                            orderInfo.adultNum = vm.goodsNum;
                            orderInfo.childNum = vm.childNum;

                            if (vm.roomPrice == 0) {
                                vm.houseNum = vm.roomPrice;
                                vm.minRoom = vm.roomPrice
                                orderInfo.room = vm.minRoom;
                                orderInfo.roomCount = vm.houseNum;
                                orderInfo.houseNum = vm.houseNum;
                                orderInfo.goodsId = vm.goodsId;
                                orderInfo.goodsNum = vm.goodsNum;
                                orderInfo.goodsMoney = vm.totalPrice;
                                orderInfo.totalMoney = vm.totalPrice;
                            } else {
                                orderInfo.room = vm.minRoom;
                                orderInfo.roomCount = vm.houseNum;
                                orderInfo.houseNum = vm.houseNum;
                                orderInfo.goodsId = vm.goodsId;
                                orderInfo.goodsNum = vm.goodsNum;
                                orderInfo.goodsMoney = vm.totalPrice;
                                orderInfo.totalMoney = vm.totalPrice;
                            }

                        } else if (vm.isPackage == "true") {
                            orderInfo.partnerOrderNo = "";
                            orderInfo.packageId = vm.packageId;
                            orderInfo.visitDate = vm.goDate;
                            orderInfo.orderNum = vm.bigNum;
                            orderInfo.orderMoney = vm.totalPrice;
                            orderInfo.adultNum = vm.mari * vm.bigNum;
                            orderInfo.childNum = vm.child * vm.bigNum;
                            orderInfo.room = vm.bigNum;
                            /*orderInfo.houseNum = vm.roomPrice;*/
                            orderInfo.goodsNum = vm.goodsNum;
                            orderInfo.goodsMoney = vm.totalPrice;
                        }
                        var wait = new waiting();
                        $tourismService.checkUserCreditLine({
                            goodsMoney: vm.mata
                        }).success(function(data) {
                            wait.hide();
                            if (data.response.state[0].code == "10") {
                                $state.go('login', {
                                    flog: 'tourism-setMeal',
                                    id: $stateParams.id,
                                    date: $stateParams.date,
                                    adultPrice: $stateParams.adultPrice
                                }, {
                                    location: 'replace'
                                })
                            } else if (data.response.state[0].code == "4") {
                                activation()
                            } else if (data.response.state[0].code == "6") {
                                Card()
                            } else if (data.response.state[0].code == "1") {
                                $window.sessionStorage.setItem('orderbasInfo', JSON.stringify(orderInfo));
                                $state.go('tourism-order', {
                                    id: $stateParams.id
                                }, {
                                    location: 'replace'
                                })
                                if ($stateParams.flog == 'tourism-order') {
                                    $state.go('tourism-order', {
                                        id: $stateParams.id,
                                        flog: $stateParams.flog,
                                        stages: $stateParams.stages
                                    }, {
                                        location: 'replace'
                                    })
                                }
                            } else {
                                toolTip(data.response.state[0].resultMessage[0])
                            }
                        })
                    }
                } else {
                    toolTip("请选择出发日期")
                }
            } else {
                toolTip("最小订购人数为：" + vm.min);
            }
        }

        //获取商品信息
        function getProductName() {
            var wait = new waiting();
            $tourismService.getProductInfo({
                id: $stateParams.id
            }).success(function(data) {
                vm.mata = data.adultPrice;
                vm.mari = data.packageProduct.adultNum;
                vm.child = data.packageProduct.childNum;
                var date = data.packageProduct;
                var childprice = data.childPrice;
                vm.childPrice = data.childPrice
                vm.productName = date.product[0].productName[0]; //商品名称
                if (JSON.stringify(date.product[0].productImage[0]) != "{}") {
                    vm.img = date.product[0].productImage[0].url[0]; //商品图片
                }
                vm.packageId = date.packageId[0]; //路线ID
                vm.getPackage = date.packageName; //线路套餐
                vm.roomMax = parseInt(date.roomMax[0]); //房间最大入住数
                vm.max = parseInt(date.max[0]); //最大订购量
                vm.min = parseInt(date.min[0]); //最小订购量
                vm.isPackage = date.isPackage[0] //是否为套餐
                vm.houseNum = vm.houseNum || vm.goodsNum % vm.roomMax; //默认房差数
                vm.day = date.product[0].day;

                if (vm.isPackage == 'false') {
                    //按人
                    if (vm.childPrice == '0') {
                        vm.momo = false
                    } else {
                        vm.momo = true
                    }
                    if (vm.goDate != "请选择") {
                        vm.marketPrice = $stateParams.marketPrice || data.marketPrice; //市场价
                        vm.roomPrice = $stateParams.roomPrice || data.roomPrice //房差价
                        vm.adultPrice = $stateParams.adultPrice || data.adultPrice; //成人价
                        vm.childPrice = $stateParams.childPrice || data.childPrice; //小孩价
                        vm.stock = $stateParams.stock || data.stock; //库存
                    } else {
                        vm.marketPrice = data.marketPrice; //市场价
                        vm.roomPrice = data.roomPrice; //房差价
                        vm.adultPrice = data.adultPrice; //成人价
                        vm.childPrice = data.childPrice; //小孩价
                        vm.stock = 0; //库存
                    }
                    //判断是否可以选择带下小孩
                    if (vm.childPrice == 'null') {
                        vm.isChild = false;
                        vm.childPrice = 0;
                    }
                    getPrice();
                } else if (vm.isPackage == 'true') {
                    //按份
                    if (vm.goDate != "请选择") {
                        vm.marketPrice = $stateParams.marketPrice || data.marketPrice; //市场价
                        vm.adultPrice = $stateParams.adultPrice || data.adultPrice; //成人价
                        vm.stock = $stateParams.stock || data.stock; //库存
                    } else {
                        vm.marketPrice = data.marketPrice; //市场价
                        vm.adultPrice = data.adultPrice; //成人价
                        vm.stock = 0; //库存
                    }
                    setprice();
                }
                wait.hide();
            })
        }

        //套餐价格计算
        function setprice() {
            vm.totalPrice = (vm.adultPrice || $stateParams.adultPrice * vm.bigNum) || vm.goodsM //总价计算
        }

        //价格计算
        var firstCount = true;

        function getPrice(type) {
            vm.totalNum = vm.goodsNum + vm.childNum; //总人数
            vm.minRoom = Math.ceil(vm.goodsNum / vm.roomMax); //最小房间数
            vm.maxRoom = vm.goodsNum; //最大房间数
            vm.RoomDifference = vm.minRoom * vm.roomMax - vm.goodsNum; //最少房差
            if (type == 'goodsNum') {
                vm.houseNum = vm.RoomDifference; //房差数
            }
            var a = parseInt(vm.adultPrice || $stateParams.adultPrice) * vm.goodsNum;
            var b = vm.childNum * vm.childPrice;
            var e = parseInt(b)
            var f = parseInt(vm.roomPrice)
            var c = vm.houseNum * f;


            vm.totalPrice = (a + e + c) || vm.goodsM; //总价计算
        }


        //跳转日期选择
        function todateSelect() {
            $state.go('tourism-dateSelect', {
                id: $stateParams.id,
                fromPage: "tourism-setMeal",
                goodsNum: vm.goodsNum,
                childNum: vm.childNum,
                houseNum: vm.houseNum,
                stages: $stateParams.stages,
                flog: $stateParams.flog
            }, {
                location: 'replace'
            })
        }

    }



    /*--------------------日期-------------------*/
    dateSelectCtrl.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$productService', '$timeout', '$tourismService'];

    function dateSelectCtrl($scope, $state, $stateParams, $verifyService, $productService, $timeout, $tourismService) {
        $verifyService.SetIOSTitle("日期");
        var goodId = $stateParams.id;
        var today = new Date();
        var currYear = today.getFullYear();
        var currMonth = today.getMonth();
        var logicMonth = currMonth;
        $scope.dataList = [];


        //初始化
        init()

        function init() {
            refreshcalenda();
        }

        //上一月
        $scope.prev = function() {
            logicMonth--;
            if (logicMonth < currMonth) {
                logicMonth = currMonth;
                return;
            }
            refreshcalenda()
        }

        //下一月
        $scope.next = function() {
            logicMonth++;
            refreshcalenda()
        }

        //选择日期并返回上一个页面
        $scope.selectedDate = function(myevent, index) {
            var el = $(myevent.currentTarget);
            console.log($scope.dataList[index].price)
            if (el.hasClass('selectable')) {
                el.addClass('active').siblings().removeClass('active');

                var selectDay = el.find('span').text();
                selectDay = selectDay < 9 ? '0' + selectDay : selectDay;
                if ($stateParams.fromPage) {
                    $state.go($stateParams.fromPage, {
                        id: goodId,
                        date: $scope.year + '-' + $scope.month + '-' + selectDay,
                        goodsNum: $stateParams.goodsNum,
                        childNum: $stateParams.childNum,
                        houseNum: $stateParams.houseNum,
                        stages: $stateParams.stages,
                        flog: $stateParams.flog,
                        adultPrice: $scope.dataList[index].aprice,
                        marketPrice: $scope.dataList[index].mprice,
                        childPrice: $scope.dataList[index].cprice,
                        stock: $scope.dataList[index].stock,
                        roomPrice: $scope.dataList[index].rprice
                    })
                }
            }
        }

        //更新日历
        function refreshcalenda() {
            var myDate = new Date(currYear, logicMonth, 1), //获取该月第1日     
                week = myDate.getDay(), //获取该月第1日的星期  
                year = myDate.getFullYear(), //获取年份
                month = myDate.getMonth(), //获取月份
                day = myDate.getDate(), //获取日
                dayCount = new Date(currYear, logicMonth + 1, 0).getDate(), //该月总天数
                dataList = []; //页面显示的每日数据
            $scope.year = year; //页面显示的年份
            $scope.month = month + 1 > 9 ? month + 1 : '0' + (month + 1); //页面显示的月份

            //该月第1日所属星期之前的空数据
            for (var i = 0; i < week; i++) {
                var obj = {};
                obj.day = '';
                obj.price = '';
                obj.class = '';
                dataList.push(obj);
            }

            //获取商品价格信息
            var wait = new waiting();
            $tourismService.getPriceInfo({
                id: goodId,
                beginDate: year + '-' + $scope.month + '-0' + day,
                endDate: year + '-' + $scope.month + '-' + dayCount
            }).success(function(re) {
                var data = re.response;
                if (data.state[0].code[0] == '1000') {
                    var priceList = data.priceList[0].price;
                    //该月每日数据
                    for (var i = 1; i <= dayCount; i++) {
                        var obj = {};
                        obj.day = i;
                        if (priceList && priceList.length) {
                            for (var n = 0; n < priceList.length; n++) {
                                var d = priceList[n].date[0];
                                var b = priceList[n].stock[0];
                                if (d.substring(d.lastIndexOf('-') + 1) == i && b > 0) {
                                    obj.price = '￥' + priceList[n].adultPrice[0];
                                    obj.aprice = priceList[n].adultPrice;
                                    obj.mprice = priceList[n].marketPrice;
                                    obj.cprice = priceList[n].childPrice;
                                    obj.stock = priceList[n].stock;
                                    obj.rprice = priceList[n].roomPrice
                                    obj.class = 'selectable';
                                    break;
                                } else {
                                    obj.stock = '';
                                    obj.cprice = '';
                                    obj.price = '';
                                    obj.class = '';
                                    obj.mprice = '';
                                }
                            }
                        }
                        dataList.push(obj)
                    }
                } else {
                    toolTip(data.state[0].solution[0])
                }
                wait.hide();
            })
            $scope.dataList = dataList;
        }
    }
})