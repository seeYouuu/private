/**
 *  Defines the HomeController controller
 *
 *  @author  sky.zhang
 *  @date    Sep 08, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the HomeController class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var HomeController = function($rootScope, $scope, CurrentAdminService) {   
            $rootScope.crumbs = {first: '主页'};
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.$on('$destroy', function() {});
        };

        return ['$rootScope', '$scope', 'CurrentAdminService', HomeController];

    });

})(define);
