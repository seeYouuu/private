/**
 *
 *  The SbMutiDropdown.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbImageWithFallbackModule');
            };

            this.run = function() {

                var features = require.toUrl('features');

                var dir = function($compile, $http) {
                    return {
                        restrict: 'E',
                        replace: true,
                        scope: {
                            url: '@',
                            defaultUrl: '@',
                            errorUrl: '@'
                        },
                        templateUrl: features + '/common/ui/SbImageWithFallback.html',
                        link: function($scope, element, attrs) {
                            $scope.$watch('url', function(url) {
                                $scope.imageUrl = url ? url : $scope.defaultUrl;
                            });
                            
                            element.bind('error', function() {
                                element.attr('src', $scope.defaultUrl);
                            });
                        }
                    };
                };

                this.mod.directive('sbImageWithFallback', ['$compile', '$http', dir]);
            };

        });

        return Feature;

    });


})(define);
