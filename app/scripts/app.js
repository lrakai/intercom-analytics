
(function () {
    'use strict';
    
    var _templateBase = './scripts';
    var config = require('./config');

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
    ])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: _templateBase + '/intercom/events.html' ,
                controller: 'intercomController',
                controllerAs: '_ctrl'
            });
            $routeProvider.otherwise({ redirectTo: '/' });
        }
    ])
    .constant('config', config);

})();