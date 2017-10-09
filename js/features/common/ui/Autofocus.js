/**
 *  Defines the Autofocus Module.
 *  This module used to override the original `autofocus` attribute since it doesn't work properly with ngRoute
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('AutofocusModule');
            };

            this.run = function() {
                this.mod.directive('autofocus', function() {
                    return {
                        restrict: 'A',
                        link: function($scope, element) {
                            element[0].focus();
                        }
                    };
                });
            };
        });

        return Feature;

    });

})(define);
