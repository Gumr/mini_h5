/**
 * home.js
 * @authors Casper 
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular','css!./easyPay.css','common/script/lib/swiper.min.js'], function(angular) {

  angular.module('app')
  .controller('easyPayController', easyPayController);

  /*分期购*/
  easyPayController.$inject = ['$scope', '$state','$stateParams','$q','$verifyService','$timeout','$easyPayService','$productService','$userService','$location','$anchorScroll'];
  function easyPayController($scope, $state,$stateParams, $q,$verifyService,$timeout,$easyPayService,$productService,$userService,$location,$anchorScroll){
    $verifyService.SetIOSTitle("分期购");
    var vm=this;
    vm.imgServer = imgUrl;
    vm.jdImgServer = $productService.imgUrl[4];
    vm.hotGoodsList = [];
    vm.bannerAdList = []; 
    vm.recommendGoodsList = [];
    vm.travelGoodsList = [];

    init();
    function init(){
      getHotGoods();
      getRecommendGoods();
      getTravelGoods();
      vm.mainScroll =  scroll(".main-content");

      //旅游锚点
      if ($stateParams.anchor == 'travel') {
        var t = $('#travel').offset().top;
          vm.mainScroll.scrollTo(0, -t)
      }
    }

    //获取爆款商品
    function getHotGoods(){
      $easyPayService.getHotGoods({
        pageNo:1,
        pageSize:9  
      }).success(function(data){
        if (data.resultCode == '0000') {
          if( !isEmptyObject(data.result) && data.result.list.length > 0 ){ 
            vm.hotGoodsList = data.result.list;
            angular.forEach(vm.hotGoodsList, function(data){
                data.thumbImgUrl = data.typeFrom == '1' ? imgUrl + data.thumbImgUrl : vm.jdImgServer + data.thumbImgUrl;
            });
            $timeout(function(){
              vm.mainScroll.refresh();
              vm.hotSwiper = new Swiper('.hot-swiper', {
                slidesPerView: 'auto',
                paginationClickable: true,
                freeMode: true
              });
            },200)
          } 
        }
      })   
    }

    //获取广告位
    function getRecommendGoods(){  
      $easyPayService.getRecommendGoods({
        channelId:$userService.$$channelId,
        bannerPageId:1000000006 
      }).success(function(data){
        if (data.resultCode == '0000') {
          vm.recommendGoodsList = data.result;
          if (!isEmptyObject(vm.recommendGoodsList)) {
            vm.bannerAdList = vm.recommendGoodsList.STAGE_BANNER_OPTION_ID;

            $timeout(function(){
              vm.bannerSlide = new Swiper('.bannerSlide', {
                loop:true,
                autoplay:4000,
                autoplayDisableOnInteraction : false,
                pagination:'.swiper-pagination'
              });
            },200)
          }  
        }

      })
    }

    //获取旅游产品
    function getTravelGoods(){  
      $productService.getTravelGoods({
        pageNo:1,
        pageSize:10,
        channelId: $userService.$$channelId
      }).success(function(data){
        if (data.resultCode == '0000') {
          if (!isEmptyObject(data.result) && !isEmptyObject(data.result.goodsInfo)) {
            vm.travelGoodsList = data.result.goodsInfo.list;
            $timeout(function(){
                vm.mainScroll.refresh();
            },200)
          }
        }

      })
    }

  }


});

