/**
 * Created by Administrator on 2016/8/20.
 */
define(['angular', 'css!./buy.css', 'common/script/lib/swiper.min.js'], function(angular) {
    angular.module('app')
        .controller("orderController", orderController)
        .controller("invoiceController", invoiceController)
        .controller('addPersonCtrl', addPersonCtrl)

    /*订单填写*/
    orderController.$inject = ['$scope', '$state', '$verifyService', '$timeout', '$tourismService', '$stateParams', '$window', '$http'];

    function orderController($scope, $state, $verifyService, $timeout, $tourismService, $stateParams, $window, $http) {
        var vm = this;
        vm.list = [];
        vm.goodsId = "";
        vm.id = $stateParams.id;
        vm.getPackage = "";
        vm.fromPage = 'tourism-order';
        var boos = sessionStorage.orderInfo
        $verifyService.SetIOSTitle("订单填写");
        vm.toAddPerson = toAddPerson;
        vm.toInvoice = toInvoice;
        vm.setdata = setdata;
        vm.time = "未填写";
        vm.invoiceAddressId = $stateParams.addressId;
        vm.invoiceIsCompany = $stateParams.invoiceIsCompany;
        vm.request = { orderInfo: {}, booker: "", travellers: "", invoice: "" };
        vm.booker = { name: $stateParams.name, mobile: $stateParams.mobile, email: $stateParams.email }; //联系人数据
        vm.emrgency = { name: $stateParams.ename, mobile: $stateParams.emobile } //紧急联系数据
        vm.money = JSON.parse(sessionStorage.orderbasInfo).goodsMoney; //商品价格
        vm.jump = jump;
        vm.Preservation = Preservation;
        //判断分期数价钱
        if ($stateParams.stages) {
            vm.stages = $stateParams.stages;
            stagesCount(vm.stages)
        }
        // 切换
        vm.handover = function(myevent, val) {
                vm.stages = val;
                stagesCount(vm.stages)
                vm.periods = vm.stages;
            }
            //自定义分期协议alert
        $scope.alert = function() {
            $('#lvxy').css('display', 'block')
            $('.lvxy-dele').css('display', 'block')
        }
        $scope.close = function() {
            $('#lvxy').css('display', 'none')
            $('.lvxy-dele').css('display', 'none')
        }

        //功能效果
        get();

        function get() {
            initial();
            //页面默认分期
            function initial() {
                vm.stages = 3;
                stagesCount(3)
            }
            jump();
            //修改添加联系人
            vm.modify = function(index) {
                $state.go('tourism-addPerson', {
                    id: $stateParams.id,
                    index: index,
                    stages: vm.stages
                })
            }


            //删除添加联系人
            vm.setnone = function(myevent, index) {
                $scope.addlit.splice(index, 1)
                console.log($scope.addlit)
                $window.sessionStorage.setItem('touristInfos', JSON.stringify($scope.addlit));
            }

            var wait = new waiting();
            $tourismService.getProductInfo({
                id: $stateParams.id
            }).success(function(data) {
                vm.rate = data.rate;
                vm.goodsId = data.goodsId;
                var date = data.packageProduct;
                vm.productName = date.product[0].productName[0]
                vm.list = date.product[0].productImage[0].url[0];
                vm.getPackage = date.packageName;
                vm.adultPrice = data.adultPrice;
                vm.bookername = data.packageProduct.bookLimit[0].booker[0].name;
                vm.bookeremail = data.packageProduct.bookLimit[0].booker[0].email;
                vm.bookermobile = data.packageProduct.bookLimit[0].booker[0].mobile;
                vm.emergency = data.packageProduct.bookLimit[0].emergency;
                //获取参数
                $scope.addlit = [];
                if (sessionStorage.touristInfos == null) {
                    $scope.addlit = [];
                } else {
                    $scope.addlit = JSON.parse(sessionStorage.touristInfos)
                    vm.request.travellers = $scope.addlit;
                }
                if (sessionStorage.invoice == null) {
                    $scope.addinvoice = [];
                } else {
                    var time = sessionStorage.invoice;
                    if (time) {
                        $scope.addinvoice = JSON.parse(time)
                        vm.request.invoice = $scope.addinvoice
                    }
                    if (vm.request.invoice.invoiceIsCompany != "0" && vm.request.invoice.invoiceIsCompany != "1") {
                        vm.time = "未填写"
                    } else {
                        vm.time = "已填写"
                    }
                }
                if (sessionStorage.orderbasInfo == null) {
                    $scope.addorderInfo = [];
                } else {
                    $scope.addorderInfo = JSON.parse(sessionStorage.orderbasInfo)
                    vm.request.orderInfo = $scope.addorderInfo;
                    vm.request.orderInfo.goodsId = vm.goodsId;
                    vm.request.orderInfo.channelId = sessionStorage.channelId
                }
                $timeout(function() {
                    scroll('.main-content');
                }, 300)
                wait.hide();
            })
        }
        //跳转页面页面信息保留
        function jump() {
            var jump = sessionStorage.jump
            if (jump) {
                jump = JSON.parse(jump);
                vm.booker.name = jump.name;
                vm.booker.mobile = jump.mobile;
                vm.booker.email = jump.email;
            }
            var jump2 = sessionStorage.jump2
            if (jump2) {
                jump2 = JSON.parse(jump2);
                vm.emrgency.name = jump2.name;
                vm.emrgency.mobile = jump2.mobile;
            }
        }
        //分期算法
        function stagesCount(val) {
            vm.Wmoney = parseFloat(vm.money / val).toFixed(2)
            vm.Smoney = parseFloat((vm.money * 0.04) + (vm.money / val)).toFixed(2)
            vm.Mmoney = parseFloat((vm.money * 0.01) + (vm.money / val)).toFixed(2)
        }

        //跳转到授权
        function OrderPayment() {
            $tourismService.getOrderPayment({
                id: vm.orderId
            }).success(function(data) {
                console.log(data);
                if (data.resultCode == "1000") {
                    location.href = httpsHeader + "/mall/orderAction/find.action?channelId=" + sessionStorage.channelId;
                } else {
                    toolTip(data.resultMessage);
                }
            })
        }
        //记住页面信息
        function Preservation() {
            var jump = vm.booker;
            var jump2 = vm.emrgency;
            if (jump) {
                $window.sessionStorage.setItem('jump', JSON.stringify(jump));
                $window.sessionStorage.setItem('jump2', JSON.stringify(jump2));
            }
        }
        //本地验证||确认按钮
        function setdata() {
            Preservation();
            vm.request.orderInfo.periods = vm.stages;
            //验证出游人信息
            var obj = {};
            for (var i = 0; i < $scope.addlit.length; i++) {
                var name = $scope.addlit[i].name;
                var credentials = $scope.addlit[i].credentials
                if (!obj[name] || !obj[credentials]) {
                    obj[name] = true;
                    obj[credentials] = true;
                } else {
                    vm.Whore = 0;
                    break;
                }
            }
            if (vm.Whore == 0) {
                toolTip('出游人信息不能一致')
            } else if (!vm.booker.name && vm.bookername == 'true') {
                toolTip('姓名不能为空')
            } else if (!$verifyService.isEmail(vm.booker.email) && vm.bookeremail == 'true') {
                toolTip('请输入正确的邮箱')
            } else if (!$verifyService.isPhoneNum(vm.booker.mobile) && vm.bookermobile == 'true') {
                toolTip('请输入正确的手机号码')
            } else if (!vm.emrgency.name && vm.emergency == 'true') {
                toolTip('紧急联系人姓名不能为空')
            } else if (!$verifyService.isPhoneNum(vm.emrgency.mobile) && vm.emergency == 'true') {
                toolTip('请输入紧急联系人的正确手机号码')
            } else if (!vm.request.travellers) {
                toolTip('请填写出游人信息')
            } else if (!vm.stages) {
                toolTip('请选择分期期数')
            } else if (vm.booker.name == vm.emrgency.name) {
                toolTip('联系人姓名与紧急联系人姓名不能一致')
            } else if (vm.booker.mobile == vm.emrgency.mobile) {
                toolTip('联系人手机号与紧急联系人手机号不能一致')
            } else if (vm.request.travellers.length != vm.request.orderInfo.adultNum + vm.request.orderInfo.childNum) {
                toolTip('出游人信息数量不对')
            } else {
                vm.request.booker = vm.booker
                vm.request.emrgency = vm.emrgency
                $tourismService.getValidateOrder({
                    orderInfo: vm.request.orderInfo,
                    booker: vm.request.booker,
                    travellers: vm.request.travellers,
                    emergency: vm.request.emrgency
                }).success(function(data) {
                    if (data.resultCode == "1000") {
                        $tourismService.checkUserCreditLine({
                            goodsMoney: vm.request.orderInfo.orderMoney
                        }).success(function(data) {
                            if (data.response.state[0].code == "6") {
                                $state.go('bankCard', {
                                    flag: 'tourism-order',
                                    id: $stateParams.id,
                                    ionviceId: vm.orderId
                                })
                            } else if (data.response.state[0].code == "4") {
                                $window.sessionStorage.removeItem('orderId')
                                $window.sessionStorage.setItem('ionviceId', JSON.stringify(vm.time));
                                $window.sessionStorage.setItem('id', $stateParams.id)
                                $state.go('essInfor', {
                                    flag: 'tourism-order',
                                    id: $stateParams.id,
                                    ionviceId: vm.orderId
                                }, {
                                    location: 'replace'
                                })
                            } else if (data.response.state[0].code == "2") {
                                $state.go('login', {
                                    flog: 'tourism-order',
                                    id: $stateParams.id,
                                    stages: vm.stages
                                }, {
                                    location: 'replace'
                                })
                            } else if (data.response.state[0].code == "1") {
                                if (vm.time == "未填写") {
                                    var wait = new waiting();
                                    $tourismService.getCreateOrder({
                                        orderInfo: vm.request.orderInfo,
                                        booker: vm.request.booker,
                                        travellers: vm.request.travellers,
                                        emergency: vm.request.emrgency
                                    }).success(function(data) {
                                        vm.orderId = data.result;
                                        if (data.resultCode == '2') {
                                            $state.go('login', {
                                                flog: 'tourism-order',
                                                id: $stateParams.id,
                                                stages: vm.stages
                                            }, {
                                                location: 'replace'
                                            })
                                        } else if (vm.orderId == null) {
                                            toolTip('网络错误，请稍后再试！');
                                            wait.hide();
                                        } else if (data.resultCode == "1000" || "0000") {
                                            location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId
                                        }
                                        wait.hide();
                                    })
                                } else {
                                    var wait = new waiting();
                                    $tourismService.getCreateOrder({
                                        orderInfo: vm.request.orderInfo,
                                        booker: vm.request.booker,
                                        travellers: vm.request.travellers,
                                        emergency: vm.request.emrgency,
                                        invoice: vm.request.invoice
                                    }).success(function(data) {
                                        vm.orderId = data.result;
                                        if (data.resultCode == '2') {
                                            $state.go('login', {
                                                flog: 'tourism-order',
                                                id: $stateParams.id,
                                                stages: vm.stages
                                            }, {
                                                location: 'replace'
                                            })
                                        } else if (vm.orderId == null) {
                                            toolTip('网络错误，请稍后再试！')
                                            wait.hide();
                                        } else if (data.resultCode = "1000" || "0000") {
                                            location.href = httpsHeader + "/mall/orderAction/orderConfirm.action?orderId=" + vm.orderId;
                                        }
                                    })
                                    wait.hide();
                                }
                            } else {
                                toolTip(data.response.state[0].resultMessage[0])
                            }
                        })
                    } else {
                        toolTip(data.resultMessage);
                    }

                })
            }
        }
        //跳转添加出游人
        function toAddPerson() {
            Preservation()
            $state.go('tourism-addPerson', {
                id: $stateParams.id,
                stages: vm.stages
            })
        }
        //跳转发票信息
        function toInvoice() {
            Preservation()
            $state.go('tourism-invoice', {
                addressId: $stateParams.addressId,
                invoiceIsCompany: vm.invoiceIsCompany,
                id: $stateParams.id,
                stages: vm.stages,
                orderstate: $stateParams.orderstate,
                ordertext: $stateParams.ordertext
            })
        }

    }

    /*发票信息*/
    invoiceController.$inject = ['$scope', '$state', '$verifyService', '$timeout', '$tourismService', '$stateParams', '$address', '$window'];

    function invoiceController($scope, $state, $verifyService, $timeout, $tourismService, $stateParams, $address, $window) {
        $verifyService.SetIOSTitle("发票信息");
        var vm = this;
        vm.cookie = { invoiceTitle: "", invoiceIsCompany: "", invoiceAddressId: $stateParams.addressId }
        vm.address = "";
        vm.placeholder = "请输入公司名称";
        vm.goorder = goorder;
        vm.goaddAddress = goaddAddress;
        vm.orderstate = $stateParams.orderstate || "";

        //跳转页面后数据不变
        if ($stateParams.orderstate == "0") {
            vm.cookie.invoiceIsCompany = "0";
            $('.f1').addClass('active')
        } else if ($stateParams.orderstate == "1") {
            vm.cookie.invoiceIsCompany = "1";
            $('.f2').addClass('active');
            vm.cookie.invoiceTitle = $stateParams.ordertext
        } else {
            var invoice = $window.sessionStorage.getItem('invoice');
            if (invoice) {
                invoice = JSON.parse(invoice)
                if (invoice.invoiceIsCompany == "0") {
                    vm.cookie.invoiceIsCompany = "0";
                    $('.f1').addClass('active')
                    vm.cookie.invoiceAddressId = invoice.invoiceAddressId
                } else if (invoice.invoiceIsCompany == "1") {
                    vm.cookie.invoiceIsCompany = "1";
                    vm.cookie.invoiceTitle = invoice.invoiceTitle
                    $('.f2').addClass('active');
                    vm.cookie.invoiceAddressId = invoice.invoiceAddressId
                }
            }
        }

        //页面初始化	
        init();

        function init() {
            //内容区滚动
            $timeout(function() {
                    scroll('.main-content');
                }, 300)
                //根据ID获取收货地址
            $address.getObtain({
                consigneeId: vm.cookie.invoiceAddressId
            }).success(function(data) {
                $scope.list = data.result.provinceName
                $scope.list += data.result.cityName
                $scope.list += data.result.countyName ? data.result.countyName : '';
                $scope.list += data.result.townName ? data.result.townName : '';
                $scope.list += data.result.consigneeAddress
                $scope.list += data.result.consigneeName
                $scope.list += data.result.consigneeMobile
                if (vm.cookie.invoiceAddressId == null) {
                    vm.address = "请选择"
                } else {
                    vm.address = $scope.list
                }
            })

            //切换
            vm.handover = function(myevent) {
                $(myevent.currentTarget).addClass('active')
                    .siblings().removeClass('active');
                if ($(myevent.currentTarget).attr("class") == 'f1 active') {
                    vm.cookie.invoiceIsCompany = "0";
                    vm.placeholder = "";
                    vm.cookie.invoiceTitle = "";
                    vm.orderstate = "0"
                    $('.invoice-text').prop("readonly", true);
                } else {
                    vm.cookie.invoiceIsCompany = "1";
                    vm.placeholder = "请输入公司名称"
                    $('.invoice-text').prop("readonly", false);
                    vm.orderstate = "1"
                }
            }
        }
        //跳转到收货地址
        function goaddAddress() {
            $state.go('addAddress', {
                fromPage: 'tourism-invoice',
                id: $stateParams.id,
                stages: $stateParams.stages,
                orderstate: vm.cookie.invoiceIsCompany,
                ordertext: vm.cookie.invoiceTitle
            }, {
                location: 'replace'
            })
        }
        //确认按钮
        function goorder() {
            if ($('.f1').attr("class") != 'f1 active' && $('.f2').attr("class") != 'f2 invoice-info active') {
                toolTip('请确认发票类型')
            } else if (vm.address == "请选择") {
                toolTip('请填写收货地址')
            } else if (vm.cookie.invoiceIsCompany == "1" && !vm.cookie.invoiceTitle) {
                toolTip('请输入公司地址')
            } else {
                var time = vm.cookie
                if (time) {
                    $window.sessionStorage.setItem('invoice', JSON.stringify(time));
                }
                $state.go('tourism-order', {
                    invoiceTitle: vm.cookie.invoiceTitle,
                    invoiceIsCompany: vm.cookie.invoiceIsCompany,
                    invoiceAddressId: vm.cookie.invoiceAddressId,
                    orderId: vm.orderId,
                    addressId: $stateParams.addressId,
                    id: $stateParams.id,
                    stages: $stateParams.stages,
                    orderstate: vm.orderstate,
                    ordertext: vm.cookie.invoiceTitle
                })
            }
        }
    }

    /*新增旅游人*/
    addPersonCtrl.$inject = ['$scope', '$state', '$verifyService', '$timeout', '$stateParams', '$productService', '$userService', '$window', '$tourismService'];

    function addPersonCtrl($scope, $state, $verifyService, $timeout, $stateParams, $productService, $userService, $window, $tourismService) {
        var vm = this;
        vm.init = init;
        $verifyService.SetIOSTitle("新增出游人");
        var mainScroll = scroll('.main-content');
        $scope.voucherType = false;

        //缓存页面元素
        var EL = {
            voucher: $('.form-voucher'),
            sex: $('.form-sex'),
            birthday: $('.form-birthday'),
            crowd: $('.form-crowd')
        }

        //select选择数据
        var credentialsTypeArr = [];
        var genderArr = [];
        var personTypeArr = [];
        var yearArr = [];
        var credentialsType = { ID_CARD: '身份证', HUZHAO: '护照', GANGAO: '港澳台通行证' }
        var gender = { male: '男', female: '女' }
        var personType = { adult: '成人', child: '儿童' }
        angular.forEach(credentialsType, function(val) { credentialsTypeArr.push(val); })
        angular.forEach(gender, function(val) { genderArr.push(val); })
        angular.forEach(personType, function(val) { personTypeArr.push(val); })
        var year = new Date().getFullYear();
        for (var i = year; i >= year - 120; i--) { yearArr.push(i); }

        //证件类型
        $scope.voucherClick = function(myevent) {
            var myPicker = new picker(myevent.currentTarget, {
                    title: "请选择证件类型",
                    cols: [{ values: credentialsTypeArr }]
                })
                /*.on('confirm',function(){
                				$scope.$apply(function(){
                					$scope.voucherType = true;
                				})		
                			})	*/
        }

        //性别
        $scope.sexClick = function(myevent) {
            var myPicker = new picker(myevent.currentTarget, {
                title: "请选择性别",
                cols: [{ values: genderArr }]
            })
        }

        //出生日期

        $scope.birthdayClick = function(myevent) {
            var myPicker = new picker(myevent.currentTarget, {
                title: "请选择出生日期",
                separator: '-',
                cols: [
                    { values: yearArr },
                    { values: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] },
                    { values: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'] }
                ]
            })
        }

        //人群
        $scope.crowdClick = function(myevent) {
            var myPicker = new picker(myevent.currentTarget, {
                title: "请选择人群",
                cols: [{ values: personTypeArr }]
            })
        }

        //生日性别补全
        $scope.autoCompleInfo = function() {
            var birthday = [];
            vm.bir = birthday
            var sex = '';
            if (EL.voucher.val() == '身份证' && $scope.voucherNum) {
                if ($scope.voucherNum.length == 18) {
                    sex = $scope.voucherNum.substring(16, 17) % 2 == 0 ? '女' : '男';
                    birthday.push($scope.voucherNum.substring(6, 10));
                    birthday.push($scope.voucherNum.substring(10, 12));
                    birthday.push($scope.voucherNum.substring(12, 14));
                }
                if ($scope.voucherNum.length == 15) {
                    sex = $scope.voucherNum.substring(13, 14) % 2 == 0 ? '女' : '男';
                    birthday.push('19' + $scope.voucherNum.substring(6, 8));
                    birthday.push($scope.voucherNum.substring(8, 10));
                    birthday.push($scope.voucherNum.substring(10, 12));
                }
            }
            EL.sex.val(sex);
            EL.birthday.val(birthday.join('-'));
        }

        var touristInfos = sessionStorage.touristInfos
        if (touristInfos) {
            var tfs = JSON.parse(touristInfos);
            if ($stateParams.index) {
                angular.forEach(credentialsType, function(val, key) { if (tfs[$stateParams.index].credentialsType == key) tfs[$stateParams.index].credentialsType = val; })
                angular.forEach(gender, function(val, key) { if (tfs[$stateParams.index].gender == key) tfs[$stateParams.index].gender = val; })
                angular.forEach(personType, function(val, key) { if (tfs[$stateParams.index].personType == key) tfs[$stateParams.index].personType = val; })
                $scope.username = tfs[$stateParams.index].name
                $scope.englishName = tfs[$stateParams.index].enName;
                $scope.mobile = tfs[$stateParams.index].mobile;
                $scope.email = tfs[$stateParams.index].email;
                $scope.voucherNum = tfs[$stateParams.index].credentials;
                $scope.voucher = tfs[$stateParams.index].credentialsType;
                $scope.sex = tfs[$stateParams.index].gender;
                $scope.crowd = tfs[$stateParams.index].personType;
                $scope.birthday = tfs[$stateParams.index].birthday;
            }
        }
        init();

        function init() {
            $tourismService.getProductInfo({
                id: $stateParams.id
            }).success(function(data) {
                vm.travellername = data.packageProduct.bookLimit[0].traveller[0].name[0];
                vm.travellerenName = data.packageProduct.bookLimit[0].traveller[0].enName[0];
                vm.travelleremail = data.packageProduct.bookLimit[0].traveller[0].email[0];
                vm.travellermobile = data.packageProduct.bookLimit[0].traveller[0].mobile[0];
                vm.travellerpersonType = data.packageProduct.bookLimit[0].traveller[0].personType[0];
                vm.travellercredentials = data.packageProduct.bookLimit[0].traveller[0].credentials[0];
                vm.travellercredentialsType = data.packageProduct.bookLimit[0].traveller[0].credentialsType[0];
            })
        }
        //提交
        $scope.submit = function() {
            vm.Birthday = EL.birthday.val().split('-')[0]
            vm.b = EL.crowd.val()

            var touristInfo = {};
            touristInfo.name = $scope.username;
            touristInfo.enName = $scope.englishName;
            touristInfo.mobile = $scope.mobile;
            touristInfo.email = $scope.email;
            touristInfo.credentialsType = EL.voucher.val();
            touristInfo.credentials = $scope.voucherNum;
            touristInfo.gender = EL.sex.val();
            touristInfo.birthday = EL.birthday.val();
            touristInfo.personType = EL.crowd.val();

            if (!touristInfo.name && vm.travellername == "TRAV_NUM_ALL") {
                toolTip('姓名不能为空')
            } else if (!touristInfo.enName && vm.travellerenName == 'TRAV_NUM_ALL') {
                toolTip('英文名不能为空')
            } else if (!$verifyService.isPhoneNum(touristInfo.mobile) && vm.travellermobile == 'TRAV_NUM_ALL') {
                toolTip('请输入正确的手机号码')
            } else if (!$verifyService.isEmail(touristInfo.email) && vm.travelleremail == 'TRAV_NUM_ALL') {
                toolTip('请输入正确的邮箱')
            } else if (touristInfo.credentialsType == '' && (vm.travellercredentials == 'TRAV_NUM_ALL' || vm.travellercredentials == 'TRAV_NUM_ONE')) {
                toolTip('请选择证件类型')
            } else if (touristInfo.credentialsType == "身份证" && touristInfo.credentials.length < 15) {
                toolTip('请输入正确的证件号码')
            } else if (touristInfo.credentialsType == "护照" && !$verifyService.isPassport(touristInfo.credentials)) {
                toolTip('请输入正确的证件号码')
            } else if (touristInfo.credentialsType == "港澳通行证" && !$verifyService.isHongkongat(touristInfo.credentials)) {
                toolTip('请输入正确的证件号码')
            } else if (touristInfo.gender == '') {
                toolTip('请选择性别')
            } else if (2016 - parseInt(vm.Birthday) < 18 && vm.b == "成人" || 2016 - parseInt(vm.Birthday) > 18 && vm.b == "儿童") {
                toolTip('人群选择有误')
            } else if (touristInfo.birthday == '') {
                toolTip('请选择出生日期')
            } else if (touristInfo.personType == '' && (vm.travellerpersonType == 'TRAV_NUM_ALL' || vm.travellerpersonType == 'TRAV_NUM_ONE')) {
                toolTip('请选择人群')
            } else {
                angular.forEach(credentialsType, function(val, key) { if (touristInfo.credentialsType == val) touristInfo.credentialsType = key; })
                angular.forEach(gender, function(val, key) { if (touristInfo.gender == val) touristInfo.gender = key; })
                angular.forEach(personType, function(val, key) { if (touristInfo.personType == val) touristInfo.personType = key; })
                if ($stateParams.index == null) {
                    var item = $window.sessionStorage.getItem('touristInfos');
                    if (item) {
                        item = JSON.parse(item);
                        item.push(touristInfo);
                        $window.sessionStorage.setItem('touristInfos', JSON.stringify(item));
                    } else {
                        $window.sessionStorage.setItem('touristInfos', JSON.stringify([touristInfo]))
                    }
                    $state.go('tourism-order', {
                        id: $stateParams.id,
                        stages: $stateParams.stages
                    })
                } else {
                    tfs[$stateParams.index] = touristInfo;
                    $window.sessionStorage.setItem('touristInfos', JSON.stringify(tfs));
                    $state.go('tourism-order', {
                        id: $stateParams.id,
                        stages: $stateParams.stages
                    })
                }

            }
        }
    }

});