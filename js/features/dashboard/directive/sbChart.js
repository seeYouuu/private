/**
 *  Defines the sandbox chart directive
 *
 *  @author  guofang.zhang
 *  @date    Jun 15, 2015
 *
 */
(function(define) {
    'use strict';

    define([], function() {

        var dir = function() {

            return {
                restrict: 'AE',
                scope: {
                	options: "="
                },
                link: function($scope, element) {
                    var ctx = $(element[0]).find('canvas')[0].getContext('2d');
                    new Chart(ctx).Doughnut($scope.options);
                },
                template: '<canvas/><span>77.77%</span>'
            };
        };

        return [dir];

    });

})(define);
