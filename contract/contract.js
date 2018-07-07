/**
 * home.js
 * @authors Casper 
 * @date    2016/09/01
 * @version 1.0.0
 */

define(['angular','css!./contract.css','common/script/lib/swiper.min.js'], function(angular) {
	angular.module('app')
    	.controller('contractController',contractController)
    	.controller('debitController',debitController)
        .controller('loanController',loanController)
        .controller('borrowController',borrowController)
        .controller('overdueController',overdueController)
    	
	/*--------------------合同协议-------------------*/	
    contractController.$inject = ['$scope','$state',"$verifyService","$timeout",'$stateParams'];
    function contractController($scope, $state,$verifyService,$timeout,$stateParams){
    	$verifyService.SetIOSTitle("合同协议");
    	$timeout(function () {
            scroll('.main-content');
        },300);
    }

    /*--------------------借款协议-------------------*/	
    borrowController.$inject = ['$scope','$state',"$verifyService","$timeout",'$stateParams'];
    function borrowController($scope, $state,$verifyService,$timeout,$stateParams){
    	$verifyService.SetIOSTitle("借款协议");
    	$timeout(function () {
            scroll('.main-content');
        },300);
    }
    
    /*--------------------委托扣款代偿授权书-------------------*/	
    debitController.$inject = ['$scope','$state',"$verifyService","$timeout",'$stateParams'];
    function debitController($scope, $state,$verifyService,$timeout,$stateParams){
    	$verifyService.SetIOSTitle("授权扣款委托书");
    	$timeout(function () {
            scroll('.main-content');
        },300);
    	
    }

    /*--------------------逾期还款代扣协议-------------------*/	
    overdueController.$inject = ['$scope','$state',"$verifyService","$timeout",'$stateParams'];
    function overdueController($scope, $state,$verifyService,$timeout,$stateParams){
    	$verifyService.SetIOSTitle("逾期还款代扣协议");
    	$timeout(function () {
            scroll('.main-content');
        },300);
    	
    }

    
    /*--------------------网络借贷信息中介服务协议-------------------*/	
    loanController.$inject = ['$scope','$state',"$verifyService","$timeout",'$stateParams'];
    function loanController($scope, $state,$verifyService,$timeout,$stateParams){
    	$verifyService.SetIOSTitle("网络借贷信息中介服务协议");
    	$timeout(function () {
            scroll('.main-content');
        },300);
    	
    }
	
})