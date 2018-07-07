/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular','css!./invest.css','common/script/lib/swiper.min.js'], function(angular) {
  angular.module('app')
  .controller('investController', investController)
  .controller('investTimeController', investTimeController)
  .controller('investIncomeController', investIncomeController)


  //投资金额
  investController.$inject = ['$scope', '$state', '$q','$verifyService','$investService','$timeout'];
  function investController($scope, $state, $q, $verifyService,$investService,$timeout) {
    var vm = this;
    vm.moneyList = [];
    vm.min = "0";
    vm.max = "2";
    vm.test = vm.max+"万以下";
    //vm.go = go;
    $verifyService.SetIOSTitle("0元购");
    vm.swiperBanner = null;
    active();
    function active(){
      vm.moneyList = $investService.moneyList
      $('.swiper-wrapper').html("");
        for(var i = 0;i < vm.moneyList.length;i++){
          $('.swiper-wrapper').append('<div class="swiper-slide"><span>' + vm.moneyList[i].name + ' </span><em>' + vm.moneyList[i].unit + '</em></div>');
        }
        $timeout(function () {
          vm.swiperBanner = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            centeredSlides: true,
            direction: 'vertical',
            onTouchEnd: function (swiper) {
              $timeout(function () {
                vm.min = $investService.moneyList[swiper.activeIndex].min;
                vm.max = $investService.moneyList[swiper.activeIndex].max;
                vm.test = $investService.moneyList[swiper.activeIndex].name+$investService.moneyList[swiper.activeIndex].unit;
                console.log(vm.min + "--" + vm.max);
              }, 200)
            }
          });
          $(".swiper-wrapper").css("width","100%")
        },200);

    };
  }


  //投资时间
  investTimeController.$inject = ['$scope', '$state',"$stateParams", '$q','$verifyService'];
  function investTimeController($scope, $state,$stateParams ,$q, $verifyService) {
    var vm = this;
    vm.term = "3";
    vm.minInvestMoney = $stateParams.minInvestMoney;
    vm.maxInvestMoney = $stateParams.maxInvestMoney;
    vm.test = $stateParams.test;
    vm.investTimeTest = vm.term+"个月";
    $verifyService.SetIOSTitle("0元购");
    vm.handover = function(myevent,term){
      $(myevent.target).addClass('current')
      .siblings().removeClass('current');
      vm.term = term;
      vm.investTimeTest = vm.term+"个月";
    }

  }

  //投资收益计算
  investIncomeController.$inject = ['$scope', '$state', '$stateParams','$q','$verifyService','$investService','$timeout','$productService','$userService'];
  function investIncomeController($scope, $state,$stateParams, $q, $verifyService,$investService,$timeout,$productService,$userService) {
    var vm = this;
    vm.selectMoney = selectMoney;
    vm.min = $stateParams.minInvestMoney;
    vm.max = $stateParams.maxInvestMoney;
    vm.test = $stateParams.test;
    vm.investTime = $stateParams.investTime;
    vm.investTimeTest = $stateParams.investTimeTest;
    vm.rate = "";
    vm.profit = "";
    vm.tjProductList = [];
    vm.massage = "";
    vm.moneyIndex = 0;
    vm.timeOutIndex = 0;
    vm.tstMin = "";
    vm.tstMax = "";
    vm.tstName = "";
    vm.tstTime = "";
    vm.tstTimeName = "";
    vm.mainScroll = "";
    vm.getTjProduct = getTjProduct;
    vm.isHide = false;
    vm.pageNo = 1;
    vm.pageSize = 9;
    var productBool = true,pullDown = false,mainScroll="";
    $verifyService.SetIOSTitle("0元购");
    active();
    function active(){
      mainScroll = new IScroll('.main-content',{
        preventDefault:false
      });
      mainScroll.on('scrollEnd', function () {
        console.log(this.y - this.maxScrollY)
        pullDown=(this.y - this.maxScrollY) < 1 ?true : false;
        if(pullDown && productBool){
          pullDown = false;
          vm.pageNo++;
          getExpected();
        }
      });
      getExpected();

      if (!getCookie('investGuide')) {
        setCookie('investGuide',1);
        setCookie('minInvestMoney',vm.min);
        setCookie('maxInvestMoney',vm.max);
        setCookie('investTime',vm.investTime);
        setCookie('investTimeTest',vm.investTimeTest);
        setCookie('test',vm.test);
      }
    }

    function getTjProduct(){
      getExpected();
    }

    function getExpected(){
      $investService.getExpectedEarnings({
        minInvestMoney:vm.min,
        maxInvestMoney:vm.max,
        investTime:vm.investTime,
        pageNo:vm.pageNo,
        pageSize:vm.pageSize,
        channelId:$userService.$$channelId
      }).success(function(data){
        if(data.resultCode == "0000"){
          vm.massage = "同时您还可得到以下任意一个商品";
          vm.rate = data.result.rate;
          vm.profit = data.result.msg;
          if(!isEmptyObject(data.result.goodsInfo.list) && data.result.goodsInfo.list.length>0 ){
            if(vm.pageNo === 1){
              vm.tjProductList = data.result.goodsInfo.list;
              for(var i = 0;i<vm.tjProductList.length;i++ ){
                if(vm.tjProductList[i].typeFrom == "1"){
                  vm.tjProductList[i].thumbImgUrl = imgUrl+vm.tjProductList[i].thumbImgUrl;
                }else{
                  vm.tjProductList[i].thumbImgUrl = $productService.imgUrl[3]+vm.tjProductList[i].thumbImgUrl;
                }
              }
            }else{
              for(var i = 0 ; i < data.result.goodsInfo.list.length ; i++){
                if(data.result.goodsInfo.list[i].typeFrom == "1") {
                  data.result.goodsInfo.list[i].thumbImgUrl = imgUrl + data.result.goodsInfo.list[i].thumbImgUrl;
                }else{
                  data.result.goodsInfo.list[i].thumbImgUrl = $productService.imgUrl[3] + data.result.goodsInfo.list[i].thumbImgUrl;
                }
                vm.tjProductList.push(data.result.goodsInfo.list[i]);
              }
            }

          }else{
            if(vm.pageNo === 1){
              vm.tjProductList = [];
              vm.massage = "暂无商品推荐"
              vm.isHide = false;
              productBool = false;
            }else{
              productBool = false;
              vm.isHide = false;
              //toolTip("商品已经全部加载")
            }
          }
        }
        $timeout(function() {
          mainScroll.refresh();
        },200);
        console.log(data);
      });
    }
    function selectMoney(item){
      if(item == "money"){
        var arr = $investService.moneyList;
        var html = '<div class="swiper-container swiper-container-vertical select-swiper"><div class="swiper-wrapper">';
        for (var i = 0; i < arr.length; i++) {
          html+=  '<div class="swiper-slide" id=""><span>'+arr[i].name+' </span><em>'+arr[i].unit+'</em></div>';
        }
        html+= '</div><div class="center-highlight"></div></div>';
        var a = new dialog().confirm({
          content : html,
          confirmBtn : function (){
              if(vm.tstMin && vm.tstMax && vm.tstName){
                $timeout(function() {
                  vm.min = vm.tstMin;
                  vm.max = vm.tstMax;
                  vm.test = vm.tstName;
                },200);
              }
          }
        });
        var swiper = new Swiper('.swiper-container', {
          slidesPerView: 'auto',
          centeredSlides: true,
          direction: 'vertical',
          initialSlide : vm.moneyIndex,
          onTouchEnd: function(swiper){
            $timeout(function(){
              vm.moneyIndex = swiper.activeIndex;
              vm.tstName = arr[swiper.activeIndex].name+arr[swiper.activeIndex].unit;
              vm.tstMin = arr[swiper.activeIndex].min;
              vm.tstMax = arr[swiper.activeIndex].max;
              console.log(vm.min+"--"+vm.max);
            },200)
          }
        });
      }else if(item == "investTime"){
          var arr = $investService.timeList;
          var html = '<div class="swiper-container swiper-container-vertical select-swiper"><div class="swiper-wrapper">';
          for (var i = 0; i < arr.length; i++) {
            html+=  '<div class="swiper-slide"><span>'+arr[i].name+'</span></div>';
          }
          html+= '</div><div class="center-highlight"></div></div>';
          var a = new dialog().confirm({
            content : html,
            confirmBtn : function (){
              if(vm.tstTime && vm.tstTimeName){
                $timeout(function() {
                  vm.investTime = vm.tstTime;
                  vm.investTimeTest = vm.tstTimeName;
                },200);
              }
            }
          });
          var swiper = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            centeredSlides: true,
            direction: 'vertical',
            initialSlide : vm.timeOutIndex,
            onTouchEnd: function(swiper){
              $timeout(function(){
                vm.timeOutIndex = swiper.activeIndex;
                vm.tstTimeName = arr[swiper.activeIndex].name;
                vm.tstTime = arr[swiper.activeIndex].value;
                console.log(vm.investTimeTest+"--"+vm.investTime);
              },200)
            }
          });
      }
      $('.dialog-content .content').css('padding',0)                
    }
  }

});

