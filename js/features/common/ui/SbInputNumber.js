(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbInputNumberModule');
            };

            this.run = function() {

                var dir = function() {
                    return {
                        restrict: 'A',
                        link : function (scope, element) {
                            element.addClass('input-number')
                            element.on('focus', function () {
                                angular.element(this).on('mousewheel', function (e) {
                                    e.preventDefault();
                                });
                            });
                            element.on('blur', function () {
                                angular.element(this).off('mousewheel');
                            });
                        }
                    };
                };

                this.mod.directive('sbInputNumber', [dir]);
            };

        });

        return Feature;

    });


})(define);