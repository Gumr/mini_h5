/*! huicoffee 01-06-2017 */
angular.module("starter", ["ionic", "starter.controllers", "starter.services", "starter.model"]).run(["$ionicPlatform", "$rootScope", "$state", "$_check", "$_service", function(a, b, c, d, e) {
    function f() {
        e.creditInfo({ mobile: g }, i).then(function(a) {
            "00" == a.resultCode && (sessionStorage.setItem("order", a.order), sessionStorage.setItem("totalMoney", a.totalMoney), sessionStorage.setItem("returnUrl", a.returnUrl), sessionStorage.setItem("toBankCard", a.toBankCard), sessionStorage.setItem("isBankCard", a.isBankCard), sessionStorage.setItem("isWhiteUser", a.isWhiteUser), sessionStorage.setItem("businessType", a.businessType), sessionStorage.setItem("utmTerm", a.utmTerm), sessionStorage.setItem("utmMedium", a.utmMedium), sessionStorage.setItem("utmSource", a.utmSource), "y" != a.toBankCard && e.queryHshUserQuotaMessage({}, i).then(function(a) {
                if ("00" == a.retCode) {
                    var b = a.data.quotaStatus;
                    e.get({}, i).then(function(a) { "00" == a.retCode && (3 != b ? "uncertified" == a.data.realname ? c.go("credit.certification", {}) : "uncertified" == a.data.zhima ? c.go("credit.sesame", {}) : "uncertified" == a.data.card || "uncertified" == a.data.address || "uncertified" == a.data.linkperson ? c.go("credit.basicInfo", {}) : c.go("credit.creditResult", {}) : c.go("credit.creditResult", {})) })
                }
            }))
        })
    }
    a.ready(function() { window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard && (cordova.plugins.Keyboard.hideKeyboardAccessoryBar(!0), cordova.plugins.Keyboard.disableScroll(!0)), window.StatusBar && StatusBar.styleDefault() });
    var g = d.getQueryParam("Mobile") || sessionStorage.getItem("tel"),
        h = d.getQueryParam("channelId") || sessionStorage.getItem("channelId"),
        i = d.getQueryParam("Authorication") || localStorage.getItem("Authorication");
    sessionStorage.setItem("tel", g), sessionStorage.setItem("channelId", h), localStorage.setItem("Authorication", i), "y" == d.getQueryParam("isZhima") ? e.getZhiMaFen({}, i).then(function(a) { "00" == a.retCode && f() }) : f()
}]).config(["$stateProvider", "$urlRouterProvider", "$_ajaxProvider", function(a, b, c) { c.setBaseUrl("https://www.funsales.com"), a.state("credit", { url: "/credit", abstract: !0, templateUrl: "templates/credit/credit.html" }).state("credit.certification", { url: "/certification?channelId&Authorication", views: { creditContent: { templateUrl: "templates/credit/certification.html", controller: "certificationCtrl" } } }).state("credit.sesame", { url: "/sesame", views: { creditContent: { templateUrl: "templates/credit/sesame.html", controller: "sesameCtrl" } } }).state("credit.basicInfo", { url: "/basicInfo", views: { creditContent: { templateUrl: "templates/credit/basicInfo.html", controller: "basicInfoCtrl" } } }).state("credit.houseInfo", { url: "/houseInfo", views: { creditContent: { templateUrl: "templates/credit/houseInfo.html", controller: "houseInfoCtrl" } } }).state("credit.securityInfo", { url: "/securityInfo", views: { creditContent: { templateUrl: "templates/credit/securityInfo.html", controller: "securityInfoCtrl" } } }).state("credit.creditResult", { url: "/creditResult", cache: !1, views: { creditContent: { templateUrl: "templates/credit/creditResult.html", controller: "creditResultCtrl" } } }).state("credit.commerce", { url: "/commerce", cache: !1, views: { creditContent: { templateUrl: "templates/credit/commerce.html", controller: "commerceCtrl" } } }).state("credit.contacts", { url: "/contacts", cache: !1, views: { creditContent: { templateUrl: "templates/credit/contacts.html", controller: "contactsCtrl" } } }).state("card", { url: "/card", abstract: !0, templateUrl: "templates/card/card.html" }).state("card.cardInfo", { url: "/cardInfo", views: { cardContent: { templateUrl: "templates/card/cardInfo.html", controller: "cardInfoCtrl" } } }).state("card.verifyCode", { url: "/verifyCode", views: { cardContent: { templateUrl: "templates/card/verifyCode.html", controller: "verifyCodeCtrl" } } }), b.otherwise("/credit/credit") }]), angular.module("starter.controllers", []).controller("certificationCtrl", ["$scope", "$rootScope", "$stateParams", "$state", "$ionicPopover", "$_check", "$_service", "$_toolTip", "$_imgManage", function(a, b, c, d, e, f, g, h, i) {
    function j() {}
    f.SetIOSTitle("身份证实名认证");
    var k = (sessionStorage.getItem("channelId"), localStorage.getItem("Authorication"));
    a.data = { voucher: ["img/credit/up-voucher-1.jpg", "img/credit/up-voucher-2.jpg", "img/credit/up-voucher-3.jpg"], username: "", cardId: "" }, j();
    var l = [];
    a.upload = function(b) {
        mapp.device.selectImages({ maxNum: 1, isCrop: !0, maxWidth: 1024, maxHeight: 768 }, function(c) {
            var d = JSON.parse(c).result[0];
            d = d.replace("http:", "https:"), l[b] = {}, l[b].photoType = "" + b, l[b].url = d, g.verifyIdPhotoList(l[b], k).then(function(c) { "00" == c.resultCode && (a.data.voucher[b] = d) })
        })
    }, a.submit = function() { l.length < 3 ? h.show("请先请上传身份证信息") : g.verifyIdPhotoListTwo(l[0], k).then(function(b) { "00" == b.resultCode && (a.data.username = b.realName, a.data.cardId = b.idCard, a.popover.show()) }) }, e.fromTemplateUrl("identification-popover.html", { scope: a, backdropClickToClose: !1 }).then(function(b) { a.popover = b }), a.identificationPopoverClose = function() { a.popover.hide() }, a.identificationPopoverConfirm = function() { a.data.username ? f.isId(a.data.cardId) ? g.commitIdCard({ realName: a.data.username, idCard: a.data.cardId }, k).then(function(b) { "00" == b.resultCode && (a.popover.hide(), "Y" == b.resData.isReturn ? d.go("credit.contacts", {}, { location: "replace" }) : d.go("credit.sesame", {}, { location: "replace" })) }) : h.show("身份证号码错误") : h.show("姓名不能为空") }
}]).controller("sesameCtrl", ["$scope", "$rootScope", "$state", "$_check", "$_service", function(a, b, c, d, e) {
    d.SetIOSTitle("芝麻授信");
    var f = localStorage.getItem("Authorication");
    a.submit = function() { e.getZhiMaUrl({ event: "sln" }, f).then(function(a) { "00" == a.retCode && (location.href = a.data) }) }
}]).controller("basicInfoCtrl", ["$scope", "$rootScope", "$state", "$ionicPopup", "$_check", "$_picker", "$_service", "$_toolTip", "$_DQpicker", function(a, b, c, d, e, f, g, h, i) {
    function j() { k(), l(), m() }

    function k() { g.queryCreditCardInfo({}, n).then(function(b) { "00" == b.retCode && (a.data.bankNum = b.data.creditBankCard) }) }

    function l() { g.queryPersonAddress({}, n).then(function(b) { "00" == b.retCode && (a.data.address = b.data.personAddress, a.data.attrId = b.data.personProvinceId + " " + b.data.personCityId, a.data.detailAddress = b.data.personAddressDetail) }) }

    function m() { g.queryUrgentPerson({}, n).then(function(b) { if ("00" == b.retCode) { a.data.contactName = b.data.urgentPerson, a.data.contactNum = b.data.urgentMobile, a.data.relationKey = b.data.urgentRelation; for (var c = 0; c < p.length; c++) p[c].key == b.data.urgentRelation && (a.data.relationVal = p[c].value) } }) }
    e.SetIOSTitle("基本信息");
    var n = (sessionStorage.getItem("channelId"), localStorage.getItem("Authorication")),
        o = [{ key: 1, value: "已婚" }, { key: 2, value: "未婚" }],
        p = [{ key: 2, value: "亲子" }, { key: 3, value: "朋友" }, { key: 4, value: "亲属" }, { key: 5, value: "同事" }];
    a.data = { bankNum: "", city: "", cityId: "", detailAddress: "", marriageVal: "", marriageKey: "", contactName: "", contactNum: "", relationVal: "", relationKey: "" }, j(), a.addressSelect = function() { i.picker({ title: "所在省市", val: a.data.city.split(" "), row: 2, callback: function(b) { a.data.city = b.val.join(" "), a.data.cityId = b.key } }) }, a.marriageSelect = function() { f.picker({ title: "请选择", val: a.data.marriageVal.split(" "), cols: [o], callback: function(b) { a.data.marriageVal = b.val.join(" "), a.data.marriageKey = b.key, a.data.contactName = "", a.data.contactNum = "", a.data.relationVal = "", a.data.relationKey = "" } }) }, a.relationSelect = function() { f.picker({ title: "请选择", val: a.data.relationVal.split(" "), cols: [p], callback: function(b) { a.data.relationVal = b.val.join(" "), a.data.relationKey = b.key } }) }, a.submit = function() {
        var b = /[\u4e00-\u9fa5]/;
        "1" == a.data.marriageKey && (a.data.relationVal = "配偶", a.data.relationKey = [1]), console.log(a.data.relationKey), 0 == a.data.bankNum.length ? h.show("银行卡号不能为空") : a.data.bankNum.length > 20 || isNaN(a.data.bankNum) ? h.show("请输入正确的银行卡卡号") : a.data.city ? a.data.detailAddress.length < 2 ? h.show("详细地址限制2-60个字内") : b.test(a.data.detailAddress) ? a.data.marriageVal ? a.data.contactName.length < 2 ? h.show("姓名不能少于2个汉字") : e.isPhoneNum(a.data.contactNum) ? a.data.relationVal ? g.saveCreditCardInfo({ creditCard: a.data.bankNum }, n).then(function(b) {
            "00" == b.retCode && g.updatePersonAddress({ personProvinceId: a.data.cityId[0], personCityId: a.data.cityId[1], personAddress: a.data.city.replace(" ", ""), personAddressDetail: a.data.detailAddress }, n).then(function(b) {
                "00" == b.retCode && g.updateUrgentPerson({ channelNo: sessionStorage.getItem("channelId"), urgentPerson: a.data.contactName, urgentMobile: a.data.contactNum, urgentRelation: a.data.relationKey[0] }, n).then(function(a) {
                    "00" == a.retCode && g.doCredit({ creditType: "1" }, n).then(function(a) {
                        if ("00" == a.retCode) {
                            var b = sessionStorage.getItem("order"),
                                e = parseInt(sessionStorage.getItem("totalMoney"));
                            "y" == b ? sessionStorage.getItem("isBankCard") ? "3" == a.data.status && e < a.data.creditAmount ? d.alert({ title: "授信成功", template: "您的授信额度为" + a.data.creditAmount, okText: "确认", okType: "button-main" }).then(function(a) { location.href = sessionStorage.getItem("returnUrl") }) : c.go("credit.creditResult", {}, { location: "replace" }) : c.go("card.cardInfo", {}, { location: "replace" }) : c.go("credit.creditResult", {}, { location: "replace" })
                        }
                    })
                })
            })
        }) : h.show("请选择关系") : h.show("请输入正确的手机号码") : h.show("请选择婚姻状态") : h.show("请输入正确的详细地址") : h.show("请选择所在省市")
    }
}]).controller("houseInfoCtrl", ["$scope", "$rootScope", "$state", "$timeout", "$window", "$ionicPopover", "$ionicPopup", "$_check", "$_picker", "$_service", "$_toolTip", "$_imgManage", "$_DQpicker", function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
    function n() { o(), p(), q(), r() }

    function o() { "faceTake" == a.data.businessType ? (a.data.isUpload = !0, j.getBuildingById({ id: sessionStorage.getItem("utmTerm") }, v).then(function(b) { "00" == b.retCode && (b.data.buildingName ? (a.data.houseArea = b.data.provinceName + " " + b.data.cityName + " " + b.data.countyName, a.data.houseAreaId = [b.data.provinceId, b.data.cityId, b.data.countyId], a.data.buildName = b.data.buildingName, a.data.buildId = b.data.buildingNo) : a.data.readOnly = !1) })) : j.queryHouse({}, v).then(function(b) { "00" == b.retCode && (b.data ? (a.data.houseArea = b.data.province + " " + b.data.city + " " + b.data.area, a.data.houseAreaId = [b.data.provinceId, b.data.cityId, b.data.countyId], a.data.buildName = b.data.buildName, a.data.purchaseType = b.data.houseTypeName, a.data.purchaseTypeId = b.data.houseType) : (a.data.readOnly = !1, a.data.purchaseTypeReadOnly = !1, a.data.isUpload = !0)) }) }

    function p() { j.queryOwnerType({}, v).then(function(a) { "00" == a.retCode && x.push(a.data) }) }

    function q() { j.queryHouseType({}, v).then(function(a) { "00" == a.retCode && y.push(a.data) }) }

    function r() { j.queryHousePhotoList({}, v).then(function(b) { "00" == b.retCode && (a.data.imgUrl = b.data) }) }

    function s() {
        j.doCredit({ creditType: "3" }, v).then(function(a) {
            if ("00" == a.retCode) {
                var b = sessionStorage.getItem("order"),
                    d = parseInt(sessionStorage.getItem("totalMoney"));
                "y" == b && "3" == a.data.status && d < a.data.creditAmount ? g.alert({ title: "授信成功", template: "您的授信额度为" + a.data.creditAmount, okText: "确认", okType: "button-main" }).then(function(a) { location.href = sessionStorage.getItem("returnUrl") }) : c.go("credit.creditResult", {}, { location: "replace" }), sessionStorage.removeItem("houseInfo")
            }
        })
    }

    function t(b) {
        if (b--, b > 0) {
            var c = "";
            b < 10 && (c = "0"), w = !0, a.data.btnText = "重新发送(" + c + b + ")", d(function() { t(b) }, 1e3)
        } else w = !1, a.data.btnIsDisabled = !1, a.data.btnText = "获取验证码"
    }
    h.SetIOSTitle("房产信息");
    var u = sessionStorage.getItem("channelId"),
        v = localStorage.getItem("Authorication"),
        w = !1,
        x = [],
        y = [],
        z = JSON.parse(sessionStorage.getItem("houseInfo")) || {};
    a.data = { houseArea: z.houseArea || "", houseAreaId: z.houseAreaId || "", buildName: z.buildName || "", buildId: z.buildId || "", houseType: z.houseType || "", houseTypeId: z.houseTypeId || "", purchaseType: z.purchaseType || "", purchaseTypeId: z.purchaseTypeId || "", mortgage: z.mortgage || "", mortgageId: z.mortgageId || "", areaSize: z.areaSize || "", voucherType: z.voucherType || 1, voucherNum: z.voucherNum || "", voucherSize: z.voucherSize || "", codeNum: "", imgUrl: [], bigImgIsShow: !1, validate: "", btnText: "获取验证码", btnIsDisabled: !0, activeSlide: 0, readOnly: !0, purchaseTypeReadOnly: !0, isUpload: !1, businessType: sessionStorage.getItem("businessType") }, n(), a.houseTypeSelect = function() { i.picker({ title: "请选择房产类型", val: a.data.houseType.split(" "), cols: x, callback: function(b) { a.data.houseType = b.val.join(" "), a.data.houseTypeId = b.key } }) }, a.purchaseTypeSelect = function() { a.data.purchaseTypeReadOnly || i.picker({ title: "请选择房产类型", val: a.data.purchaseType.split(" "), cols: y, callback: function(b) { a.data.purchaseType = b.val.join(" "), a.data.purchaseTypeId = b.key } }) }, a.mortgageSelect = function() {
        i.picker({
            title: "请选择房产类型",
            val: a.data.mortgage.split(" "),
            cols: [
                [{ key: 1, value: "是" }, { key: 2, value: "否" }]
            ],
            callback: function(b) { a.data.mortgage = b.val.join(" "), a.data.mortgageId = b.key }
        })
    }, a.upload = function(b) {
        l.upload(b, function(b) {
            j.uploadHousePhoto({ uploadFile: b }, v).then(function(c) { "00" == c.retCode && a.data.imgUrl.push({ photoUrl: b, id: c.photoId }) });
            var c = document.querySelector(".upload-input");
            c.outerHTML = c.outerHTML
        })
    }, a.bigImgShow = function(b) { a.data.activeSlide = b, a.data.bigImgIsShow = !0 }, a.bigImgHide = function() { a.data.bigImgIsShow = !1 }, a.imgDel = function(b, c) { j.deleteHousePhoto({ photoId: c }, v).then(function(c) { "00" == c.retCode && a.data.imgUrl.splice(b, 1) }) }, a.addressSelect = function(b) { a.data.readOnly || m.picker({ title: "所在地区", val: a.data.houseArea.split(" "), row: 3, callback: function(b) { a.data.houseArea = b.val.join(" "), a.data.houseAreaId = b.key } }) }, a.voucherTab = function(b) { a.data.voucherType = b, a.data.voucherNum = "" }, a.checkCode = function() { 5 != a.data.codeNum.length || w ? 5 != a.data.codeNum.length && (a.data.btnIsDisabled = !0, k.show("请输入正确的员工编号")) : a.data.btnIsDisabled = !1 }, a.sms = function() { j.sms({ phoneNum: a.data.codeNum, smsVerifyType: "common" }, v).then(function(b) { "00" == b.retCode && (a.data.btnIsDisabled = !0, t(100)) }) }, a.submit = function() {
        var b = a.data.houseArea.split(" ");
        if (a.data.houseArea)
            if (a.data.buildName)
                if (a.data.houseType)
                    if (a.data.purchaseType)
                        if (a.data.mortgage)
                            if (a.data.areaSize)
                                if (2 != a.data.voucherType || a.data.voucherSize)
                                    if (a.data.voucherNum)
                                        if (a.data.imgUrl.length <= 0 && a.data.isUpload) k.show("请上传房产证");
                                        else if ("faceTake" == a.data.businessType)
            if (a.data.codeNum)
                if (6 != a.data.validate.length) k.show("请输入正确的验证码");
                else {
                    var b = a.data.houseArea.split(" ");
                    j.updateHshHouse({ event: "1", channelId: u, utmSource: sessionStorage.getItem("utmSource"), utmMedium: sessionStorage.getItem("utmMedium"), province: b[0], city: b[1], area: b[2], provinceId: a.data.houseAreaId[0], cityId: a.data.houseAreaId[1], areaId: a.data.houseAreaId[2], buildName: a.data.buildName, buildNameId: a.data.buildId, houseStatus: a.data.houseTypeId[0], houseType: a.data.purchaseTypeId[0], isAnJie: a.data.mortgageId[0], houseArea: a.data.areaSize, managerPhone: a.data.codeNum, managerPhoneCode: a.data.validate, propertyType: a.data.voucherType, houseCard: a.data.voucherNum, wordCode: a.data.voucherSize }, v).then(function(a) { "00" == a.retCode && s() })
                }
        else k.show("请输入员工编号");
        else j.updateHouse({ event: "1", province: b[0], city: b[1], area: b[2], provinceId: a.data.houseAreaId[0], cityId: a.data.houseAreaId[1], areaId: a.data.houseAreaId[2], buildName: a.data.buildName, houseStatus: a.data.houseTypeId[0], houseType: a.data.purchaseTypeId[0], isAnJie: a.data.mortgageId[0], houseArea: a.data.areaSize, infoModule: "hsh", propertyType: a.data.voucherType, houseCard: a.data.voucherNum, wordCode: a.data.voucherSize }, v).then(function(a) { "00" == a.retCode ? s() : "03" == a.retCode || "05" == a.retCode ? g.alert({ title: "提示", template: a.retMsg, okText: "确认", okType: "button-main" }).then(function(a) { c.go("credit.creditResult", {}, { location: "replace" }) }) : k.show(a.retMsg) });
        else k.show("请输入证号");
        else k.show("请输入字号");
        else k.show("请选择面积大小");
        else k.show("请选择是否按揭");
        else k.show("请选择购房类型");
        else k.show("请选择房产类型");
        else k.show("请填写楼盘名称");
        else k.show("请选择所在地区")
    }, a.$on("$ionicView.beforeLeave", function() { z = { houseArea: a.data.houseArea, houseAreaId: a.data.houseAreaId, buildName: a.data.buildName, buildId: a.data.buildId, houseType: a.data.houseType, houseTypeId: a.data.houseTypeId[0], purchaseType: a.data.purchaseType, purchaseTypeId: a.data.purchaseTypeId[0], mortgage: a.data.mortgage, mortgageId: a.data.mortgageId[0], areaSize: a.data.areaSize, voucherType: a.data.voucherType, voucherNum: a.data.voucherNum, voucherSize: a.data.voucherSize }, sessionStorage.setItem("houseInfo", JSON.stringify(z)) })
}]).controller("securityInfoCtrl", ["$scope", "$rootScope", "$state", "$ionicPopup", "$_check", "$_SBpicker", "$_service", "$_toolTip", function(a, b, c, d, e, f, g, h) {
    function i() {}
    e.SetIOSTitle("社保信息");
    var j = localStorage.getItem("Authorication");
    a.data = { city: "", cityId: "", username: "", password: "", passType: "password" }, i(), a.addressSelect = function() { f.picker({ title: "社保所在省市", val: a.data.city.split(" "), callback: function(b) { a.data.city = b.val.join(" "), a.data.cityId = b.key } }) }, a.submit = function() { a.data.city ? a.data.username ? a.data.password ? g.updateSb({ sbProvince: a.data.cityId[0], sbCity: a.data.cityId[1], sbAccount: a.data.username, sbPassword: a.data.password }, j).then(function(a) { "00" == a.retCode && g.credit({ creditType: "2" }, j).then(function(a) { "00" == a.retCode && g.get({ mobile: sessionStorage.getItem("tel") }, j).then(function(a) { "00" == a.retCode && ("uncertified" == a.data.myhouse ? d.confirm({ title: "提交成功", template: "授信评估需10分钟左右，您可以继续提交房产信息。", cancelText: "取消", cancelType: "button-default", okText: "确认", okType: "button-main" }).then(function(a) { a ? c.go("credit.houseInfo", {}, { location: "replace" }) : c.go("credit.creditResult", {}, { location: "replace" }) }) : d.alert({ title: "提交成功", template: "授信评估需10分钟左右，请耐心等待！", okText: "确认", okType: "button-main" }).then(function(a) { c.go("credit.creditResult", {}, { location: "replace" }) })) }) }) }) : h.show("密码不能为空") : h.show("账号不能为空") : h.show("请选择社保所在省市") }, a.change = function() { a.data.passType = "password" == a.data.passType ? "text" : "password" }
}]).controller("commerceCtrl", ["$scope", "$rootScope", "$state", "$ionicPopup", "$_check", "$_service", "$_toolTip", function(a, b, c, d, e, f, g) {
    function h() {}

    function i() { f.updateJd({ jdAccount: a.data.username, jdPassword: a.data.password, phoneCheck: a.data.phoneNum }, j).then(function(b) { "00" == b.retCode ? d.alert({ title: "提交成功", template: "评估需15分钟左右", okText: "确认", okType: "button-main" }).then(function(a) { c.go("credit.creditResult", {}) }) : "02" == b.retCode && d.show({ template: '<input type="text" ng-model="data.phoneNum">', title: "请输入验证码", scope: a, buttons: [{ text: "确认", type: "button-main", onTap: function(b) { a.data.phoneNum ? i() : b.preventDefault() } }] }) }) }
    e.SetIOSTitle("社保信息");
    var j = localStorage.getItem("Authorication");
    a.data = { username: "", password: "", phoneNum: "" }, h(), a.submit = function() { a.data.username ? a.data.password ? i() : g.show("密码不能为空") : g.show("账号不能为空") }
}]).controller("creditResultCtrl", ["$scope", "$rootScope", "$state", "$_check", "$_service", function(a, b, c, d, e) {
    function f() { g(), h() }

    function g() {
        e.queryHshUserQuotaMessage({}, i).then(function(b) {
            if ("00" == b.retCode) {
                var c = sessionStorage.getItem("order");
                a.data.quotaStatus = b.data.quotaStatus, a.data.limitMoney = b.data.creditConsumeQuota, a.data.isModify = b.isModify, 3 == b.data.quotaStatus && "y" == c && parseInt(a.data.needLoan) > parseInt(b.data.usableCreditAmount) && (a.data.isAmount = !0)
            }
        })
    }

    function h() { e.get({ mobile: sessionStorage.getItem("tel") }, i).then(function(b) { "00" == b.retCode && ("uncertified" == b.data.myhouse ? (a.data.isHouseSkip = !0, a.data.houseStatus = "推荐") : "certifing" == b.data.myhouse ? a.data.houseStatus = "审核中" : "fail" == b.data.myhouse ? a.data.houseStatus = "认证失败" : a.data.houseStatus = "已完成", "uncertified" == b.data.shebao || "again_certified" == b.data.shebao ? a.data.isSecurity = !0 : "certifing" == b.data.shebao ? a.data.shebaoStatus = "审核中" : "fail" == b.data.shebao ? a.data.shebaoStatus = "认证失败" : a.data.shebaoStatus = "已完成") }) }
    d.SetIOSTitle("授信结果");
    var i = localStorage.getItem("Authorication");
    a.data = { quotaStatus: "", limitMoney: 0, needLoan: sessionStorage.getItem("totalMoney"), isModify: !1, houseStatus: "", shebaoStatus: "", isHouseSkip: !1, isSecurity: !1, isAmount: !1 }, f(), a.houseSubmit = function() { a.data.isHouseSkip && c.go("credit.houseInfo", {}) }, a.securitySubmit = function() { a.data.isSecurity && c.go("credit.securityInfo", {}) }, a.basicSubmit = function() { c.go("credit.basicInfo", {}) }, a.re = function() { location.href = sessionStorage.getItem("returnUrl") }
}]).controller("contactsCtrl", ["$scope", "$rootScope", "$state", "$ionicPopup", "$_check", "$_service", "$_toolTip", "$_picker", function(a, b, c, d, e, f, g, h) {
    function i() {}
    e.SetIOSTitle("联系人信息");
    var j = localStorage.getItem("Authorication");
    relationArr = [{ key: 1, value: "配偶" }, { key: 2, value: "亲子" }, { key: 3, value: "朋友" }, { key: 4, value: "亲属" }, { key: 5, value: "同事" }], a.data = { contactName: "", contactNum: "", relationVal: "", relationKey: "" }, i(), a.relationSelect = function() { h.picker({ title: "请选择", val: a.data.relationVal.split(" "), cols: [relationArr], callback: function(b) { a.data.relationVal = b.val.join(" "), a.data.relationKey = b.key } }) }, a.submit = function() { a.data.contactName.length < 2 ? g.show("联系人姓名不能少于2个汉字") : e.isPhoneNum(a.data.contactNum) ? a.data.relationVal ? f.updateUrgentPerson({ channelNo: sessionStorage.getItem("channelId"), urgentPerson: a.data.contactName, urgentMobile: a.data.contactNum, urgentRelation: a.data.relationKey[0] }, j).then(function(a) { "00" == a.retCode && f.queryHshUserQuotaMessage({}, j).then(function(a) { "00" == a.retCode && d.alert({ title: "授信成功", template: "您的授信额度为" + a.data.creditConsumeQuota, okText: "确认", okType: "button-main" }).then(function(a) { location.href = sessionStorage.getItem("returnUrl") }) }) }) : g.show("请选择关系") : g.show("请输入正确的联系人手机号码") }
}]).controller("cardInfoCtrl", ["$scope", "$rootScope", "$state", "$_check", "$_service", "$_toolTip", function(a, b, c, d, e, f) {
    function g() { h() }

    function h() { e.getUserProfile({}, i).then(function(b) { "00" == b.resultCode && (b.realName ? (a.data.username = b.realName, a.data.idCard = b.idCard) : a.data.readOnly = !1) }) }
    d.SetIOSTitle("绑卡信息");
    var i = localStorage.getItem("Authorication");
    a.data = { username: "", idCard: "", bankCard: "", bankName: "", phoneNum: "", readOnly: !0 }, g(), a.getBankName = function() { d.isBankCard(a.data.bankCard) ? e.cardBinQuery({ bankcardNo: a.data.bankCard }, i).then(function(b) { "00" == b.resultCode && (a.data.bankName = b.resData.bankName) }) : a.data.bankName = "" }, a.submit = function() { a.data.username ? d.isId(a.data.idCard) ? d.isBankCard(a.data.bankCard) ? d.isPhoneNum(a.data.phoneNum) ? e.applyBind({ realName: a.data.username, idCard: a.data.idCard, bankcardNo: a.data.bankCard, phoneNum: a.data.phoneNum }, i).then(function(b) { "00" == b.resultCode && (sessionStorage.setItem("cardInfo", JSON.stringify(a.data)), c.go("card.verifyCode", {}, { location: "replace" })) }) : f.show("请输入正确的手机号") : f.show("请输入正确的银行卡号") : f.show("请输入正确的身份证号码") : f.show("姓名不能为空") }
}]).controller("verifyCodeCtrl", ["$scope", "$rootScope", "$state", "$timeout", "$window", "$ionicPopup", "$_check", "$_service", "$_toolTip", function(a, b, c, d, e, f, g, h, i) {
    function j() { k() }

    function k() { o--, a.data.btnText = "重发验证码(" + o + ")", d(function() { o > 1 ? k() : (a.data.btnText = "获取验证码", a.data.btnIsDisabled = !1) }, 1e3) }
    g.SetIOSTitle("短信密码验证");
    var l = JSON.parse(sessionStorage.getItem("cardInfo")),
        m = localStorage.getItem("Authorication"),
        n = !0;
    a.data = { message: "", password: "", btnText: "获取验证码", btnIsDisabled: !0, eyeShow: !1 };
    var o = 60;
    j(), a.submit = function() {
        6 != a.data.message.length ? i.show("请输入六位数验证码") : /^\d{6}$/.test(a.data.password) ? h.confirmBind({ smsCode: a.data.message, password: a.data.password }, m).then(function(a) {
            "00" == a.resultCode && (sessionStorage.removeItem("cardInfo"), "y" == sessionStorage.getItem("toBankCard") ? location.href = sessionStorage.getItem("returnUrl") : h.queryHshUserQuotaMessage({}, m).then(function(a) {
                if ("00" == a.retCode) {
                    var b = sessionStorage.getItem("order"),
                        d = parseInt(sessionStorage.getItem("totalMoney"));
                    "3" == a.data.quotaStatus && "y" == b && d < a.data.creditConsumeQuota ? f.alert({ title: "授信成功", template: "您的授信额度为" + a.data.creditConsumeQuota, okText: "确认", okType: "button-main" }).then(function(a) { location.href = sessionStorage.getItem("returnUrl") }) : c.go("credit.creditResult", {}, { location: "replace" })
                }
            }))
        }) : i.show("请输入六位数字密码")
    }, a.getSms = function() { h.applyBind({ realName: l.username, idCard: l.idCard, bankcardNo: l.bankCard, phoneNum: l.phoneNum }, m).then(function(b) { "00" == b.resultCode && (o = 60, a.data.btnIsDisabled = !0, k()) }) }, a.change = function() {
        var b = angular.element(document.querySelector(".password"));
        n ? (a.data.eyeShow = !0, b.attr("type", "text"), n = !1) : (a.data.eyeShow = !1, b.attr("type", "password"), n = !0)
    }
}]), angular.module("starter.model", []).factory("$_service", ["$_ajax", function(a) { return { getProvinceList: function(b, c) { return a.post("/bigdata/houseModel/queryProvince", b, { headers: { Authorication: c } }) }, getCityList: function(b, c) { return a.post("/bigdata/houseModel/queryCity", b, { headers: { Authorication: c } }) }, getCountyList: function(b, c) { return a.post("/bigdata/houseModel/queryCounty", b, { headers: { Authorication: c } }) }, creditInfo: function(b, c) { return a.post("/mall/authorizationCustAction/creditInfo.action", b, { headers: { Authorication: c } }) }, verifyIdPhotoList: function(b, c) { return a.post("/mall/authorizationCustAction/verifyIdPhoto.action", b, { headers: { Authorication: c } }) }, verifyIdPhotoListTwo: function(b, c) { return a.post("/mall/authorizationCustAction/verifyIdPhotoTwo.action", b, { headers: { Authorication: c } }) }, commitIdCard: function(b, c) { return a.post("/mall/authorizationCustAction/commitIdCard.action", b, { headers: { Authorication: c } }) }, getZhiMaUrl: function(b, c) { return a.post("/bigdata/risk/getZhiMaUrl", b, { headers: { Authorication: c } }) }, getZhiMaFen: function(b, c) { return a.post("/bigdata/risk/getZhiMaFen", b, { headers: { Authorication: c } }) }, updatePersonAddress: function(b, c) { return a.post("/bigdata/person/updatePersonAddress", b, { headers: { Authorication: c } }) }, saveCreditCardInfo: function(b, c) { return a.post("/bigdata/creditBankCard/saveCreditCardInfo", b, { headers: { Authorication: c } }) }, queryCreditCardInfo: function(b, c) { return a.post("/bigdata/creditBankCard/queryCreditCardInfo", b, { headers: { Authorication: c } }) }, updateUrgentPerson: function(b, c) { return a.post("/bigdata/person/updateUrgentPerson", b, { headers: { Authorication: c } }) }, queryUrgentPerson: function(b, c) { return a.post("/bigdata/person/queryUrgentPerson", b, { headers: { Authorication: c } }) }, queryPersonAddress: function(b, c) { return a.post("/bigdata/person/queryPersonAddress", b, { headers: { Authorication: c } }) }, querySBProvince: function(b, c) { return a.post("/bigdata/shebao/querySbCode", b, { headers: { Authorication: c } }) }, querySBCity: function(b, c) { return a.post("/bigdata/shebao/querySbCodeByFatherId", b, { headers: { Authorication: c } }) }, updateSb: function(b, c) { return a.post("/bigdata/shebao/updateSb", b, { headers: { Authorication: c } }) }, queryOwnerType: function(b, c) { return a.post("/bigdata/houseModel/queryOwnerType", b, { headers: { Authorication: c } }) }, queryHouseType: function(b, c) { return a.post("/bigdata/houseModel/queryHouseType", b, { headers: { Authorication: c } }) }, uploadHousePhoto: function(b, c) { return a.post("/bigdata/creditHouse/uploadHousePhoto", b, { headers: { Authorication: c } }) }, deleteHousePhoto: function(b, c) { return a.post("/bigdata/creditHouse/deleteHousePhoto", b, { headers: { Authorication: c } }) }, queryHousePhotoList: function(b, c) { return a.post("/bigdata/creditHouse/queryHousePhotoList", b, { headers: { Authorication: c } }) }, sms: function(b, c) { return a.post("/bigdata/creditHouse/sms", b, { headers: { Authorication: c } }) }, updateHouse: function(b, c) { return a.post("/bigdata/creditHouse/updateHouse", b, { headers: { Authorication: c } }, !1, !0) }, queryHouse: function(b, c) { return a.post("/bigdata/creditHouse/queryHouse", b, { headers: { Authorication: c } }) }, updateHshHouse: function(b, c) { return a.post("/bigdata/creditHouse/updateHshHouse", b, { headers: { Authorication: c } }) }, getBuildingById: function(b, c) { return a.post("/bigdata/buildingPrice/getBuildingById", b, { headers: { Authorication: c } }) }, updateJd: function(b, c) { return a.post("/bigdata/shop/updateJd", b, { headers: { Authorication: c } }) }, doCredit: function(b, c) { return a.post("/scc/credit/do-credit", b, { headers: { Authorication: c } }) }, credit: function(b, c) { return a.post("/scc/credit/credit", b, { headers: { Authorication: c } }) }, queryHshUserQuotaMessage: function(b, c) { return a.post("/scc/Loan/queryHshUserQuotaMessage", b, { headers: { Authorication: c } }) }, get: function(b, c) { return a.post("/scc/certified/get", b, { headers: { Authorication: c } }) }, cardBinQuery: function(b, c) { return a.post("/mall/insideCustAction/cardBinQuery.action", b, { headers: { Authorication: c } }) }, getUserProfile: function(b, c) { return a.post("/mall/authorizationCustAction/getUserProfile.action", b, { headers: { Authorication: c } }) }, applyBind: function(b, c) { return a.post("/mall/authorizationCustAction/applyBind.action", b, { headers: { Authorication: c } }) }, smsAction: function(b, c) { return a.post("/mall/smsAction/smsAction.action", b, { headers: { Authorication: c } }) }, confirmBind: function(b, c) { return a.post("/mall/authorizationCustAction/confirmBind.action", b, { headers: { Authorication: c } }) } } }]), angular.module("starter.services", []).factory("$_check", function() {
    return {
        isPhoneNum: function(a) { return /^1(3[0-9]|4[57]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(a) },
        isFixedPhone: function(a) { return /(0[1-9]\d{1,2}-)?[1-9]\d{6,7}/.test(a) },
        isBankCard: function(a) { return /^(\d{16}|\d{19})$/.test(a) },
        isTradePwd: function(a) { return /^\d{6}$/.test(a) },
        isId: function(a) {
            if (18 != a.length) return !1;
            for (var b = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2], c = [1, 0, "x", 9, 8, 7, 6, 5, 4, 3, 2], d = 0, e = 0; e < b.length; e++) {
                if (isNaN(a[e])) return !1;
                d += a[e] * b[e]
            }
            return c[d % 11] == a[17].toLowerCase()
        },
        SetIOSTitle: function(a) {
            var b = angular.element(document.querySelector("body"));
            document.title = a;
            var c = angular.element('<iframe src="/favicon.ico"></iframe>');
            c.on("load", function() { setTimeout(function() { c.off("load").remove() }, 0) }), b.append(c)
        },
        getQueryParam: function(a) {
            var b = location.hash,
                c = new RegExp("(^|&)" + a + "=([^&]*)(&|$)"),
                d = b.substr(b.indexOf("?") + 1).match(c);
            return null != d ? d[2] : ""
        }
    }
}).provider("$_ajax", function() {
    var a = "";
    this.setBaseUrl = function(b) { a = b }, this.$get = ["$http", "$q", "$ionicLoading", "$window", "$_toolTip", function(b, c, d, e, f) {
        return {
            getBaseUrl: function() { return a },
            get: function(e, g, h, i, j) {
                var k = c.defer(),
                    l = i ? e : a + e;
                return d.show(), b.get(l, { params: g }, h).success(function(a) {
                    k.resolve(a), d.hide();
                    var b = a.resultCode || a.retCode,
                        c = a.resultMessage || a.retMsg;
                    "01" == b || "04" == b ? location.href = sessionStorage.getItem("returnUrl") : "00" != b && (j || f.show(c))
                }).error(function() { d.hide(), k.reject("error"), f.show("服务器异常，请稍后再试") }), k.promise
            },
            post: function(e, g, h, i, j) {
                var k = c.defer(),
                    l = i ? e : a + e;
                return d.show(), b.post(l, g, h).success(function(a) {
                    k.resolve(a), d.hide();
                    var b = a.resultCode || a.retCode,
                        c = a.resultMessage || a.retMsg;
                    "04" == b || "01" == b ? location.href = sessionStorage.getItem("returnUrl") : "00" != b && (j || f.show(c))
                }).error(function() { d.hide(), k.reject("error"), f.show("服务器异常，请稍后再试") }), k.promise
            }
        }
    }]
}).service("$_toolTip", ["$ionicLoading", function(a) { this.show = function(b) { a.show({ template: b, noBackdrop: !0, duration: 1500 }) } }]).service("$_picker", ["$timeout", "$_service", function(a, b) {
    function c() {
        f.boudingBox = angular.element('<div class="picker-container"><div class="picker-shade"></div><div class="picker-wrapper"><div class="picker-top-bar"><div class="picker-cancel">取消</div><h2 class="picker-tit">' + f.defaults.title + '</h2><div class="picker-confirm">确认</div></div> <div class="picker-content"><div class="center-highlight"></div></div></div></div>');
        for (var b = 0, c = f.defaults.cols, e = 0; e < c.length; e++) {
            for (var h = '<div class="swiper-container swiper-container-vertical picker-swiper' + e + '"><div class="swiper-wrapper">', i = 0; i < c[e].length; i++) h += '<div class="swiper-slide">' + c[e][i].value + "</div>", b = f.defaults.val[e] == c[e][i].value ? i : b;
            h += "</div></div>", g.val[e] = c[e][b].value, g.key[e] = c[e][b].key, angular.element(f.boudingBox[0].querySelector(".picker-content")).append(h),
                function(b, d) { a(function() { mySwiper = new Swiper(".picker-swiper" + b, { initialSlide: d, slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { g.val[b] = c[b][a.activeIndex].value, g.key[b] = c[b][a.activeIndex].key } }) }, 50) }(e, b)
        }
        d(), f.confirm(), f.cancel()
    }

    function d() { angular.element(document.querySelector("body")).append(f.boudingBox), a(function() { f.boudingBox.addClass("active") }, 50) }

    function e() { g.val = [], g.key = [], f.boudingBox.removeClass("active"), a(function() { f.boudingBox.remove() }, 200) }
    var f = this;
    f.defaults = { title: "", val: "" };
    var g = {};
    g.val = [], g.key = [], f.picker = function(a) { return angular.extend(f.defaults, a), c(), this }, f.confirm = function() {
        var a = f.boudingBox[0].querySelector(".picker-confirm");
        a.onclick = function() { f.defaults.callback && f.defaults.callback(g), e() }
    }, f.cancel = function() {
        var a = f.boudingBox[0].querySelector(".picker-cancel");
        a.onclick = function() { e() }
    }
}]).service("$_SBpicker", ["$timeout", "$_service", function(a, b) {
    function c() {
        h.boudingBox = angular.element('<div class="picker-container"><div class="picker-shade"></div><div class="picker-wrapper"><div class="picker-top-bar"><div class="picker-cancel">取消</div><h2 class="picker-tit">' + h.defaults.title + '</h2><div class="picker-confirm">确认</div></div> <div class="picker-content"><div class="center-highlight"></div><div class="swiper-container swiper-container-vertical picker-swiper0"><div class="swiper-wrapper"></div></div><div class="swiper-container swiper-container-vertical picker-swiper1"><div class="swiper-wrapper"></div></div></div></div></div>');
        for (var b = 0, c = "", d = 0; d < h.provinceList.length; d++) c += '<div class="swiper-slide">' + h.provinceList[d].name + "</div>", b = h.defaults.val[0] == h.provinceList[d].name ? d : b;
        i.val[0] = h.provinceList[b].name, i.key[0] = h.provinceList[b].code, angular.element(h.boudingBox[0].querySelector(".picker-swiper0 .swiper-wrapper")).append(c), a(function() { h.mySwiper0 = new Swiper(".picker-swiper0", { initialSlide: b, slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { i.val[0] = h.provinceList[a.activeIndex].name, i.key[0] = h.provinceList[a.activeIndex].code, e(h.provinceList[a.activeIndex].code) } }), h.mySwiper1 = new Swiper(".picker-swiper1", { slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { i.val[1] = h.cityeList[a.activeIndex].name, i.key[1] = h.cityeList[a.activeIndex].code } }), e(h.provinceList[b].code) }, 50), f(), h.confirm(), h.cancel()
    }

    function d() { b.querySBProvince({}, localStorage.getItem("Authorication")).then(function(a) { "00" == a.retCode && (h.provinceList = a.data, c()) }) }

    function e(a) {
        var c = 0;
        b.querySBCity({ fatherId: a }, localStorage.getItem("Authorication")).then(function(a) {
            if ("00" == a.retCode) {
                h.cityeList = a.data, row = "";
                for (var b = 0; b < h.cityeList.length; b++) row += '<div class="swiper-slide">' + h.cityeList[b].name + "</div>", c = h.defaults.val[1] == h.cityeList[b].name ? b : c;
                i.val[1] = h.cityeList[c].name, i.key[1] = h.cityeList[c].code, angular.element(h.boudingBox[0].querySelector(".picker-swiper1 .swiper-wrapper")).html(row), h.mySwiper1.update(), h.mySwiper1.slideTo(c, 0, !1)
            }
        })
    }

    function f() { angular.element(document.querySelector("body")).append(h.boudingBox), a(function() { h.boudingBox.addClass("active") }, 50) }

    function g() { i.val = [], i.key = [], h.boudingBox.removeClass("active"), a(function() { h.boudingBox.remove() }, 200) }
    var h = this;
    h.defaults = { title: "", val: "" };
    var i = {};
    i.val = [], i.key = [], h.picker = function(a) { return angular.extend(h.defaults, a), d(), this }, h.confirm = function() {
        var a = h.boudingBox[0].querySelector(".picker-confirm");
        a.onclick = function() { h.defaults.callback && h.defaults.callback(i), g() }
    }, h.cancel = function() {
        var a = h.boudingBox[0].querySelector(".picker-cancel");
        a.onclick = function() { g() }
    }
}]).service("$_DQpicker", ["$timeout", "$_service", function(a, b) {
    function c() {
        i.boudingBox = angular.element('<div class="picker-container"><div class="picker-shade"></div><div class="picker-wrapper"><div class="picker-top-bar"><div class="picker-cancel">取消</div><h2 class="picker-tit">' + i.defaults.title + '</h2><div class="picker-confirm">确认</div></div> <div class="picker-content"><div class="center-highlight"></div><div class="swiper-container swiper-container-vertical picker-swiper0"><div class="swiper-wrapper"></div></div><div class="swiper-container swiper-container-vertical picker-swiper1"><div class="swiper-wrapper"></div></div></div></div></div>'), i.defaults.row > 2 && angular.element(i.boudingBox[0].querySelector(".picker-content")).append('<div class="swiper-container swiper-container-vertical picker-swiper2"><div class="swiper-wrapper"></div></div>');
        for (var b = 0, c = "", d = 0; d < i.provinceList.length; d++) c += '<div class="swiper-slide">' + i.provinceList[d].name + "</div>", b = i.defaults.val[0] == i.provinceList[d].name ? d : b;
        j.val[0] = i.provinceList[b].name, j.key[0] = i.provinceList[b].id, angular.element(i.boudingBox[0].querySelector(".picker-swiper0 .swiper-wrapper")).append(c), a(function() { i.mySwiper0 = new Swiper(".picker-swiper0", { initialSlide: b, slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { j.val[0] = i.provinceList[a.activeIndex].name, j.key[0] = i.provinceList[a.activeIndex].id, e(i.provinceList[a.activeIndex].id) } }), i.mySwiper1 = new Swiper(".picker-swiper1", { slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { j.val[1] = i.cityList[a.activeIndex].name, j.key[1] = i.cityList[a.activeIndex].id, i.defaults.row > 2 && f(i.cityList[a.activeIndex].id) } }), i.defaults.row > 2 && (i.mySwiper2 = new Swiper(".picker-swiper2", { slidesPerView: "auto", centeredSlides: !0, direction: "vertical", onSlideChangeEnd: function(a) { j.val[2] = i.countyList[a.activeIndex].name, j.key[2] = i.countyList[a.activeIndex].id } })), e(i.provinceList[b].id) }, 50), g(), i.confirm(), i.cancel()
    }

    function d() { b.getProvinceList().then(function(a) { "00" == a.retCode && (i.provinceList = a.data, c()) }) }

    function e(a) {
        var c = 0;
        b.getCityList({ id: a }).then(function(a) {
            if ("00" == a.retCode) {
                i.cityList = a.data, row = "";
                for (var b = 0; b < i.cityList.length; b++) row += '<div class="swiper-slide">' + i.cityList[b].name + "</div>", c = i.defaults.val[1] == i.cityList[b].name ? b : c;
                j.val[1] = i.cityList[c].name, j.key[1] = i.cityList[c].id, angular.element(i.boudingBox[0].querySelector(".picker-swiper1 .swiper-wrapper")).html(row), i.mySwiper1.update(), i.mySwiper1.slideTo(c, 0, !1), i.defaults.row > 2 && f(i.cityList[c].id)
            }
        })
    }

    function f(a) {
        var c = 0;
        b.getCountyList({ id: a }).then(function(a) {
            if ("00" == a.retCode) {
                i.countyList = a.data, row = "";
                for (var b = 0; b < i.countyList.length; b++) row += '<div class="swiper-slide">' + i.countyList[b].name + "</div>", c = i.defaults.val[2] == i.countyList[b].name ? b : c;
                j.val[2] = i.countyList[c].name, j.key[2] = i.countyList[c].id, angular.element(i.boudingBox[0].querySelector(".picker-swiper2 .swiper-wrapper")).html(row), i.mySwiper2.update(), i.mySwiper2.slideTo(c, 0, !1)
            }
        })
    }

    function g() { angular.element(document.querySelector("body")).append(i.boudingBox), a(function() { i.boudingBox.addClass("active") }, 50) }

    function h() { j.val = [], j.key = [], i.boudingBox.removeClass("active"), a(function() { i.boudingBox.remove() }, 200) }
    var i = this;
    i.defaults = { title: "", val: "", row: 2 };
    var j = {};
    j.val = [], j.key = [], i.picker = function(a) { return angular.extend(i.defaults, a), d(), this }, i.confirm = function() {
        var a = i.boudingBox[0].querySelector(".picker-confirm");
        a.onclick = function() { i.defaults.callback && i.defaults.callback(j), h() }
    }, i.cancel = function() {
        var a = i.boudingBox[0].querySelector(".picker-cancel");
        a.onclick = function() { h() }
    }
}]).factory("$_imgManage", function() {
    function a(a) {
        var b = 1024,
            c = 768,
            d = document.createElement("canvas"),
            e = a.width,
            f = a.height;
        e > f ? e > b && (f = Math.round(f *= b / e), e = b) : f > c && (e = Math.round(e *= c / f), f = c), d.width = e, d.height = f;
        var g = d.getContext("2d");
        return g.drawImage(a, 0, 0, e, f), d.toDataURL("image/jpeg", .9)
    }
    return {
        upload: function(b, c) {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var d = b[0],
                    e = new FileReader;
                e.onload = function(b) {
                    var d = new Blob([b.target.result]);
                    window.URL = window.URL || window.webkitURL;
                    var e = window.URL.createObjectURL(d),
                        f = new Image;
                    f.src = e, f.onload = function() {
                        var b = a(f),
                            d = b.split(";")[0];
                        d.indexOf(":image/") != -1 ? c && c(b) : $_toolTip.show("请上传jpg，png，gif格式的图片")
                    }
                }, e.readAsArrayBuffer(d)
            } else alert("浏览器不支持")
        },
        getBase64Image: function(a) {
            var b = document.createElement("canvas");
            b.width = a.width, b.height = a.height;
            var c = b.getContext("2d");
            c.drawImage(a, 0, 0, a.width, a.height);
            var d = a.src.substring(a.src.lastIndexOf(".") + 1).toLowerCase(),
                e = b.toDataURL("image/" + d);
            return e
        }
    }
});