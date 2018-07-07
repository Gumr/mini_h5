/**
 * app.service.js
 * @authors Casper
 * @date    2015/12/22
 * @version 1.0.0
 */


//测试环境地址
// var httpsHeader = "https://thsh.funsales.com";
//测试环境图片地址
// var imgUrl = "https://kfhsh.funsales.com/";
var pdfUrl = "http://n1.hlej.com/skldnfoweh/wsejhiqwlg"
    //线上图片访问
var imgUrl = "https://image.funsales.com/";
//京东图片地址
var jdImaUrl = "https://img13.360buyimg.com/";
var $AuthTokenName = 'sinks-token',
    $AuthTokenTimeout = 'sings-token-timeout'

//线上地址
var httpsHeader = "https://www.funsales.com";

//注册过滤接口
var httpsHeaderf = "https://user.hlej.com/risk";
var postCfg = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: function(data) {
        return $.param(data);
    }
};

define(['angular'], function() {
    angular.module('app.service', [])
        .service('$verifyService', $verifyService)
        .service('$homeService', $homeService)
        .service('$userService', $userService)
        .service('$productService', $productService)
        .service('$investService', $investService)
        .service('$common', $common)
        .service('$address', $address)
        .service('$easyPayService', $easyPayService)
        .service('$tourismService', $tourismService)
        .service('$customerService', $customerService)
        .service('$cardService', $cardService)
    $verifyService.$inject = [];

    function $verifyService() {
        return {
            isPhoneNum: function(tel) {
                return /^1[3456789]\d{9}$/.test(tel);
            },
            isFixedPhone: function(tel) {
                return /0[1-9]\d{1,2}-?[1-9]\d{6,7}/.test(tel);
            },
            isBankCardNo: function(cardNo) {
                return /^(\d{16}|\d{19})$/.test(cardNo);
            },
            isTradePwd: function(pwd) {
                return /^[\x21-\x7E]{6,20}$/.test(pwd) && !/^\d+$/.test(pwd);
            },
            isLoginPwd: function(pwd) {
                return pwd.length >= 6 && pwd.length <= 20;
            },
            isEmail: function(email) {
                return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(email);
            },
            isMoney: function(money) {
                return /^([1-9][\d]{0,14}|0)(\.[\d]{1,2})?$/.test(money);
            },
            isId: function(id) {
                return /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(id);
            },
            isBuildingMoney: function(money) {
                return /^([1-9][\d]{0,14}|0)(\.[\d]{1,2})?$/.test(money);
            },
            isPassport: function(money) { //护照
                return /^[a-zA-Z0-9]{5,17}$/.test(money);
            },
            isCertificate: function(money) { //军官证
                return /^[a-zA-Z0-9]{7,21}$/.test(money);
            },
            isHongkongat: function(money) { //港澳通行证
                return /^[a-zA-Z0-9]{5,21}$/.test(money);
            },
            SetIOSTitle: function(titleName) {
                if (window.sessionStorage.getItem('channelId') != "2989213940") {
                    var $body = $('body');
                    document.title = titleName;
                    //hack在微信等webview中无法修改document.title的情况
                    var $iframe = $('<iframe src="/favicon.ico"></iframe>');
                    $iframe.on('load', function() {
                        setTimeout(function() {
                            $iframe.off('load').remove();
                        }, 0);
                    }).appendTo($body);
                }
            },
            getQueryParam: function(name) {
                //解析url参数
                //参数：变量名，url为空则表从当前页面的url中取
                var u = location.hash;
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
                    r = u.substr(u.indexOf("\?") + 1).match(reg);
                return r != null ? r[2] : "";
            },
            getGrowing: function(userId, mobile) {
                _vds.push(['setCS1', 'userId', userId]);
                _vds.push(['setCS2', 'mobile', mobile]);
            },
            setGrowing: function(name, goodsid, brandName, price, time) {
                _vds.push(['setPageGroup', name]);
                _vds.push(['setPS1', goodsid]);
                _vds.push(['setPS2', brandName]);
                _vds.push(['setPS3', price]);
                _vds.push(['setPS4', time]);
            },
        };
    }

    $common.$inject = ['$state', '$location', '$userService', '$timeout'];

    function $common($state, $location, $userService, $timeout) {
        return {
            goUser: function(stateParams, obj) {
                $state.go('login', stateParams, {
                    location: (typeof obj === 'string' ? $location.path() === obj : obj) ? 'replace' : true,
                    id: sessionStorage.id,
                    fromPage: 'tourism-invoice',
                    businessType: sessionStorage.getItem('businessType')
                });
            }
        }
    }
    $homeService.$inject = ['$http', '$window'];

    function $homeService($http, $window) {
        return {
            /*
            typeContent : [
              //         {name:"手机",src:"home/images/icon-home (2).png",id:"737",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/mobile_parallel/index.html"},
                    {name:"手机",src:"home/images/icon-home (2).png",id:"737",href:"#/productList?oneLevelId=9987&listMark=手机"},
              //          {name:"数码",src:"home/images/icon-home (3).png",id:"652",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/numeral/index.html"},
                    {name:"数码",src:"home/images/icon-home (3).png",id:"652",href:"#/productList?oneLevelId=652&listMark=数码"},
                    {name:"iPhone专区",src:"home/images/icon-home (11).png",id:"seg",href:"#/search?keywords=iPhone"},
                    
              //        {name:"双11",src:"home/images/icon-home (41).png",id:"670",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/mobile_parallel/index.html"},
              //         {name:"双11",src:"home/images/icon-home (41).png",id:"670",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/carnival/index.html"},
                        {name:"电脑办公",src:"home/images/icon-home (4c).png",id:"seg",href:"#/productList?oneLevelId=670&listMark=电脑办公"},
                      //{name:"奢侈品",src:"home/images/icon-home (6).png",id:"seg",href:"#/productList?oneLevelId=1672&listMark=奢侈品"}
                      {name:"美妆个护",src:"home/images/icon-home (12).png",id:"seg",href:"#/search?keywords=%E7%BE%8E%E5%A6%86%E4%B8%AA%E6%8A%A4"}
              //          {name:"奢侈品",src:"home/images/icon-home (6).png",id:"seg",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/entry/index.html"}
                      ],
                      classContent : [
                       // {name:"家具家装",src:"home/images/icon-home (7).png",id:"737",href:"#/productList?oneLevelId=9847&listMark=家具家装"},
                        {name:"珠宝",src:"home/images/icon-home (13).png",id:"seg",href:"#/search?keywords=%E7%8F%A0%E5%AE%9D"},
                        {name:"家居厨具",src:"home/images/icon-home (8).png",id:"lx",href:"#/productList?oneLevelId=1620&listMark=家居厨具"},
              //          {name:"家用电器",src:"home/images/icon-home (9).png",id:"670",href:"https://www.funsales.com/ActivityProject/DbElevenVenue/appliances/index.html"},
                    {name:"家用电器",src:"home/images/icon-home (9).png",id:"737",href:"#/productList?oneLevelId=737&listMark=家用电器"},
                        {name:"钟表",src:"home/images/icon-home (10).png",id:"seg",href:"#/productList?oneLevelId=5025&listMark=钟表"},
                        {name:"母婴",src:"home/images/icon-home (5).png",id:"seg",href:"#/productList?oneLevelId=1319&listMark=母婴"},
                      ],
            */
            typeContent: [
                { name: "手机", src: "home/images/icons-11.jpg", id: "737", href: "#/innerPhone?oneLevelId=9987&listMark=手机" },
                { name: "数码", src: "home/images/icons-12.jpg", id: "652", href: "#/numerical?oneLevelId=652&listMark=数码" },
                { name: "电脑办公", src: "home/images/icons-13.jpg", id: "seg", href: "#/innerBrain?oneLevelId=670&listMark=电脑办公" },
                { name: "轻奢", src: "home/images/icons-14.png", id: "seg", href: httpsHeader+"/ActivityProject/luxury2017/index.html" },
                { name: "美妆个护", src: "home/images/icons-22.jpg", id: "seg", href: "#/beauty?oneLevelId=1316&listMark=美妆" }
            ],
            classContent: [
                { name: "珠宝", src: "home/images/icons-21.jpg", id: "seg", href: "#/innerJewellery?oneLevelId=6144&listMark=珠宝" },
                // { name: "家居厨具", src: "home/images/icons-17.jpg", id: "lx", href: "#/productList?oneLevelId=1620&listMark=家居厨具" },
                { name: "汽车用品", src: "home/images/icons-23.png", id: "lx", href: httpsHeader+"/ActivityProject/car_season/index.html" },
                { name: "家用电器", src: "home/images/icons-18.jpg", id: "737", href: "#/appliancesProductList?oneLevelId=737&listMark=家用电器" },
                { name: "钟表", src: "home/images/icons-19.jpg", id: "seg", href: "#/innerWatch?oneLevelId=5025&listMark=钟表" },
                { name: "iPhone专区", src: "home/images/icons-20.jpg", id: "seg", href: httpsHeader+"/ActivityProject/seckill/index.html" },
            ],
            getHomeList: function(data) { //首页图片请求
                return $http.post(httpsHeader + "/mall/hshBannerAction/getPageOptionBanner.action", data);
            },
            getProvince: function() { //省
                return $http.post(httpsHeader + "/mall/addressApi/findProvince.action");
            },
            getCity: function(data) { //市
                return $http.post(httpsHeader + "/mall/addressApi/findCity.action", data);
            },
            getCounty: function(data) { //市
                return $http.post(httpsHeader + "/mall/addressApi/findCounty.action", data);
            },
            getTown: function(data) { //市
                return $http.post(httpsHeader + "/mall/addressApi/findTown.action", data);
            },
            getBrandsByTop: function(data) { //市
                return $http.post(httpsHeader + "/mall/brandAction/getBrandsByTop.action", data);
            },
            locateAddress: function() { //定位
                return $http.post(httpsHeader + "/mall/addressApi/locateAddress.action");
            },
            modifyLocateAddress: function(data) { //定位
                return $http.post(httpsHeader + "/mall/addressApi/modifyLocateAddress.action", data);
            },
            getHomeSpikeInfo: function(data) { //秒杀
                return $http.post(httpsHeader + "/mall/spikeBuyApi/getHomeSpikeInfo.action", data);
            },
            getYourlikeInfo: function(data) {
                return $http.get(httpsHeader + "/mall/activityGoodsCommonApi/getActivityGoodsList.action?activityId=" + data);
                //return $http.get("https://www.funsales.com"+"/mall/activityGoodsCommonApi/getActivityGoodsList.action?activityId="+data);
            }
        }
    }

    $userService.$inject = ['$http', '$window', '$state'];

    function $userService($http, $window, $state) {
        function get() {
            var token = $window.localStorage.getItem($AuthTokenName);
            if (token) {
                return token;
            }
            return null;
        }
        $service = {
            $$channelId: $window.sessionStorage.getItem('channelId'),
            $$payload: null,
            checkLoginState: function(auth) {

                return $http.post(httpsHeader + "/mall/loginAction/checkLoginState.action", null, {
                    headers: {
                        Authorication: auth,
                    }
                }).success(function(data) {
                    if (data.resultCode != "0000") {
                        $window.localStorage.removeItem($AuthTokenName);
                        //$window.location.herf="#/login";
                        //$state.go('login', stateParams, {
                        //    location: (typeof obj === 'string' ? $location.path() === obj : obj) ? 'replace' : true
                        //});
                        //$state.go("login", null, {
                        //    location: 'replace'
                        //});
                    } else {
                        
                    }
                })
            },
            getAllHshCustInfo: function(auth) {

                return $http.post(httpsHeader + "/mall/hshCustAction/getAllHshCustInfo.action", null, {
                    headers: {
                        Authorication: auth
                    }
                }).success(function(data) {
                    if (data.resultCode != "0000") {
                        $window.localStorage.removeItem($AuthTokenName);
                    } else {
                        var $$payload = {};
                        $$payload.id = data.result.userInfo.id;
                        $$payload.mobile = data.result.userInfo.mobile;
                        $$payload.realName = data.result.userInfo.realName;
                        $$payload.hlejCustId = data.result.userInfo.hlejCustId;
                        $window.localStorage.setItem("$$payload", JSON.stringify($$payload));
                        localStorage.setItem('phoneNum',data.result.userInfo.mobile)
                        if(!sessionStorage.getItem('channelId')){
                            sessionStorage.setItem('channelId','1000013001')
                        }
                    }
                })
            },
            login: function(data, config) {
                return $http.post(httpsHeader + "/mall/custlogOrRegAction/custLogin.action", data, config).success(function(data, status, headers, config) {
                    if (data.resultCode == "0000") {
                        data = eval(data);
                        $window.localStorage.setItem($AuthTokenName, headers('Authorication'));
                    }
                })
            },
            codeLogin: function(data, config) {
                return $http.post(httpsHeader + "/mall/custlogOrRegAction/custLoginByVerifyCode.action", data, config).success(function(data, status, headers, config) {
                    if (data.resultCode == "0000") {
                        data = eval(data);
                        $window.localStorage.setItem($AuthTokenName, headers('Authorication'));
                    }
                })
            },
            deLayPwdModify: function(data, config) {
                return $http.post(httpsHeader + "/mall/custCodesAction/deLayPwdModify.action", data, { headers: config })
            },
            isAuthenticated: function() {
                var payload = get();
                if (payload) {
                    return true;
                }
                return false;
            },
            regist: function(data) { //注册
                return $http.post(httpsHeader + "/mall/custlogOrRegAction/custRegist.action", data).success(function(data, status, headers, config) {
                    if (data.resultCode == "0000") {
                        data = eval(data);
                        $window.localStorage.setItem($AuthTokenName, headers('Authorication'));
                    }
                })
            },
            registSD: function(data) { //注册
                return $http.post(httpsHeaderSD + "/mall/vendingRegist/custRegist.action", data)
            },
            registDraw: function(data) { //注册送抽奖 扫码充值抽奖
                return $http.post(httpsHeader + "/mall/vendLuckydrawActivityAction/getLuckydrawTime.action", data)
            },
            verifyCode: function(data) { //图片验证码
                return $http.post(httpsHeader + "/mall/verificatCodeAction/getVerifyCode.action", data)
            },
            checkRegistVerify: function(data) {
                return $http.post(httpsHeader + "/mall/verificatCodeAction/checkRegistVerify.action", data)
            },
            sendSM: function(data) { //手机验证码
                return $http.post(httpsHeader + "/mall/verificatCodeAction/getPhoneVerifyCode2.action", data)
            },
            sendCode: function(data) { //验证码登录手机验证码
                return $http.post(httpsHeader + "/mall/verificatCodeAction/getPhoneVerifyCodeForLogin.action", data)
            },
            sendMessage: function(data) { //重置余额支付手机验证码
                return $http.post(httpsHeader + "/mall/verificatCodeAction/getPhoneVerifyCodeForBlanceAccountPwd.action", data)
            },
            forgetLoginPswCheck: function(data) { //忘记交易密码
                return $http.post(httpsHeader + "/mall/custCodesAction/forgetLoginPswCheck.action", data)
            },
            forgetLoginPassWord: function(data) {
                return $http.post(httpsHeader + "/mall/custCodesAction/forgetLoginPassWord.action", data)
            },
            updateLoginPassWord: function(data, auth) { //修改交易密码
                return $http.post(httpsHeader + "/mall/custCodesAction/updateLoginPassWord.action", data, auth)
            },
            balancePassword: function(data, SESSIONID) { //设置余额支付支付密码
                return $http.post(httpsHeader + "/mall/accountBalanceAction/updateAccountBalancePayPassword.action", data, { headers: { Authorication: SESSIONID } });
            },
            resetBalancePassword: function(data, SESSIONID) { //重置余额支付密码
                return $http.post(httpsHeader + "/mall/accountBalanceAction/findAccountBalancePayPassword.action", data, { headers: { Authorication: SESSIONID } });
            },
            registerFilter: function(data) {
                return $http.jsonp(httpsHeaderf + "/risk/registerFilter.action?callback=JSON_CALLBACK", { params: data })
            },
            queryCustomInfo: function(data) { //
                return $http.get(httphhl + "/bigdata/custom/queryCustomInfo?callback=JSON_CALLBACK", { params: data })
            },
            getAuthorication: get
        }
        return $service;
    }
    $tourismService.$inject = ['$http', '$window'];

    function $tourismService($http, $window) {
        return {
            type: [
                { name: "周边游", src: "tourism/home/images/category-1.png", productClass: "16", productType: '', href: "#/tourism/search?productClass=16&placeStart=" + $window.sessionStorage.getItem("city-orientation") },
                { name: "国内游", src: "tourism/home/images/category-2.png", productClass: "", productType: 'INNER', href: "#/tourism/search?productType=INNER&placeStart=" + $window.sessionStorage.getItem("city-orientation") },
                { name: "国外游", src: "tourism/home/images/category-3.png", productClass: "", productType: 'FOREIGNLINE', href: "#/tourism/search?productType=FOREIGNLINE&placeStart=" + $window.sessionStorage.getItem("city-orientation") },
                { name: "自由行", src: "tourism/home/images/category-4.png", productClass: "18", productType: '', href: "#/tourism/search?productClass=18&placeStart=" + $window.sessionStorage.getItem("city-orientation") },
                { name: "跟团游", src: "tourism/home/images/category-5.png", productClass: "15", productType: '', href: "#/tourism/search?productClass=15&placeStart=" + $window.sessionStorage.getItem("city-orientation") },
                { name: "酒店套餐", src: "", productClass: "17", productType: '', href: "#/tourism/search?productClass=17&placeStart=" + $window.sessionStorage.getItem("city-orientation") }
            ],
            getHomeBanner: function(data) {
                return $http.post(httpsHeader + "/mall/tourismAction/getBanner.action", data);
            },
            getHotDestination: function(data) {
                return $http.post(httpsHeader + "/mall/tourismAction/getHotPlace.action", data);
            },
            getTourismSearch: function(data) { //搜索
                return $http.get(httpsHeader + "/mall/tourismAction/getTourismSearch.action", { params: data });
            },
            getProductInfo: function(data) {
                return $http.get(httpsHeader + "/mall/tourismAction/getProductInfo.action?id=" + data.id);
            },
            getValidateOrder: function(data) { //下单检验
                return $http.post(httpsHeader + "/mall/tourismAction/getValidateOrder.action", data)
            },
            getCreateOrder: function(data) { //下单
                return $http.post(httpsHeader + "/mall/tourismAction/getCreateOrder.action", data)
            },
            getPriceInfo: function(data) { //获取价格信息
                return $http.get(httpsHeader + "/mall/tourismAction/getPriceInfo.action", { params: data })
            },
            checkUserCreditLine: function(data) {
                return $http.get(httpsHeader + "/mall/tourismAction/checkUserCreditLine.action", { params: data })
            },
            getOrderPayment: function(data) {
                return $http.post(httpsHeader + "/mall/tourismAction/getOrderPayment.action", data)
            },
            checkUserLogin: function(data) { //判断用户是否登录
                return $http.post(httpsHeader + "/mall/tourismAction/checkUserLogin.action", data)
            },
            getRepayPlan: function(data) { //分期金额
                return $http.post(httpsHeader + "/mall/tourismAction/getRepayPlan.action", data)
            }
        }
    }
    $customerService.$inject = ['$http', '$window'];

    function $customerService($http, $window) {
        return {
            getJDServerType: function(data) { //申请售后服务
                return $http.post(httpsHeader + "/mall/afterSaleAction/getJDServerType.action", data);
            },
            getJDReturnType: function(data) { //商品退回方式
                return $http.post(httpsHeader + "/mall/afterSaleAction/getJDReturnType.action", data);
            },
            checkJDOrderAfterSale: function(data) {
                return $http.post(httpsHeader + "/mall/afterSaleAction/checkJDOrderAfterSale.action", data);
            },
            saveAfterSaleApply: function(data) { //保存服务单申请
                return $http.post(httpsHeader + "/mall/afterSaleAction/saveAfterSaleApply.action", data);
            },
            updateAfterSaleApply: function(data) { //更新服务单申请
                return $http.post(httpsHeader + "/mall/afterSaleAction/updateAfterSaleApply.action", data);
            },
            doGoodsDetail: function(data) { //得到商品详情
                return $http.get(httpsHeader + "/mall/newOrderAction/getOrderDetailById.action", { params: data });
            },
            orderDetail: function(data) { //订单详情
                return $http.get(httpsHeader + "/mall/orderApi/orderDetail.action", { params: data });
            },
            cancelOrder: function(data) { //取消订单
                return $http.get(httpsHeader + "/mall/orderApi/cancelOrder.action", { params: data });
            },
            checkUserQuota: function(data) { //去支付(分期购)
                return $http.post(httpsHeader + "/mall/orderAction/checkUserQuota.action", data);
            },
            toContiInvest: function(data) { //去支付(0元购)
                return $http.get(httpsHeader + "/mall/orderApi/toContiInvest.action", { params: data });
            },
            updateOrder: function(data) { //确认订单
                return $http.get(httpsHeader + "/mall/orderApi/updateOrderState.action", { params: data });
            },
            orderTrack: function(data) { //订单跟踪
                return $http.get(httpsHeader + "/mall/orderApi/queryOrderTrack.action", { params: data });
            },
            findOrder: function(data,SESSIONID) { //我的订单
                return $http.get(httpsHeader + "/mall/orderApi/findOrder.action", { params: data ,headers: { Authorication: SESSIONID }});
            },
            getAfterSaleApplyInfo: function(data) { //获取服务单申请
                return $http.post(httpsHeader + "/mall/afterSaleAction/getAfterSaleApplyInfo.action", data);
            },
            getServiceDetailInfo: function(data) { //服务单详情
                return $http.post(httpsHeader + "/mall/afterSaleAction/getServiceDetailInfo.action", data);
            },
            getdoGoodsDetail: function(data) { //得到商品详情
                return $http.get(httpsHeader + "/mall/goodsApi/doGoodsDetail.action", { params: data });
            },
            getMonthPaymentList: function(data) { //获取分期购月供数据
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getMonthPaymentList.action", data);
            },
            confirmOrder: function(data) { //确认订单初始化
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/confirmOrder.action", data);
            },
            submitOrder: function(data,SESSIONID) { //确认订单下单
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/submitOrder.action", data,{ headers: { Authorication: SESSIONID } });
            },
            newAjaxCheckUserOrder: function(data) { //验证用户是否满足下单条件接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/newAjaxCheckUserOrder.action", data);
            },
            newAjaxCheckUserQuota: function(data) { //验证是否有额度,判断是否已激活授信接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/newAjaxCheckUserQuota.action", data);
            },
            queryUserAccountInfo: function(data,SESSIONID) { //额度
                return $http.post(httpsHeader + "/mall/hshCustAction/queryUserAccountInfo.action", data,{ headers: { Authorication: SESSIONID } });
            },
            getAllAfterSaleApply: function(data) { //获取客服全部售后服务单接口
                return $http.post(httpsHeader + "/mall/afterSaleAction/getAllAfterSaleApply.action", data);
            },
            submitLogisticsInfo: function(data) { //获取客服全部售后服务单接口
                return $http.post(httpsHeader + "/mall/afterSaleAction/submitLogisticsInfo.action", data);
            },
            cancelJDService: function(data) { //取消服务单/客户放弃接口
                return $http.post(httpsHeader + "/mall/afterSaleAction/cancelJDService.action", data);
            },
            confirmReceipt: function(data) { //确认收货
                return $http.post(httpsHeader + "/mall/afterSaleAction/confirmReceipt.action", data);
            },
            checkJDOrderAfterSale: function(data) { //检查订单中的商品是否可以发起售后
                return $http.post(httpsHeader + "/mall/afterSaleAction/checkJDOrderAfterSale.action", data);
            },
            ajaxGetMonthPayMoney: function(data) { //获取月供金额接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/ajaxGetMonthPayMoney.action", data);
            },
            resendCode: function(data) { //重发凭证按钮
                return $http.post(httpsHeader + "/mall/orderApi/resendCode.action", data);
            },
            createSign: function(data) { //分期协议
                return $http.get(httpsHeader + "/mall/orderApi/createSign.action", { params: data });
            },
            newAjaxCheckJDStock: function(data) { //验证所选收货地址是否有足够的库存
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/newAjaxCheckJDStock.action", data);
            },
            getRePaymentPlanList: function(data) { //获取分期购的正式还款计划接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getRePaymentPlanList.action", data);
            },
            directPurchaseAction: function(data) { //刷卡支付下单接口
                return $http.post(httpsHeader + "/mall/directPurchaseAction/submitOrder.action", data);
            },
            executePos: function(data) { //刷卡支付下单接口
                return $http.get(httpsHeader + "/mall/directPurchaseAction/executePos.action", { params: data });
            },
            getPosRecordByOrderId: function(data) { //刷卡支付下单接口
                return $http.get(httpsHeader + "/mall/directPurchaseAction/getPosOrderInfoByOrderId.action", { params: data });
            },
            getSign: function(data) { //sign
                return $http.post(httpsHeader + "/mall/insideCustAction/getSign.action", data);
            },
            getGoodsOrderPrice: function(data) { //获取商品价格
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getGoodsOrderPrice.action", data);
            },
            goodsTi: function(data) { //提醒输入手机号
                return $http.post(httpsHeader + "/mall/spikeBuyApi/savePhoneMessage.action", data);
            },
            getLoanFeeInfo: function(data,SESSIONID) { //支付页获取分期数据
                return $http.post(httpsHeader + "/mall/orderAction/getLoanFeeInfo.action", data, { headers: { Authorication: SESSIONID } });
            },
            getBillOrderMonthPaymentList: function(data,SESSIONID) { //获取还款计划
                return $http.post(httpsHeader + "/mall/orderAction/getBillOrderMonthPaymentList.action", data, { headers: { Authorication: SESSIONID } });
            },
            doOrderBill: function(data) { //银联
                return $http.post(httpsHeader + "/mall/orderAction/doOrderBill.action", data);
            },
            wxPay: function(data) { //小程序微信支付
                return $http.post(httpsHeader + "/mall/weixin/api/wxpayMiniProgramAction/wxPay.action", data);
            },
            machinePay: function(data) { //贩卖机扫码余额支付
                return $http.post(httpsHeader + "/mall//accountBalanceAction/consumeAccountBalance.action", data);
            },
            oauthView: function(data) { //微信
                return $http.get(httpsHeader + "/mall/funsalesWechatPay/oauthView.action", { params: data });
            },
            getOrderActualFee: function(data,SESSIONID) { //获取利息
                return $http.post(httpsHeader + "/mall/orderAction/getOrderActualFee.action", data, { headers: { Authorication: SESSIONID } });
            },
            weChatRecharge: function(data, SESSIONID) { //微信余额充值
                return $http.post(httpsHeader + "/mall/accountBalanceAction/accountBalanceRecharge.action", data, { headers: { Authorication: SESSIONID } });
            },
            firstRecharge: function(data, SESSIONID) { //判断是否首次充值
                return $http.post(httpsHeader + "/mall/accountBalanceAction/isOrNoFirstRecharge.action", data, { headers: { Authorication: SESSIONID } });
            },
            rechangeMoney: function(data, SESSIONID) { //充值金额 赠送金额
                return $http.post(httpsHeader + "/mall/accountBalanceAction/getRechargeLargessRecordInfo.action", data, { headers: { Authorication: SESSIONID } });
            },
            judgePassword: function(data, SESSIONID) { //判断是否存在支付密码
                return $http.post(httpsHeader + "/mall/accountBalanceAction/isOrNoExistAccountBalancePayPassword.action", data, { headers: { Authorication: SESSIONID}, });
            },
            accountMount: function(data, SESSIONID) { //支付查询账户余额
                return $http.post(httpsHeader + "/mall/accountBalanceAction/findAccountBalanceMoney.action", data, { headers: { Authorication: SESSIONID } });
            },
            billDetail: function(data, SESSIONID) { //查询账户账单明细
                return $http.post(httpsHeader + "/mall/accountBalanceAction/findFundChangeDetails.action", data, { headers: { Authorication: SESSIONID } });
            },
            inforMation: function(data, SESSIONID) { //查询账户基本信息
                return $http.post(httpsHeader + "/mall/accountBalanceAction/findAccountBalanceAccount.action", data, { headers: { Authorication: SESSIONID } });
            },
            qualification: function(data, SESSIONID) { //判断手机号是否有领取商品的资格
                return $http.post(httpsHeader + "/mall/newYearActivityAction/isOrNoHaveQualifier.action", data, { headers: { Authorication: SESSIONID } });
            },
            single: function(data, config) { //新年活动单点登录入口
                return $http.post(httpsHeader + "/mall/newYearActivityAction/newYearActivityLogin.action", data, config).success(function(data, status, headers, config) {
                    // console.log(data);
                    if (data.resultCode == "0000") {
                        data = eval(data);
                        $window.localStorage.setItem($AuthTokenName, headers('Authorication'));
                    }
                });
            },
            sendMessage: function(data) { //新年送礼手机验证码
                return $http.post(httpsHeader + "/mall/verificatCodeAction/getPhoneVerifyCodeForBlanceAccountPwd.action?time=" + Date.parse(new Date()), data)
            },
            newYearGood: function(data, SESSIONID) { //根据手机号码获取商品
                return $http.post(httpsHeader + "/mall/newYearActivityAction/getGoodsListByPhoneNum.action", data, { headers: { Authorication: SESSIONID } });
            },
            isNoGetGood: function(data, SESSIONID) { //判断用户是否能领取商品
                return $http.post(httpsHeader + "/mall/newYearActivityAction/isOrNoGetGoods.action", data, { headers: { Authorication: SESSIONID } });
            },
            newYearOrder: function(data, SESSIONID) { //新年送礼下单
                return $http.post(httpsHeader + "/mall/newYearActivityAction/submitOrder.action", data, { headers: { Authorication: SESSIONID } });
            },
        }
    }
    $productService.$inject = ['$http', '$window'];

    function $productService($http, $window) {
        return {
            getDetails: function(data, consigneeId, channelId, businessType) { //得到商品详情
                return $http.get(httpsHeader + "/mall/goodsApi/doGoodsDetail.action?goodsId=" + data + "&consigneeId=" + consigneeId + '&channelId=' + channelId + '&businessType=' + businessType);
            },
            getProductList: function(data) { //得到商品列表
                return $http.post(httpsHeader + "/mall/goodsApi/findGoods.action", data);
            },
            getWare: function(data) { //秒杀页商品列表秒杀页商品列表得到商品
                return $http.get(httpsHeader + "/mall/spikeBuyApi/getSpikeGoodsList.action?spikeActivityId=" + data);
            },
            recommendGoods: function(data) { //得到推荐列表
                return $http.post(httpsHeader + "/mall/goodsApi/recommendGoods.action", data);
            },
            findSecondCategory: function(data) {
                return $http.post(httpsHeader + "/mall/categoryApi/findSecondCategory.action", data);
            },
            confirmPayment: function(data) {
                return $http.post(httpsHeader + "/mall/hirePurchaseAction/confirmPayment.action", data);
            },
            findGoodsByBrand: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/findGoodsByBrand.action", data);
            },
            findFourCategory: function(data) {
                return $http.post(httpsHeader + "/mall/activityApi/findFourCategory.action", data);
            },
            findGoodsSecondCategory: function(data) {
                return $http.post(httpsHeader + "/mall/categoryApi/findGoodsSecondCategory.action", data);
            },
            findSecondGoods: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/findSecondGoods.action", data);
            },
            searchGoods: function(data) { //搜索
                return $http.get(httpsHeader + "/mall/goodsSearchApi/searchGoods.action", { params: data });
            },
            searchBrandList: function(data) { //搜索-获取品牌
                return $http.get(httpsHeader + "/mall/goodsSearchApi/searchBrandList.action", { params: data });
            },
            doUserTrace: function(data) { //搜索-用户行为
                return $http.get(httpsHeader + "/mall/userTraceApi/doUserTrace.action", { params: data });
            },
            getGoodsAttr: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/getGoodsAttr.action", data);
            },
            getTravelGoods: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/getTravelGoods.action", data);
            },
            getSearchGoods: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/findGoodsLikeName.action", data);
            },
            getGoodsIsCollect: function(data) { //是否已收藏
                return $http.get(httpsHeader + "/mall/goodsMyCollectApi/getGoodsIsCollect.action", { params: data });
            },
            saveGoodsCollect: function(data) { //收藏
                return $http.post(httpsHeader + "/mall/goodsMyCollectApi/saveGoodsCollect.action", data);
            },
            cancelGoodsCollect: function(data) { //取消收藏
                return $http.get(httpsHeader + "/mall/goodsMyCollectApi/cancelGoodsCollect.action", { params: data });
            },
            getPageBanner: function(data) { //商品列表banner
                return $http.get(httpsHeader + "/mall/hshBannerAction/getPageBanner.action", { params: data });
            },
            getShoppingCartGoodsNum: function(data, SESSIONID) { //查询购物车商品数量
                return $http.get(httpsHeader + "/mall/shoppingCartGoodsAction/getShoppingCartGoodsNum.action", { params: data, headers: { Authorication: SESSIONID } });
            },
            getGoodsMonthRepayInfo: function(data) { //获取商品分期信息-购物车
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getGoodsMonthRepayInfo.action", data);
            },
            doAddShoppingCartGoods: function(data) { //添加购物车商品
                return $http.post(httpsHeader + "/mall/shoppingCartGoodsAction/doAddShoppingCartGoods.action", data);
            },
            deleteShoppingCartGoods: function(data, SESSIONID) { //删除购物车商品
                return $http.post(httpsHeader + "/mall/shoppingCartGoodsAction/deleteShoppingCartGoods.action", data, { headers: { Authorication: SESSIONID } });
            },
            getDefaultShoppingAddress: function(data) { //获取默认收货地址接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getDefaultShoppingAddress.action", data);
            },
            getShoppingCartGoodsList: function(data, SESSIONID) { //购物车列表
                return $http.post(httpsHeader + "/mall/shoppingCartGoodsAction/getShoppingCartGoodsList.action", data, { headers: { Authorication: SESSIONID } });
            },
            getCartGoodsOrderAmountInfo: function(data, SESSIONID) { //确认订单页，订单总额查询接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getCartGoodsOrderAmountInfo.action", data);
            },
            getCartGoodsOrdeMonthPaymentList: function(data, SESSIONID) { //确认订单页，订单总额还款计划查询接口
                return $http.post(httpsHeader + "/mall/newHirePurchaseAction/getCartGoodsOrdeMonthPaymentList.action", data);
            },
            saveGoodsCollectCart: function(data, SESSIONID) { //收藏--购物车使用
                return $http.post(httpsHeader + "/mall/goodsMyCollectApi/saveGoodsCollect.action", data, { headers: { Authorication: SESSIONID } });
            },
            findActivityCouponByGoodPoolId: function(data, SESSIONID) { //查询优惠券
                return $http.post(httpsHeader + "/mall/couponApi/findActivityCouponByGoodPoolId.action", data, { headers: { Authorication: SESSIONID } });
            },
            getCouponToUser: function(data, SESSIONID) { //领取优惠券
                return $http.post(httpsHeader + "/mall/couponApi/getCouponToUser.action", data, { headers: { Authorication: SESSIONID } });
            },
            getProductSpu: function(data, SESSIONID) { //商品属性spu
                return $http.get(httpsHeader + "/mall/goodsApi/getProductSpu.action", { params: data });
            },
            getGoodsSpecInfo(data, SESSIONID) { //spu获取商品详情//临时测试
                return $http.get(httpsHeader + "/mall/goodsApi/doGoodsSpecInfo.action", { params: data });
            },
            getNextInfo(data, SESSIONID) { //获取图文详情，产品规格
                return $http.get(httpsHeader + "/mall/goodsApi/doGoodsDetailComment.action", { params: data });
            },
            getGoodsDetailByJD: function(data) { //京东商品单独调用---优化结果(商品详情部分字段拆分过来)
                return $http.get(httpsHeader + "/mall/goodsApi/doGoodsDetailByJD.action", { params: data });
            },
            setCartGoodsNum:function(data){//修改商品数量--购物车使用
                return $http.post(httpsHeader+"/mall/shoppingCartGoodsAction/addShoppingCartGoodsNum.action", data);
            },
            imgUrl: {
                0: jdImaUrl + "imgzone/",
                1: jdImaUrl + "n1/",
                2: jdImaUrl + "n2/",
                3: jdImaUrl + "n3/",
                4: jdImaUrl + "n4/" //小
            }
        }
    }
    $investService.$inject = ['$http', '$window'];

    function $investService($http, $window) {
        return {
            getExpectedEarnings: function(data) {
                return $http.post(httpsHeader + "/mall/earningsAction/getExpectedEarnings.action", data);
            },
            moneyList: [
                { name: '2万以下', unit: '', min: "0", max: "2" },
                { name: '2-4', unit: '万', min: "2", max: "4" },
                { name: '4-6', unit: '万', min: "4", max: "6" },
                { name: '6-8', unit: '万', min: "6", max: "8" },
                { name: '8万以上', unit: '', min: "8", max: "0" },
            ],
            timeList: [
                { name: '3个月', value: "3" },
                { name: '6个月', value: "6" },
                { name: '12个月', value: "12" },
            ],
        }
    }
    //收货地址
    $address.$inject = ['$http', '$window'];

    function $address($http, $window) {
        return {
            getAddress: function(data) { //新增地址
                return $http.post(httpsHeader + "/mall/consigneeApi/findConsignees.action", data);
            },
            getdelivery: function(data) { //收货地址
                return $http.post(httpsHeader + "/mall/consigneeApi/addConsignee.action", data);
            },
            getProvince: function() { //省
                return $http.post(httpsHeader + "/mall/addressApi/findProvince.action");
            },
            getCity: function(data) { //市
                return $http.post(httpsHeader + "/mall/addressApi/findCity.action", data);
            },
            getCounty: function(data) { //县
                return $http.post(httpsHeader + "/mall/addressApi/findCounty.action", data);
            },
            getTown: function(data) { //镇
                return $http.post(httpsHeader + "/mall/addressApi/findTown.action", data);
            },
            getdoUpdate: function(data) { //更新新地址
                return $http.post(httpsHeader + "/mall/consigneeApi/doUpdate.action", data);
            },
            getDelete: function(data) { //删除地址
                return $http.post(httpsHeader + "/mall/consigneeApi/delete.action", data);
            },
            getObtain: function(data) { //根据ID获取收货地址
                return $http.post(httpsHeader + "/mall/consigneeApi/getById.action", data);
            },
        }
    }

    $easyPayService.$inject = ['$http', '$window'];

    function $easyPayService($http, $window) {
        return {
            getHotGoods: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/findGoodByRecommendIdOne.action", data);
            },
            getRecommendGoods: function(data) {
                return $http.post(httpsHeader + "/mall/hshBannerAction/getPageOptionBanner.action", data);
            },
            getPeriodPrice: function(data) {
                return $http.post(httpsHeader + "/mall/goodsApi/getMonthPay.action", data);
            },
            validateOldPaycode: function(data) { //验证旧密码
                return $http.post(httpsHeader + "/mall/resetPayCodeAction/validateOldPaycode.action", data);
            },
            resetPaycode: function(data) { //发送密码
                return $http.post(httpsHeader + "/mall/resetPayCodeAction/resetPaycode.action", data);
            },
            validateOldPaycode: function(data) { //验证身份证
                return $http.post(httpsHeader + "/mall/resetPayCodeAction/validateCustIdCard.action", data);
            },
            getPhoneCode: function(data) { //获取手机验证码
                return $http.post(httpsHeader + "/mall/resetPayCodeAction/getPhoneCode.action", data);
            },
            checkPhoneCode: function(data) { //手机验证码
                return $http.post(httpsHeader + "/mall//resetPayCodeAction/checkPhoneCode.action", data);
            }
        }
    }

    $cardService.$inject = ['$http', '$window'];

    function $cardService($http, $window) {
        return {
            querybindCard: function(data) {
                return $http.post(httpsHeader + "/mall/HshBankCardBindAction/getBankCardInfo.action", data);
            },
            bindBankCard: function(data) {
                return $http.post(httpsHeader + "/mall/HshBankCardBindAction/bindBankCard.action", data);
            },
            getCouponList: function(data,SESSIONID) {
                return $http.get(httpsHeader + "/mall/couponApi/getCouponList.action", { params: data ,headers: { Authorication: SESSIONID }});
            },
            getCoupons: function(data,SESSIONID) {
                return $http.get(httpsHeader + "/mall/couponApi/getCoupons.action", { params: data,headers: { Authorication: SESSIONID } });
            },
            convertCoupon: function(data) { //兑换卡卷
                return $http.get(httpsHeader + "/mall/couponApi/convertCoupon.action", { params: data });
            },
            getCouponNumIsUsable: function(data, SESSIONID) { //商品可用卡卷
                return $http.post(httpsHeader + "/mall/couponApi/getCouponNumIsUsable.action", data, { headers: { Authorication: SESSIONID } });
            },
            getActivityCoupon: function(data, SESSIONID) { //商品可用卡卷
                return $http.post(httpsHeader + "/mall/couponApi/getActivityCoupon.action", data, { headers: { Authorication: SESSIONID } });
            },
            getInterestFreePageBanner: function(data) { //免息分期banner
                return $http.get(httpsHeader + "/mall/hshBannerAction/getInterestFreePageBanner.action", { params: data });
            },
            getInterestFreePageBanner: function(data) { //免息分期banner
                return $http.get(httpsHeader + "/mall/hshBannerAction/getPageBanner.action?channelId=&bannerPageId=4000000000&bannerOptionId=4000000001", data);
            },
            getModuleGoodsList: function(data) { //爆款
                return $http.get(httpsHeader + "/mall/interestFreePageApi/getModuleGoodsList.action", { params: data });
            },
            getTabList: function(data) { //秒杀专场tab栏秒杀专场tab栏秒杀专场tab栏秒杀专场tab栏
                return $http.get(httpsHeader + "/mall/spikeBuyApi/getPageSpikeTimeList.action", data);
            },
            getGoodsCollectList: function(data,SESSIONID) { //我的收藏
                return $http.post(httpsHeader + "/mall/goodsMyCollectApi/getGoodsCollectList.action", data,{ headers: { Authorication: SESSIONID } });
            },
            getGoodsCategoryList: function(data) { //商品分类
                return $http.get(httpsHeader + "/mall/categoryApi/getGoodsCategoryList.action", { params: data });
            },
            getOneCategoryList: function(data) { //一级分类
                return $http.get(httpsHeader + "/mall/categoryApi/getOneCategoryList.action", { params: data });
            },
            getGiftCard: function(data,SESSIONID) { //礼品卡
                return $http.get(httpsHeader + "/mall/giftCardAction/getUserGiftCardList.action", { params: data , headers: { Authorication: SESSIONID } });
            },
            getUserGiftCardNum:function(data,SESSIONID){//可用数量
                return $http.get(httpsHeader + "/mall/giftCardAction/getUserGiftCardNum.action", { params: data , headers: { Authorication: SESSIONID } });
            }
        }
    }
});

function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0

}