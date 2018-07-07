/**
 * application-configuration.js
 * @authors Casper 
 * @date    2017/08/19
 * @version 1.0.0
 */
require.config({
  baseUrl: './',
  urlArgs: '@ver='+(new Date()).getTime(),
  paths: {
    'jquery': 'vendor/jquery/jquery-2.1.4.min',
    'angular': 'vendor/angular/angular.min',
    'angular-ui-route': 'vendor/angular-ui-router/release/angular-ui-router.min',
    'oclazyload': 'vendor/oclazyload/dist/ocLazyLoad.require.min',
    'iScroll' : 'vendor/iscroll/build/iscroll'
  },
  map: {
    '*': {
      'css': 'vendor/require-css/css.min',
    }
  },
  shim: {
    'angular': {
      deps: ['jquery',"css!common/css/resets.css","css!common/css/main.css","common/script/lib/flexible.js","vendor/iscroll/build/iscroll-probe.js"],
      exports: 'angular'
    },
    'angular-ui-route': {
      deps: ['angular']
    },
    'oclazyload': {
      deps: ['angular']
    }
  }
});

define(['angular', 'app'], function(angular) {
  'use strict';
  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
  });
});