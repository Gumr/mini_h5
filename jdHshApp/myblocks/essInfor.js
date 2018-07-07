define(['angular', 'css!./user.css'], function(angular) {
    angular.module('app')
        .controller('essInforController', essInforController)
        .controller('sesameController', sesameController)
        .controller('bankCardController', bankCardController)
        .controller('bankListController', bankListController)
        .controller('bankCardCodeController', bankCardCodeController)
        .controller('workInforController', workInforController);
    //授信基本信息
    essInforController.$inject = ['$scope', '$state', '$stateParams', '$verifyService', '$http', '$common', '$timeout', 'userInfo'];

    function essInforController($scope, $state, $stateParams, $verifyService, $http, $common, $timeout, userInfo) {
        var vm = this;
        if (userInfo.data.resultCode != "0000") {
            $common.goUser({
                state: 'essInfor'
            }, '/order');
            $timeout(function() { scroll('.main-content'); }, 300);
        }
        vm.userInfo = userInfo.data.result.userInfo;
        vm.essInfor = "";
        //个人信息
        vm.myInfo = {
            name: "",
            id: "",
            marriage: "",
            marriageId: "",
            isMarry: false,
            noMarry: false
        };
        //紧急联系人信息
        vm.contactInfo = {
            name: "",
            phone: "",
            relationshipId: "",
            relationship: "请选择"
        };
        vm.orderId = $verifyService.getQueryParam("orderId");
        vm.typeFrom = $verifyService.getQueryParam("typeFrom");
        vm.ionviceId = $verifyService.getQueryParam("ionviceId");
        vm.fromPage = $verifyService.getQueryParam("fromPage");
        vm.id = sessionStorage.getItem('id');
        console.log(vm.id)
        vm.showsel = false;
        vm.showName = true;
        vm.showId = true;
        vm.selectMarry = selectMarry;
        vm.showSelect = showSelect;
        vm.hideSelect = hideSelect;
        vm.selRel = selRel;
        vm.submit = submit;
        var myIscroll = scroll('.main-content');
        getEssInfor();

        selectMarry('no');
        //是否已婚点击事件
        function selectMarry(str) {
            if (str == "yse") {
                vm.myInfo.isMarry = true;
                vm.myInfo.noMarry = false;
                vm.myInfo.marriage = "已婚";
                vm.myInfo.marriageId = 2;
                switch (vm.contactInfo.relationshipId) {
                    case 1:
                        vm.contactInfo.relationship = "配偶";
                        break;
                    case 2:
                        vm.contactInfo.relationship = "亲子";
                        break;
                    case 3:
                        vm.contactInfo.relationship = "朋友";
                        break;
                    case 4:
                        vm.contactInfo.relationship = "亲属";
                        break;
                    case 5:
                        vm.contactInfo.relationship = "同事";
                        break;
                }
            } else {
                vm.myInfo.isMarry = false;
                vm.myInfo.noMarry = true;
                vm.myInfo.marriage = "未婚";
                vm.myInfo.marriageId = 1;
                switch (vm.contactInfo.relationshipId) {
                    case 1:
                        vm.contactInfo.relationship = "亲子";
                        break;
                    case 2:
                        vm.contactInfo.relationship = "朋友";
                        break;
                    case 3:
                        vm.contactInfo.relationship = "亲属";
                        break;
                    case 4:
                        vm.contactInfo.relationship = "同事";
                        break;
                }
            }
        }

        //获取个人基本信息
        function getEssInfor() {
            $http.post(httpsHeader + "/mall/creditAction/getUserBaseInfoById.action", {}).success(function(data) {
                if (data.resultCode == "0000") {
                    if (data.result.userInfo.realName) {
                        vm.essInfor = data.result.userInfo;
                        vm.showName = false;
                        vm.showId = false;
                        vm.myInfo.name = vm.essInfor.realName;
                        vm.myInfo.id = vm.essInfor.idCard;
                        vm.contactInfo.name = vm.essInfor.urgentPerson.urgentPerson;
                        vm.contactInfo.phone = vm.essInfor.urgentPerson.urgentPhone;
                        vm.contactInfo.relationshipId = vm.essInfor.urgentPerson.urgentRelation;
                        vm.myInfo.marriageId = vm.essInfor.marriage;
                        if (vm.myInfo.marriageId == 1) {
                            selectMarry("no");
                        } else {
                            selectMarry("yse");
                        }
                        switch (vm.contactInfo.relationshipId) {
                            case 1:
                                vm.contactInfo.relationship = "配偶";
                                break;
                            case 2:
                                vm.contactInfo.relationship = "亲子";
                                break;
                            case 3:
                                vm.contactInfo.relationship = "朋友";
                                break;
                            case 4:
                                vm.contactInfo.relationship = "亲属";
                                break;
                            case 5:
                                vm.contactInfo.relationship = "同事";
                                break;
                        }
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
            })
        }


        //显示select数据
        function showSelect() {
            vm.showsel = true;
        }
        //隐藏select数据
        function hideSelect() {
            vm.showsel = false;
        }
        //选择select数据
        function selRel(str, id) {
            vm.contactInfo.relationship = str;
            vm.contactInfo.relationshipId = id;
            vm.showsel = false;
        }
        //自定义alert弹框
        function theDialog(str, target) {
            var verificationDialog = new dialog().alert({
                content: '<div>' + str + '</div>',
                confirmBtnText: '取消',
                confirmBtn: function() {
                    $state.go(target, {}, {
                        location: 'replace'
                    });
                }
            })
        }

        //点击下一步
        function submit() {
            if (vm.myInfo.name == "") {
                toolTip("个人信息姓名不能为空！");
                return false;
            }
            if (vm.myInfo.id == "") {
                toolTip("身份证号不能为空！");
                return false;
            } else if (!$verifyService.isId(vm.myInfo.id)) {
                toolTip("请输入正确的身份证号！");
                return false;
            }
            if (vm.myInfo.marriage == "") {
                toolTip("请选择婚姻状况！");
                return false;
            }
            if (vm.contactInfo.name == "") {
                toolTip("紧急联系人姓名不能为空！");
                return false;
            } else if (vm.contactInfo.name == vm.myInfo.name) {
                toolTip("紧急联系人姓名不能跟个人信息姓名一样！");
                return false;
            }
            if (vm.contactInfo.phone == "") {
                toolTip("紧急联系人电话不能为空！");
                return false;
            } else if (!$verifyService.isPhoneNum(vm.contactInfo.phone)) {
                toolTip("请输入正确的电话！");
                return false;
            } else if (vm.userInfo.mobile == vm.contactInfo.phone) {
                toolTip("紧急联系人电话不能与注册手机号相同！");
                return false;
            }
            if (vm.contactInfo.relationshipId == "") {
                toolTip("请选择与联系人的关系！");
                return false;
            }
            var wait = new waiting();
            var data = {
                userName: vm.myInfo.name,
                idCard: vm.myInfo.id,
                marriage: vm.myInfo.marriageId,
                urgentPerson: vm.contactInfo.name,
                urgentPhone: vm.contactInfo.phone,
                urgentRelation: vm.contactInfo.relationshipId
            };
            if (vm.orderId) {
                data["orderId"] = vm.orderId;
            }
            if (vm.typeFrom) {
                data["typeFrom"] = vm.typeFrom;
            }
            $http.post(httpsHeader + "/mall/creditAction/saveUserBaseInfo.action", data).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.orderId && sessionStorage.setItem("orderId", vm.orderId);
                    vm.ionviceId && sessionStorage.setItem("ionviceId", vm.ionviceId);
                    vm.fromPage && sessionStorage.setItem("fromPage", vm.fromPage);
                    if (data.result.status == 0) { //非白非黑用户，跳去芝麻信用认证
                        if (data.result.url && data.result.url.indexOf("http") != -1) {
                            //location.href=data.result.url;
                            sessionStorage.setItem("sesameUrl", data.result.url);
                            $state.go('sesame', {}, {
                                location: 'replace'
                            })
                        }
                    } else if (data.result.status == 1) { //白名单用户
                        if (data.result.isBindCard) { //是否绑卡
                            if (vm.orderId && !vm.fromPage) { //来自分期购
                                sessionStorage.removeItem("orderId");
                                location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                            } else if (vm.ionviceId) { //来自驴妈妈
                                sessionStorage.removeItem("ionviceId");
                                $state.go('tourism-order', {
                                    id: vm.id
                                }, {
                                    location: 'replace'
                                })
                            } else if (vm.orderId && vm.fromPage) { //来自继续下单
                                sessionStorage.removeItem("fromPage");
                                sessionStorage.removeItem("orderId");
                                location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                            } else { //来自个人中心
                                theDialog("资料提交成功,马上去购物吧！", "home");
                            }
                        } else {
                            $state.go('bankCard', {}, {
                                location: 'replace'
                            })
                        }
                    } else if (data.result.status == -1) { //黑名单用户
                        theDialog("综合评分不足，如有疑问，请联系汇生活客服热线400-812-3381。", "myCenter");
                    }
                } else {
                    if (data.result) {
                        if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
                //else{
                //    $common.goUser({
                //        state: 'essInfor'
                //    },'/essInfor');
                //}
                wait.hide();
            });
        }
    }

    //授信芝麻信用
    sesameController.$inject = ['$scope', '$state', '$stateParams', 'userInfo', '$common'];

    function sesameController($scope, $state, $stateParams, userInfo, $common) {
        var vm = this;
        if (userInfo.data.resultCode != "0000") {
            $common.goUser({
                state: 'sesame'
            }, '/order');
        }
        vm.go = go;
        vm.url = sessionStorage.getItem("sesameUrl");

        //去芝麻信用认证
        function go() {
            location.href = vm.url;
        }
    }


    //授信工作信息
    workInforController.$inject = ['$address', '$scope', '$state', '$address', '$timeout', '$verifyService', '$http', 'userInfo', '$common'];

    function workInforController($address, $scope, $state, $address, $timeout, $verifyService, $http, userInfo, $common) {
        var vm = this;
        if (userInfo.data.resultCode != "0000") {
            $common.goUser({
                state: 'workInfor'
            }, '/order');
        }
        vm.info = {
            name: "",
            phone: "",
            province: "",
            provinceId: "",
            city: "",
            cityId: "",
            countyId: "",
            countyName: "",
            townId: "",
            townName: "请选择",
            //area:"请选择",
            //areaId:"",
            address: '',
            post: '请选择',
            postId: '',
            income: "请选择",
            incomeId: "",
            bankCardNo: ""
        };
        vm.orderId = sessionStorage.getItem("orderId");
        vm.id = sessionStorage.getItem('id')
        vm.ionviceId = sessionStorage.getItem("ionviceId");
        vm.fromPage = sessionStorage.getItem("fromPage");
        vm.address1 = '请选择';
        vm.address2 = '';
        vm.address3 = '';
        vm.address4 = '';
        vm.showAddRess = false;
        vm.showPost = false;
        vm.showIncome = false;
        vm.select3d = false;
        vm.showSelect = showSelect;
        vm.hideSelect = hideSelect;
        vm.selPost = selPost;
        vm.selectTabClick = selectTabClick;
        vm.showPostSel = showPostSel;
        vm.hideBothSel = hideBothSel;
        vm.showIncomeSel = showIncomeSel;
        vm.selIncome = selIncome;
        vm.submit = submit;
        vm.addressActive = { rightCity: $('.city-box'), rightCounty: $('.county-box'), rightStreet: $('.street-box') };
        vm.selText = "";
        vm.postList = [
            { text: "基层员工", value: 5 },
            { text: "初级管理", value: 4 },
            { text: "高级管理", value: 3 },
            { text: "法人或股东", value: 2 },
            { text: "公务员", value: 1 }
        ];
        vm.incomeList = [
            { text: "2000元以下", value: 5 },
            { text: "2000-5000元", value: 4 },
            { text: "5000-8000元", value: 3 },
            { text: "8000-12000元", value: 2 },
            { text: "12000元以上", value: 1 },
        ];
        vm.provinceList = [];
        vm.cityList = [];
        vm.countyList = [];
        vm.townList = [];
        var myIscroll = scroll('.rightProvince');
        var myIscroll1 = scroll('.city-box');
        var myIscroll2 = scroll('.county-box');
        var myIscroll3 = scroll('.street-box');
        var myIscrollMain = scroll('.main-content');
        getEssInfor();


        //获取个人就业信息
        function getEssInfor() {
            $http.post(httpsHeader + "/mall/creditAction/getUserWorkInfoById.action", {}).success(function(data) {
                if (data.resultCode == "0000") {
                    if (data.result.userWorkInfo.companyName) {
                        vm.essInfor = data.result.userWorkInfo;
                        vm.info.name = vm.essInfor.companyName;
                        vm.info.phone = vm.essInfor.mobile;
                        vm.info.province = vm.essInfor.comProvinceName;
                        vm.info.provinceId = vm.essInfor.comProvince;
                        vm.info.city = vm.essInfor.comCityName;
                        vm.info.cityId = vm.essInfor.comCity;

                        vm.info.countyId = vm.essInfor.comCounty;
                        vm.info.countyName = vm.essInfor.comCountyName;
                        vm.info.townId = vm.essInfor.comTown;
                        vm.info.townName = vm.essInfor.comTownName;

                        vm.info.address = vm.essInfor.comDetail;
                        vm.info.postId = vm.essInfor.position;
                        vm.info.incomeId = vm.essInfor.monthIncome;
                        vm.info.bankCardNo = vm.essInfor.cardNumber;
                        switch (vm.info.postId) {
                            case "1":
                                vm.info.post = "公务员";
                                break;
                            case "2":
                                vm.info.post = "法人或股东";
                                break;
                            case "3":
                                vm.info.post = "高级管理";
                                break;
                            case "4":
                                vm.info.post = "初级管理";
                                break;
                            case "5":
                                vm.info.post = "基层员工";
                                break;
                        }
                        switch (vm.info.incomeId) {
                            case "1":
                                vm.info.income = "12000元以上";
                                break;
                            case "2":
                                vm.info.income = "8000-12000元";
                                break;
                            case "3":
                                vm.info.income = "5000-8000元";
                                break;
                            case "4":
                                vm.info.income = "2000-5000元";
                                break;
                            case "5":
                                vm.info.income = "2000元以下";
                                break;
                        }
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
            })
        }


        //获得省份
        $address.getProvince({}).success(function(data) {
            if (data.resultCode == "0000") {
                vm.provinceList = data.result;
                $timeout(function() {
                    myIscroll.refresh();
                }, 200)
            }
        });
        //选择省份
        $scope.provinceClick = function(id, name) {
            vm.info.provinceId = id;
            vm.info.province = name;
            vm.address1 = name;
            vm.address2 = '请选择';
            vm.address3 = '';
            vm.address4 = '';
            vm.info.cityId = "";
            vm.info.countyId = "";
            vm.info.townId = "";
            vm.addressActive.rightCity.addClass('active');
            $('.select-tab span').removeClass('active').eq(0).addClass('active');
            $address.getCity({
                provinceId: id
            }).success(function(data) {
                if (data.resultCode == "0000") {
                    vm.cityList = data.result;
                    $timeout(function() {
                        myIscroll1.refresh();
                    }, 200)
                }
            })
        };
        //选择城市
        $scope.cityClick = function(id, name) {
            vm.info.cityId = id;
            vm.info.city = name;
            vm.address2 = name;
            vm.address3 = '请选择';
            vm.address4 = '';
            vm.info.countyId = "";
            vm.info.townId = "";
            vm.addressActive.rightCounty.addClass('active');
            $('.select-tab span').removeClass('active').eq(1).addClass('active');
            //hideSelect();
            $address.getCounty({
                cityId: id
            }).success(function(data) {
                if (data.result.length > 0) {
                    vm.countyList = data.result;
                    $timeout(function() {
                        myIscroll2.refresh();
                    }, 200)
                } else {
                    vm.select3d = false;
                    vm.showAddRess = false;
                    $('.modal-layer,.shade').removeClass('active');
                    hidePage();
                    vm.info.countyId = 0;
                    vm.info.countyName = "";
                    vm.info.townId = 0;
                    vm.info.townName = "";
                    vm.address3 = '';
                    vm.address4 = '';
                }
            })
        };
        //选择县
        $scope.countyClick = function(id, name) {
                vm.info.countyId = id;
                vm.info.countyName = name;
                vm.address3 = name;
                vm.address4 = '请选择';
                vm.info.townId = "";
                vm.addressActive.rightStreet.addClass('active');
                $('.select-tab span').removeClass('active').eq(2).addClass('active');
                $address.getTown({
                    countyId: id
                }).success(function(data) {
                    if (data.result.length > 0) {
                        vm.townList = data.result;
                        $timeout(function() {
                            myIscroll3.refresh();
                        }, 200)
                    } else {
                        vm.select3d = false;
                        vm.showAddRess = false;
                        $('.modal-layer,.shade').removeClass('active');
                        hidePage();
                        vm.info.townId = 0;
                        vm.info.townName = "";
                        vm.address4 = '';
                    }
                })
            }
            //选择镇
        $scope.townClick = function(id, name) {
            vm.info.townId = id;
            vm.info.townName = name;
            vm.address4 = name;
            vm.select3d = false;
            vm.showAddRess = false;
            $('.modal-layer,.shade').removeClass('active');
            hidePage();
            $('.select-tab span').removeClass('active').eq(3).addClass('active');
        }

        //关闭
        function hidePage() {
            setTimeout(function() {
                vm.addressActive.rightCity.removeClass('active');
                vm.addressActive.rightCounty.removeClass('active');
                vm.addressActive.rightStreet.removeClass('active');
            }, 300);
        }

        //显示省市弹出框
        function showSelect() {
            vm.select3d = true;
            vm.showAddRess = true;
            $('.select-tab span').removeClass('active').eq(0).addClass('active');
        }
        //隐藏省市弹出框
        function hideSelect() {
            vm.select3d = false;
            vm.showAddRess = false;
        }
        //点击省市二级标题
        function selectTabClick(str) {
            switch (str) {
                case "province":
                    if (vm.address1 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(0).addClass('active');
                    vm.addressActive.rightCity.removeClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "city":
                    if (vm.address2 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(1).addClass('active');
                    vm.addressActive.rightCity.addClass('active');
                    vm.addressActive.rightCounty.removeClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "county":
                    if (vm.address3 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(2).addClass('active');
                    vm.addressActive.rightCounty.addClass('active');
                    vm.addressActive.rightStreet.removeClass('active');
                    break;
                case "town":
                    if (vm.address4 == "请选择") { return }
                    $('.select-tab span').removeClass('active').eq(3).addClass('active');
                    vm.addressActive.rightStreet.addClass('active');
                    break;
            }
        }

        //选择职务
        function selPost(str, id) {
            vm.info.post = str;
            vm.info.postId = id;
            hideBothSel();
        }
        //选择收入
        function selIncome(str, id) {
            vm.info.income = str;
            vm.info.incomeId = id;
            hideBothSel();
        }

        //弹出职务选择框
        function showPostSel() {
            vm.showsel = true;
            vm.showPost = true;
            vm.selText = "选择职务";
        }
        //弹出收入选择框
        function showIncomeSel() {
            vm.showsel = true;
            vm.showIncome = true;
            vm.selText = "选择收入";
        }

        //隐藏选择框
        function hideBothSel() {
            vm.showsel = false;
            vm.showPost = false;
            vm.showIncome = false;
        }

        //点击确定
        function submit() {
            if (vm.info.name == "") {
                toolTip("公司名称不能为空！");
                return false;
            }
            if (vm.info.phone == "") {
                toolTip("公司电话不能为空！");
                return false;
            } else if (!$verifyService.isFixedPhone(vm.info.phone)) {
                toolTip("公司电话格式有误,请输入正确的号码格式!(例如: 0755-88888888)");
                return false;
            }
            if (vm.info.provinceId == "" || vm.info.cityId == "") {
                toolTip("请选择公司地址！");
                return false;
            }
            if (vm.info.address == "") {
                toolTip("详细地址不能为空！");
                return false;
            }
            if (vm.info.postId == "") {
                toolTip("请选择职务！");
                return false;
            }
            if (vm.info.incomeId == "") {
                toolTip("请选择收入！");
                return false;
            }
            if (vm.info.bankCardNo == "") {
                toolTip("信用卡卡号不能为空！");
                return false;
            } else if (!$verifyService.isBankCardNo(vm.info.bankCardNo)) {
                toolTip("请输入正确的信用卡卡号！");
                return false;
            }
            var wait = new waiting();
            var data = {
                cardNumber: vm.info.bankCardNo,
                companyName: vm.info.name,
                companyTelephone: vm.info.phone,
                monthIncome: vm.info.incomeId,
                position: vm.info.postId,
                comDetail: vm.info.address,
                comProvince: vm.info.provinceId,
                comCity: vm.info.cityId,
                comCounty: vm.info.countyId,
                comTown: vm.info.townId
            };
            $http.post(httpsHeader + "/mall/creditAction/saveUserWorkInfo.action", data).success(function(data) {
                if (data.resultCode == 0000) {
                    if (data.result.isBindCard == true) { //已绑卡
                        if (vm.orderId && !vm.fromPage) { //来自分期购
                            sessionStorage.removeItem("orderId");
                            location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                        } else if (vm.ionviceId) { //来自驴妈妈
                            sessionStorage.removeItem("ionviceId");
                            $state.go('tourism-order', {
                                id: vm.id
                            }, {
                                location: 'replace'
                            })
                        } else if (vm.orderId && vm.fromPage) { //来自继续下单
                            sessionStorage.removeItem("fromPage");
                            sessionStorage.removeItem("orderId");
                            location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                        } else { //来自个人中心
                            var verificationDialog = new dialog().alert({
                                content: '<div>资料提交成功，马上去购物吧!</div>',
                                confirmBtnText: '确定',
                                confirmBtn: function() {
                                    $state.go('home', {}, {
                                        location: 'replace'
                                    })
                                }
                            })
                        }
                    } else {
                        $state.go('bankCard', {}, {
                            location: 'replace'
                        })
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
                wait.hide();
            });
        }
    }

    //授信绑卡页面
    bankCardController.$inject = ['$scope', '$state', '$stateParams', '$http', '$verifyService', 'userInfo', '$common', '$cardService'];

    function bankCardController($scope, $state, $stateParams, $http, $verifyService, userInfo, $common, $cardService) {
        var vm = this;
        if (userInfo.data.resultCode != "0000") {
            $common.goUser({
                state: 'bankCard'
            }, '/order');
        }
        vm.info = {
            userName: "",
            idCard: "",
            phoneNo: "",
            cardNo: "",
            bankName: "",
            bankRealId: "",
            bankType: ""
        };
        vm.fromPage = $verifyService.getQueryParam("fromPage");
        vm.orderId = $verifyService.getQueryParam("orderId");
        vm.ionviceId = $verifyService.getQueryParam("ionviceId");
        if (vm.orderId) {
            sessionStorage.setItem("orderId", vm.orderId);
        }
        if (vm.ionviceId) {
            sessionStorage.setItem("ionviceId", vm.ionviceId);
        }
        if (vm.fromPage) {
            sessionStorage.setItem("fromPage", vm.fromPage);
        }

        vm.showName = true;
        vm.showId = true;
        vm.getBankName = getBankName;
        vm.getBankList = getBankList;
        vm.submit = submit;
        var mainScroll = scroll('.main-content');

        getUser();
        getEssInfor();
        //获取个人个人银行卡信息
        function getEssInfor() {
            $http.post(httpsHeader + "/mall/creditAction/getUseCardInfoById.action", {}).success(function(data) {
                if (data.resultCode == "0000") {
                    if (data.result.userCardInfo.bankCardNo) {
                        vm.essInfor = data.result.userCardInfo;
                        vm.info.cardNo = vm.essInfor.bankCardNo;
                        vm.info.bankName = vm.essInfor.bankName;
                        vm.info.bankRealId = vm.essInfor.bankCode;
                        vm.info.bankType = vm.essInfor.bankType;
                        vm.info.phoneNo = vm.essInfor.mobileNo;
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
            })
        }
        //获取用户信息
        function getUser() {
            $http.post(httpsHeader + "/mall/creditAction/getUserInfoById.action", {}).success(function(data) {
                if (data.resultCode == 0000) {
                    var info = data.result.userInfo;
                    if (info.realName) {
                        vm.info.userName = info.realName;
                        vm.showName = false;
                    }
                    if (info.idCard) {
                        vm.info.idCard = info.idCard;
                        vm.showId = false;
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
            });
        }

        //获取银行卡所对应银行
        function getBankName() {
            if (vm.info.cardNo == "") {
                toolTip("银行卡号不能为空！");
                return false;
            } else if (!$verifyService.isBankCardNo(vm.info.cardNo)) {
                toolTip("请输入正确的银行卡号！");
                return false;
            }
            $http.post(httpsHeader + "/mall/creditAction/getBankNameByBankCard.action", { cardNo: vm.info.cardNo }).success(function(data) {
                if (data.resultCode == 0000) {
                    vm.info.bankName = data.result.result.bankName;
                    vm.info.bankRealId = data.result.result.bankRealId;
                } else {
                    vm.info.bankName = "";
                    vm.info.bankRealId = "";
                    toolTip(data.result.message);
                }
            });
            //vm.info.bankName="招商银行";
            //vm.info.bankRealId="CMB";
        }

        //跳转到银行列表页面
        function getBankList() {
            $state.go('bankList', {})
        }

        //点击下一步
        function submit() {
            if (vm.info.userName == "") {
                toolTip("姓名不能为空！");
                return false;
            }
            if (vm.info.idCard == "") {
                toolTip("身份证不能为空！");
                return false;
            }
            if (vm.info.cardNo == "") {
                toolTip("银行卡号不能为空！");
                return false;
            } else if (!$verifyService.isBankCardNo(vm.info.cardNo)) {
                toolTip("请输入正确的银行卡号！");
                return false;
            }
            if (vm.info.bankName == "") {
                toolTip("请输入有效的银行卡号！");
                return false;
            }
            if (vm.info.phoneNo == "") {
                toolTip("银行预留手机号不能为空！");
                return false;
            } else if (!$verifyService.isPhoneNum(vm.info.phoneNo)) {
                toolTip("请输入正确的手机号！");
                return false;
            }
            var wait = new waiting();
            var parmes = {
                userName: vm.info.userName,
                idCard: vm.info.idCard,
                cardNo: vm.info.cardNo,
                phoneNo: vm.info.phoneNo,
                bankName: vm.info.bankName,
                bankRealId: vm.info.bankRealId
            };
            $http.post(httpsHeader + "/mall/creditAction/saveUserCardInfo.action", parmes).success(function(data) {
                if (data.resultCode == 0000) {
                    parmes["smsSeq"] = data.result.result.smsSeq;
                    parmes["bankType"] = data.result.result.bankType;
                    parmes["orderNo"] = data.result.result.orderNo;
                    sessionStorage.setItem("bankCardInfo", JSON.stringify(parmes));
                    $state.go('bankCardCode', {
                        flag: $stateParams.flag
                    }, {
                        location: 'replace'
                    })
                } else {
                    /* var verificationDialog = new dialog().alert({
                        content : '<div>身份证、姓名或银行预留手机号有误（很抱歉您的银行卡信息未能通过验证，请仔细核对）</div>',
                        confirmBtnText : '确定',
                    });*/
                    toolTip(data.result.message);
                }
                wait.hide();
            });
        }
    }

    //银行列表页面
    bankListController.$inject = ['$scope', '$state', '$stateParams', '$http', 'userInfo'];

    function bankListController($scope, $state, $stateParams, $http, userInfo) {
        var vm = this;
        vm.bankList = [];
        var mainScroll = scroll('.main-content');
        getSupportBank();

        //获取绑卡所支持的银行
        function getSupportBank() {
            $http.post(httpsHeader + "/mall/creditAction/getBanks.action", {}).success(function(data) {
                vm.bankList = data.result.banks;
            });
        }

    }

    //输入银行卡验证码页面
    bankCardCodeController.$inject = ['$scope', '$state', '$stateParams', '$http', '$rootScope', 'userInfo', '$common'];

    function bankCardCodeController($scope, $state, $stateParams, $http, $rootScope, userInfo, $common) {
        var vm = this;
        if (userInfo.data.resultCode != "0000") {
            $common.goUser({
                state: 'bankCardCode'
            }, '/order');
        }
        vm.bankCardInfo = $.parseJSON(sessionStorage.getItem("bankCardInfo"));
        vm.num = 60;
        vm.code = "";
        vm.getMegCode = getMegCode;
        vm.canSend = false;
        vm.orderId = sessionStorage.getItem("orderId");
        vm.ionviceId = sessionStorage.getItem("ionviceId");
        vm.id = sessionStorage.getItem('id');
        vm.fromPage = sessionStorage.getItem("fromPage");
        var mainScroll = scroll('.main-content');

        clearInterval($rootScope.banktimer);
        passwordFn();
        setTimer();

        function setTimer() {
            $rootScope.banktimer = setInterval(function() {
                vm.num--;
                $("#codeText").html("重发验证码(" + vm.num + ")");
                if (vm.num == 0) {
                    $("#codeText").html("重发验证码");
                    clearInterval($rootScope.banktimer);
                    vm.canSend = true;
                    vm.num = 60;
                }
            }, 1000)
        }
        //绑定银行卡
        function bandCard() {
            var wait = new waiting();
            var data = {};
            data = $.extend(data, vm.bankCardInfo);
            //data["cardNo"]="123456";
            console.log(vm.code);
            data["validCode"] = vm.code;
            $http.post(httpsHeader + "/mall/creditAction/saveBankCard.action", data).success(function(data) {
                if (data.resultCode == 0000) {
                    if ($stateParams.flag == 'bindCard') {
                        $state.go('bindCard', {

                        })
                    } else if (vm.orderId && !vm.fromPage) { //来自分期购
                        sessionStorage.removeItem("orderId");
                        location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                    } else if (vm.ionviceId) { //来自驴妈妈
                        sessionStorage.removeItem("ionviceId");
                        $state.go('tourism-order', {
                            id: vm.id
                        }, {
                            location: 'replace'
                        })
                    } else if (vm.orderId && vm.fromPage) { //来自继续下单
                        sessionStorage.removeItem("fromPage");
                        sessionStorage.removeItem("orderId");
                        location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                    } else { //来自个人中心
                        var verificationDialog = new dialog().alert({
                            content: '<div>资料提交成功，马上去购物吧!</div>',
                            confirmBtnText: '确定',
                            confirmBtn: function() {
                                $state.go('myCenter', {}, {
                                    location: 'replace'
                                })
                            }
                        })
                    }
                } else {
                    if (data.result) {
                        if (data.result.msg) {
                            toolTip(data.result.msg);
                        } else if (data.result.message) {
                            toolTip(data.result.message);
                        } else {
                            toolTip(data.resultMessage);
                        }
                    } else {
                        toolTip(data.resultMessage);
                    };
                }
                wait.hide();
            });
        }

        //获取手机验证码
        function getMegCode() {
            if (!vm.canSend) { return };
            var wait = new waiting();
            var parmes = {
                userName: vm.bankCardInfo.userName,
                idCard: vm.bankCardInfo.idCard,
                cardNo: vm.bankCardInfo.cardNo,
                phoneNo: vm.bankCardInfo.phoneNo,
                bankName: vm.bankCardInfo.bankName,
                bankRealId: vm.bankCardInfo.bankRealId,
            };
            vm.canSend = false;
            $http.post(httpsHeader + "/mall/creditAction/saveUserCardInfo.action", parmes).success(function(data) {
                if (data.resultCode == 0000) {
                    setTimer();
                } else {
                    toolTip("验证码发送失败");
                    $("#codeText").html("重发验证码");
                    vm.canSend = true;
                }
                wait.hide();
            });
        }

        //密码框功能
        function passwordFn() {
            var $input = $(".fake-box input");
            $("#pwd-input").on("input", function() {
                var pwd = $(this).val().trim();
                vm.code = pwd;
                for (var i = 0, len = pwd.length; i < len; i++) {
                    $input.eq("" + i + "").val(pwd[i]);
                }
                $input.each(function() {
                    var index = $(this).index();
                    if (index >= len) {
                        $(this).val("");
                    }
                });
                if (len == 0) {
                    $(".pwd-box span").show();
                } else if (len == 6) {
                    bandCard();
                    $(".pwd-box span").show();
                } else {
                    $(".pwd-box span").hide();
                }
            });
        }

    }


});