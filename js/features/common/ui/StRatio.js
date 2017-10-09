/**
 *
 *  The stRatio.
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
                this.super.initializer('StRatioModule');
            };

            this.run = function() {
                var dir = function() {
                    return {
                        restrict: 'A',
                        scope: {},
                        link: function($scope, element, attr) {
                            var ratio = +(attr.stRatio);
                            element.css('width', ratio + '%');
                        }
                    };
                };

                this.mod.directive('stRatio', [dir]);
            };

        });

        return Feature;

    });


})(define);
