/**
 * home.js
 * @authors Casper
 * @date    2015/12/22
 * @version 1.0.0
 */
define(['angular'], function(angular) {
    angular.module('app').controller('LoginController', LoginController);
    LoginController.$inject = ['$scope', '$state', '$q','$verifyService','$loginService'];
    function LoginController($scope, $state, $q,$verifyService,$loginService) {

    }
});

