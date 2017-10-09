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

    define(['FeatureBase', 'lodash'], function(Base, _) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('ImageWithFallbackModule');
            };

            this.run = function() {

                var dir = function($compile) {
                    return {
                        restrict: 'E',
                        replace: true,
                        scope: {
                            url: '@',
                            defaultUrl: '@',
                            errorUrl: '@'
                        },
                        link: function($scope, element, attrs) {
                            $scope.imageUrl = $scope.url;

                            $scope.$watch('url', function(newValue, oldValue) {
                                $scope.imageUrl = $scope.url;
                            }, true);

                            element.bind('error', function() {
                                element.attr('src', $scope.defaultUrl);
                            });
                        },
                        template: '<img ng-src="{{imageUrl}}">'
                    };
                };

                this.mod.directive('imageWithFallback', ['$compile', dir]);
            };

        });

        return Feature;

    });


})(define);
